import { useEffect, useState } from "react";
import Topology3D from "@/components/Topology3D";
import { Device } from "@/lib/types";
import { fetchDevices } from "@/lib/mock";
import DevicePanel from "@/components/DevicePanel";


export default function Analytics() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => setDevices(await fetchDevices()))();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Analytics</h2>

      <div className="surface p-6 md:p-8">
        <div className="mb-3 text-sm text-muted">
          Topology — click a node to open details
        </div>
        <Topology3D
          devices={devices}
          onPick={(id) => {
            setSelectedId(id);
            setOpen(true);
          }}
        />
      </div>

  <DevicePanel deviceId={selectedId} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
