import { Canvas } from "@react-three/fiber";
import { Float, Html, Line, OrbitControls, Sparkles } from "@react-three/drei";

const SEGMENT_COLORS = {
  Champions: "#34d399",
  "Loyal Customers": "#38bdf8",
  "Potential Loyalists": "#a78bfa",
  "At Risk": "#fbbf24",
  Hibernating: "#fb7185",
  "Needs Attention": "#94a3b8",
};

function colorFor(name) {
  return SEGMENT_COLORS[name] || "#2dd4bf";
}

function getPositions(count) {
  if (!count) return [];
  return Array.from({ length: count }, (_, index) => {
    const angle = Math.PI / 2 + (index / count) * Math.PI * 2;
    return [
      Math.cos(angle) * 3.05,
      Math.sin(angle) * 1.38,
      Math.sin(angle * 2) * 0.22,
    ];
  });
}

function CenterCore({ totalCustomers }) {
  return (
    <group>
      <Float speed={1.15} floatIntensity={0.08} rotationIntensity={0.08}>
        <mesh>
          <icosahedronGeometry args={[0.52, 2]} />
          <meshPhysicalMaterial
            color="#0f766e"
            emissive="#14b8a6"
            emissiveIntensity={0.7}
            metalness={0.55}
            roughness={0.22}
            transparent
            opacity={0.92}
          />
        </mesh>
        <mesh rotation={[0.55, 0.25, 0.2]}>
          <torusGeometry args={[0.72, 0.018, 8, 80]} />
          <meshBasicMaterial color="#5eead4" transparent opacity={0.8} />
        </mesh>
        <mesh rotation={[1.1, -0.45, -0.2]}>
          <torusGeometry args={[0.86, 0.009, 8, 80]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.52} />
        </mesh>
      </Float>
      <Html center position={[0, 0, 0.62]} distanceFactor={10} zIndexRange={[50, 0]}>
        <div className="pointer-events-none flex min-w-[92px] flex-col items-center rounded-xl border border-teal-300/30 bg-slate-950/85 px-3 py-2 text-center shadow-[0_0_28px_rgba(20,184,166,0.22)] backdrop-blur-md">
          <span className="text-[9px] font-bold tracking-[0.24em] text-teal-300">RFM CORE</span>
          <span className="mt-1 text-lg font-semibold leading-none text-white">{Number(totalCustomers || 0).toLocaleString()}</span>
          <span className="mt-1 whitespace-nowrap text-[9px] text-slate-300">eligible customers</span>
        </div>
      </Html>
    </group>
  );
}

function SegmentNode({ segment, position, selected, onSelect }) {
  const count = Number(segment.count) || 0;
  const color = colorFor(segment.name);
  const radius = Math.min(0.28 + Math.sqrt(count) * 0.035, 0.52);
  const labelLength = Math.hypot(position[0], position[1]) || 1;
  const labelPosition = [
    (position[0] / labelLength) * (radius + 0.36),
    (position[1] / labelLength) * (radius + 0.36),
    0.04,
  ];

  return (
    <Float speed={1.15 + (count % 4) * 0.12} floatIntensity={0.13} rotationIntensity={0.04}>
      <group position={position}>
        <mesh
          onClick={(event) => {
            event.stopPropagation();
            onSelect(segment.name);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
          scale={selected ? 1.12 : 1}
        >
          <sphereGeometry args={[radius, 40, 40]} />
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={selected ? 1.1 : 0.35}
            metalness={0.36}
            roughness={0.2}
            clearcoat={0.8}
            clearcoatRoughness={0.16}
          />
        </mesh>
        <mesh scale={selected ? 1.22 : 1.12}>
          <torusGeometry args={[radius + 0.09, selected ? 0.024 : 0.012, 8, 56]} />
          <meshBasicMaterial color={color} transparent opacity={selected ? 0.95 : 0.42} />
        </mesh>
        <Html center position={labelPosition} distanceFactor={10} zIndexRange={[30, 0]}>
          <button
            type="button"
            aria-pressed={selected}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(segment.name);
            }}
            className={`pointer-events-auto min-w-[108px] whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-center shadow-lg backdrop-blur-md transition duration-200 ${
              selected
                ? "border-teal-300 bg-slate-900 text-white shadow-teal-500/30"
                : "border-slate-700/80 bg-slate-950/85 text-slate-200 hover:border-teal-400 hover:bg-slate-900"
            }`}
          >
            <span className="block text-[10px] font-semibold">{segment.name}</span>
            <span className="mt-0.5 block text-[9px] opacity-75">{count.toLocaleString()} {count === 1 ? "customer" : "customers"}</span>
          </button>
        </Html>
      </group>
    </Float>
  );
}

export function CustomerSegments3D({
  segments = [],
  selectedSegment = "All segments",
  totalCustomers = 0,
  loading = false,
  onSelectSegment = () => {},
}) {
  const positions = getPositions(segments.length);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> INTERACTIVE 3D
          </div>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Customer segment universe</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Drag to explore. Select any node to filter the customer list below.</p>
        </div>
        <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
          {selectedSegment === "All segments" ? "All segments" : `Filtering: ${selectedSegment}`}
        </span>
      </div>

      <div className="relative mt-4 h-[350px] overflow-hidden rounded-xl border border-slate-800/70 bg-[radial-gradient(ellipse_at_center,_rgba(15,118,110,0.22),_rgba(2,6,23,0.98)_72%)] sm:h-[390px]">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-300">Loading customer segmentsâ€¦</div>
        ) : segments.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-300">Segment data will appear here when customer analytics are available.</div>
        ) : (
          <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 10], fov: 42 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.9} />
            <pointLight position={[0, 1.5, 4]} intensity={4} color="#5eead4" />
            <pointLight position={[-4, 1, 2]} intensity={2.5} color="#818cf8" />
            <Sparkles count={30} scale={[8.4, 3.7, 1.5]} size={1.8} speed={0.22} opacity={0.38} color="#99f6e4" />
            {segments.map((segment, index) => (
              <Line
                key={`link-${segment.name}`}
                points={[[0, 0, -0.2], positions[index]]}
                color={colorFor(segment.name)}
                transparent
                opacity={selectedSegment === segment.name ? 0.75 : 0.25}
                lineWidth={selectedSegment === segment.name ? 1.7 : 1}
              />
            ))}
            <CenterCore totalCustomers={totalCustomers} />
            {segments.map((segment, index) => (
              <SegmentNode
                key={segment.name}
                segment={segment}
                position={positions[index]}
                selected={selectedSegment === segment.name}
                onSelect={onSelectSegment}
              />
            ))}
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              rotateSpeed={0.42}
              minPolarAngle={Math.PI / 2 - 0.22}
              maxPolarAngle={Math.PI / 2 + 0.22}
            />
          </Canvas>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Customer segment filters">
        {segments.map((segment) => {
          const color = colorFor(segment.name);
          const active = selectedSegment === segment.name;
          return (
            <button
              key={`filter-${segment.name}`}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectSegment(segment.name)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-teal-400 bg-teal-50 text-teal-900 dark:bg-teal-950/50 dark:text-teal-100"
                  : "border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              {segment.name} <span className="opacity-70">{segment.count}</span>
            </button>
          );
        })}
        {selectedSegment !== "All segments" && (
          <button
            type="button"
            onClick={() => onSelectSegment(selectedSegment)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
          >
            Clear selection
          </button>
        )}
      </div>
    </section>
  );
}
