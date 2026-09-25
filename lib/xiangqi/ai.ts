import { BoardState, Position, Side } from './types';
import { cloneBoard, getLegalMoves, isSideInCheck } from './rules';

export interface AiQuotes {
  greeting: string;
  checkmate: string;
  win: string;
  lose: string;
}

export interface AiCultivator {
  id: string;
  name: string;
  title: string;
  sect: string;
  realm: string;
  realmLevel: number;
  elo: number;
  avatarUrl: string;
  frameColor: string;
  description: string;
  depth: number;
  quotes: AiQuotes;
}

export const AI_CULTIVATOR_RIVALS: AiCultivator[] = [
  {
    id: 'ai_bach_van',
    name: 'Bạch Vân Đạo Đồng',
    title: 'Kỳ Đạo Đạo Đồng',
    sect: 'Bạch Vân Tông',
    realm: 'Luyện Khí Kỳ',
    realmLevel: 1,
    elo: 1100,
    avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    frameColor: '#10b981',
    description: 'Tiểu đạo đồng mới nhập môn, kỳ nghệ chất phác, thích dùng pháo công kích trực diện.',
    depth: 1,
    quotes: {
      greeting: 'Đạo hữu xin chỉ giáo! Tiểu đạo học cờ chưa lâu, mong hạ thủ lưu tình.',
      checkmate: 'Chiếu tướng! Đạo hữu hãy cẩn thận nước cờ này.',
      win: 'Đa tạ đạo hữu đã nhường! Tiểu đạo may mắn thắng nửa chiêu.',
      lose: 'Kỳ nghệ của đạo hữu thật cao siêu, tiểu đạo tâm phục khẩu phục.',
    },
  },
  {
    id: 'ai_thanh_phong',
    name: 'Thanh Phong Trưởng Lão',
    title: 'Bạch Vân Kỳ Sĩ',
    sect: 'Thanh Hư Kiếm Tông',
    realm: 'Trúc Cơ Kỳ',
    realmLevel: 2,
    elo: 1350,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    frameColor: '#06b6d4',
    description: 'Trưởng lão ngoại môn, phòng thủ vững vàng, chuyên bẫy ngựa giăng phục binh.',
    depth: 2,
    quotes: {
      greeting: 'Lão hủ bế quan trăm năm, hôm nay có duyên cùng đạo hữu đánh một ván luận đạo.',
      checkmate: 'Lôi đình vạn quân, tướng quân bất động!',
      win: 'Gừng càng già càng cay, đạo hữu cần ma luyện tâm tính thêm.',
      lose: 'Hậu sinh khả úy! Tiên giới lại xuất hiện một vị kỳ đạo kỳ tài.',
    },
  },
  {
    id: 'ai_huyen_minh',
    name: 'Huyền Minh Kiếm Khách',
    title: 'Thanh Hư Kỳ Tướng',
    sect: 'Vạn Kiếm Tông',
    realm: 'Kim Đan Kỳ',
    realmLevel: 3,
    elo: 1550,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    frameColor: '#eab308',
    description: 'Kiếm đạo dung hợp kỳ đạo, sát phạt quyết đoán, xuất xe như sấm sét.',
    depth: 3,
    quotes: {
      greeting: 'Kiếm xuất vỏ, cờ định càn khôn! Đạo hữu, tiếp chiêu!',
      checkmate: 'Vạn kiếm quy tông, sát khí đằng đằng!',
      win: 'Kiếm ý tung hoành, bàn cờ định sinh tử!',
      lose: 'Kiếm gãy cờ tàn, kiếm ý của đạo hữu thật sắc bén!',
    },
  },
  {
    id: 'ai_bang_phach',
    name: 'Băng Phách Tiên Tử',
    title: 'Thông Huyền Kỳ Hoàng',
    sect: 'Hàn Băng Cung',
    realm: 'Nguyên Anh Kỳ',
    realmLevel: 4,
    elo: 1750,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    frameColor: '#a855f7',
    description: 'Tuyệt mỹ tiên tử cung Hàn Băng, phong tỏa thế cờ lạnh lùng từng bước ép chết đối thủ.',
    depth: 3,
    quotes: {
      greeting: 'Hàn băng ngàn năm đóng băng vạn dặm. Mời đạo hữu hạ quân.',
      checkmate: 'Băng phách hàn sương, vô lộ khả đào.',
      win: 'Thế cờ đã đông cứng, thắng bại đã định từ mười nước trước.',
      lose: 'Không ngờ ngọn lửa đạo tâm của đạo hữu lại làm tan chảy hàn băng.',
    },
  },
  {
    id: 'ai_doc_co',
    name: 'Độc Cô Kiếm Ma',
    title: 'Độc Cô Kỳ Thần',
    sect: 'Cửu U Ma Tông',
    realm: 'Đại Thừa Kỳ',
    realmLevel: 8,
    elo: 2150,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    frameColor: '#ef4444',
    description: 'Cả đời cầu một trận bại không được, kỳ đạo xuất quỷ nhập thần, tính toán thâm sâu.',
    depth: 4,
    quotes: {
      greeting: 'Trăm năm cầu một trận bại! Hy vọng đạo hữu không làm ta thất vọng.',
      checkmate: 'Huyết hải ma sát, diệt tuyệt sinh cơ!',
      win: 'Lại thắng một ván vô vị... Thế gian này ai xứng làm kỳ phùng địch thủ?',
      lose: 'Haha! Trăm năm qua rốt cuộc cũng có người phá giải được Ma Đạo Tàn Cuộc!',
    },
  },
];

const PIECE_VALUES: Record<string, number> = {
  k: 10000,
  r: 900,
  c: 450,
  n: 400,
  b: 200,
  a: 200,
  p: 100,
};

export interface AdvantageEvaluation {
  score: number;
  advantagePercent: number;
  textVi: string;
}

// Evaluate board score: positive = Red ahead, negative = Black ahead
export function evaluateBoardScore(board: BoardState): number {
  let score = 0;
  for (let r = 0; r <= 9; r++) {
    for (let c = 0; c <= 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      let val = PIECE_VALUES[p.type] || 0;
      // Positional bonus for advancing pawns
      if (p.type === 'p') {
        if (p.side === 'red' && r <= 4) val += 100;
        if (p.side === 'black' && r >= 5) val += 100;
      }
      if (p.side === 'red') score += val;
      else score -= val;
    }
  }
  return score;
}

// Evaluate advantage: returns percentage and textual description
export function evaluateAdvantage(board: BoardState): AdvantageEvaluation {
  const score = evaluateBoardScore(board);
  const clampedPercent = Math.min(95, Math.max(5, Math.round(50 + score / 40)));
  let textVi = 'Cân bằng thế trận';
  if (clampedPercent >= 70) {
    textVi = 'Bên Đỏ chiếm đại ưu thế';
  } else if (clampedPercent >= 56) {
    textVi = 'Bên Đỏ có chút tiên thủ';
  } else if (clampedPercent <= 30) {
    textVi = 'Bên Đen chiếm đại ưu thế';
  } else if (clampedPercent <= 44) {
    textVi = 'Bên Đen có chút tiên thủ';
  }

  return {
    score,
    advantagePercent: clampedPercent,
    textVi,
  };
}

interface MoveCandidate {
  from: Position;
  to: Position;
  score: number;
}

export function findBestMove(
  board: BoardState,
  side: Side,
  level: number = 2
): { from: Position; to: Position } | null {
  const isMaximizing = side === 'red';
  const candidates: MoveCandidate[] = [];

  for (let r = 0; r <= 9; r++) {
    for (let c = 0; c <= 8; c++) {
      const p = board[r][c];
      if (p && p.side === side) {
        const legal = getLegalMoves(board, r, c);
        for (const m of legal) {
          const testBoard = cloneBoard(board);
          const captured = testBoard[m.r][m.c];
          testBoard[m.r][m.c] = p;
          testBoard[r][c] = null;

          let moveScore = evaluateBoardScore(testBoard);

          // Give extra weight to captures and checks
          if (captured) {
            moveScore += (isMaximizing ? 1 : -1) * (PIECE_VALUES[captured.type] || 50);
          }
          if (isSideInCheck(testBoard, side === 'red' ? 'black' : 'red')) {
            moveScore += (isMaximizing ? 1 : -1) * 80;
          }

          // Small randomness for variation
          moveScore += (Math.random() - 0.5) * (level === 1 ? 120 : 30);

          candidates.push({
            from: { r, c },
            to: m,
            score: moveScore,
          });
        }
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => (isMaximizing ? b.score - a.score : a.score - b.score));
  return {
    from: candidates[0].from,
    to: candidates[0].to,
  };
}

export function getHintMove(
  board: BoardState,
  side: Side
): { from: Position; to: Position; explanation: string } | null {
  const best = findBestMove(board, side, 3);
  if (!best) return null;

  const piece = board[best.from.r][best.from.c];
  const target = board[best.to.r][best.to.c];

  let explanation = 'Nước cờ tối ưu thế trận.';
  if (target) {
    explanation = `Trảm sát ${target.side === 'red' ? 'quân Đỏ' : 'quân Đen'}, chiếm ưu thế vật chất.`;
  } else if (piece?.type === 'r') {
    explanation = 'Xuất Xe chiếm giữ lộ hiểm lộ quan trọng.';
  } else if (piece?.type === 'c') {
    explanation = 'Pháo giá trận, nhắm thẳng phương hướng sát chiêu.';
  } else if (piece?.type === 'n') {
    explanation = 'Mã đạp trường giang, mở rộng tầm kiểm soát.';
  }

  return {
    from: best.from,
    to: best.to,
    explanation,
  };
}

export type BotDifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface BotDifficultyConfig {
  level: BotDifficultyLevel;
  name: string;
  subName: string;
  elo: number;
  color: string;
  glowColor: string;
  description: string;
  botRival: AiCultivator;
}

export const BOT_DIFFICULTY_PRESETS: BotDifficultyConfig[] = [
  {
    level: 1,
    name: 'Sơ Nhập Môn',
    subName: 'Đạo Đồng',
    elo: 1100,
    color: '#10b981',
    glowColor: 'rgba(16,185,129,0.3)',
    description: 'Nước đi đơn giản, thích hợp làm quen thế cờ.',
    botRival: AI_CULTIVATOR_RIVALS[0],
  },
  {
    level: 2,
    name: 'Tiểu Thành',
    subName: 'Trúc Cơ',
    elo: 1350,
    color: '#06b6d4',
    glowColor: 'rgba(6,182,212,0.3)',
    description: 'Biết giăng bẫy phòng thủ và phản công cơ bản.',
    botRival: AI_CULTIVATOR_RIVALS[1],
  },
  {
    level: 3,
    name: 'Đại Thành',
    subName: 'Kim Đan',
    elo: 1550,
    color: '#eab308',
    glowColor: 'rgba(234,179,8,0.3)',
    description: 'Sát phạt quyết đoán, xuất chiêu biến hóa đa đoan.',
    botRival: AI_CULTIVATOR_RIVALS[2],
  },
  {
    level: 4,
    name: 'Viên Mãn',
    subName: 'Nguyên Anh',
    elo: 1750,
    color: '#a855f7',
    glowColor: 'rgba(168,85,247,0.3)',
    description: 'Phong tỏa thế cờ lạnh lùng, gần như không mắc sai sót.',
    botRival: AI_CULTIVATOR_RIVALS[3],
  },
  {
    level: 5,
    name: 'Vô Địch Giới',
    subName: 'Kiếm Ma',
    elo: 2150,
    color: '#ef4444',
    glowColor: 'rgba(239,68,68,0.4)',
    description: 'Cực hạn tính toán, sát chiêu tuyệt diệt không lối thoát.',
    botRival: AI_CULTIVATOR_RIVALS[4],
  },
];

