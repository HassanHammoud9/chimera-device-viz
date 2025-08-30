const base = [
    { id: "C1", name: "Edge-Collector-01", status: "online", cpu: 41, cpuHistory: [22, 28, 36, 32, 30, 38, 41] },
    { id: "C2", name: "Edge-Collector-02", status: "degraded", cpu: 72, cpuHistory: [70, 68, 66, 69, 71, 74, 72] },
    { id: "C3", name: "Sensor-Hub-3", status: "offline", cpu: 0, cpuHistory: [8, 7, 5, 4, 2, 0, 0] },
    { id: "C4", name: "Sensor-Hub-4", status: "online", cpu: 33, cpuHistory: [18, 22, 25, 30, 28, 31, 33] },
    { id: "C5", name: "Aggregator-01", status: "online", cpu: 54, cpuHistory: [42, 47, 49, 51, 53, 55, 54] },
];
export async function fetchDevices() {
    // simulate latency for realism
    await new Promise(r => setTimeout(r, 150));
    return base;
}
export async function fetchDeviceById(id) {
    await new Promise(r => setTimeout(r, 150));
    const d = base.find(x => x.id === id);
    if (!d)
        return null;
    const rand = (n) => Math.max(0, Math.min(100, Math.round(n + (Math.random() * 10 - 5))));
    const trail = (v) => Array.from({ length: 20 }, (_, i) => rand(v + Math.sin(i / 2) * 8));
    return {
        id: d.id,
        name: d.name,
        status: d.status,
        metrics: {
            cpu: rand(d.cpu || 20),
            mem: rand(55),
            net: rand(35),
        },
        trends: {
            cpu: trail(d.cpu || 20),
            mem: trail(55),
            net: trail(35),
        },
        lastSeen: new Date(Date.now() - (d.status === "offline" ? 1000 * 60 * 45 : 1000 * 30)).toISOString(),
        ip: "10.12.4." + (20 + Math.floor(Math.random() * 80)),
        location: "DC-1 / Rack A",
        logs: [
            { ts: new Date(Date.now() - 600000).toISOString(), level: "info", msg: "Heartbeat OK" },
            { ts: new Date(Date.now() - 540000).toISOString(), level: "warn", msg: "CPU spike detected (85%)" },
            { ts: new Date(Date.now() - 300000).toISOString(), level: "info", msg: "Ingest 1.2k msgs/min" },
            ...(d.status === "offline"
                ? [{ ts: new Date(Date.now() - 120000).toISOString(), level: "error", msg: "Agent unreachable" }]
                : []),
        ],
        blocklist: {}, // Add a default empty blocklist or mock data as needed
    };
}
