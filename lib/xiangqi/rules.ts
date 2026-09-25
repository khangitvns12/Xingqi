import { BoardState, Piece, PieceType, Position, Side, SkillFxType } from './types';

export const INITIAL_BOARD: BoardState = [
  // Row 0: Black back rank
  [
    { type: 'r', side: 'black' },
    { type: 'n', side: 'black' },
    { type: 'b', side: 'black' },
    { type: 'a', side: 'black' },
    { type: 'k', side: 'black' },
    { type: 'a', side: 'black' },
    { type: 'b', side: 'black' },
    { type: 'n', side: 'black' },
    { type: 'r', side: 'black' },
  ],
  // Row 1
  [null, null, null, null, null, null, null, null, null],
  // Row 2: Black cannons
  [
    null,
    { type: 'c', side: 'black' },
    null,
    null,
    null,
    null,
    null,
    { type: 'c', side: 'black' },
    null,
  ],
  // Row 3: Black pawns
  [
    { type: 'p', side: 'black' },
    null,
    { type: 'p', side: 'black' },
    null,
    { type: 'p', side: 'black' },
    null,
    { type: 'p', side: 'black' },
    null,
    { type: 'p', side: 'black' },
  ],
  // Row 4
  [null, null, null, null, null, null, null, null, null],
  // Row 5
  [null, null, null, null, null, null, null, null, null],
  // Row 6: Red pawns
  [
    { type: 'p', side: 'red' },
    null,
    { type: 'p', side: 'red' },
    null,
    { type: 'p', side: 'red' },
    null,
    { type: 'p', side: 'red' },
    null,
    { type: 'p', side: 'red' },
  ],
  // Row 7: Red cannons
  [
    null,
    { type: 'c', side: 'red' },
    null,
    null,
    null,
    null,
    null,
    { type: 'c', side: 'red' },
    null,
  ],
  // Row 8
  [null, null, null, null, null, null, null, null, null],
  // Row 9: Red back rank
  [
    { type: 'r', side: 'red' },
    { type: 'n', side: 'red' },
    { type: 'b', side: 'red' },
    { type: 'a', side: 'red' },
    { type: 'k', side: 'red' },
    { type: 'a', side: 'red' },
    { type: 'b', side: 'red' },
    { type: 'n', side: 'red' },
    { type: 'r', side: 'red' },
  ],
];

export function cloneBoard(board: BoardState): BoardState {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function getPieceCharVi(typeOrPiece: PieceType | Piece, side?: Side): string {
  const type: PieceType = typeof typeOrPiece === 'string' ? typeOrPiece : typeOrPiece.type;
  const s: Side = typeof typeOrPiece === 'string' ? (side || 'red') : typeOrPiece.side;

  if (s === 'red') {
    switch (type) {
      case 'k': return 'TƯỚNG';
      case 'a': return 'SĨ';
      case 'b': return 'TƯỢNG';
      case 'n': return 'MÃ';
      case 'r': return 'XE';
      case 'c': return 'PHÁO';
      case 'p': return 'BINH';
    }
  } else {
    switch (type) {
      case 'k': return 'TƯỚNG';
      case 'a': return 'SĨ';
      case 'b': return 'VOI';
      case 'n': return 'MÃ';
      case 'r': return 'XE';
      case 'c': return 'PHÁO';
      case 'p': return 'TỐT';
    }
  }
}

export function getPieceNameVi(typeOrPiece: PieceType | Piece): string {
  const type: PieceType = typeof typeOrPiece === 'string' ? typeOrPiece : typeOrPiece.type;
  switch (type) {
    case 'k': return 'Tướng';
    case 'a': return 'Sĩ';
    case 'b': return 'Tượng';
    case 'n': return 'Mã';
    case 'r': return 'Xe';
    case 'c': return 'Pháo';
    case 'p': return 'Binh/Tốt';
  }
}

export function getSkillTypeForPiece(typeOrPiece: PieceType | Piece): SkillFxType {
  const type: PieceType = typeof typeOrPiece === 'string' ? typeOrPiece : typeOrPiece.type;
  switch (type) {
    case 'r': return 'thunder';
    case 'c': return 'fire';
    case 'n': return 'sword';
    case 'b': return 'shield';
    case 'a': return 'tai-chi';
    case 'k': return 'holy';
    case 'p': return 'slash';
  }
}

export function getSkillNameVi(type: SkillFxType): string {
  switch (type) {
    case 'thunder': return 'Cửu Thiên Lôi Đình Trảm';
    case 'fire': return 'Hồng Mông Liệt Hỏa Oanh';
    case 'frost': return 'Băng Hà Tuyệt Sát Kiếm';
    case 'holy': return 'Bát Quái Càn Khôn Chưởng';
    case 'burst': return 'Kỳ Đạo Bạo Liệt Kích';
    case 'slash': return 'Phá Không Trảm';
    case 'sword': return 'Vạn Kiếm Quy Tông';
    case 'tai-chi': return 'Thái Cực Bát Quái Trận';
    case 'shield': return 'Hộ Thể Kim Chung Tráo';
  }
}

function isInsidePalace(r: number, c: number, side: Side): boolean {
  if (c < 3 || c > 5) return false;
  if (side === 'red') return r >= 7 && r <= 9;
  return r >= 0 && r <= 2;
}

// Pseudo legal moves without considering checks
function getPseudoLegalMoves(board: BoardState, r: number, c: number): Position[] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: Position[] = [];
  const side = piece.side;

  switch (piece.type) {
    case 'k': {
      // General moves 1 step orthogonally inside palace
      const dirs = [
        { r: -1, c: 0 },
        { r: 1, c: 0 },
        { r: 0, c: -1 },
        { r: 0, c: 1 },
      ];
      for (const d of dirs) {
        const nr = r + d.r;
        const nc = c + d.c;
        if (isInsidePalace(nr, nc, side)) {
          const target = board[nr][nc];
          if (!target || target.side !== side) {
            moves.push({ r: nr, c: nc });
          }
        }
      }
      break;
    }

    case 'a': {
      // Advisor moves 1 step diagonally inside palace
      const dirs = [
        { r: -1, c: -1 },
        { r: -1, c: 1 },
        { r: 1, c: -1 },
        { r: 1, c: 1 },
      ];
      for (const d of dirs) {
        const nr = r + d.r;
        const nc = c + d.c;
        if (isInsidePalace(nr, nc, side)) {
          const target = board[nr][nc];
          if (!target || target.side !== side) {
            moves.push({ r: nr, c: nc });
          }
        }
      }
      break;
    }

    case 'b': {
      // Elephant moves 2 steps diagonally, cannot cross river, eye cannot be blocked
      const steps = [
        { r: -2, c: -2, eyeR: -1, eyeC: -1 },
        { r: -2, c: 2, eyeR: -1, eyeC: 1 },
        { r: 2, c: -2, eyeR: 1, eyeC: -1 },
        { r: 2, c: 2, eyeR: 1, eyeC: 1 },
      ];
      for (const s of steps) {
        const nr = r + s.r;
        const nc = c + s.c;
        const eyeR = r + s.eyeR;
        const eyeC = c + s.eyeC;

        if (nc >= 0 && nc <= 8) {
          // River constraint: red stays rows 5..9, black stays rows 0..4
          const withinTerritory = side === 'red' ? nr >= 5 && nr <= 9 : nr >= 0 && nr <= 4;
          if (withinTerritory) {
            if (!board[eyeR][eyeC]) {
              const target = board[nr][nc];
              if (!target || target.side !== side) {
                moves.push({ r: nr, c: nc });
              }
            }
          }
        }
      }
      break;
    }

    case 'n': {
      // Horse moves L-shape, foot cannot be hobbled
      const steps = [
        { r: -2, c: -1, hobbleR: -1, hobbleC: 0 },
        { r: -2, c: 1, hobbleR: -1, hobbleC: 0 },
        { r: 2, c: -1, hobbleR: 1, hobbleC: 0 },
        { r: 2, c: 1, hobbleR: 1, hobbleC: 0 },
        { r: -1, c: -2, hobbleR: 0, hobbleC: -1 },
        { r: 1, c: -2, hobbleR: 0, hobbleC: -1 },
        { r: -1, c: 2, hobbleR: 0, hobbleC: 1 },
        { r: 1, c: 2, hobbleR: 0, hobbleC: 1 },
      ];
      for (const s of steps) {
        const nr = r + s.r;
        const nc = c + s.c;
        if (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
          const hr = r + s.hobbleR;
          const hc = c + s.hobbleC;
          if (!board[hr][hc]) {
            const target = board[nr][nc];
            if (!target || target.side !== side) {
              moves.push({ r: nr, c: nc });
            }
          }
        }
      }
      break;
    }

    case 'r': {
      // Chariot moves orthogonally any squares
      const dirs = [
        { r: -1, c: 0 },
        { r: 1, c: 0 },
        { r: 0, c: -1 },
        { r: 0, c: 1 },
      ];
      for (const d of dirs) {
        let nr = r + d.r;
        let nc = c + d.c;
        while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
          const target = board[nr][nc];
          if (!target) {
            moves.push({ r: nr, c: nc });
          } else {
            if (target.side !== side) {
              moves.push({ r: nr, c: nc });
            }
            break;
          }
          nr += d.r;
          nc += d.c;
        }
      }
      break;
    }

    case 'c': {
      // Cannon moves orthogonally, jumps over exactly one screen to capture
      const dirs = [
        { r: -1, c: 0 },
        { r: 1, c: 0 },
        { r: 0, c: -1 },
        { r: 0, c: 1 },
      ];
      for (const d of dirs) {
        let nr = r + d.r;
        let nc = c + d.c;
        let screenFound = false;

        while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
          const target = board[nr][nc];
          if (!screenFound) {
            if (!target) {
              moves.push({ r: nr, c: nc });
            } else {
              screenFound = true;
            }
          } else {
            if (target) {
              if (target.side !== side) {
                moves.push({ r: nr, c: nc });
              }
              break;
            }
          }
          nr += d.r;
          nc += d.c;
        }
      }
      break;
    }

    case 'p': {
      // Soldier/Pawn moves forward 1 square; across river can also move sideways
      const forward = side === 'red' ? -1 : 1;
      const crossedRiver = side === 'red' ? r <= 4 : r >= 5;

      const forwardR = r + forward;
      if (forwardR >= 0 && forwardR <= 9) {
        const target = board[forwardR][c];
        if (!target || target.side !== side) {
          moves.push({ r: forwardR, c });
        }
      }

      if (crossedRiver) {
        for (const dc of [-1, 1]) {
          const nc = c + dc;
          if (nc >= 0 && nc <= 8) {
            const target = board[r][nc];
            if (!target || target.side !== side) {
              moves.push({ r, c: nc });
            }
          }
        }
      }
      break;
    }
  }

  return moves;
}

export function areKingsFacing(board: BoardState): boolean {
  let redK: Position | null = null;
  let blackK: Position | null = null;

  for (let r = 0; r <= 9; r++) {
    for (let c = 0; c <= 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k') {
        if (p.side === 'red') redK = { r, c };
        else blackK = { r, c };
      }
    }
  }

  if (!redK || !blackK) return false;
  if (redK.c !== blackK.c) return false;

  // Check if pieces in between
  const col = redK.c;
  const minR = Math.min(redK.r, blackK.r) + 1;
  const maxR = Math.max(redK.r, blackK.r);

  for (let r = minR; r < maxR; r++) {
    if (board[r][col]) return false;
  }

  return true;
}

export function isSideInCheck(board: BoardState, side: Side): boolean {
  if (areKingsFacing(board)) return true;

  let kingPos: Position | null = null;
  for (let r = 0; r <= 9; r++) {
    for (let c = 0; c <= 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.side === side) {
        kingPos = { r, c };
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return true;

  const oppSide: Side = side === 'red' ? 'black' : 'red';
  for (let r = 0; r <= 9; r++) {
    for (let c = 0; c <= 8; c++) {
      const p = board[r][c];
      if (p && p.side === oppSide) {
        const moves = getPseudoLegalMoves(board, r, c);
        if (moves.some((m) => m.r === kingPos!.r && m.c === kingPos!.c)) {
          return true;
        }
      }
    }
  }

  return false;
}

export function getLegalMoves(board: BoardState, r: number, c: number): Position[] {
  const piece = board[r][c];
  if (!piece) return [];

  const pseudoMoves = getPseudoLegalMoves(board, r, c);
  const legal: Position[] = [];

  for (const m of pseudoMoves) {
    const testBoard = cloneBoard(board);
    testBoard[m.r][m.c] = piece;
    testBoard[r][c] = null;

    if (!isSideInCheck(testBoard, piece.side) && !areKingsFacing(testBoard)) {
      legal.push(m);
    }
  }

  return legal;
}

export function hasAnyLegalMoves(board: BoardState, side: Side): boolean {
  for (let r = 0; r <= 9; r++) {
    for (let c = 0; c <= 8; c++) {
      const p = board[r][c];
      if (p && p.side === side) {
        const moves = getLegalMoves(board, r, c);
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
}

export function generateMoveNotation(board: BoardState, from: Position, to: Position): string {
  const piece = board[from.r][from.c];
  if (!piece) return '';

  const name = getPieceCharVi(piece.type, piece.side);
  const fromCol = piece.side === 'red' ? 9 - from.c : from.c + 1;
  const toCol = piece.side === 'red' ? 9 - to.c : to.c + 1;

  if (from.r === to.r) {
    return `${name} ${fromCol} Bình ${toCol}`;
  }

  const isAdvancing = piece.side === 'red' ? to.r < from.r : to.r > from.r;
  const action = isAdvancing ? 'Tiến' : 'Thoái';

  if (['r', 'c', 'p', 'k'].includes(piece.type)) {
    const diff = Math.abs(to.r - from.r);
    return `${name} ${fromCol} ${action} ${diff}`;
  } else {
    return `${name} ${fromCol} ${action} ${toCol}`;
  }
}
