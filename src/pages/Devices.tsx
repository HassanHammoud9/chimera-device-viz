import { useEffect, useMemo, useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import { Device } from "@/lib/types";
import { fetchDevices } from "@/lib/mock";

// table helpers
type SortKey = "id" | "name" | "status" | "cpu";
type SortDir = "asc" | "desc";
type DeviceStatus = "online" | "degraded" | "offline";

function StatusPill({ status }: { status: DeviceStatus }) {
  const cls =
    status === "online"
      ? "bg-green-500/15 text-green-400"
      : status === "degraded"
      ? "bg-yellow-500/15 text-yellow-400"
      : "bg-red-500/15 text-red-400";
  return (
    <span className={`status-chip rounded-lg px-2 py-0.5 text-xs capitalize ${cls}`}>{status}</span>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const data = points.map((v, i) => ({ i, v }));
  return (
    <div className="h-8 w-28">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.8} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={false}
            contentStyle={{
              background: "#141823",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 10,
              padding: "6px 8px",
              color: "white",
            }}
            formatter={(value: number) => [`${value}%`, "CPU"]}
            labelFormatter={() => ""}
          />
          <Area type="monotone" dataKey="v" stroke="currentColor" fill="url(#spark)" strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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
    const list = devices.filter(
      (d) =>
        !q ||
        d.id.toString().toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q)
    );
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

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const thBtn = "inline-flex items-center gap-1 text-left hover:text-text transition";

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-xl font-semibold">Devices</h2>
        <label className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
          <input
            className="w-full rounded-xl border border-[color:var(--border)] bg-soft px-8 py-2 text-sm outline-none placeholder:text-muted focus:border-white/20"
            placeholder="Search by ID, name, or status…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="overflow-x-auto surface rounded-xl border border-white/10 bg-panel">
        <table className="min-w-full text-sm">
          <thead className="bg-soft/70">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-muted">
              <th>
                <button className={thBtn} onClick={() => toggleSort("id")}>
                  ID <ArrowUpDown size={14} className="opacity-60" />
                </button>
              </th>
              <th>
                <button className={thBtn} onClick={() => toggleSort("name")}>
                  Name <ArrowUpDown size={14} className="opacity-60" />
                </button>
              </th>
              <th>
                <button className={thBtn} onClick={() => toggleSort("status")}>
                  Status <ArrowUpDown size={14} className="opacity-60" />
                </button>
              </th>
              <th className="text-right">
                <button className={thBtn} onClick={() => toggleSort("cpu")}>
                  CPU <ArrowUpDown size={14} className="opacity-60" />
                </button>
              </th>
              <th className="text-right pr-4">Trend</th>
            </tr>
          </thead>
          <tbody className="[&>tr:not(:last-child)]:border-b [&>tr]:border-white/10">
            {(loading ? [] : filtered).map((d) => (
              <tr
                key={d.id}
                className="[&>td]:px-3 [&>td]:py-2"
              >
                <td className="font-medium text-text/90">{d.id}</td>
                <td className="text-text">{d.name}</td>
                <td>
                  <StatusPill status={d.status as DeviceStatus} />
                </td>
                <td className="text-right">{d.cpu}%</td>
                <td className="text-right pr-4 text-muted">
                  <Sparkline points={d.cpuHistory} />
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-muted">
                  No devices match “{query}”.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-muted">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted">
        {loading
          ? "Loading…"
          : `${filtered.length} device${filtered.length === 1 ? "" : "s"} shown • sort by ${sortKey} (${sortDir})`}
      </div>
    </div>
  );
}
