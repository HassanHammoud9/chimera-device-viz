import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Activity, Cpu, Wifi } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
const data = [
    { t: "09:00", load: 22 },
    { t: "10:00", load: 35 },
    { t: "11:00", load: 29 },
    { t: "12:00", load: 41 },
    { t: "13:00", load: 33 },
    { t: "14:00", load: 48 },
];
const Card = ({ children }) => (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 }, className: "cardish p-4", children: children }));
export default function Dashboard() {
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsx(Card, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Cpu, { className: "opacity-80" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-muted", children: "Active Devices" }), _jsx("div", { className: "text-2xl font-semibold", children: "128" })] })] }) }), _jsx(Card, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Wifi, { className: "opacity-80" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-muted", children: "Online" }), _jsx("div", { className: "text-2xl font-semibold", children: "117" })] })] }) }), _jsx(Card, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Activity, { className: "opacity-80" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-muted", children: "Avg Load" }), _jsx("div", { className: "text-2xl font-semibold", children: "48%" })] })] }) })] }), _jsxs(Card, { children: [_jsx("div", { className: "mb-2 text-sm text-muted", children: "Cluster Load (today)" }), _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: data, children: [_jsx(XAxis, { dataKey: "t", stroke: "currentColor" }), _jsx(YAxis, { stroke: "currentColor" }), _jsx(Tooltip, { contentStyle: {
                                            background: "#111826",
                                            border: "1px solid rgba(255,255,255,.1)",
                                        } }), _jsx(Line, { type: "monotone", dataKey: "load", stroke: "currentColor", strokeWidth: 2, dot: false })] }) }) })] })] }));
}
