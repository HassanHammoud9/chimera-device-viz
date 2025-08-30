export function getLogs(data, loading) {
    if (loading) {
        return Array.from({ length: 3 }).map((_, i) => ({ ts: String(Date.now() - i * 60000), level: "info", msg: "…" }));
    }
    if (data?.logs && data.logs.length > 0)
        return data.logs;
    if (!data)
        return [];
    // Generate mock logs based on device type or status
    const now = Date.now();
    const base = [
        { ts: String(now - 120000), level: "info", msg: `${data.name || "Device"} connected to network.` },
        { ts: String(now - 60000), level: data.status === "degraded" ? "warn" : "info", msg: data.status === "degraded" ? "Performance degraded detected." : "Normal operation." },
        { ts: String(now), level: "info", msg: `Heartbeat received.` },
    ];
    if (data.status === "offline")
        base[2] = { ts: String(now), level: "error", msg: "Device is offline." };
    return base;
}
