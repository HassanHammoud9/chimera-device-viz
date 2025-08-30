import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/DevicePanel.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { fetchDevices, fetchDeviceById } from "@/lib/mock";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cpu, Wifi, HardDrive } from "lucide-react";
import Gauge from "./Gauge";
import { getLogs } from "./getLogs";
function mapDetails(raw, prev) {
    const id = raw.id ?? prev?.id ?? "";
    const givenName = raw.given_name;
    const hostname = raw.hostname;
    const nameField = raw.name;
    const isActive = raw.is_active;
    const statusField = raw.status;
    const metrics = raw.metrics;
    const trends = raw.trends;
    const lastSeen = raw.last_seen;
    const firstSeen = raw.first_seen;
    const ip = raw.ip;
    const group = raw.group;
    const locationRaw = raw.location;
    const logs = raw.logs;
    const blocklist = raw.blocklist;
    return {
        id: String(id),
        name: givenName ?? hostname ?? nameField ?? prev?.name ?? `Device ${id}`,
        status: isActive != null
            ? isActive
                ? "online"
                : "offline"
            : statusField ?? prev?.status ?? "offline",
        metrics: metrics ?? prev?.metrics ?? { cpu: 0, mem: 0, net: 0 },
        trends: trends ?? prev?.trends ?? { cpu: [], mem: [], net: [] },
        lastSeen: lastSeen ?? firstSeen ?? prev?.lastSeen ?? new Date().toISOString(),
        ip: ip ?? prev?.ip ?? "—",
        location: group?.name ?? locationRaw ?? prev?.location,
        logs: logs ?? prev?.logs ?? [],
        blocklist: blocklist ?? prev?.blocklist ?? {},
    };
}
export default function DevicePanel({ deviceId, open, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        (async () => {
            if (!open || deviceId == null)
                return;
            setLoading(true);
            setError(null);
            try {
                const id = String(deviceId);
                // Fetch the device list, falling back to mock data if the API fails.
                let list = [];
                try {
                    list = (await axios.get(`/api/devices`)).data;
                }
                catch {
                    list = (await fetchDevices());
                }
                const rawList = list.find((d) => String(d.id) === id);
                // Try to load the full device details. If the API request fails, use the
                // mock detail data instead so the panel still renders useful content.
                let detail = rawList ?? null;
                try {
                    detail = (await axios.get(`/api/devices/${id}`)).data;
                }
                catch {
                    try {
                        detail = await fetchDeviceById(id);
                    }
                    catch {
                        // ignore mock fetch errors; we'll fall back to the list data
                    }
                }
                setData(detail ? mapDetails(detail, rawList ? mapDetails(rawList) : undefined) : null);
            }
            catch {
                setError("Could not load device details");
                setData(null);
            }
            finally {
                setLoading(false);
            }
        })();
        return () => { };
    }, [deviceId, open]);
    // Quick action handler
    async function handleAction(action, category) {
        if (!data)
            return;
        setActionLoading(action + (category ? `:${category}` : ""));
        setError(null);
        try {
            const res = await axios.post(`/api/devices/${data.id}/actions`, {
                action,
                ...(category ? { category } : {}),
            });
            setData((prev) => mapDetails(res.data ?? {}, prev ?? data));
        }
        catch (e) {
            if (axios.isAxiosError(e)) {
                setError(e.response?.data?.detail || "Action failed");
            }
            else {
                setError("Action failed");
            }
        }
        finally {
            setActionLoading(null);
        }
    }
    return (_jsx(AnimatePresence, { children: open && (_jsxs(_Fragment, { children: [_jsx(motion.div, { className: "absolute inset-0 bg-black/40 z-10", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose }), _jsxs(motion.aside, { className: "absolute right-0 top-0 h-full w-[360px] z-20 device-panel border-l border-[color:var(--border)] p-6 pt-4 overflow-y-auto rounded-l-2xl shadow-xl", initial: { x: 420 }, animate: { x: 0 }, exit: { x: 420 }, transition: { type: "spring", stiffness: 260, damping: 28 }, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "space-y-1 mt-6 md:mt-8", children: [_jsx("h3", { className: "text-xl font-bold text-white drop-shadow-md", style: { textShadow: "0 2px 8px #000c" }, children: data?.name ?? "Loading…" }), data && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "text-base text-white font-extrabold tracking-wide drop-shadow-md", style: { textShadow: "0 2px 8px #000c" }, children: [data.id, " \u2022 ", data.ip, " \u2022 ", data.location ?? "—"] }), _jsx("div", { className: "border-b border-white/10 my-2" })] }))] }), _jsx("button", { onClick: onClose, className: "rounded-lg border border-[color:var(--border)] px-2 py-1 hover:bg-white/5", "aria-label": "Close", children: _jsx(X, { size: 16 }) })] }), data && (_jsxs("div", { className: "mb-6 flex flex-wrap gap-2", children: [_jsx("button", { className: "px-3 py-1 rounded bg-yellow-600 text-white font-semibold hover:bg-yellow-700 disabled:opacity-60 shadow-sm", disabled: actionLoading === "isolate", onClick: () => handleAction("isolate"), children: actionLoading === "isolate" ? "Isolating..." : "Isolate" }), _jsx("button", { className: "px-3 py-1 rounded bg-green-700 text-white font-semibold hover:bg-green-800 disabled:opacity-60 shadow-sm", disabled: actionLoading === "release", onClick: () => handleAction("release"), children: actionLoading === "release" ? "Releasing..." : "Release" }), Object.keys(data.blocklist || {}).map((cat) => (_jsx("button", { className: `px-3 py-1 rounded font-semibold disabled:opacity-60 shadow-sm ${data.blocklist[cat]
                                        ? "bg-red-700 text-white hover:bg-red-800"
                                        : "bg-gray-700 text-white hover:bg-gray-800"}`, disabled: actionLoading === `toggle_block:${cat}`, onClick: () => handleAction("toggle_block", cat), children: actionLoading === `toggle_block:${cat}`
                                        ? `Toggling ${cat}...`
                                        : `${data.blocklist[cat] ? "Unblock" : "Block"} ${cat}` }, cat)))] })), error && _jsx("div", { className: "text-red-400 mb-4", children: error }), data && (_jsxs("div", { className: "mb-6", children: [_jsx("span", { className: "status-chip rounded-lg px-2 py-0.5 text-xs capitalize " +
                                        (data.status === "online"
                                            ? "bg-green-500/15 text-green-400"
                                            : data.status === "degraded"
                                                ? "bg-yellow-500/15 text-yellow-400"
                                                : "bg-red-500/15 text-red-400"), children: data.status }), _jsxs("span", { className: "ml-2 text-xs text-muted", children: ["Last seen ", new Date(data.lastSeen).toLocaleTimeString()] })] })), _jsxs("div", { className: "grid grid-cols-3 gap-4 mb-6", children: [_jsx(Gauge, { value: data?.metrics.cpu ?? 0, label: "CPU", tone: toneOf(data?.metrics.cpu) }), _jsx(Gauge, { value: data?.metrics.mem ?? 0, label: "Memory", tone: toneOf(data?.metrics.mem) }), _jsx(Gauge, { value: data?.metrics.net ?? 0, label: "Network", tone: toneOf(data?.metrics.net) })] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [_jsx(Info, { icon: _jsx(Cpu, { size: 16 }), label: "Avg CPU", value: `${avg(data?.trends.cpu)}%` }), _jsx(Info, { icon: _jsx(HardDrive, { size: 16 }), label: "Avg Mem", value: `${avg(data?.trends.mem)}%` }), _jsx(Info, { icon: _jsx(Wifi, { size: 16 }), label: "Avg Net", value: `${avg(data?.trends.net)}%` })] }) }), _jsxs("div", { className: "bg-[#23242a] rounded-xl p-4 shadow-inner border border-white/5", children: [_jsx("div", { className: "mb-3 font-semibold text-base text-white tracking-wide", children: "Recent logs" }), _jsxs("ul", { className: "space-y-3 text-xs", children: [getLogs(data, loading).map((l, idx) => (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "mt-1 h-2 w-2 rounded-full " +
                                                        (l.level === "error"
                                                            ? "bg-red-500"
                                                            : l.level === "warn"
                                                                ? "bg-yellow-500"
                                                                : "bg-green-500") }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "text-muted", children: [new Date(l.ts).toLocaleTimeString(), " \u2022 ", l.level] }), _jsx("div", { children: l.msg })] })] }, idx))), getLogs(data, loading).length === 0 && !loading && (_jsx("li", { className: "text-muted", children: "No logs." }))] })] })] })] })) }));
}
// Info block
function Info({ icon, label, value, }) {
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { children: icon }), _jsx("span", { className: "text-muted", children: label }), _jsx("span", { className: "ml-auto font-bold", children: value })] }));
}
// (removed unused toDetails function)
function avg(arr) {
    if (!arr || !arr.length)
        return 0;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}
function toneOf(v) {
    if (v == null)
        return "ok";
    if (v < 60)
        return "ok";
    if (v < 80)
        return "warn";
    return "bad";
}
