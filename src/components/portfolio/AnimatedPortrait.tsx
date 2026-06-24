import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import portraitUrl from "@/assets/v2-3d-pixar.png";
import { usePageReady } from "./PageTransition";

const PORTRAIT_MASK: React.CSSProperties = {
  WebkitMaskImage:
    "radial-gradient(ellipse 72% 78% at 50% 52%, black 42%, rgba(0,0,0,0.85) 58%, transparent 76%)",
  maskImage:
    "radial-gradient(ellipse 72% 78% at 50% 52%, black 42%, rgba(0,0,0,0.85) 58%, transparent 76%)",
};

export function AnimatedPortrait() {
  const ready = usePageReady();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [10, -10]), { stiffness: 110, damping: 14 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-10, 10]), { stiffness: 110, damping: 14 });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, scale: 0.85, y: 16 }}
      animate={ready ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.85, y: 16 }}
      transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto h-[300px] w-[300px] overflow-visible animate-float sm:h-[360px] sm:w-[360px] md:h-[400px] md:w-[400px]"
      style={{ perspective: 1100 }}
    >
      {/* Single ambient glow — oversized so blur fades into page background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
        transition={{ duration: 1.2, delay: 0.15, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 42% 38%, rgba(79,70,229,0.22) 0%, rgba(249,115,22,0.12) 38%, transparent 68%)",
          filter: "blur(48px)",
        }}
      />

      {/* Portrait with mouse tilt */}
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative h-full w-full"
      >
        <motion.div
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={ready ? { clipPath: "inset(0 0 0% 0)" } : { clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
          className="absolute inset-0"
          style={{ transform: "translateZ(40px)", ...PORTRAIT_MASK }}
        >
          <img
            src={portraitUrl}
            alt="V S Kanna"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            width={400}
            height={400}
            className="h-full w-full animate-portrait-breathe object-contain"
            style={{ mixBlendMode: "screen" }}
          />
        </motion.div>
      </motion.div>

      {/* Floating particles around portrait */}
      {ready && Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const r = 130 + (i % 3) * 22;
        const dx = Math.cos(angle) * r;
        const dy = Math.sin(angle) * r;
        const color = i % 3 === 0 ? "#4F46E5" : i % 3 === 1 ? "#F97316" : "#8B7BD8";
        return (
          <motion.span
            key={i}
            className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: [dx * 0.7, dx, dx * 0.7],
              y: [dy * 0.7, dy, dy * 0.7],
              opacity: [0, 0.9, 0.4, 0.9, 0],
              scale: [0.6, 1.1, 0.6],
            }}
            transition={{
              duration: 6 + (i % 4),
              repeat: Infinity,
              delay: 1 + i * 0.15,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </motion.div>
  );
}
