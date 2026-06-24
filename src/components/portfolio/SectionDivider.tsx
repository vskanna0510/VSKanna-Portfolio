import { motion } from "framer-motion";

export function SectionDivider() {
  return (
    <div className="relative mx-auto my-4 max-w-7xl px-6">
      <motion.svg
        viewBox="0 0 1200 40"
        className="h-10 w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <defs>
          <linearGradient id="div-grad" x1="0" x2="1">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0" />
            <stop offset="30%" stopColor="#4F46E5" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#F97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 0 20 Q 300 5 600 20 T 1200 20"
          fill="none"
          stroke="url(#div-grad)"
          strokeWidth="1.5"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { pathLength: 1, opacity: 1, transition: { duration: 1.6, ease: "easeInOut" } },
          }}
        />
        <motion.circle
          r="3.5"
          fill="#F97316"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 0.6 } },
          }}
        >
          <animateMotion
            dur="6s"
            repeatCount="indefinite"
            path="M 0 20 Q 300 5 600 20 T 1200 20"
          />
        </motion.circle>
      </motion.svg>
    </div>
  );
}
