"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts"
import type { ChessStats } from "@/types/chess"

interface ChessSectionProps {
  stats: ChessStats | null
}

// ─── Animated stat card ───────────────────────────────────────────────────────

interface ChessStatCardProps {
  label: string
  value: number
  subValue?: string
  icon: string
  delay?: number
}

function ChessStatCard({ label, value, subValue, icon, delay = 0 }: ChessStatCardProps) {
  const [displayed, setDisplayed] = useState(0)
  const frameRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const duration = 1200

  useEffect(() => {
    const delayMs = delay * 1000
    const timer = setTimeout(() => {
      frameRef.current = requestAnimationFrame(function animate(ts) {
        if (startRef.current === null) startRef.current = ts
        const elapsed = ts - startRef.current
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplayed(Math.round(value * eased))
        if (progress < 1) frameRef.current = requestAnimationFrame(animate)
      })
    }, delayMs)

    return () => {
      clearTimeout(timer)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      startRef.current = null
    }
  }, [value, delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5 flex flex-col gap-2 hover:border-violet-500/40 transition-colors"
    >
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <span className="text-lg">{icon}</span>
        <span className="uppercase tracking-wide text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-violet-400 tabular-nums">{displayed}</div>
      {subValue && <div className="text-xs text-muted-foreground">{subValue}</div>}
    </motion.div>
  )
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function RecordTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; fill: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg space-y-1">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-medium text-foreground tabular-nums">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

function ChessSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl border border-violet-500/10 bg-violet-500/5 p-5 h-24" />
      ))}
    </div>
  )
}

export function ChessSection({ stats }: ChessSectionProps) {
  if (!stats) return <ChessSkeleton />

  const { chess_blitz, chess_bullet, chess_rapid, tactics, puzzle_rush } = stats

  // Totals
  const totalGames =
    chess_blitz.record.win + chess_blitz.record.loss + chess_blitz.record.draw +
    chess_bullet.record.win + chess_bullet.record.loss + chess_bullet.record.draw +
    chess_rapid.record.win + chess_rapid.record.loss + chess_rapid.record.draw

  const totalWins = chess_blitz.record.win + chess_bullet.record.win + chess_rapid.record.win
  const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : "0"

  const bestRating = Math.max(
    chess_blitz.best.rating,
    chess_bullet.best.rating,
    chess_rapid.best.rating
  )

  // Chart data
  const chartData = [
    {
      name: "Blitz",
      Win: chess_blitz.record.win,
      Draw: chess_blitz.record.draw,
      Loss: chess_blitz.record.loss,
    },
    {
      name: "Bullet",
      Win: chess_bullet.record.win,
      Draw: chess_bullet.record.draw,
      Loss: chess_bullet.record.loss,
    },
    {
      name: "Rapid",
      Win: chess_rapid.record.win,
      Draw: chess_rapid.record.draw,
      Loss: chess_rapid.record.loss,
    },
  ]

  return (
    <div className="space-y-8">
      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ChessStatCard
          label="Blitz Rating"
          value={chess_blitz.last.rating}
          subValue={`Best: ${chess_blitz.best.rating} · 5 min`}
          icon="♟️"
          delay={0}
        />
        <ChessStatCard
          label="Bullet Rating"
          value={chess_bullet.last.rating}
          subValue={`Best: ${chess_bullet.best.rating} · 1 min`}
          icon="⚡"
          delay={0.1}
        />
        <ChessStatCard
          label="Rapid Rating"
          value={chess_rapid.last.rating}
          subValue={`Best: ${chess_rapid.best.rating} · 15 min`}
          icon="🧠"
          delay={0.2}
        />
        <ChessStatCard
          label="Tactics Peak"
          value={tactics.highest.rating}
          subValue={
            puzzle_rush?.best
              ? `Puzzle Rush: ${puzzle_rush.best.score}/${puzzle_rush.best.total_attempts}`
              : "Highest tactics rating"
          }
          icon="🎯"
          delay={0.3}
        />
      </div>

      {/* ── W/L/D Chart ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-xl border border-border/50 bg-card p-6"
      >
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Win / Draw / Loss by Format
        </h2>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              barSize={28}
              margin={{ top: 0, right: 40, bottom: 0, left: 12 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<RecordTooltip />} cursor={{ fill: "hsl(var(--muted)/0.3)" }} />
              <Bar dataKey="Win" stackId="a" fill="#8b5cf6" radius={[4, 0, 0, 4]}>
                <LabelList
                  dataKey="Win"
                  position="insideLeft"
                  style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }}
                  formatter={(v) => (Number(v) > 80 ? Number(v).toLocaleString() : "")}
                />
                {chartData.map((_, i) => (
                  <Cell key={i} fill="#8b5cf6" />
                ))}
              </Bar>
              <Bar dataKey="Draw" stackId="a" fill="#6d28d9">
                {chartData.map((_, i) => (
                  <Cell key={i} fill="#6d28d9" />
                ))}
              </Bar>
              <Bar dataKey="Loss" stackId="a" fill="#3b1f7a" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="Loss"
                  position="insideRight"
                  style={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  formatter={(v) => (Number(v) > 80 ? Number(v).toLocaleString() : "")}
                />
                {chartData.map((_, i) => (
                  <Cell key={i} fill="#3b1f7a" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-3 justify-end">
          {[
            { label: "Win", color: "#8b5cf6" },
            { label: "Draw", color: "#6d28d9" },
            { label: "Loss", color: "#3b1f7a" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Summary strip ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: "Total Games", value: totalGames.toLocaleString(), icon: "🎮" },
          { label: "Win Rate", value: `${winRate}%`, icon: "📈" },
          { label: "Peak Rating", value: bestRating.toLocaleString(), icon: "🏆" },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="rounded-xl border border-border/50 bg-card p-4 text-center space-y-1"
          >
            <div className="text-xl">{icon}</div>
            <div className="text-lg font-bold text-violet-400 tabular-nums">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Attribution ──────────────────────────────────────────────── */}
      <p className="text-center text-xs text-muted-foreground/50">
        Stats via{" "}
        <a
          href="https://www.chess.com/member/jerohamsanchez"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-violet-400 transition-colors"
        >
          Chess.com · jerohamsanchez
        </a>
        {" · "}cached {new Date(stats.cachedAt).toLocaleString()}
      </p>
    </div>
  )
}
