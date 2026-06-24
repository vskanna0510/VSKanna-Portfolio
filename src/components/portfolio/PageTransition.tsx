import { motion } from "framer-motion";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const PageReadyCtx = createContext(false);
export const usePageReady = () => useContext(PageReadyCtx);

export function PageTransition({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  // Reveal duration ~ 1.0s wipe + 0.25s grace
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <PageReadyCtx.Provider value={ready}>
      <motion.div
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
        style={{ transformOrigin: "top" }}
        className="pointer-events-none fixed inset-0 z-[200]"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(180deg, #FBFBF9 0%, #FBFBF9 60%, rgba(79,70,229,0.06) 100%)",
          }}
        />
      </motion.div>
      <motion.div
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 0.25 }}
        style={{ transformOrigin: "top" }}
        className="pointer-events-none fixed inset-0 z-[199]"
      >
        <div
          className="h-full w-full"
          style={{
            background: "linear-gradient(180deg, #4F46E5 0%, #F97316 100%)",
            opacity: 0.18,
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </PageReadyCtx.Provider>
  );
}
