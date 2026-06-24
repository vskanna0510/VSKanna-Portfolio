#!/usr/bin/env node
/**
 * Build production bundle, audit with Lighthouse (mobile + desktop),
 * compare LCP / TBT / CLS against lighthouse/baseline.json, write report.
 *
 * Usage:
 *   node scripts/lighthouse.mjs
 *   node scripts/lighthouse.mjs --update-baseline
 *   node scripts/lighthouse.mjs --skip-build   # reuse existing dist + running preview
 */
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DEFAULT_PORT = Number(process.env.LIGHTHOUSE_PORT ?? 4173);
const LH_DIR = join(ROOT, "lighthouse");
const BASELINE_PATH = join(LH_DIR, "baseline.json");
const LATEST_PATH = join(LH_DIR, "latest.json");
const REPORT_PATH = join(LH_DIR, "report.md");

const updateBaseline = process.argv.includes("--update-baseline");
const skipBuild = process.argv.includes("--skip-build");

let previewProc = null;
let PORT = DEFAULT_PORT;
let URL = `http://localhost:${PORT}/`;

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.listen(port, "127.0.0.1", () => {
      server.close(() => resolve(true));
    });
  });
}

async function findAvailablePort(start) {
  for (let port = start; port < start + 20; port++) {
    if (await isPortFree(port)) return port;
  }
  throw new Error(`No free port in range ${start}-${start + 19}`);
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      shell: true,
      cwd: ROOT,
      env: process.env,
    });
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`)),
    );
  });
}

async function waitForServer(maxMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(URL);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  throw new Error(`Preview server did not respond at ${URL}`);
}

function startPreview() {
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    };
    const ok = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    previewProc = spawn("npm", ["run", "preview", "--", "--port", String(PORT), "--strictPort"], {
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      cwd: ROOT,
      env: process.env,
    });
    previewProc.on("error", fail);

    const onPreviewOutput = (chunk) => {
      const msg = chunk.toString();
      if (msg.includes("already in use") || msg.includes("Error:")) {
        fail(new Error(msg.trim()));
      }
    };
    previewProc.stderr?.on("data", onPreviewOutput);
    previewProc.stdout?.on("data", onPreviewOutput);

    previewProc.on("close", (code) => {
      if (!settled && code !== 0 && code !== null) {
        fail(new Error(`Preview exited with code ${code}`));
      }
    });

    waitForServer().then(ok).catch(fail);
  });
}

async function startPreviewWithRetry() {
  for (let attempt = 0; attempt < 8; attempt++) {
    PORT = await findAvailablePort(DEFAULT_PORT + attempt);
    URL = `http://localhost:${PORT}/`;
    try {
      await startPreview();
      return;
    } catch {
      stopPreview();
      if (attempt === 7) {
        throw new Error(`Could not start preview after 8 attempts (from port ${DEFAULT_PORT})`);
      }
    }
  }
}

function stopPreview() {
  if (previewProc && !previewProc.killed) {
    previewProc.kill("SIGTERM");
    previewProc = null;
  }
}

async function runAudit(formFactor) {
  const isMobile = formFactor === "mobile";
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  try {
    const options = {
      logLevel: "error",
      output: "json",
      onlyCategories: ["performance"],
      port: chrome.port,
      formFactor,
      screenEmulation: {
        mobile: isMobile,
        width: isMobile ? 412 : 1350,
        height: isMobile ? 823 : 940,
        deviceScaleFactor: isMobile ? 2.625 : 1,
        disabled: false,
      },
    };
    const runnerResult = await lighthouse(URL, options);
    const audits = runnerResult?.lhr?.audits ?? {};
    return {
      lcp: audits["largest-contentful-paint"]?.numericValue ?? null,
      tbt: audits["total-blocking-time"]?.numericValue ?? null,
      cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
    };
  } finally {
    await chrome.kill();
  }
}

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) {
    return { mobile: {}, desktop: {} };
  }
  return JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
}

function fmtLcp(ms) {
  return ms == null ? "—" : `${Math.round(ms)}ms`;
}

function fmtTbt(ms) {
  return ms == null ? "—" : `${Math.round(ms)}ms`;
}

function fmtCls(v) {
  return v == null ? "—" : v.toFixed(3);
}

function delta(before, after, isCls = false) {
  if (before == null || after == null) return "—";
  const d = after - before;
  if (Math.abs(d) < (isCls ? 0.0001 : 1)) return "0";
  const improved = d < 0;
  const arrow = improved ? "▼" : "▲";
  if (isCls) return `${arrow} ${d >= 0 ? "+" : ""}${d.toFixed(3)}`;
  return `${arrow} ${d >= 0 ? "+" : ""}${Math.round(d)}ms`;
}

function buildReport(baseline, latest) {
  const lines = [
    "# Lighthouse Performance Report",
    "",
    `Generated: ${latest.updatedAt}`,
    "",
    "## Mobile",
    "",
    "| Metric | Baseline | Latest | Δ |",
    "|--------|----------|--------|---|",
    `| LCP | ${fmtLcp(baseline.mobile?.lcp)} | ${fmtLcp(latest.mobile.lcp)} | ${delta(baseline.mobile?.lcp, latest.mobile.lcp)} |`,
    `| TBT | ${fmtTbt(baseline.mobile?.tbt)} | ${fmtTbt(latest.mobile.tbt)} | ${delta(baseline.mobile?.tbt, latest.mobile.tbt)} |`,
    `| CLS | ${fmtCls(baseline.mobile?.cls)} | ${fmtCls(latest.mobile.cls)} | ${delta(baseline.mobile?.cls, latest.mobile.cls, true)} |`,
    "",
    "## Desktop",
    "",
    "| Metric | Baseline | Latest | Δ |",
    "|--------|----------|--------|---|",
    `| LCP | ${fmtLcp(baseline.desktop?.lcp)} | ${fmtLcp(latest.desktop.lcp)} | ${delta(baseline.desktop?.lcp, latest.desktop.lcp)} |`,
    `| TBT | ${fmtTbt(baseline.desktop?.tbt)} | ${fmtTbt(latest.desktop.tbt)} | ${delta(baseline.desktop?.tbt, latest.desktop.tbt)} |`,
    `| CLS | ${fmtCls(baseline.desktop?.cls)} | ${fmtCls(latest.desktop.cls)} | ${delta(baseline.desktop?.cls, latest.desktop.cls, true)} |`,
    "",
    "_▼ = improved · ▲ = regressed_",
    "",
  ];
  return lines.join("\n");
}

function checkRegression(baseline, latest) {
  const warnings = [];
  const checks = [
    ["mobile", "lcp", 500],
    ["mobile", "cls", 0.05],
    ["desktop", "lcp", 500],
    ["desktop", "cls", 0.05],
  ];
  for (const [form, metric, threshold] of checks) {
    const b = baseline[form]?.[metric];
    const l = latest[form]?.[metric];
    if (b == null || l == null) continue;
    const d = l - b;
    if (metric === "cls" && d > threshold) {
      warnings.push(`${form} CLS regressed by ${d.toFixed(3)} (threshold ${threshold})`);
    } else if (metric !== "cls" && d > threshold) {
      warnings.push(
        `${form} ${metric.toUpperCase()} regressed by ${Math.round(d)}ms (threshold ${threshold}ms)`,
      );
    }
  }
  return warnings;
}

async function main() {
  mkdirSync(LH_DIR, { recursive: true });

  try {
    if (!skipBuild) {
      console.log("\n▶ Building production bundle…\n");
      await run("npm", ["run", "build"]);
    }

    console.log("\n▶ Starting preview…\n");
    await startPreviewWithRetry();
    console.log(`✓ Preview ready at ${URL}\n`);

    console.log("\n▶ Running Lighthouse (mobile)…\n");
    const mobile = await runAudit("mobile");

    console.log("\n▶ Running Lighthouse (desktop)…\n");
    const desktop = await runAudit("desktop");

    const latest = {
      updatedAt: new Date().toISOString(),
      url: URL,
      mobile,
      desktop,
    };

    writeFileSync(LATEST_PATH, JSON.stringify(latest, null, 2));

    const baseline = loadBaseline();
    const report = buildReport(baseline, latest);
    writeFileSync(REPORT_PATH, report);

    if (process.env.GITHUB_STEP_SUMMARY) {
      writeFileSync(process.env.GITHUB_STEP_SUMMARY, report);
    }

    console.log("\n" + report + "\n");

    if (updateBaseline) {
      const nextBaseline = {
        updatedAt: latest.updatedAt,
        mobile,
        desktop,
      };
      writeFileSync(BASELINE_PATH, JSON.stringify(nextBaseline, null, 2));
      console.log("✓ Baseline updated at lighthouse/baseline.json\n");
    }

    const warnings = checkRegression(baseline, latest);
    if (warnings.length > 0 && !updateBaseline) {
      console.warn(
        "⚠ Performance regressions detected:\n" + warnings.map((w) => `  - ${w}`).join("\n"),
      );
      if (process.env.CI) process.exitCode = 1;
    } else {
      console.log("✓ Lighthouse audit complete → lighthouse/report.md\n");
    }
  } finally {
    stopPreview();
  }
}

main().catch((err) => {
  console.error(err);
  stopPreview();
  process.exit(1);
});
