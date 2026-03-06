"use client"

import { Suspense, useRef, useState, useCallback } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars, Html, Line } from "@react-three/drei"
import * as THREE from "three"

/* ─── Architecture Data ─────────────────────────────────────────────────── */

type Category = "core" | "framework" | "infra" | "ai" | "service" | "storage"

interface NodeData {
  id: string
  label: string
  sub?: string
  cost: string
  category: Category
  pos: [number, number, number]
  size: number
}

const COLORS: Record<Category, string> = {
  core: "#3b82f6",
  framework: "#06b6d4",
  infra: "#eab308",
  ai: "#10b981",
  service: "#a855f7",
  storage: "#64748b",
}

const CAT_LABELS: Record<Category, string> = {
  core: "Core Platform",
  framework: "Framework",
  infra: "Infrastructure",
  ai: "AI Services",
  service: "Distribution",
  storage: "Storage",
}

const NODES: NodeData[] = [
  // Core
  { id: "core", label: "js17.dev", sub: "Next.js 14 + TypeScript + Tailwind", cost: "", category: "core", pos: [0, 0, 0], size: 0.55 },

  // Framework shell (~r2)
  { id: "nextjs", label: "Next.js 14", sub: "App Router, RSC, Edge", cost: "$0", category: "framework", pos: [2.2, 0.3, 0.5], size: 0.28 },
  { id: "ts", label: "TypeScript", sub: "Strict mode", cost: "$0", category: "framework", pos: [1.5, -0.5, 1.8], size: 0.22 },
  { id: "react", label: "React 18", sub: "RSC + Hooks", cost: "$0", category: "framework", pos: [0.3, 1, 2.2], size: 0.22 },
  { id: "tailwind", label: "Tailwind CSS", sub: "4 theme palettes", cost: "$0", category: "framework", pos: [-1.6, 0.4, 1.8], size: 0.22 },
  { id: "mdx", label: "MDX Blog", sub: "next-mdx-remote", cost: "$0", category: "framework", pos: [-2.2, -0.4, 0.5], size: 0.2 },

  // Infrastructure shell (~r3.5)
  { id: "vercel", label: "Vercel", sub: "Edge + Serverless + Blob", cost: "$0/mo", category: "infra", pos: [0, 2.2, -2.8], size: 0.38 },
  { id: "cf", label: "Cloudflare", sub: "DNS + CDN + SSL", cost: "$0/mo", category: "infra", pos: [2.8, 1.8, -1.5], size: 0.3 },
  { id: "gh", label: "GitHub", sub: "Actions CI/CD", cost: "$0/mo", category: "infra", pos: [-2.8, 1.8, -1.5], size: 0.3 },
  { id: "gd", label: "GoDaddy", sub: "Domain registrar", cost: "$1/mo", category: "infra", pos: [0, -1.8, -2.8], size: 0.2 },

  // AI Services shell (~r4.5)
  { id: "openai", label: "OpenAI", sub: "GPT-4o + TTS + Moderation", cost: "~$10/mo", category: "ai", pos: [3.8, 0.2, 2], size: 0.35 },
  { id: "shot", label: "Shotstack", sub: "Video composition API", cost: "~$25/mo", category: "ai", pos: [-3.8, 0.5, 2], size: 0.28 },

  // Distribution shell (~r5)
  { id: "yt", label: "YouTube", sub: "Auto video publishing", cost: "$0/mo", category: "service", pos: [-4.2, 1.8, 0], size: 0.3 },
  { id: "resend", label: "Resend", sub: "Email API (100/day free)", cost: "$0/mo", category: "service", pos: [4.2, -1, 0], size: 0.28 },
  { id: "credly", label: "Credly", sub: "Verified certifications", cost: "$0/mo", category: "service", pos: [3.2, 2.8, -1], size: 0.2 },
  { id: "oauth", label: "Google OAuth", sub: "Admin authentication", cost: "$0/mo", category: "service", pos: [-3.2, -1.8, 1], size: 0.2 },

  // Storage
  { id: "blob", label: "Vercel Blob", sub: "Audio, data, moderation", cost: "$0/mo", category: "storage", pos: [1.8, -2.8, 1.2], size: 0.22 },
]

// Connections: [fromId, toId]
const CONNECTIONS: [string, string][] = [
  // Everything to core
  ...NODES.filter(n => n.id !== "core").map(n => ["core", n.id] as [string, string]),
  // Pipeline links
  ["openai", "shot"],
  ["shot", "yt"],
  ["openai", "resend"],
  ["vercel", "blob"],
  ["gh", "vercel"],
  ["cf", "gd"],
]

/* ─── 3D Components ─────────────────────────────────────────────────────── */

function GlowNode({
  node,
  highlighted,
  onHover,
}: {
  node: NodeData
  highlighted: boolean
  onHover: (id: string | null) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const color = COLORS[node.category]
  const isCore = node.id === "core"

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const pulse = isCore
      ? 1 + Math.sin(t * 1.5) * 0.08
      : 1 + Math.sin(t * 2 + node.pos[0] * 3) * 0.04
    meshRef.current.scale.setScalar(pulse)
  })

  return (
    <group position={node.pos}>
      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={() => onHover(node.id)}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[node.size, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={highlighted ? 2 : 0.6}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[node.size * 1.4, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={highlighted ? 0.18 : 0.06}
        />
      </mesh>

      {/* Label */}
      <Html
        distanceFactor={9}
        position={[0, node.size + 0.35, 0]}
        center
        style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
      >
        <div className="flex flex-col items-center gap-0.5 select-none">
          <span
            className="font-bold text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]"
            style={{ fontSize: isCore ? 13 : 10 }}
          >
            {node.label}
          </span>
          {highlighted && node.sub && (
            <span className="text-[9px] text-white/60 drop-shadow-lg">
              {node.sub}
            </span>
          )}
          {node.cost && (
            <span
              className="font-mono drop-shadow-lg"
              style={{
                fontSize: 9,
                color: node.cost.includes("~") ? "#fbbf24" : "#34d399",
              }}
            >
              {node.cost}
            </span>
          )}
        </div>
      </Html>
    </group>
  )
}

function ConnectionLine({
  from,
  to,
  color,
  highlighted,
}: {
  from: [number, number, number]
  to: [number, number, number]
  color: string
  highlighted: boolean
}) {
  return (
    <Line
      points={[from, to]}
      color={color}
      lineWidth={1}
      transparent
      opacity={highlighted ? 0.5 : 0.12}
    />
  )
}

function OrbitalRing({
  radius,
  color,
  tiltX,
  tiltZ,
}: {
  radius: number
  color: string
  tiltX: number
  tiltZ: number
}) {
  return (
    <mesh rotation={[tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, 0.008, 16, 128]} />
      <meshBasicMaterial color={color} transparent opacity={0.1} />
    </mesh>
  )
}

/* ─── Scene ──────────────────────────────────────────────────────────────── */

function Scene() {
  const groupRef = useRef<THREE.Group>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleHover = useCallback((id: string | null) => {
    setHoveredId(id)
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.04
  })

  // Determine which nodes are highlighted (hovered + its connections)
  const highlightedNodes = new Set<string>()
  if (hoveredId) {
    highlightedNodes.add(hoveredId)
    CONNECTIONS.forEach(([a, b]) => {
      if (a === hoveredId) highlightedNodes.add(b)
      if (b === hoveredId) highlightedNodes.add(a)
    })
  }

  return (
    <group ref={groupRef}>
      {/* Orbital rings */}
      <OrbitalRing radius={2.5} color="#06b6d4" tiltX={Math.PI / 2} tiltZ={0.15} />
      <OrbitalRing radius={3.8} color="#eab308" tiltX={Math.PI / 2.3} tiltZ={-0.2} />
      <OrbitalRing radius={5.2} color="#a855f7" tiltX={Math.PI / 2.8} tiltZ={0.3} />

      {/* Connection lines */}
      {CONNECTIONS.map(([fromId, toId]) => {
        const fromNode = NODES.find(n => n.id === fromId)
        const toNode = NODES.find(n => n.id === toId)
        if (!fromNode || !toNode) return null
        const isHighlighted = hoveredId
          ? highlightedNodes.has(fromId) && highlightedNodes.has(toId)
          : false
        return (
          <ConnectionLine
            key={`${fromId}-${toId}`}
            from={fromNode.pos}
            to={toNode.pos}
            color={COLORS[toNode.category]}
            highlighted={isHighlighted}
          />
        )
      })}

      {/* Nodes */}
      {NODES.map(node => (
        <GlowNode
          key={node.id}
          node={node}
          highlighted={highlightedNodes.has(node.id)}
          onHover={handleHover}
        />
      ))}
    </group>
  )
}

/* ─── Exported Default ───────────────────────────────────────────────────── */

export default function ArchitectureScene3D() {
  return (
    <div className="not-prose my-8 relative rounded-2xl border border-blue-500/20 overflow-hidden bg-[#050510] h-[350px] md:h-[550px]">
      <Canvas
        camera={{ position: [0, 3, 10], fov: 55 }}
        gl={{ antialias: true }}
        style={{ background: "#050510" }}
      >
        <ambientLight intensity={0.25} />
        <pointLight position={[10, 10, 10]} intensity={0.7} />
        <pointLight position={[-10, -5, -10]} intensity={0.25} color="#6366f1" />

        <Stars radius={60} depth={60} count={2500} factor={4} fade speed={0.8} />

        <Suspense fallback={null}>
          <Scene />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={18}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 max-w-[280px]">
        {(Object.entries(CAT_LABELS) as [Category, string][]).map(([cat, label]) => (
          <div key={cat} className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[cat] }} />
            <span className="text-[9px] text-white/70">{label}</span>
          </div>
        ))}
      </div>

      {/* Cost summary */}
      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-xl border border-white/10 p-3 text-right">
        <div className="text-[9px] text-white/50 uppercase tracking-wider mb-0.5">Total Monthly</div>
        <div className="text-xl font-bold text-emerald-400 font-mono">~$36</div>
        <div className="text-[9px] text-white/30 mt-0.5">vs $25,000+/mo traditional</div>
      </div>

      {/* Interaction hint */}
      <div className="absolute bottom-3 right-3 text-[9px] text-white/30">
        Drag to orbit &middot; Scroll to zoom
      </div>
    </div>
  )
}
