import { motion, useScroll, useTransform } from "framer-motion";
import desk from "@/assets/bg-desk-setup.jpg";
import circuit from "@/assets/bg-circuit-macro.jpg";
import bokeh from "@/assets/bg-code-bokeh.jpg";

type Props = {
  /** When true, fade vignettes in the hero viewport so HeroAurora owns the top band. */
  suppressHeroZone?: boolean;
};

/**
 * Responsive parallax vignettes — bounded with clamp() so they NEVER cover the
 * central reading column on any screen (mobile → ultrawide). Each layer is
 * alpha-masked at the edges so corners feather away cleanly.
 */
export function AmbientBackdrop({ suppressHeroZone = false }: Props) {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  const feather: React.CSSProperties = {
    WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, black 28%, transparent 78%)",
    maskImage: "radial-gradient(ellipse at center, black 0%, black 28%, transparent 78%)",
  };

  const heroMask: React.CSSProperties = suppressHeroZone
    ? {
        WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 35%)",
        maskImage: "linear-gradient(180deg, transparent 0%, black 35%)",
      }
    : {};

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={heroMask}>
      {/* Top-left desk vignette — desktop only, pinned to gutter on ultrawide */}
      <motion.div
        style={{
          y: y1,
          width: "clamp(180px, 26vw, 460px)",
          height: "clamp(220px, 36vh, 420px)",
          left: "max(-4vw, calc(50% - 50vw))",
          top: "clamp(-2vh, -2vh, 0vh)",
          ...feather,
        }}
        className={`absolute mix-blend-multiply opacity-[0.085] md:block ${suppressHeroZone ? "hidden lg:block" : "hidden md:block"}`}
      >
        <img
          src={desk}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          width={800}
          height={600}
        />
      </motion.div>

      {/* Mid-right circuit vignette — lg+, pinned to right gutter */}
      <motion.div
        style={{
          y: y2,
          width: "clamp(220px, 26vw, 480px)",
          height: "clamp(240px, 36vh, 440px)",
          right: "max(-4vw, calc(50% - 50vw))",
          top: "clamp(30vh, 32vh, 38vh)",
          ...feather,
        }}
        className="absolute hidden mix-blend-multiply opacity-[0.075] lg:block"
      >
        <img
          src={circuit}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          width={800}
          height={600}
        />
      </motion.div>

      {/* Bottom-wide bokeh — always visible, ultra-faint */}
      <motion.div
        style={{
          y: y3,
          width: "min(120vw, 1800px)",
          height: "clamp(220px, 42vh, 520px)",
          left: "50%",
          translateX: "-50%",
          bottom: "-6vh",
          ...feather,
        }}
        className={`absolute mix-blend-multiply ${suppressHeroZone ? "opacity-[0.035]" : "opacity-[0.06]"}`}
      >
        <img
          src={bokeh}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          width={1920}
          height={1080}
        />
      </motion.div>

      {/* Cream veils — guarantee top & bottom text bands stay readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--background) 0%, transparent 12%, transparent 88%, var(--background) 100%)",
        }}
      />
      {/* Center-column reading veil — lighter in hero when HeroAurora owns the top band */}
      <div
        className="absolute inset-0"
        style={{
          background: suppressHeroZone
            ? "radial-gradient(ellipse 70% 50% at 50% 45%, rgba(251,251,249,0.22) 0%, transparent 75%)"
            : "radial-gradient(ellipse 70% 50% at 50% 45%, rgba(251,251,249,0.45) 0%, transparent 75%)",
        }}
      />
    </div>
  );
}
