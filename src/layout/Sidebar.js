import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Cpu, LineChart } from "lucide-react";
const link = "flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:text-text hover:bg-white/5 transition";
export default function Sidebar() {
    return (_jsx("aside", { className: "h-full md:h-full w-full md:w-64 shrink-0 border border-[color:var(--border)] md:border-r md:border-[color:var(--border)] bg-panel p-3 rounded-xl md:rounded-none", children: _jsxs("nav", { className: "space-y-1", children: [_jsxs(NavLink, { to: "/", end: true, className: link, children: [_jsx(LayoutDashboard, { size: 18 }), " Dashboard"] }), _jsxs(NavLink, { to: "/devices", className: link, children: [_jsx(Cpu, { size: 18 }), " Devices"] }), _jsxs(NavLink, { to: "/analytics", className: link, children: [_jsx(LineChart, { size: 18 }), " Analytics"] })] }) }));
}
