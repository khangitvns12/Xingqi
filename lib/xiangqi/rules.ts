import { BoardState, Move, Piece, PieceType, Position, Side, SkillFxType } from './types';

export const INITIAL_BOARD: BoardState = [
  // Row 0: Black baseline
  [
    { side: 'black', type: 'r', id: 'b_r1' },
    { side: 'black', type: 'n', id: 'b_n1' },
    { side: 'black', type: 'b', id: 'b_b1' },
    { side: 'black', type: 'a', id: 'b_a1' },
    { side: 'black', type: 'k', id: 'b_k' },
    { side: 'black', type: 'a', id: 'b_a2' },
    { side: 'black', type: 'b', id: 'b_b2' },
    { side: 'black', type: 'n', id: 'b_n2' },
    { side: 'black', type: 'r', id: 'b_r2' },
  ],
  // Row 1: Empty
  Array(9).fill(null),
  // Row 2: Black Cannons
  [
    null,
    { side: 'black', type: 'c', id: 'b_c1' },
    null,
    null,
    null,
    null,
    null,
    { side: 'black', type: 'c', id: 'b_c2' },
    null,
  ],
  // Row 3: Black Pawns
  [
    { side: 'black', type: 'p', id: 'b_p1' },
    null,
    { side: 'black', type: 'p', id: 'b_p2' },
    null,
    { side: 'black', type: 'p', id: 'b_p3' },
    null,
    { side: 'black', type: 'p', id: 'b_p4' },
    null,
    { side: 'black', type: 'p', id: 'b_p5' },
  ],
  // Row 4: Empty (River Black side)
  Array(9).fill(null),
  // Row 5: Empty (River Red side)
  Array(9).fill(null),
  // Row 6: Red Pawns
  [
    { side: 'red', type: 'p', id: 'r_p1' },
    null,
    { side: 'red', type: 'p', id: 'r_p2' },
    null,
    { side: 'red', type: 'p', id: 'r_p3' },
    null,
    { side: 'red', type: 'p', id: 'r_p4' },
    null,
    { side: 'red', type: 'p', id: 'r_p5' },
  ],
  // Row 7: Red Cannons
  [
    null,
    { side: 'red', type: 'c', id: 'r_c1' },
    null,
    null,
    null,
    null,
    null,
    { side: 'red', type: 'c', id: 'r_c2' },
    null,
  ],
  // Row 8: Empty
  Array(9).fill(null),
  // Row 9: Red baseline
  [
    { side: 'red', type: 'r', id: 'r_r1' },
    { side: 'red', type: 'n', id: 'r_n1' },
    { side: 'red', type: 'b', id: 'r_b1' },
    { side: 'red', type: 'a', id: 'r_a1' },
    { side: 'red', type: 'k', id: 'r_k' },
    { side: 'red', type: 'a', id: 'r_a2' },
    { side: 'red', type: 'b', id: 'r_b2' },
    { side: 'red', type: 'n', id: 'r_n2' },
    { side: 'red', type: 'r', id: 'r_r2' },
  ],
];

export function cloneBoard(board: BoardState): BoardState {
  return board.map((row) => row.map((p) => (p ? { ...p } : null)));
}

export function isInsideBoard(r: number, c: number): boolean {
  return r >= 0 && r <= 9 && c >= 0 && c <= 8;
}

export function isInsidePalace(r: number, c: number, side: Side): boolean {
  if (c < 3 || c > 5) return false;
  if (side === 'black') {
    return r >= 0 && r <= 2;
  } else {
    return r >= 7 && r <= 9;
  }
}

export function findKingPosition(board: BoardState, side: Side): Position | null {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (piece && piece.side === side && piece.type === 'k') {
        return { r, c };
      }
    }
  }
  return null;
}

// Flying general rule: King cannot face King directly on the same column without intervening piece
export function areKingsFacing(board: BoardState): boolean {
  const redKing = findKingPosition(board, 'red');
  const blackKing = findKingPosition(board, 'black');
  if (!redKing || !blackKing) return false;
  if (redKing.c !== blackKing.c) return false;

  const col = redKing.c;
  const startR = Math.min(redKing.r, blackKing.r) + 1;
  const endR = Math.max(redKing.r, blackKing.r);

  for (let r = startR; r < endR; r++) {
    if (board[r][col] !== null) {
      return false; // has intervening piece
    }
  }
  return true; // no piece in between!
}

export function getPseudoMoves(board: BoardState, r: number, c: number): Position[] {
  const piece = board[r][c];
  if (!piece) return [];

  const moves: Position[] = [];
  const side = piece.side;

  switch (piece.type) {
    case 'k': {
      // King: 1 step orthogonal in palace
      const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
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
      // Advisor: 1 step diagonal in palace
      const dirs = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
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
      // Elephant: 2 steps diagonal, cannot cross river, eye cannot be blocked
      const dirs = [
        [-2, -2],
        [-2, 2],
        [2, -2],
        [2, 2],
      ];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        // Check river constraint
        if (side === 'red' && nr < 5) continue;
        if (side === 'black' && nr > 4) continue;

        if (isInsideBoard(nr, nc)) {
          // Check eye (blocker at r + dr/2, c + dc/2)
          const eyeR = r + dr / 2;
          const eyeC = c + dc / 2;
          if (board[eyeR][eyeC] === null) {
            const target = board[nr][nc];
            if (!target || target.side !== side) {
              moves.push({ r: nr, c: nc });
            }
          }
        }
      }
      break;
    }

    case 'n': {
      // Horse: 8 possible jumps, blocked if leg is blocked
      const horseSteps = [
        { dr: -2, dc: -1, legR: -1, legC: 0 },
        { dr: -2, dc: 1, legR: -1, legC: 0 },
        { dr: 2, dc: -1, legR: 1, legC: 0 },
        { dr: 2, dc: 1, legR: 1, legC: 0 },
        { dr: -1, dc: -2, legR: 0, legC: -1 },
        { dr: 1, dc: -2, legR: 0, legC: -1 },
        { dr: -1, dc: 2, legR: 0, legC: 1 },
        { dr: 1, dc: 2, legR: 0, legC: 1 },
      ];

      for (const step of horseSteps) {
        const nr = r + step.dr;
        const nc = c + step.dc;
        if (isInsideBoard(nr, nc)) {
          const legPosR = r + step.legR;
          const legPosC = c + step.legC;
          // Leg must be empty
          if (board[legPosR][legPosC] === null) {
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
      // Chariot: orthogonal any distance until blocked
      const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [dr, dc] of dirs) {
        let step = 1;
        while (true) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (!isInsideBoard(nr, nc)) break;
          const target = board[nr][nc];
          if (!target) {
            moves.push({ r: nr, c: nc });
          } else {
            if (target.side !== side) {
              moves.push({ r: nr, c: nc });
            }
            break; // path blocked
          }
          step++;
        }
      }
      break;
    }

    case 'c': {
      // Cannon: orthogonal movement like chariot, captures by jumping over exactly 1 piece
      const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [dr, dc] of dirs) {
        let step = 1;
        let jumped = false;
        while (true) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (!isInsideBoard(nr, nc)) break;
          const target = board[nr][nc];
          if (!jumped) {
            if (!target) {
              moves.push({ r: nr, c: nc }); // regular move
            } else {
              jumped = true; // found screen
            }
          } else {
            // Already jumped over one piece, looking for enemy piece to capture
            if (target) {
              if (target.side !== side) {
                moves.push({ r: nr, c: nc }); // capture!
              }
              break; // cannon can only jump 1 piece
            }
          }
          step++;
        }
      }
      break;
    }

    case 'p': {
      // Soldier / Pawn
      if (side === 'red') {
        // Moves forward (r - 1)
        const forwardR = r - 1;
        if (forwardR >= 0) {
          const target = board[forwardR][c];
          if (!target || target.side !== side) {
            moves.push({ r: forwardR, c });
          }
        }
        // Crossed river (r <= 4): can move left or right
        if (r <= 4) {
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
      } else {
        // Black: moves forward (r + 1)
        const forwardR = r + 1;
        if (forwardR <= 9) {
          const target = board[forwardR][c];
          if (!target || target.side !== side) {
            moves.push({ r: forwardR, c });
          }
        }
        // Crossed river (r >= 5): can move left or right
        if (r >= 5) {
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
      }
      break;
    }
  }

  return moves;
}

// Check if given side is currently in check
export function isSideInCheck(board: BoardState, side: Side): boolean {
  const kingPos = findKingPosition(board, side);
  if (!kingPos) return true; // king captured

  // Check if kings are facing directly
  if (areKingsFacing(board)) {
    return true;
  }

  const oppSide: Side = side === 'red' ? 'black' : 'red';

  // Check all opponent pieces to see if any pseudo move lands on kingPos
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (piece && piece.side === oppSide) {
        const moves = getPseudoMoves(board, r, c);
        for (const m of moves) {
          if (m.r === kingPos.r && m.c === kingPos.c) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

// Generate valid legal moves that don't result in self-check
export function getLegalMoves(board: BoardState, r: number, c: number): Position[] {
  const piece = board[r][c];
  if (!piece) return [];

  const pseudoMoves = getPseudoMoves(board, r, c);
  const legalMoves: Position[] = [];

  for (const move of pseudoMoves) {
    // Simulate move
    const newBoard = cloneBoard(board);
    newBoard[move.r][move.c] = newBoard[r][c];
    newBoard[r][c] = null;

    // Must not leave own side in check and kings must not face each other
    if (!isSideInCheck(newBoard, piece.side) && !areKingsFacing(newBoard)) {
      legalMoves.push(move);
    }
  }

  return legalMoves;
}

// Check if current side has any legal moves available
export function hasAnyLegalMoves(board: BoardState, side: Side): boolean {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (piece && piece.side === side) {
        const legal = getLegalMoves(board, r, c);
        if (legal.length > 0) return true;
      }
    }
  }
  return false;
}

export function getPieceNameVi(piece: Piece): string {
  if (piece.side === 'red') {
    switch (piece.type) {
      case 'k': return 'Tướng';
      case 'a': return 'Sĩ';
      case 'b': return 'Tượng';
      case 'n': return 'Mã';
      case 'r': return 'Xe';
      case 'c': return 'Pháo';
      case 'p': return 'Binh';
    }
  } else {
    switch (piece.type) {
      case 'k': return 'Tướng';
      case 'a': return 'Sĩ';
      case 'b': return 'Tượng';
      case 'n': return 'Mã';
      case 'r': return 'Xe';
      case 'c': return 'Pháo';
      case 'p': return 'Tốt';
    }
  }
}

export function getPieceCharVi(piece: Piece): string {
  if (piece.side === 'red') {
    switch (piece.type) {
      case 'k': return '帥'; // Soái
      case 'a': return '仕'; // Sĩ
      case 'b': return '相'; // Tượng (Đỏ)
      case 'n': return '傌'; // Mã (Đỏ)
      case 'r': return '俥'; // Xe (Đỏ)
      case 'c': return '炮'; // Pháo (Đỏ)
      case 'p': return '兵'; // Binh (Đỏ)
    }
  } else {
    switch (piece.type) {
      case 'k': return '將'; // Tướng
      case 'a': return '士'; // Sĩ
      case 'b': return '象'; // Tượng (Đen)
      case 'n': return '馬'; // Mã (Đen)
      case 'r': return '車'; // Xe (Đen)
      case 'c': return '砲'; // Pháo (Đen)
      case 'p': return '卒'; // Tốt (Đen)
    }
  }
}

export function getSkillTypeForPiece(type: PieceType): SkillFxType {
  switch (type) {
    case 'r': return 'thunder';   // Xe: Cửu Thiên Lôi Đình
    case 'c': return 'fire';      // Pháo: Tam Muội Chân Hỏa
    case 'n': return 'sword';     // Mã: Thanh Phong Phi Kiếm
    case 'k': return 'tai-chi';   // Tướng: Thái Cực Bát Quái
    case 'a':
    case 'b': return 'shield';    // Sĩ, Tượng: Huyền Vũ Hộ Giáp / Băng Thuẫn
    case 'p': return 'slash';     // Tốt/Binh: Huyết Sát Đột Kích
    default: return 'sword';
  }
}

export function getSkillNameVi(type: SkillFxType): string {
  switch (type) {
    case 'thunder': return '⚡ Cửu Thiên Lôi Đình';
    case 'fire': return '🔥 Tam Muội Chân Hỏa';
    case 'sword': return '⚔️ Vạn Kiếm Quy Tông';
    case 'tai-chi': return '☯️ Bát Quái Trấn Thiên';
    case 'shield': return '🛡️ Huyền Vũ Linh Thuẫn';
    case 'slash': return '🗡️ Huyết Sát Phá Giáp';
  }
}

export function generateMoveNotation(board: BoardState, from: Position, to: Position): string {
  const piece = board[from.r][from.c];
  if (!piece) return '';

  const name = getPieceNameVi(piece);
  // Vietnamese column standard: Red counts 1..9 from right to left (col 8 is 1, col 0 is 9).
  // Black counts 1..9 from right to left (col 0 is 1, col 8 is 9).
  const startCol = piece.side === 'red' ? 9 - from.c : from.c + 1;
  const destCol = piece.side === 'red' ? 9 - to.c : to.c + 1;

  if (from.r === to.r) {
    // Horizontal move (Bình)
    return `${name} ${startCol} bình ${destCol}`;
  } else if (piece.side === 'red' ? to.r < from.r : to.r > from.r) {
    // Forward move (Tiến)
    if (piece.type === 'n' || piece.type === 'b' || piece.type === 'a') {
      return `${name} ${startCol} tiến ${destCol}`;
    } else {
      const steps = Math.abs(to.r - from.r);
      return `${name} ${startCol} tiến ${steps}`;
    }
  } else {
    // Backward move (Thoái)
    if (piece.type === 'n' || piece.type === 'b' || piece.type === 'a') {
      return `${name} ${startCol} thoái ${destCol}`;
    } else {
      const steps = Math.abs(to.r - from.r);
      return `${name} ${startCol} thoái ${steps}`;
    }
  }
}
