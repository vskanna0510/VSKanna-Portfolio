import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Gamepad2, Sparkles } from "lucide-react";
import { PixelPong } from "@/components/arcade/PixelPong";
import { NeuralSnake } from "@/components/arcade/NeuralSnake";
import { CodeCatch } from "@/components/arcade/CodeCatch";
import { Breakout } from "@/components/arcade/Breakout";
import { Twenty48 } from "@/components/arcade/Twenty48";
import { AmbientBackdrop } from "@/components/portfolio/AmbientBackdrop";
import { PageTransition } from "@/components/portfolio/PageTransition";
import { CustomCursor } from "@/components/portfolio/CustomCursor";
import arcadeHero from "@/assets/arcade-hero-doodle.jpg";
import arcadeHeroPortrait from "@/assets/arcade-hero-doodle-portrait.jpg";

const GAMES = [
  {
    id: "pong",
    title: "Pixel Pong",
    desc: "Classic Pong against the computer. First to 5 wins.",
    color: "#4F46E5",
    icon: "◐ ●  ◑",
  },
  {
    id: "snake",
    title: "Neural Snake",
    desc: "Eat tokens and grow. Speed picks up as you go.",
    color: "#F97316",
    icon: "▪▪▪◆",
  },
  {
    id: "catch",
    title: "Code Catch",
    desc: "Catch falling code symbols. Miss three and you lose.",
    color: "#8B7BD8",
    icon: "{ } ; ()",
  },
  {
    id: "breakout",
    title: "Breakout",
    desc: "Break the bricks. Mouse or arrow keys.",
    color: "#FF6B6B",
    icon: "▰▰▰▰",
  },
  {
    id: "2048",
    title: "2048",
    desc: "Merge tiles with the arrow keys. Try to beat your best.",
    color: "#FFB454",
    icon: "2·4·8",
  },
] as const;

type GameId = (typeof GAMES)[number]["id"];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, rotateX: -8 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function ArcadePage() {
  const [active, setActive] = useState<GameId | null>(null);

  return (
    <>
      <CustomCursor />
      <PageTransition>
        <AmbientBackdrop />
        <main className="relative mx-auto min-h-screen max-w-6xl px-6 pt-28 pb-20">
          {/* Animated hero banner */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-12 overflow-hidden rounded-3xl border border-white/10"
          >
            <picture>
              <source media="(max-width: 640px)" srcSet={arcadeHeroPortrait} />
              <motion.img
                src={arcadeHero}
                alt="Doodle illustration of colourful retro arcade games"
                width={1920}
                height={1080}
                className="h-[320px] w-full object-cover sm:h-[380px]"
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
            {/* scanlines */}
            <div
              className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 3px)",
              }}
            />
            {/* drifting light sweep */}
            <motion.div
              className="pointer-events-none absolute inset-y-0 w-1/3"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,180,84,0.18), transparent)",
              }}
              animate={{ x: ["-30%", "330%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />

            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
              <Link
                to="/"
                className="mb-3 inline-flex w-fit items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" /> back to portfolio
              </Link>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <motion.h1
                    className="font-display text-5xl font-bold tracking-tight sm:text-6xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    The <span className="text-gradient">Arcade</span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="mt-3 max-w-xl text-muted-foreground"
                  >
                    Five small browser games I made for fun. Grab a keyboard.
                  </motion.p>
                </div>
                <motion.div
                  animate={{ rotate: [0, -8, 8, 0], y: [0, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="hidden sm:block"
                >
                  <Gamepad2 className="h-16 w-16 text-[var(--coral)]/60 drop-shadow-[0_0_20px_rgba(255,107,107,0.5)]" />
                </motion.div>
              </div>
            </div>
          </motion.section>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ perspective: 1200 }}>
            {GAMES.map((g, i) => (
              <motion.button
                key={g.id}
                onClick={() => setActive(g.id)}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="show"
                whileHover={{ y: -10, rotateX: 6, rotateY: -6, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{ transformStyle: "preserve-3d" }}
                className="glass group relative overflow-hidden rounded-3xl p-6 text-left"
              >
                {/* coloured aura on hover */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 30% 0%, ${g.color}44, transparent 60%)`,
                  }}
                />
                {/* animated border sheen */}
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100"
                  style={{
                    background: `conic-gradient(from 0deg, transparent, ${g.color}55, transparent 30%)`,
                    mask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
                    WebkitMask:
                      "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    padding: 1,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />

                <div className="relative">
                  <div
                    className="relative mb-5 flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl border border-white/10"
                    style={{ background: `linear-gradient(135deg, ${g.color}33, transparent 70%)` }}
                  >
                    <motion.div
                      className="font-mono text-5xl font-bold tracking-tighter"
                      style={{ color: g.color, textShadow: `0 0 24px ${g.color}99` }}
                      animate={{ y: [0, -4, 0], opacity: [0.75, 1, 0.75] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.2,
                      }}
                    >
                      {g.icon}
                    </motion.div>
                    {/* floating sparkles */}
                    <motion.div
                      className="absolute right-2 top-2"
                      animate={{ opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    >
                      <Sparkles className="h-3 w-3" style={{ color: g.color }} />
                    </motion.div>
                    <div className="crt-overlay absolute inset-0" />
                  </div>
                  <div
                    className="mb-1 font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: g.color }}
                  >
                    game · {g.id}
                  </div>
                  <h3 className="font-display text-xl font-semibold">{g.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{g.desc}</p>
                  <motion.div
                    className="mt-4 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold"
                    style={{ borderColor: `${g.color}55` }}
                    whileHover={{ x: 4 }}
                  >
                    Play →
                  </motion.div>
                </div>
              </motion.button>
            ))}
          </div>
        </main>

        <AnimatePresence>
          {active === "pong" && <PixelPong onClose={() => setActive(null)} />}
          {active === "snake" && <NeuralSnake onClose={() => setActive(null)} />}
          {active === "catch" && <CodeCatch onClose={() => setActive(null)} />}
          {active === "breakout" && <Breakout onClose={() => setActive(null)} />}
          {active === "2048" && <Twenty48 onClose={() => setActive(null)} />}
        </AnimatePresence>
      </PageTransition>
    </>
  );
}
