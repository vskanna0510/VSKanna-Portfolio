import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Magnetic plasma blob cursor — indigo→terracotta gradient with morphing blob shape.
 * On hover over interactive elements, it grows + magnetically snaps toward the target center.
 */
export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 380, damping: 30, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 380, damping: 30, mass: 0.5 });

  const [hover, setHover] = useState(false);
  const [clicking, setClicking] = useState(false);
  const lastPos = useRef({ x: 0, y: 0, t: performance.now() });
  const velocity = useMotionValue(0);
  const stretchX = useTransform(velocity, [0, 40], [1, 1.45]);
  const stretchY = useTransform(velocity, [0, 40], [1, 0.7]);
  const angle = useMotionValue(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target?.closest?.("a,button,[data-cursor='hover'],input,textarea,label");

      let tx = e.clientX;
      let ty = e.clientY;

      if (interactive) {
        // Magnetic pull toward target center
        const rect = interactive.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        tx = e.clientX + (cx - e.clientX) * 0.25;
        ty = e.clientY + (cy - e.clientY) * 0.25;
      }
      x.set(tx);
      y.set(ty);

      // velocity for stretch + angle
      const now = performance.now();
      const dt = Math.max(1, now - lastPos.current.t);
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const v = (Math.hypot(dx, dy) / dt) * 16;
      velocity.set(v);
      if (v > 1) angle.set((Math.atan2(dy, dx) * 180) / Math.PI);
      lastPos.current = { x: e.clientX, y: e.clientY, t: now };

      setHover(!!interactive);
    };
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [x, y, velocity, angle]);

  const size = hover ? 64 : 28;

  return (
    <>
      {/* Inner core dot */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          background: "var(--espresso)",
          mixBlendMode: "difference",
        }}
      />

      {/* Plasma blob */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9998]"
        style={{
          x: sx,
          y: sy,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          animate={{
            width: size,
            height: size,
            scale: clicking ? 0.7 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          style={{
            scaleX: stretchX,
            scaleY: stretchY,
            rotate: angle,
          }}
          className="relative"
        >
          <div
            className="absolute inset-0 animate-blob-morph"
            style={{
              background: hover
                ? "linear-gradient(135deg, #F97316, #4F46E5)"
                : "linear-gradient(135deg, #4F46E5, #8B7BD8, #F97316)",
              filter: "blur(2px)",
              opacity: hover ? 0.85 : 0.65,
              boxShadow: hover
                ? "0 0 40px rgba(249,115,22,0.55), 0 0 80px rgba(79,70,229,0.35)"
                : "0 0 28px rgba(79,70,229,0.45)",
            }}
          />
          <div
            className="absolute inset-2 animate-blob-morph"
            style={{
              background: "rgba(255,255,255,0.5)",
              animationDirection: "reverse",
              animationDuration: "9s",
              filter: "blur(4px)",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Click ripple */}
      {clicking && (
        <motion.div
          key={Math.random()}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pointer-events-none fixed left-0 top-0 z-[9997] h-16 w-16 rounded-full border-2"
          style={{
            x: sx,
            y: sy,
            translateX: "-50%",
            translateY: "-50%",
            borderColor: "rgba(79,70,229,0.6)",
          }}
        />
      )}
    </>
  );
}
