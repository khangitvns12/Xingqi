export type Side = 'red' | 'black';

export type PieceType = 'k' | 'a' | 'b' | 'n' | 'r' | 'c' | 'p';
// k: King/General (Tướng / Soái)
// a: Advisor (Sĩ)
// b: Elephant/Bishop (Tượng / Tượng)
// n: Knight/Horse (Mã)
// r: Rook/Chariot (Xe)
// c: Cannon (Pháo)
// p: Pawn/Soldier (Tốt / Binh)

export interface Piece {
  side: Side;
  type: PieceType;
  id: string;
}

export type BoardState = (Piece | null)[][];

export interface Position {
  r: number; // 0 to 9 (row)
  c: number; // 0 to 8 (col)
}

export type SkillFxType = 'thunder' | 'fire' | 'sword' | 'tai-chi' | 'shield' | 'slash';

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece | null;
  notation: string;
  timestamp: number;
  skillFx?: SkillFxType;
}

export interface SkillEffect {
  id: string;
  type: SkillFxType;
  row: number;
  col: number;
  attackerSide: Side;
  skillName: string;
  quote?: string;
}

export type GameStatus = 'waiting' | 'playing' | 'check' | 'checkmate' | 'stalemate' | 'resigned' | 'draw' | 'timeout';

export interface GamePlayer {
  id: string;
  name: string;
  title: string;
  realm: string;
  realmLevel: number;
  elo: number;
  avatarUrl: string;
  frameColor: string;
  side: Side;
  isAi?: boolean;
  aiDifficultyLevel?: number; // 1 to 6
  timeLeft: number; // in seconds
}

export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  hostRealm: string;
  hostElo: number;
  timeLimit: number; // minutes per side (3, 5, 10, 15)
  increment: number; // seconds added per move
  isRanked: boolean;
  status: 'waiting' | 'playing' | 'ended';
  players: {
    red?: GamePlayer;
    black?: GamePlayer;
  };
  spectatorCount: number;
  password?: string;
  createdAt: number;
}
