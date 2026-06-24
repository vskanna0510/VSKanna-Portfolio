import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

type Props = {
  speak: () => void;
  stop: () => void;
  speaking: boolean;
  supported: boolean;
  muted: boolean;
  toggleMute: () => void;
};

export function VoiceWelcome({ speak, stop, speaking, supported, muted, toggleMute }: Props) {
  if (!supported) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
      className="fixed right-4 top-20 z-50 sm:right-6"
    >
      <div className="glass flex items-center gap-1 rounded-full p-1.5">
        <button
          onClick={speaking ? stop : () => speak()}
          data-cursor="hover"
          aria-label={speaking ? "Stop intro voiceover" : "Play intro voiceover"}
          className="group relative grid h-9 w-9 place-items-center overflow-hidden rounded-full transition-transform hover:scale-110"
          style={{ background: "var(--gradient-brand)" }}
        >
          <AnimatePresence mode="wait">
            {speaking ? (
              <motion.span
                key="pause"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                className="grid place-items-center text-white"
              >
                <Pause className="h-4 w-4" />
              </motion.span>
            ) : (
              <motion.span
                key="play"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                className="grid place-items-center text-white"
              >
                <Play className="h-4 w-4 translate-x-[1px]" />
              </motion.span>
            )}
          </AnimatePresence>
          {speaking && (
            <span className="absolute inset-0 animate-ping rounded-full border-2 border-white/60" />
          )}
        </button>

        <button
          onClick={toggleMute}
          data-cursor="hover"
          aria-label={muted ? "Unmute intro voiceover" : "Mute intro voiceover"}
          className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 transition-colors hover:text-foreground"
          title={muted ? "Voiceover muted" : "Voiceover on"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        <AnimatePresence>
          {speaking && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap pr-3 font-mono text-[10px] uppercase tracking-wider text-[var(--coral)]"
            >
              speaking…
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
