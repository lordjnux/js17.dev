"use client"

import dynamic from "next/dynamic"

const Scene3D = dynamic(
  () => import("./ArchitectureScene3D"),
  {
    ssr: false,
    loading: () => (
      <div className="not-prose my-8 rounded-2xl border border-blue-500/20 bg-[#050510] flex items-center justify-center h-[350px] md:h-[550px]">
        <div className="text-blue-400 text-sm font-mono animate-pulse">
          Initializing 3D Architecture...
        </div>
      </div>
    ),
  }
)

export function ArchitectureScene() {
  return <Scene3D />
}
