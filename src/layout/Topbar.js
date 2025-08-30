import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Menu } from "lucide-react";
export default function Topbar({ onMenu }) {
    return (_jsx("header", { className: "sticky top-0 z-30 w-full border-b border-[color:var(--border)] bg-soft/60 backdrop-blur px-3 md:px-4 py-3", children: _jsxs("div", { className: "mx-auto max-w-7xl flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "md:hidden rounded-lg border border-[color:var(--border)] px-2 py-1 hover:bg-white/5", "aria-label": "Open menu", onClick: onMenu, children: _jsx(Menu, { size: 18 }) }), _jsx("h1", { className: "text-lg font-semibold tracking-wide", children: "Chimera Device Viz" })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx("div", { className: "hidden md:block text-sm text-muted", children: "v0.1" }) })] }) }));
}
