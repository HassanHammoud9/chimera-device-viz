import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";
// Layout helper to position nodes in a ring with some height variation
function useLayout(devices) {
    return useMemo(() => {
        const n = devices.length || 1;
        const R = 6;
        const nodes = devices.map((d, i) => {
            const a = (i / n) * Math.PI * 2;
            return {
                id: d.id,
                name: d.name,
                status: d.status,
                pos: new THREE.Vector3(Math.cos(a) * R, (Math.sin(i * 1.2) * R) / 6, Math.sin(a) * R),
            };
        });
        const links = nodes.map((n, i) => ({
            source: n,
            target: nodes[(i + 1) % nodes.length],
        }));
        if (nodes.length > 3) {
            links.push({ source: nodes[0], target: nodes[2] });
            links.push({ source: nodes[1], target: nodes[3] });
        }
        return { nodes, links };
    }, [devices]);
}
function NodeBall({ node, onPick }) {
    const ref = useRef(null);
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        ref.current.position.y = node.pos.y + Math.sin(t + ref.current.id) * 0.06;
        ref.current.rotation.y += 0.003;
    });
    const color = node.status === "online"
        ? "#22c55e"
        : node.status === "degraded"
            ? "#eab308"
            : "#ef4444";
    return (_jsxs("mesh", { ref: ref, position: node.pos, onClick: (e) => {
            e.stopPropagation();
            onPick(node.id);
        }, children: [_jsx("sphereGeometry", { args: [0.38, 32, 32] }), _jsx("meshStandardMaterial", { color: color, roughness: 0.4, metalness: 0.2 }), _jsx(Html, { distanceFactor: 12, children: _jsx("div", { className: "r3f-chip r3f-chip--sm", title: node.name, children: node.name || `C${node.id}` }) })] }));
}
function Link({ a, b }) {
    const geo = useMemo(() => {
        const g = new THREE.BufferGeometry().setFromPoints([a, b]);
        return g;
    }, [a, b]);
    const material = useMemo(() => new THREE.LineBasicMaterial({ color: "white", opacity: 0.25, transparent: true }), []);
    const line = useMemo(() => new THREE.Line(geo, material), [geo, material]);
    return _jsx("primitive", { object: line });
}
export default function Topology3D({ devices, onPick, }) {
    const { nodes, links } = useLayout(devices);
    return (_jsx("div", { className: "h-[360px] md:h-[520px] rounded-xl border border-[color:var(--border)] bg-panel", children: _jsxs(Canvas, { camera: { position: [0, 5, 14], fov: 45 }, children: [_jsx("ambientLight", { intensity: 0.6 }), _jsx("directionalLight", { position: [6, 8, 3], intensity: 0.8 }), links.map((l, i) => (_jsx(Link, { a: l.source.pos, b: l.target.pos }, i))), nodes.map((n) => (_jsx(NodeBall, { node: n, onPick: onPick }, n.id))), _jsx(OrbitControls, { enablePan: false, minDistance: 6, maxDistance: 28 })] }) }));
}
