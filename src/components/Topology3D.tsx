import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Device } from "@/lib/types";

// Layout helper to position nodes in a ring with some height variation
function useLayout(devices: Device[]) {
  return useMemo(() => {
    const n = devices.length || 1;
    const R = 6;
    const nodes = devices.map((d, i) => {
      const a = (i / n) * Math.PI * 2;
      return {
        id: d.id,
        name: d.name,
        status: d.status,
        pos: new THREE.Vector3(
          Math.cos(a) * R,
          (Math.sin(i * 1.2) * R) / 6,
          Math.sin(a) * R
        ),
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

type NodeBallProps = {
  node: { id: Device["id"]; name: string; status: Device["status"]; pos: THREE.Vector3 };
  onPick: (id: Device["id"]) => void;
};

function NodeBall({ node, onPick }: NodeBallProps) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.position.y = node.pos.y + Math.sin(t + ref.current.id) * 0.06;
    ref.current.rotation.y += 0.003;
  });

  const color =
    node.status === "online"
      ? "#22c55e"
      : node.status === "degraded"
      ? "#eab308"
      : "#ef4444";

  return (
    <mesh
      ref={ref}
      position={node.pos}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onPick(node.id);
      }}
    >
      <sphereGeometry args={[0.38, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      <Html distanceFactor={12}>
        <div className="r3f-chip r3f-chip--sm" title={node.name}>
          {node.name || `C${node.id}`}
        </div>
      </Html>
    </mesh>
  );
}

function Link({ a, b }: { a: THREE.Vector3; b: THREE.Vector3 }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([a, b]);
    return g;
  }, [a, b]);
  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color: "white", opacity: 0.25, transparent: true }),
    []
  );
  const line = useMemo(() => new THREE.Line(geo, material), [geo, material]);
  return <primitive object={line} />;
}

export default function Topology3D({
  devices,
  onPick,
}: {
  devices: Device[];
  onPick: (id: Device["id"]) => void;
}) {
  const { nodes, links } = useLayout(devices);

  return (
    <div className="h-[360px] md:h-[520px] rounded-xl border border-[color:var(--border)] bg-panel">
      <Canvas camera={{ position: [0, 5, 14], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[6, 8, 3]} intensity={0.8} />
        {links.map((l, i) => (
          <Link key={i} a={l.source.pos} b={l.target.pos} />
        ))}
        {nodes.map((n) => (
          <NodeBall key={n.id} node={n} onPick={onPick} />
        ))}
        <OrbitControls enablePan={false} minDistance={6} maxDistance={28} />
      </Canvas>
    </div>
  );
}
