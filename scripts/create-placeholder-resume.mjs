import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "public");
fs.mkdirSync(dir, { recursive: true });

const body =
  "BT /F1 24 Tf 72 700 Td (V S Kanna) Tj 0 -36 Td /F1 12 Tf (Replace this file with your real resume PDF.) Tj ET";

const objs = [
  "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj",
  "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj",
  "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj",
  "4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj",
  `5 0 obj<</Length ${body.length}>>stream\n${body}\nendstream\nendobj`,
];

let pdf = "%PDF-1.4\n";
const offsets = [0];

for (const obj of objs) {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${obj}\n`;
}

const xrefPos = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;

for (let i = 1; i < offsets.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}

pdf += `trailer<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xrefPos}\n%%EOF`;

const out = path.join(dir, "VSKanna_Resume.pdf");
fs.writeFileSync(out, pdf);
console.log(`Wrote ${out}`);
