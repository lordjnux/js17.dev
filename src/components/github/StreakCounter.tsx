import { Card, CardContent } from "@/components/ui/card"
import { Flame, TrendingUp } from "lucide-react"

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
}

export function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-6 text-center">
          <Flame className="h-5 w-5 text-orange-500 mx-auto mb-2" />
          <p className="text-3xl font-bold tabular-nums">{currentStreak}</p>
          <p className="text-xs text-muted-foreground mt-1">Current Streak (days)</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-5 w-5 text-blue-500 mx-auto mb-2" />
          <p className="text-3xl font-bold tabular-nums">{longestStreak}</p>
          <p className="text-xs text-muted-foreground mt-1">Longest Streak (days)</p>
        </CardContent>
      </Card>
    </div>
  )
}
