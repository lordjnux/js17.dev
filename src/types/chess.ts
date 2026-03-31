export interface ChessTimeControl {
  last: { rating: number; date: number; rd: number }
  best: { rating: number; date: number; game?: string }
  record: { win: number; loss: number; draw: number }
}

export interface ChessStats {
  chess_rapid: ChessTimeControl
  chess_bullet: ChessTimeControl
  chess_blitz: ChessTimeControl
  fide: number
  tactics: {
    highest: { rating: number; date: number }
    lowest: { rating: number; date: number }
  }
  puzzle_rush?: {
    best: { total_attempts: number; score: number }
  }
  cachedAt: string
}
