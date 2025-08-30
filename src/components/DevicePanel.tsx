// src/components/DevicePanel.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cpu, Wifi, HardDrive } from "lucide-react";
import Gauge from "./Gauge";

import { DeviceDetails } from "@/lib/types";
import { getLogs } from "./getLogs";

type Props = {
  deviceId: number | null;
  open: boolean;
  onClose: () => void;
};

export default function DevicePanel({ deviceId, open, onClose }: Props) {
  const [data, setData] = useState<DeviceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!open || !deviceId) return;
      setLoading(true);
      setError(null);

      const toDetails = (raw: any): DeviceDetails => ({
        id: Number(raw.id),
        name: raw.given_name ?? raw.hostname ?? `Device ${raw.id}`,
        status: raw.is_active ? "online" : "offline",
        metrics: raw.metrics ?? { cpu: 0, mem: 0, net: 0 },
        trends: raw.trends ?? { cpu: [], mem: [], net: [] },
        lastSeen: raw.last_seen ?? raw.first_seen ?? new Date().toISOString(),
        ip: raw.ip ?? "—",
        location: raw.group?.name,
        logs: raw.logs ?? [],
        blocklist: raw.blocklist ?? {},
      });

      try {
        // Try to find the device in the list first
        const list = await axios.get(`/api/devices`);
        let raw = list.data.find((d: any) => Number(d.id) === Number(deviceId));

        // Fallback to per-device endpoint if not present in list
        if (!raw) {
          const one = await axios.get(`/api/devices/${deviceId}`);
          raw = one.data;
        }

        setData(raw ? toDetails(raw) : null);
      } catch {
        setError("Could not load device details");
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
    return () => {};
  }, [deviceId, open]);

  // Quick action handler
  async function handleAction(
    action: "isolate" | "release" | "toggle_block",
    category?: string
  ) {
    if (!data) return;
    setActionLoading(action + (category ? `:${category}` : ""));
    setError(null);
    try {
      const res = await axios.post(`/api/devices/${data.id}/actions`, {
        action,
        ...(category ? { category } : {}),
      });
      // server may return updated device; map minimally
      const raw = res.data ?? {};
      setData((prev) => ({
        ...(prev ?? { id: data.id, name: data.name, status: data.status }),
        status:
          raw.is_active != null
            ? raw.is_active
              ? "online"
              : "offline"
            : prev?.status ?? data.status,
        blocklist: raw.blocklist ?? prev?.blocklist ?? data.blocklist ?? {},
        logs: raw.logs ?? prev?.logs ?? data.logs ?? [],
        metrics: raw.metrics ?? prev?.metrics ?? data.metrics,
        trends: raw.trends ?? prev?.trends ?? data.trends,
        lastSeen:
          raw.last_seen ?? prev?.lastSeen ?? data.lastSeen ?? new Date().toISOString(),
        ip: raw.ip ?? prev?.ip ?? data.ip,
        location: raw.group?.name ?? prev?.location ?? data.location,
        name: raw.given_name ?? raw.hostname ?? prev?.name ?? data.name,
      }));
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setError(e.response?.data?.detail || "Action failed");
      } else {
        setError("Action failed");
      }
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* panel */}
          <motion.aside
            className="fixed right-0 top-0 bottom-0 w-[420px] bg-panel border-l border-[color:var(--border)] shadow-2xl p-4 overflow-y-auto"
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="space-y-1 mt-6 md:mt-8">
                <h3
                  className="text-lg font-bold text-white drop-shadow-md"
                  style={{ textShadow: "0 2px 8px #000c" }}
                >
                  {data?.name ?? "Loading…"}
                </h3>
                {data && (
                  <>
                    <div
                      className="text-base text-white font-extrabold tracking-wide drop-shadow-md"
                      style={{ textShadow: "0 2px 8px #000c" }}
                    >
                      {data.id} • {data.ip} • {data.location ?? "—"}
                    </div>
                    <div className="border-b border-white/10 my-2" />
                  </>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg border border-[color:var(--border)] px-2 py-1 hover:bg-white/5"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Actions */}
            {data && (
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  className="px-3 py-1 rounded bg-yellow-600 text-white font-semibold hover:bg-yellow-700 disabled:opacity-60"
                  disabled={actionLoading === "isolate"}
                  onClick={() => handleAction("isolate")}
                >
                  {actionLoading === "isolate" ? "Isolating..." : "Isolate"}
                </button>
                <button
                  className="px-3 py-1 rounded bg-green-700 text-white font-semibold hover:bg-green-800 disabled:opacity-60"
                  disabled={actionLoading === "release"}
                  onClick={() => handleAction("release")}
                >
                  {actionLoading === "release" ? "Releasing..." : "Release"}
                </button>
                {/* Toggle blocklist categories */}
                {Object.keys(data.blocklist || {}).map((cat) => (
                  <button
                    key={cat}
                    className={`px-3 py-1 rounded font-semibold disabled:opacity-60 ${
                      data.blocklist[cat]
                        ? "bg-red-700 text-white hover:bg-red-800"
                        : "bg-gray-700 text-white hover:bg-gray-800"
                    }`}
                    disabled={actionLoading === `toggle_block:${cat}`}
                    onClick={() => handleAction("toggle_block", cat)}
                  >
                    {actionLoading === `toggle_block:${cat}`
                      ? `Toggling ${cat}...`
                      : `${data.blocklist[cat] ? "Unblock" : "Block"} ${cat}`}
                  </button>
                ))}
              </div>
            )}
            {error && <div className="text-red-400 mb-2">{error}</div>}

            {/* status */}
            {data && (
              <div className="mb-4">
                <span
                  className={
                    "status-chip rounded-lg px-2 py-0.5 text-xs capitalize " +
                    (data.status === "online"
                      ? "bg-green-500/15 text-green-400"
                      : data.status === "degraded"
                      ? "bg-yellow-500/15 text-yellow-400"
                      : "bg-red-500/15 text-red-400")
                  }
                >
                  {data.status}
                </span>
                <span className="ml-2 text-xs text-muted">
                  Last seen {new Date(data.lastSeen).toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* gauges */}
            <div className="grid grid-cols-3 gap-3 soft mb-4">
              <Gauge
                value={data?.metrics.cpu ?? 0}
                label="CPU"
                tone={toneOf(data?.metrics.cpu)}
              />
              <Gauge
                value={data?.metrics.mem ?? 0}
                label="Memory"
                tone={toneOf(data?.metrics.mem)}
              />
              <Gauge
                value={data?.metrics.net ?? 0}
                label="Network"
                tone={toneOf(data?.metrics.net)}
              />
            </div>

            {/* quick info */}
            <div className="soft mb-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <Info icon={<Cpu size={16} />} label="Avg CPU" value={`${avg(data?.trends.cpu)}%`} />
                <Info icon={<HardDrive size={16} />} label="Avg Mem" value={`${avg(data?.trends.mem)}%`} />
                <Info icon={<Wifi size={16} />} label="Avg Net" value={`${avg(data?.trends.net)}%`} />
              </div>
            </div>

            {/* logs */}
            <div className="soft">
              <div className="mb-2 font-medium">Recent logs</div>
              <ul className="space-y-2 text-xs">
                {getLogs(data, loading).map((l, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span
                      className={
                        "mt-1 h-2 w-2 rounded-full " +
                        (l.level === "error"
                          ? "bg-red-500"
                          : l.level === "warn"
                          ? "bg-yellow-500"
                          : "bg-green-500")
                      }
                    />
                    <div className="flex-1">
                      <div className="text-muted">
                        {new Date(l.ts).toLocaleTimeString()} • {l.level}
                      </div>
                      <div>{l.msg}</div>
                    </div>
                  </li>
                ))}
                {getLogs(data, loading).length === 0 && !loading && (
                  <li className="text-muted">No logs.</li>
                )}
              </ul>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function avg(arr?: number[]) {
  if (!arr || !arr.length) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}
function toneOf(v?: number) {
  if (v == null) return "ok" as const;
  if (v < 60) return "ok";
  if (v < 80) return "warn";
  return "bad";
}
function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="surface px-3 py-2">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-1 text-base">{value}</div>
    </div>
  );
}
