"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageStat } from "@/types/github"

interface LanguageChartProps {
  languages: LanguageStat[]
}

export function LanguageChart({ languages }: LanguageChartProps) {
  if (!languages.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Languages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="h-36 w-36 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languages}
                  dataKey="percentage"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  strokeWidth={2}
                >
                  {languages.map((lang) => (
                    <Cell key={lang.name} fill={lang.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, ""]}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6 }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 flex-1">
            {languages.map((lang) => (
              <div key={lang.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ background: lang.color }}
                  />
                  <span className="text-xs text-muted-foreground truncate">{lang.name}</span>
                </div>
                <span className="text-xs font-medium tabular-nums">{lang.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
