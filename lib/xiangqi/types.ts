export type Side = 'red' | 'black';

export type PieceType = 'k' | 'a' | 'b' | 'n' | 'r' | 'c' | 'p';

export interface Piece {
  type: PieceType;
  side: Side;
}

export interface Position {
  r: number;
  c: number;
}

export type BoardState = (Piece | null)[][];

export type SkillFxType =
  | 'thunder'
  | 'fire'
  | 'frost'
  | 'slash'
  | 'burst'
  | 'holy'
  | 'sword'
  | 'tai-chi'
  | 'shield';

export interface SkillEffect {
  id: string;
  type: SkillFxType;
  row: number;
  col: number;
  attackerSide: Side;
  skillName: string;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured: Piece | null;
  notation: string;
  timestamp: number;
  skillFx?: SkillFxType;
}

export interface GamePlayer {
  id: string;
  name: string;
  title: string;
  realm: string;
  realmLevel: number;
  elo: number;
  avatarUrl: string;
  selectedFrameId?: string;
  frameColor?: string;
  side?: Side;
  isAi?: boolean;
  aiDifficultyLevel?: number;
  timeLeft: number;
}

export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  hostRealm?: string;
  hostElo?: number;
  hostAvatarUrl?: string;
  hostTitle?: string;
  hostFrameId?: string;
  timeLimit: number; // in minutes (0 = unlimited)
  increment: number; // in seconds
  status: 'waiting' | 'playing' | 'ended';
  players: {
    red?: GamePlayer;
    black?: GamePlayer;
  };
  spectatorCount?: number;
  isCustom?: boolean;
  isRanked?: boolean;
  minElo?: number;
  password?: string;
  createdAt: number;
}
