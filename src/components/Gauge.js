import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
export default function Gauge({ value, label, tone = "ok", size = 108 }) {
    const radius = 46;
    const stroke = 10;
    // Animated value (0..100)
    const progress = useSpring(clamp01(value), { stiffness: 120, damping: 20 });
    useEffect(() => {
        progress.set(clamp01(value));
    }, [value, progress]);
    // Map 0..100 -> 0..1 for the SVG pathLength
    const pathLength = useTransform(progress, (p) => p / 100);
    const color = tone === "ok" ? "rgb(34 197 94)" : tone === "warn" ? "rgb(234 179 8)" : "rgb(239 68 68)";
    return (_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsxs("svg", { width: size, height: size, viewBox: "0 0 120 120", "aria-label": `${label} ${Math.round(value)}%`, children: [_jsx("circle", { cx: "60", cy: "60", r: radius, stroke: "rgba(255,255,255,.08)", strokeWidth: stroke, fill: "none", strokeLinecap: "round" }), _jsx(motion.circle, { cx: "60", cy: "60", r: radius, stroke: color, strokeWidth: stroke, fill: "none", strokeLinecap: "round", transform: "rotate(-90 60 60)", style: { pathLength } }), _jsxs("text", { x: "60", y: "66", textAnchor: "middle", fontSize: "18", fill: "currentColor", children: [Math.round(value), "%"] })] }), _jsx("div", { className: "text-sm text-muted", children: label })] }));
}
function clamp01(v) {
    if (Number.isNaN(v))
        return 0;
    return Math.max(0, Math.min(100, v));
}
