import { areKingsFacing, cloneBoard, getLegalMoves, isSideInCheck } from './rules';
import { BoardState, Move, PieceType, Position, Side } from './types';

// Base piece values in Xiangqi
const PIECE_VALUES: Record<PieceType, number> = {
  k: 10000,
  r: 900,
  c: 450,
  n: 400,
  b: 200,
  a: 200,
  p: 100,
};

// Positional bonuses
export function evaluateBoard(board: BoardState, povSide: Side): number {
  let redScore = 0;
  let blackScore = 0;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      let val = PIECE_VALUES[piece.type];

      // Positional modifiers
      if (piece.type === 'p') {
        // Soldier crossed river bonus
        if (piece.side === 'red') {
          if (r <= 4) val += 100; // crossed river
          if (r <= 2) val += 50;  // deep into enemy palace
        } else {
          if (r >= 5) val += 100; // crossed river
          if (r >= 7) val += 50;  // deep into enemy palace
        }
      } else if (piece.type === 'r') {
        // Chariot mobility bonus
        val += 20;
      } else if (piece.type === 'c') {
        // Cannon bonus in middle-game
        val += 15;
      } else if (piece.type === 'n') {
        // Central horse bonus
        if (c >= 2 && c <= 6 && r >= 3 && r <= 6) {
          val += 25;
        }
      }

      if (piece.side === 'red') {
        redScore += val;
      } else {
        blackScore += val;
      }
    }
  }

  // Check state penalty
  if (isSideInCheck(board, 'red')) redScore -= 60;
  if (isSideInCheck(board, 'black')) blackScore -= 60;

  return povSide === 'red' ? redScore - blackScore : blackScore - redScore;
}

export interface AiMoveResult {
  from: Position;
  to: Position;
  score: number;
}

interface MoveCandidate {
  from: Position;
  to: Position;
  capturedVal: number;
}

// Generate all legal moves for a side
export function getAllLegalMoves(board: BoardState, side: Side): MoveCandidate[] {
  const candidates: MoveCandidate[] = [];

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (piece && piece.side === side) {
        const legalMoves = getLegalMoves(board, r, c);
        for (const m of legalMoves) {
          const target = board[m.r][m.c];
          candidates.push({
            from: { r, c },
            to: m,
            capturedVal: target ? PIECE_VALUES[target.type] : 0,
          });
        }
      }
    }
  }

  // Move ordering: prioritize captures
  candidates.sort((a, b) => b.capturedVal - a.capturedVal);
  return candidates;
}

// Alpha-Beta Minimax search
function alphaBeta(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  currentSide: Side,
  povSide: Side
): number {
  if (depth === 0) {
    return evaluateBoard(board, povSide);
  }

  const moves = getAllLegalMoves(board, currentSide);
  if (moves.length === 0) {
    // Checkmate or stalemate: current side loses
    return isMaximizing ? -99999 + (5 - depth) : 99999 - (5 - depth);
  }

  const nextSide: Side = currentSide === 'red' ? 'black' : 'red';

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = cloneBoard(board);
      newBoard[move.to.r][move.to.c] = newBoard[move.from.r][move.from.c];
      newBoard[move.from.r][move.from.c] = null;

      const evalScore = alphaBeta(newBoard, depth - 1, alpha, beta, false, nextSide, povSide);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cut-off
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = cloneBoard(board);
      newBoard[move.to.r][move.to.c] = newBoard[move.from.r][move.from.c];
      newBoard[move.from.r][move.from.c] = null;

      const evalScore = alphaBeta(newBoard, depth - 1, alpha, beta, true, nextSide, povSide);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cut-off
    }
    return minEval;
  }
}

export function findBestMove(
  board: BoardState,
  side: Side,
  difficultyLevel: number = 2
): AiMoveResult | null {
  const moves = getAllLegalMoves(board, side);
  if (moves.length === 0) return null;

  // Difficulty 1 (Tập Sự - Luyện Khí): 40% random move to allow beginner easy practice
  if (difficultyLevel <= 1) {
    if (Math.random() < 0.4) {
      const randomPick = moves[Math.floor(Math.random() * Math.min(moves.length, 6))];
      return {
        from: randomPick.from,
        to: randomPick.to,
        score: 0,
      };
    }
  }

  // Difficulty 2 (Sơ Cấp - Trúc Cơ): Depth 1 with minor randomness
  if (difficultyLevel === 2) {
    if (Math.random() < 0.15) {
      const randomPick = moves[Math.floor(Math.random() * Math.min(moves.length, 4))];
      return {
        from: randomPick.from,
        to: randomPick.to,
        score: 0,
      };
    }
  }

  // Determine search depth based on difficulty
  // Level 1: 1 ply
  // Level 2: 1-2 plies
  // Level 3: 2 plies
  // Level 4: 3 plies
  // Level 5: 3-4 plies
  // Level 6: 4 plies
  let depth = 2;
  if (difficultyLevel <= 1) depth = 1;
  else if (difficultyLevel === 2) depth = 1;
  else if (difficultyLevel === 3) depth = 2;
  else if (difficultyLevel === 4) depth = 3;
  else if (difficultyLevel === 5) depth = 3;
  else if (difficultyLevel >= 6) depth = 4;

  let bestMove: MoveCandidate = moves[0];
  let bestScore = -Infinity;
  const nextSide: Side = side === 'red' ? 'black' : 'red';

  for (const move of moves) {
    const newBoard = cloneBoard(board);
    newBoard[move.to.r][move.to.c] = newBoard[move.from.r][move.from.c];
    newBoard[move.from.r][move.from.c] = null;

    const score = alphaBeta(
      newBoard,
      depth - 1,
      -Infinity,
      Infinity,
      false,
      nextSide,
      side
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return {
    from: bestMove.from,
    to: bestMove.to,
    score: bestScore,
  };
}

// Hint generator for player (Thiên Cơ Chỉ Điểm)
export function getHintMove(
  board: BoardState,
  side: Side
): { from: Position; to: Position; explanation: string } | null {
  const result = findBestMove(board, side, 4);
  if (!result) return null;

  const movingPiece = board[result.from.r][result.from.c];
  const targetPiece = board[result.to.r][result.to.c];

  let explanation = '';
  if (targetPiece) {
    explanation = `Trảm sát quân đối phương tại ô (${result.to.r + 1}, ${result.to.c + 1}) để chiếm tiên cơ khí vận!`;
  } else if (movingPiece?.type === 'r') {
    explanation = 'Xuất Chiến Xa chiếm giữ lộ then chốt, uy hiếp tung hoành cửu châu.';
  } else if (movingPiece?.type === 'c') {
    explanation = 'Đi Pháo vào vị trí pháo đầu hoặc tuần hà để lập trận pháp hỏa diệm.';
  } else if (movingPiece?.type === 'n') {
    explanation = 'Nhảy Mã khai thông cước bộ, vượt qua trở ngại phong tỏa.';
  } else if (movingPiece?.type === 'p') {
    explanation = 'Tiến Binh vượt hà, từng bước uy hiếp cung đình đối phương.';
  } else {
    explanation = 'Củng cố phòng tuyến hậu phương, giữ vững an toàn chủ tướng.';
  }

  return {
    from: result.from,
    to: result.to,
    explanation,
  };
}

// Advantage Evaluator (Thanh Thế Trận / Advantage Bar)
export function evaluateAdvantage(board: BoardState): {
  redScore: number;
  blackScore: number;
  advantagePercent: number; // 0 to 100 (50 is dead even)
  advantageSide: Side | 'equal';
  textVi: string;
} {
  const redAdvantage = evaluateBoard(board, 'red');

  // Map redAdvantage (typically between -1500 to +1500) to 5% - 95%
  const clamped = Math.max(-1500, Math.min(1500, redAdvantage));
  const advantagePercent = Math.round(50 + (clamped / 1500) * 45);

  let advantageSide: Side | 'equal' = 'equal';
  let textVi = 'Thế trận cân bằng (Ngang tài ngang sức)';

  if (redAdvantage > 300) {
    advantageSide = 'red';
    textVi = `Tiên thủ (Đỏ) chiếm ưu thế (+${Math.round(redAdvantage / 10)})`;
  } else if (redAdvantage < -300) {
    advantageSide = 'black';
    textVi = `Hậu thủ (Đen) chiếm ưu thế (+${Math.round(Math.abs(redAdvantage) / 10)})`;
  } else if (redAdvantage > 100) {
    advantageSide = 'red';
    textVi = 'Tiên thủ (Đỏ) hơi nhỉnh hơn một chút';
  } else if (redAdvantage < -100) {
    advantageSide = 'black';
    textVi = 'Hậu thủ (Đen) hơi nhỉnh hơn một chút';
  }

  return {
    redScore: redAdvantage > 0 ? redAdvantage : 0,
    blackScore: redAdvantage < 0 ? Math.abs(redAdvantage) : 0,
    advantagePercent,
    advantageSide,
    textVi,
  };
}

// Difficulty Preset Definition
export type BotDifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface BotDifficultyConfig {
  level: BotDifficultyLevel;
  key: string;
  name: string;
  subName: string;
  badge: string;
  elo: number;
  description: string;
  botRival: AiCultivator;
  color: string;
  glowColor: string;
  bgGradient: string;
}

export const BOT_DIFFICULTY_PRESETS: BotDifficultyConfig[] = [
  {
    level: 1,
    key: 'easy',
    name: 'Tập Sự (Dễ)',
    subName: 'Luyện Khí Kỳ',
    badge: 'Cấp 1 • Sơ Học',
    elo: 1000,
    description: 'Thao tác chậm rãi, thỉnh thoảng đi nước ngẫu nhiên. Rất thích hợp để người mới làm quen nước đi và luật cờ tướng.',
    color: '#10b981', // Emerald
    glowColor: 'rgba(16, 185, 129, 0.4)',
    bgGradient: 'from-emerald-950/70 to-slate-900',
    botRival: {
      id: 'bot_lvl_1',
      name: 'Bạch Vân Đạo Đồng',
      sect: 'Thanh Vân Tông',
      realm: 'Luyện Khí Kỳ',
      realmLevel: 1,
      elo: 1000,
      title: 'Kỳ Đạo Đạo Đồng',
      avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
      frameColor: '#10b981',
      searchDepth: 1,
      quotes: {
        greeting: 'Tiểu đạo xin kính chào tiền bối, mong tiền bối nương tay chỉ điểm vài nước!',
        capture: 'A, tiểu đạo bắt được một quân rồi!',
        underCheck: 'Nguy hiểm quá, tiểu đạo phải bảo vệ Tướng quân!',
        giveCheck: 'Tiền bối chú ý nhé, tiểu đạo xin phép chiếu một cái!',
        win: 'Tiểu đạo may mắn quá, cảm ơn tiền bối đã nhường!',
        lose: 'Tiền bối kỳ nghệ cao thâm, vãn bối cam bái hạ phong!',
      },
    },
  },
  {
    level: 2,
    key: 'normal',
    name: 'Sơ Cấp (Bình Thường)',
    subName: 'Trúc Cơ Kỳ',
    badge: 'Cấp 2 • Nhập Môn',
    elo: 1300,
    description: 'Nắm vững cách bắt quân cơ bản, biết điều động Mã và Pháo nhưng đôi khi để lộ sơ hở ở tuyến phòng thủ.',
    color: '#06b6d4', // Cyan
    glowColor: 'rgba(6, 182, 212, 0.4)',
    bgGradient: 'from-cyan-950/70 to-slate-900',
    botRival: {
      id: 'bot_lvl_2',
      name: 'Thanh Phong Trưởng Lão',
      sect: 'Thục Sơn Kiếm Phái',
      realm: 'Trúc Cơ Kỳ',
      realmLevel: 2,
      elo: 1300,
      title: 'Bạch Vân Kỳ Sĩ',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      frameColor: '#06b6d4',
      searchDepth: 2,
      quotes: {
        greeting: 'Bàn cờ như chiến trường, tiên hữu hãy thong thả xuất chiêu!',
        capture: 'Kiếm khí tung hoành, đoạn tuyệt đường lui của đối phương!',
        underCheck: 'Thế cờ hiểm trở thật, lão phu phải thoái thủ!',
        giveCheck: 'Pháp kiếm xuất vỏ! Chiếu!',
        win: 'Kỳ đạo quý ở sự trầm ổn, tiên hữu cần rèn luyện thêm!',
        lose: 'Nước cờ thật huyền diệu, lão phu khâm phục vô cùng!',
      },
    },
  },
  {
    level: 3,
    key: 'intermediate',
    name: 'Trung Cấp (Khá)',
    subName: 'Kim Đan Kỳ',
    badge: 'Cấp 3 • Tinh Thông',
    elo: 1600,
    description: 'Tính toán trước 2-3 nước đi, biết dùng Pháo giăng bẫy, bảo vệ Tướng chặt chẽ và phản công chớp nhoáng.',
    color: '#f59e0b', // Amber
    glowColor: 'rgba(245, 158, 11, 0.4)',
    bgGradient: 'from-amber-950/70 to-slate-900',
    botRival: {
      id: 'bot_lvl_3',
      name: 'Tử Tiêu Kiếm Tôn',
      sect: 'Thiên Đao Tông',
      realm: 'Kim Đan Kỳ',
      realmLevel: 3,
      elo: 1600,
      title: 'Diệu Thủ Đan Tâm',
      avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
      frameColor: '#f59e0b',
      searchDepth: 2,
      quotes: {
        greeting: 'Kim Đan đại thành, hôm nay mượn bàn cờ luận đạo cùng đạo hữu!',
        capture: 'Trảm! Một kích đoạn tuyệt căn cơ!',
        underCheck: 'Chiêu này khá lắm, suýt nữa phá vỡ kim đan phòng hộ!',
        giveCheck: 'Lôi đình vạn quân, liệu đạo hữu có đỡ nổi đòn này?',
        win: 'Đại đạo vô tình, thắng bại vốn là lẽ thường!',
        lose: 'Hôm nay được mở mang tầm mắt, đạo hữu quả là kỳ tài!',
      },
    },
  },
  {
    level: 4,
    key: 'advanced',
    name: 'Cao Cấp (Khó)',
    subName: 'Nguyên Anh Kỳ',
    badge: 'Cấp 4 • Cao Thủ',
    elo: 1850,
    description: 'Tấn công dồn dập, phối hợp Xe - Pháo - Mã đồng bộ. Cực kỳ nhạy bén với các nước chiếu bí và bẫy bắt quân.',
    color: '#a855f7', // Purple
    glowColor: 'rgba(168, 85, 247, 0.4)',
    bgGradient: 'from-purple-950/70 to-slate-900',
    botRival: {
      id: 'bot_lvl_4',
      name: 'Băng Phách Tiên Cơ',
      sect: 'Hàn Băng Thần Cung',
      realm: 'Nguyên Anh Kỳ',
      realmLevel: 4,
      elo: 1850,
      title: 'Cửu Tiêu Kiếm Tiên',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      frameColor: '#a855f7',
      searchDepth: 3,
      quotes: {
        greeting: 'Hàn băng ngàn năm không tan, xem đạo hữu làm sao phá vỡ hàn trận!',
        capture: 'Băng phong vạn dặm, chôn vùi trong sương tuyết!',
        underCheck: 'Nguyên Anh xuất khiếu, há lại dễ bị tổn thương?',
        giveCheck: 'Tuyệt sát hàn sương! Đạo hữu nguy hiểm rồi!',
        win: 'Kỳ lực của đạo hữu còn thiếu chút hỏa hầu!',
        lose: 'Bản cung tâm phục khẩu phục, tiên hữu quả thực thâm sâu khôn lường!',
      },
    },
  },
  {
    level: 5,
    key: 'master',
    name: 'Đại Sư (Rất Khó)',
    subName: 'Hóa Thần Kỳ',
    badge: 'Cấp 5 • Đại Sư',
    elo: 2150,
    description: 'Phân tích thế trận sâu sắc, khai cuộc chuẩn xác, trung cuộc ma ảo, tàn cuộc hiểm ác. Bất kỳ sơ hở nào cũng phải trả giá.',
    color: '#f43f5e', // Rose
    glowColor: 'rgba(244, 63, 94, 0.4)',
    bgGradient: 'from-rose-950/70 to-slate-900',
    botRival: {
      id: 'bot_lvl_5',
      name: 'Độc Cô Kiếm Ma',
      sect: 'Vạn Ma Thần Điện',
      realm: 'Hóa Thần Kỳ',
      realmLevel: 5,
      elo: 2150,
      title: 'Thần Toán Chân Quân',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      frameColor: '#f43f5e',
      searchDepth: 3,
      quotes: {
        greeting: 'Bản tọa tung hoành thiên hạ trăm năm chưa từng gặp đối thủ, tiếp chiêu!',
        capture: 'Huyết sát ngút trời! Vạn kiếp bất phục!',
        underCheck: 'Có bản lĩnh! Nhưng Ma Đạo Bất Tử!',
        giveCheck: 'Vô Gian Địa Ngục! Chiếu bí chỉ trong gang tấc!',
        win: 'Ha ha ha! Thiên hạ vô địch, thật là tịch mịch!',
        lose: 'Không ngờ thế gian lại có người phá được Ma Đạo Trận của ta!',
      },
    },
  },
  {
    level: 6,
    key: 'grandmaster',
    name: 'Tiên Đế (Thách Thức Cực Hạn)',
    subName: 'Vô Thượng Tiên Đế',
    badge: 'Cấp 6 • Tiên Đế',
    elo: 2600,
    description: 'Trình độ cờ thần thánh. Thuật toán Alpha-Beta toàn diện, kiểm soát trung tâm, điều binh khiển tướng như thần.',
    color: '#fbbf24', // Gold
    glowColor: 'rgba(251, 191, 36, 0.5)',
    bgGradient: 'from-yellow-950/70 to-slate-900',
    botRival: {
      id: 'bot_lvl_6',
      name: 'Cửu Thiên Tiên Đế',
      sect: 'Hỗn Độn Tiên Cung',
      realm: 'Vô Thượng Tiên Đế',
      realmLevel: 10,
      elo: 2600,
      title: 'Vô Thượng Tiên Đế',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      frameColor: '#fbbf24',
      searchDepth: 4,
      quotes: {
        greeting: 'Vạn vật giai vi kỳ tử, duy bản tọa chưởng quản Càn Khôn!',
        capture: 'Hư không toái liệt, thiên đạo luân hồi!',
        underCheck: 'Ý chí kiên cường, quả không hổ là thiên chi kiêu tử!',
        giveCheck: 'Cửu Sắc Lôi Kiếp! Xem thần thông của ngươi!',
        win: 'Vô Thượng Thiên Đạo, người phàm sao hiểu thấu?',
        lose: 'Kỳ tài khoáng thế! Hôm nay bản tọa chứng kiến Đạo Tổ tái sinh!',
      },
    },
  },
];

// AI Cultivator Rivals configuration with Daoist personalities
export interface AiCultivator {
  id: string;
  name: string;
  sect: string;
  realm: string;
  realmLevel: number;
  elo: number;
  title: string;
  avatarUrl: string;
  frameColor: string;
  searchDepth: number;
  quotes: {
    greeting: string;
    capture: string;
    underCheck: string;
    giveCheck: string;
    win: string;
    lose: string;
  };
}

export const AI_CULTIVATOR_RIVALS: AiCultivator[] = [
  {
    id: 'ai_1',
    name: 'Bạch Vân Đạo Đồng',
    sect: 'Thanh Vân Tông',
    realm: 'Luyện Khí Kỳ',
    realmLevel: 1,
    elo: 1120,
    title: 'Kỳ Đạo Đạo Đồng',
    avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    frameColor: '#10b981',
    searchDepth: 1,
    quotes: {
      greeting: 'Tiểu đạo xin kính chào tiền bối, mong tiền bối chỉ điểm vài nước!',
      capture: 'Hì hì, nước cờ này tiểu đạo đã ngắm từ lâu rồi!',
      underCheck: 'A, nguy hiểm quá, đành phải thoái thủ thôi!',
      giveCheck: 'Tiền bối cẩn thận, xem một kích Binh pháp này!',
      win: 'Đa tạ tiền bối đã nhường, tiểu đạo may mắn thắng nửa chiêu!',
      lose: 'Tiền bối kỳ nghệ cao thâm, vãn bối cam bái hạ phong!',
    },
  },
  {
    id: 'ai_2',
    name: 'Thanh Phong Trưởng Lão',
    sect: 'Thục Sơn Kiếm Phái',
    realm: 'Trúc Cơ Kỳ',
    realmLevel: 2,
    elo: 1350,
    title: 'Bạch Vân Kỳ Sĩ',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    frameColor: '#06b6d4',
    searchDepth: 2,
    quotes: {
      greeting: 'Bàn cờ như chiến trường, tiên hữu hãy xuất chiêu đi!',
      capture: 'Kiếm khí tung hoành, đoạn tuyệt đường lui của đối phương!',
      underCheck: 'Hừ, thế cờ hiểm trở thật, nhưng lão phu há sợ?',
      giveCheck: 'Pháp kiếm xuất vỏ! Chiếu!',
      win: 'Kỳ đạo quý ở sự trầm ổn, tiên hữu cần rèn luyện thêm!',
      lose: 'Nước cờ thật huyền diệu, lão phu khâm phục vô cùng!',
    },
  },
  {
    id: 'ai_3',
    name: 'Tử Tiêu Kiếm Tôn',
    sect: 'Thiên Đao Tông',
    realm: 'Kim Đan Kỳ',
    realmLevel: 3,
    elo: 1580,
    title: 'Diệu Thủ Đan Tâm',
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    frameColor: '#f59e0b',
    searchDepth: 3,
    quotes: {
      greeting: 'Kim Đan đại thành, hôm nay mượn bàn cờ luận đạo cùng đạo hữu!',
      capture: 'Trảm! Không lưu lại một tia sinh cơ!',
      underCheck: 'Chiêu này khá lắm, suýt nữa phá vỡ phòng ngự của ta!',
      giveCheck: 'Lôi đình vạn quân, liệu đạo hữu có hóa giải được không?',
      win: 'Đại đạo vô tình, thắng bại vốn là chuyện thường tình!',
      lose: 'Hôm nay được mở mang tầm mắt, đạo hữu quả là kỳ tài thiên bẩm!',
    },
  },
  {
    id: 'ai_4',
    name: 'Băng Phách Tiên Cơ',
    sect: 'Hàn Băng Thần Cung',
    realm: 'Nguyên Anh Kỳ',
    realmLevel: 4,
    elo: 1780,
    title: 'Cửu Tiêu Kiếm Tiên',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    frameColor: '#a855f7',
    searchDepth: 3,
    quotes: {
      greeting: 'Hàn băng ngàn năm không tan, xem đạo hữu làm sao phá vỡ hàn trận của bản cung!',
      capture: 'Băng phong vạn dặm, hóa thành tro bụi!',
      underCheck: 'Nguyên Anh xuất khiếu, dễ gì tổn thương được ta?',
      giveCheck: 'Tuyệt sát hàn sương! Đạo hữu nguy hiểm rồi!',
      win: 'Kỳ lực của đạo hữu còn thiếu chút hỏa hầu!',
      lose: 'Bản cung tâm phục khẩu phục, tiên hữu quả thực thâm sâu khôn lường!',
    },
  },
  {
    id: 'ai_5',
    name: 'Độc Cô Kiếm Ma',
    sect: 'Vạn Ma Thần Điện',
    realm: 'Hóa Thần Kỳ',
    realmLevel: 5,
    elo: 2050,
    title: 'Thần Toán Chân Quân',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    frameColor: '#f43f5e',
    searchDepth: 4,
    quotes: {
      greeting: 'Bản tọa tung hoành tam giới trăm năm chưa từng gặp kỳ phùng địch thủ, ngươi có dám chiến?',
      capture: 'Huyết sát ngút trời! Đi chết đi!',
      underCheck: 'Có bản lĩnh! Nhưng Ma Đạo Bất Tử!',
      giveCheck: 'Vô Gian Địa Ngục! Chiếu bí chỉ trong gang tấc!',
      win: 'Ha ha ha! Thiên hạ vô địch, thật là tịch mịch!',
      lose: 'Không ngờ thế gian lại có người hóa giải được Ma Đạo Thần Trận của ta!',
    },
  },
  {
    id: 'ai_6',
    name: 'Cửu Thiên Tiên Đế',
    sect: 'Hỗn Độn Tiên Cung',
    realm: 'Vô Thượng Tiên Đế',
    realmLevel: 10,
    elo: 2650,
    title: 'Vô Thượng Tiên Đế',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    frameColor: '#fbbf24',
    searchDepth: 4,
    quotes: {
      greeting: 'Vạn vật giai vi kỳ tử, duy bản tọa chưởng quản Càn Khôn!',
      capture: 'Hư không toái liệt, thiên đạo luân hồi!',
      underCheck: 'Ý chí kiên cường, quả không hổ là thiên chi kiêu tử!',
      giveCheck: 'Cửu Sắc Lôi Kiếp! Xem thần thông của ngươi!',
      win: 'Vô Thượng Thiên Đạo, người phàm sao hiểu thấu?',
      lose: 'Kỳ tài khoáng thế! Hôm nay bản tọa chứng kiến Đạo Tổ tái sinh!',
    },
  },
];
