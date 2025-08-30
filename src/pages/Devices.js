import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import { fetchDevices } from "@/lib/mock";
function StatusPill({ status }) {
    const cls = status === "online"
        ? "bg-green-500/15 text-green-400"
        : status === "degraded"
            ? "bg-yellow-500/15 text-yellow-400"
            : "bg-red-500/15 text-red-400";
    return (_jsx("span", { className: `status-chip rounded-lg px-2 py-0.5 text-xs capitalize ${cls}`, children: status }));
}
function Sparkline({ points }) {
    const data = points.map((v, i) => ({ i, v }));
    return (_jsx("div", { className: "h-8 w-28", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: data, margin: { top: 2, right: 0, left: 0, bottom: 0 }, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "spark", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "currentColor", stopOpacity: 0.8 }), _jsx("stop", { offset: "100%", stopColor: "currentColor", stopOpacity: 0.05 })] }) }), _jsx(Tooltip, { cursor: false, contentStyle: {
                            background: "#141823",
                            border: "1px solid rgba(255,255,255,.08)",
                            borderRadius: 10,
                            padding: "6px 8px",
                            color: "white",
                        }, formatter: (value) => [`${value}%`, "CPU"], labelFormatter: () => "" }), _jsx(Area, { type: "monotone", dataKey: "v", stroke: "currentColor", fill: "url(#spark)", strokeWidth: 2, isAnimationActive: false })] }) }) }));
}
export default function Devices() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [sortKey, setSortKey] = useState("id");
    const [sortDir, setSortDir] = useState("desc");
    useEffect(() => {
        (async () => {
            setLoading(true);
            const list = await fetchDevices();
            setDevices(list);
            setLoading(false);
        })();
    }, []);
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const list = devices.filter((d) => !q ||
            d.id.toString().toLowerCase().includes(q) ||
            d.name.toLowerCase().includes(q) ||
            d.status.toLowerCase().includes(q));
        list.sort((a, b) => {
            const dir = sortDir === "asc" ? 1 : -1;
            switch (sortKey) {
                case "id":
                    return (Number(a.id) - Number(b.id)) * dir;
                case "name":
                    return a.name.localeCompare(b.name) * dir;
                case "status":
                    return a.status.localeCompare(b.status) * dir;
                case "cpu":
                    return (a.cpu - b.cpu) * dir;
                default:
                    return 0;
            }
        });
        return list;
    }, [devices, query, sortKey, sortDir]);
    function toggleSort(key) {
        if (key === sortKey)
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortKey(key);
            setSortDir("asc");
        }
    }
    const thBtn = "inline-flex items-center gap-1 text-left hover:text-text transition";
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Devices" }), _jsxs("label", { className: "relative w-full md:w-72", children: [_jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 opacity-60" }), _jsx("input", { className: "w-full rounded-xl border border-[color:var(--border)] bg-soft px-8 py-2 text-sm outline-none placeholder:text-muted focus:border-white/20", placeholder: "Search by ID, name, or status\u2026", value: query, onChange: (e) => setQuery(e.target.value) })] })] }), _jsx("div", { className: "overflow-x-auto surface rounded-xl border border-white/10 bg-panel", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { className: "bg-soft/70", children: _jsxs("tr", { className: "[&>th]:px-3 [&>th]:py-2 text-muted", children: [_jsx("th", { children: _jsxs("button", { className: thBtn, onClick: () => toggleSort("id"), children: ["ID ", _jsx(ArrowUpDown, { size: 14, className: "opacity-60" })] }) }), _jsx("th", { children: _jsxs("button", { className: thBtn, onClick: () => toggleSort("name"), children: ["Name ", _jsx(ArrowUpDown, { size: 14, className: "opacity-60" })] }) }), _jsx("th", { children: _jsxs("button", { className: thBtn, onClick: () => toggleSort("status"), children: ["Status ", _jsx(ArrowUpDown, { size: 14, className: "opacity-60" })] }) }), _jsx("th", { className: "text-right", children: _jsxs("button", { className: thBtn, onClick: () => toggleSort("cpu"), children: ["CPU ", _jsx(ArrowUpDown, { size: 14, className: "opacity-60" })] }) }), _jsx("th", { className: "text-right pr-4", children: "Trend" })] }) }), _jsxs("tbody", { className: "[&>tr:not(:last-child)]:border-b [&>tr]:border-white/10", children: [(loading ? [] : filtered).map((d) => (_jsxs("tr", { className: "[&>td]:px-3 [&>td]:py-2", children: [_jsx("td", { className: "font-medium text-text/90", children: d.id }), _jsx("td", { className: "text-text", children: d.name }), _jsx("td", { children: _jsx(StatusPill, { status: d.status }) }), _jsxs("td", { className: "text-right", children: [d.cpu, "%"] }), _jsx("td", { className: "text-right pr-4 text-muted", children: _jsx(Sparkline, { points: d.cpuHistory }) })] }, d.id))), !loading && filtered.length === 0 && (_jsx("tr", { children: _jsxs("td", { colSpan: 5, className: "px-3 py-10 text-center text-muted", children: ["No devices match \u201C", query, "\u201D."] }) })), loading && (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-3 py-10 text-center text-muted", children: "Loading\u2026" }) }))] })] }) }), _jsx("div", { className: "text-xs text-muted", children: loading
                    ? "Loading…"
                    : `${filtered.length} device${filtered.length === 1 ? "" : "s"} shown • sort by ${sortKey} (${sortDir})` })] }));
}
