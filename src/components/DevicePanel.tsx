// src/components/DevicePanel.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cpu, Wifi, HardDrive } from "lucide-react";
import Gauge from "./Gauge";

import { DeviceDetails } from "@/lib/types";
import { getLogs } from "./getLogs";

type Props = {
  deviceId: string | null;
  open: boolean;
  onClose: () => void;
};

function mapDetails(raw: Record<string, unknown>, prev?: DeviceDetails): DeviceDetails {
  const id = raw.id ?? prev?.id ?? "";
  const givenName = raw.given_name as string | undefined;
  const hostname = raw.hostname as string | undefined;
  const nameField = raw.name as string | undefined;
  const isActive = raw.is_active as boolean | undefined;
  const statusField = raw.status as DeviceDetails["status"] | undefined;
  const metrics = raw.metrics as DeviceDetails["metrics"] | undefined;
  const trends = raw.trends as DeviceDetails["trends"] | undefined;
  const lastSeen = raw.last_seen as string | undefined;
  const firstSeen = raw.first_seen as string | undefined;
  const ip = raw.ip as string | undefined;
  const group = raw.group as { name?: string } | undefined;
  const locationRaw = raw.location as string | undefined;
  const logs = raw.logs as DeviceDetails["logs"] | undefined;
  const blocklist = raw.blocklist as Record<string, boolean> | undefined;
  return {
    id: String(id),
    name: givenName ?? hostname ?? nameField ?? prev?.name ?? `Device ${id}`,
    status:
      isActive != null
        ? isActive
          ? "online"
          : "offline"
        : statusField ?? prev?.status ?? "offline",
    metrics: metrics ?? prev?.metrics ?? { cpu: 0, mem: 0, net: 0 },
    trends: trends ?? prev?.trends ?? { cpu: [], mem: [], net: [] },
    lastSeen:
      lastSeen ?? firstSeen ?? prev?.lastSeen ?? new Date().toISOString(),
    ip: ip ?? prev?.ip ?? "—",
    location: group?.name ?? locationRaw ?? prev?.location,
    logs: logs ?? prev?.logs ?? [],
    blocklist: blocklist ?? prev?.blocklist ?? {},
  };
}

export default function DevicePanel({ deviceId, open, onClose }: Props) {
  const [data, setData] = useState<DeviceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!open || deviceId == null) return;
      setLoading(true);
      setError(null);
      try {
        const id = String(deviceId);
        const list = await axios.get(`/api/devices`);
        const rawList = list.data.find(
          (d: Record<string, unknown>) => String((d as { id: unknown }).id) === id
        );
        let detail = rawList;
        try {
          const one = await axios.get(`/api/devices/${id}`);
          detail = one.data;
        } catch {
          // ignore detail fetch errors; fallback to list data
        }
        setData(detail ? mapDetails(detail, rawList ? mapDetails(rawList) : undefined) : null);
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
      setData((prev) => mapDetails(res.data ?? {}, prev ?? data));
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
          {/* backdrop (scoped to nearest relative container) */}
          <motion.div
            className="absolute inset-0 bg-black/40 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* panel (scoped, not fixed) */}
          <motion.aside
            className="absolute right-0 top-0 h-full w-[360px] z-20 device-panel border-l border-[color:var(--border)] p-6 pt-4 overflow-y-auto rounded-l-2xl shadow-xl"
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1 mt-6 md:mt-8">
                <h3
                  className="text-xl font-bold text-white drop-shadow-md"
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
              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  className="px-3 py-1 rounded bg-yellow-600 text-white font-semibold hover:bg-yellow-700 disabled:opacity-60 shadow-sm"
                  disabled={actionLoading === "isolate"}
                  onClick={() => handleAction("isolate")}
                >
                  {actionLoading === "isolate" ? "Isolating..." : "Isolate"}
                </button>
                <button
                  className="px-3 py-1 rounded bg-green-700 text-white font-semibold hover:bg-green-800 disabled:opacity-60 shadow-sm"
                  disabled={actionLoading === "release"}
                  onClick={() => handleAction("release")}
                >
                  {actionLoading === "release" ? "Releasing..." : "Release"}
                </button>
                {/* Toggle blocklist categories */}
                {Object.keys(data.blocklist || {}).map((cat) => (
                  <button
                    key={cat}
                    className={`px-3 py-1 rounded font-semibold disabled:opacity-60 shadow-sm ${
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
            {error && <div className="text-red-400 mb-4">{error}</div>}

            {/* status */}
            {data && (
              <div className="mb-6">
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
            <div className="grid grid-cols-3 gap-4 mb-6">
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
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <Info icon={<Cpu size={16} />} label="Avg CPU" value={`${avg(data?.trends.cpu)}%`} />
                <Info icon={<HardDrive size={16} />} label="Avg Mem" value={`${avg(data?.trends.mem)}%`} />
                <Info icon={<Wifi size={16} />} label="Avg Net" value={`${avg(data?.trends.net)}%`} />
              </div>
            </div>

            {/* logs */}
            <div className="bg-[#23242a] rounded-xl p-4 shadow-inner border border-white/5">
              <div className="mb-3 font-semibold text-base text-white tracking-wide">Recent logs</div>
              <ul className="space-y-3 text-xs">
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

// Info block
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
    <div className="flex items-center gap-2">
      <span>{icon}</span>
      <span className="text-muted">{label}</span>
      <span className="ml-auto font-bold">{value}</span>
    </div>
  );
}

// (removed unused toDetails function)

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
