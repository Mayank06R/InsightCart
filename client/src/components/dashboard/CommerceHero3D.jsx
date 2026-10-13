import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls, Sparkles } from "@react-three/drei";
import { Activity, ArrowDownRight, ArrowUpRight, MousePointer2, Sparkles as SparklesIcon } from "lucide-react";

function OrbitRing({ radius, tube, color, rotation, speed = 0.15 }) {
  const ringRef = useRef(null);

  useFrame((_, delta) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z += delta * speed;
    ringRef.current.rotation.x += delta * speed * 0.35;
  });

  return (
    <mesh ref={ringRef} rotation={rotation}>
      <torusGeometry args={[radius, tube, 14, 120]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.7}
        metalness={0.8}
        roughness={0.22}
      />
    </mesh>
  );
}

function IntelligenceOrb() {
  return (
    <>
      <ambientLight intensity={0.75} />
      <pointLight position={[2.5, 2.5, 3]} intensity={22} color="#76f7e8" />
      <pointLight position={[-3, -1, -2]} intensity={15} color="#8b5cf6" />
      <Float speed={1.5} rotationIntensity={0.22} floatIntensity={0.45}>
        <mesh>
          <icosahedronGeometry args={[1.05, 7]} />
          <MeshDistortMaterial
            color="#39d9d0"
            emissive="#087e87"
            emissiveIntensity={0.45}
            metalness={0.58}
            roughness={0.18}
            distort={0.28}
            speed={1.6}
          />
        </mesh>
        <OrbitRing radius={1.42} tube={0.012} color="#8b5cf6" rotation={[0.8, 0.3, 0.2]} speed={0.12} />
        <OrbitRing radius={1.62} tube={0.008} color="#62eee0" rotation={[1.1, 0.9, 0.7]} speed={-0.09} />
      </Float>
      <Sparkles count={70} scale={4.3} size={2.3} speed={0.35} color="#b8fff6" />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.45} />
    </>
  );
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function CommerceHero3D() {
  return (
    <section className="relative isolate overflow-hidden rounded-[28px] border border-slate-800 bg-[#070b14] text-white shadow-2xl shadow-slate-950/10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-violet-600/20 blur-[90px]" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-teal-400/10 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(148,163,184,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.3)_1px,transparent_1px)] [background-size:34px_34px]" />
      </div>

      <div className="relative grid min-h-[390px] grid-cols-1 items-center gap-2 px-6 py-7 sm:px-8 md:grid-cols-[1.02fr_0.98fr] md:px-10 lg:min-h-[405px] lg:px-12">
        <div className="relative z-10 max-w-xl py-2">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.19em] text-teal-200 sm:text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-300" />
            </span>
            Customer intelligence platform
          </div>

          <h2 className="max-w-lg text-3xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-4xl lg:text-[3.25rem]">
            Every order tells
            <span className="block bg-gradient-to-r from-teal-200 via-cyan-300 to-violet-300 bg-clip-text pb-1 text-transparent">
              a bigger story.
            </span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400 sm:text-[15px]">
            Explore sales performance, discover customer patterns, and turn store activity into clearer decisions.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => scrollToSection("overview-metrics")}
              className="group inline-flex items-center gap-2 rounded-xl bg-teal-300 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-950/20 transition duration-200 hover:-translate-y-0.5 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 focus:ring-offset-[#070b14]"
            >
              Explore dashboard <ArrowDownRight size={16} className="transition-transform group-hover:translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("sales-insights")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition duration-200 hover:border-violet-300/40 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              View analytics <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Activity size={13} className="text-teal-300" /> Sales signals</span>
            <span className="inline-flex items-center gap-1.5"><SparklesIcon size={13} className="text-violet-300" /> RFM intelligence</span>
            <span className="inline-flex items-center gap-1.5"><MousePointer2 size={13} className="text-cyan-300" /> Interactive 3D</span>
          </div>
        </div>

        <div className="relative mx-auto h-[265px] w-full max-w-[420px] sm:h-[300px] md:h-[350px]" role="img" aria-label="Animated teal 3D intelligence orb surrounded by rotating rings and particles">
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 4.7], fov: 43 }}
            gl={{ alpha: true, antialias: true }}
            className="!absolute inset-0"
          >
            <IntelligenceOrb />
          </Canvas>

          <div className="pointer-events-none absolute left-0 top-[18%] rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2.5 shadow-xl shadow-black/20 backdrop-blur-xl sm:left-1">
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500">Commerce pulse</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-white"><span className="h-1.5 w-1.5 rounded-full bg-teal-300" /> Signals connected</p>
          </div>

          <div className="pointer-events-none absolute bottom-[13%] right-0 rounded-2xl border border-violet-300/15 bg-slate-900/75 px-3 py-2.5 shadow-xl shadow-black/20 backdrop-blur-xl sm:right-1">
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500">Customer lens</p>
            <p className="mt-1 text-xs font-semibold text-white">RFM segmentation <span className="ml-1 text-violet-300">↗</span></p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="relative h-px bg-gradient-to-r from-transparent via-teal-300/50 to-transparent" />
    </section>
  );
}
