export type DeviceStatus = "online" | "degraded" | "offline";

export type Device = {
  id: number;
  name: string;
  status: DeviceStatus;
  cpu: number;          // latest %
  cpuHistory: number[]; // small sparkline
};

export type DeviceDetails = {
  id: number;
  name: string;
  status: DeviceStatus;
  metrics: {
    cpu: number;
    mem: number;
    net: number;
  };
  trends: {
    cpu: number[];
    mem: number[];
    net: number[];
  };
  lastSeen: string;
  ip: string;
  location?: string;
  logs: { ts: string; level: "info" | "warn" | "error"; msg: string }[];
  blocklist: { [category: string]: boolean };
};
