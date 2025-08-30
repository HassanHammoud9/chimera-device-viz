import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import Topology3D from "@/components/Topology3D";
import { fetchDevices } from "@/lib/mock";
import DevicePanel from "@/components/DevicePanel";
export default function Analytics() {
    const [devices, setDevices] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    useEffect(() => {
        (async () => setDevices(await fetchDevices()))();
    }, []);
    return (
    // relative → DevicePanel (absolute) will be scoped to this page
    _jsxs("div", { className: "space-y-4 relative", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Analytics" }), _jsxs("div", { className: "surface p-6 md:p-8", children: [_jsx("div", { className: "mb-3 text-sm text-muted", children: "Topology \u2014 click a node to open details" }), _jsx(Topology3D, { devices: devices, onPick: (id) => {
                            setSelectedId(id); // use string id
                            setOpen(true);
                        } })] }), _jsx(DevicePanel, { deviceId: selectedId, open: open, onClose: () => setOpen(false) })] }));
}
