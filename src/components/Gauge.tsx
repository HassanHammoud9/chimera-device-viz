import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

type Props = {
  value: number;                // 0..100
  label: string;
  tone?: "ok" | "warn" | "bad";
  size?: number;                // px
};

export default function Gauge({ value, label, tone = "ok", size = 108 }: Props) {
  const radius = 46;
  const stroke = 10;

  // Animated value (0..100)
  const progress = useSpring(clamp01(value), { stiffness: 120, damping: 20 });
  useEffect(() => {
    progress.set(clamp01(value));
  }, [value, progress]);

  // Map 0..100 -> 0..1 for the SVG pathLength
  const pathLength = useTransform(progress, (p) => p / 100);

  const color =
    tone === "ok" ? "rgb(34 197 94)" : tone === "warn" ? "rgb(234 179 8)" : "rgb(239 68 68)";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 120 120" aria-label={`${label} ${Math.round(value)}%`}>
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="rgba(255,255,255,.08)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ pathLength }}
        />
        <text x="60" y="66" textAnchor="middle" fontSize="18" fill="currentColor">
          {Math.round(value)}%
        </text>
      </svg>
      <div className="text-sm text-muted">{label}</div>
    </div>
  );
}

function clamp01(v: number) {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, v));
}
