import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "kanna_voice_played_v1";
const MUTE_KEY = "kanna_voice_muted_v1";

const MESSAGE = "Hi, I'm Kanna. I'm a full-stack and AI engineer. Here's a quick tour of my work.";

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Prefer high-quality natural English voices
  const preferred = [
    "Google UK English Male",
    "Google US English",
    "Microsoft Guy Online (Natural) - English (United States)",
    "Microsoft Ryan Online (Natural) - English (United Kingdom)",
    "Daniel",
    "Samantha",
  ];
  for (const name of preferred) {
    const v = voices.find((vv) => vv.name === name);
    if (v) return v;
  }
  return voices.find((v) => v.lang?.startsWith("en")) ?? voices[0] ?? null;
}

export function useWelcomeVoice() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [muted, setMuted] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok = "speechSynthesis" in window;
    setSupported(ok);
    if (!ok) return;
    setMuted(localStorage.getItem(MUTE_KEY) === "1");
    // Warm voices up
    window.speechSynthesis.getVoices();
    const onVoices = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", onVoices);
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener?.("voiceschanged", onVoices);
    };
  }, []);

  const speak = useCallback(
    (text: string = MESSAGE) => {
      if (!supported) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const v = pickVoice();
        if (v) u.voice = v;
        u.rate = 1.0;
        u.pitch = 1.05;
        u.volume = 1;
        u.onstart = () => setSpeaking(true);
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        utterRef.current = u;
        window.speechSynthesis.speak(u);
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        setSpeaking(false);
      }
    },
    [supported],
  );

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      if (next) window.speechSynthesis?.cancel();
      return next;
    });
  }, []);

  // Auto-play once on the first user interaction (browsers block autoplay before that)
  useEffect(() => {
    if (!supported) return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    if (localStorage.getItem(MUTE_KEY) === "1") return;
    const handler = () => {
      speak();
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
    window.addEventListener("pointerdown", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, [supported, speak]);

  return { speak, stop, speaking, supported, muted, toggleMute };
}
