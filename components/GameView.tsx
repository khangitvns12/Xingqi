'use client';

import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Swords,
  RotateCcw,
  Flag,
  Handshake,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Flame,
  Shield,
  Clock,
  ArrowLeft,
  Bot,
  Trophy,
  History,
  MessageSquare,
  Repeat,
  Lightbulb,
  HelpCircle,
  Shuffle,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import {
  BoardState,
  GamePlayer,
  GameRoom,
  Move,
  Piece,
  Position,
  Side,
  SkillEffect,
  SkillFxType,
} from '../lib/xiangqi/types';
import {
  areKingsFacing,
  cloneBoard,
  generateMoveNotation,
  getLegalMoves,
  getPieceCharVi,
  getPieceNameVi,
  getSkillNameVi,
  getSkillTypeForPiece,
  hasAnyLegalMoves,
  INITIAL_BOARD,
  isSideInCheck,
} from '../lib/xiangqi/rules';
import { evaluateAdvantage, findBestMove, getHintMove } from '../lib/xiangqi/ai';
import { soundManager } from '../lib/audio/soundFx';
import { UserAccount } from '../lib/storage/userStore';
import { getRealmByLevel } from '../lib/cultivation/realms';
import JadeChessboard from './JadeChessboard';

interface GameViewProps {
  room: GameRoom;
  currentUser: UserAccount;
  onGameEnd: (result: {
    winnerSide: Side | 'draw';
    eloChange: number;
    expGained: number;
    spiritStonesGained: number;
  }) => void;
  onReturnToLobby: () => void;
}

export default function GameView({
  room,
  currentUser,
  onGameEnd,
  onReturnToLobby,
}: GameViewProps) {
  // Board & Game state
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [currentTurn, setCurrentTurn] = useState<Side>('red');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);

  // Status
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Side | 'draw' | null>(null);
  const [gameOverReason, setGameOverReason] = useState<string>('');

  // Players setup
  const [mySide, setMySide] = useState<Side>(room.players.red?.id === currentUser.id ? 'red' : 'black');
  const [flipped, setFlipped] = useState<boolean>(mySide === 'black');

  // Hint and Advantage states
  const [hintMove, setHintMove] = useState<{ from: Position; to: Position; explanation: string } | null>(null);
  const [showAdvantageBar, setShowAdvantageBar] = useState<boolean>(true);

  // Real-time board advantage evaluation
  const advantage = evaluateAdvantage(board);

  // Derived check status
  const isCheck = isSideInCheck(board, currentTurn);

  // Timers (in seconds; 0 means unlimited)
  const initialTime = room.timeLimit === 0 ? 0 : room.timeLimit * 60;
  const [redTime, setRedTime] = useState<number>(initialTime);
  const [blackTime, setBlackTime] = useState<number>(initialTime);

  // Captured pieces
  const [capturedRed, setCapturedRed] = useState<Piece[]>([]); // pieces red captured (black pieces)
  const [capturedBlack, setCapturedBlack] = useState<Piece[]>([]); // pieces black captured (red pieces)

  // Floating skill effect overlay
  const [activeSkillFx, setActiveSkillFx] = useState<SkillEffect | null>(null);

  // Sound state
  const [soundOn, setSoundOn] = useState(soundManager.enabled);

  // Shaking effect for board on heavy strike
  const [boardShake, setBoardShake] = useState(false);

  // Zoom & Pan state for mobile / multi-touch responsiveness
  const [boardZoom, setBoardZoom] = useState<number>(1);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const initialTouchDistanceRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);

  // Touch event handlers for pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      initialTouchDistanceRef.current = distance;
      initialZoomRef.current = boardZoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistanceRef.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const ratio = distance / initialTouchDistanceRef.current;
      const newZoom = Math.min(Math.max(initialZoomRef.current * ratio, 0.85), 1.6);
      setBoardZoom(Number(newZoom.toFixed(2)));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialTouchDistanceRef.current = null;
    }
  };

  const resetZoom = () => setBoardZoom(1);
  const zoomIn = () => setBoardZoom((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 1.6));
  const zoomOut = () => setBoardZoom((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.85));

  const opponentPlayer: GamePlayer =
    mySide === 'red'
      ? room.players.black || {
          id: 'ai_bot',
          name: 'Bạch Vân Đạo Đồng',
          title: 'Kỳ Đạo Đạo Đồng',
          realm: 'Luyện Khí Kỳ',
          realmLevel: 1,
          elo: 1150,
          avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
          frameColor: '#10b981',
          side: 'black',
          isAi: true,
          timeLeft: initialTime,
        }
      : room.players.red || {
          id: 'ai_bot',
          name: 'Thanh Phong Trưởng Lão',
          title: 'Bạch Vân Kỳ Sĩ',
          realm: 'Trúc Cơ Kỳ',
          realmLevel: 2,
          elo: 1350,
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          frameColor: '#06b6d4',
          side: 'red',
          isAi: true,
          timeLeft: initialTime,
        };

  const myPlayer: GamePlayer =
    mySide === 'red'
      ? room.players.red || {
          id: currentUser.id,
          name: currentUser.daoName,
          title: 'Đạo Hữu',
          realm: getRealmByLevel(currentUser.realmLevel).name,
          realmLevel: currentUser.realmLevel,
          elo: currentUser.elo,
          avatarUrl: currentUser.avatarUrl,
          frameColor: getRealmByLevel(currentUser.realmLevel).glowColor,
          side: 'red',
          timeLeft: initialTime,
        }
      : room.players.black || {
          id: currentUser.id,
          name: currentUser.daoName,
          title: 'Đạo Hữu',
          realm: getRealmByLevel(currentUser.realmLevel).name,
          realmLevel: currentUser.realmLevel,
          elo: currentUser.elo,
          avatarUrl: currentUser.avatarUrl,
          frameColor: getRealmByLevel(currentUser.realmLevel).glowColor,
          side: 'black',
          timeLeft: initialTime,
        };

  const endGameFinalize = (winSide: Side | 'draw') => {
    if (winSide === mySide) {
      soundManager.playVictoryFanfare();
      // Throw confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#06b6d4', '#10b981', '#a855f7'],
        });
      } catch {
        // ignore
      }
    }

    // Calculate rewards
    let eloDelta = 0;
    let expGained = 0;
    let stones = 0;

    if (winSide === mySide) {
      eloDelta = Math.floor(22 + Math.random() * 8);
      expGained = 150;
      stones = 50;
    } else if (winSide === 'draw') {
      eloDelta = 0;
      expGained = 50;
      stones = 15;
    } else {
      eloDelta = -Math.floor(15 + Math.random() * 6);
      expGained = 30; // practice insight
      stones = 5;
    }

    onGameEnd({
      winnerSide: winSide,
      eloChange: eloDelta,
      expGained,
      spiritStonesGained: stones,
    });
  };

  // Finish match logic
  const handleGameFinish = (winSide: Side | 'draw', reason: string) => {
    setGameOver(true);
    setWinner(winSide);
    setGameOverReason(reason);
    endGameFinalize(winSide);
  };

  // Execute a move on the board
  const executeMove = (from: Position, to: Position) => {
    const movingPiece = board[from.r][from.c];
    if (!movingPiece) return;

    const targetPiece = board[to.r][to.c];
    const notation = generateMoveNotation(board, from, to);
    const nextSide: Side = movingPiece.side === 'red' ? 'black' : 'red';

    // Skill effect trigger on capture
    let skillType: SkillFxType | undefined;
    if (targetPiece) {
      skillType = getSkillTypeForPiece(movingPiece.type);
      const effect: SkillEffect = {
        id: 'fx_' + Date.now(),
        type: skillType,
        row: to.r,
        col: to.c,
        attackerSide: movingPiece.side,
        skillName: getSkillNameVi(skillType),
      };
      setActiveSkillFx(effect);
      soundManager.playCapture(skillType);

      // Trigger board shake
      setBoardShake(true);
      setTimeout(() => setBoardShake(false), 400);

      // Clear skill fx after 1.4s
      setTimeout(() => setActiveSkillFx(null), 1400);

      // Track captured pieces
      if (movingPiece.side === 'red') {
        setCapturedRed((prev) => [...prev, targetPiece]);
      } else {
        setCapturedBlack((prev) => [...prev, targetPiece]);
      }
    } else {
      soundManager.playPieceMove();
    }

    // Apply move to board
    const newBoard = cloneBoard(board);
    newBoard[to.r][to.c] = movingPiece;
    newBoard[from.r][from.c] = null;

    setBoard(newBoard);
    setLastMove({ from, to });
    setSelectedPos(null);
    setValidMoves([]);

    const recordedMove: Move = {
      from,
      to,
      piece: movingPiece,
      captured: targetPiece,
      notation,
      timestamp: Date.now(),
      skillFx: skillType,
    };
    setMoveHistory((prev) => [...prev, recordedMove]);

    // Check if next side has any legal moves
    const oppHasMoves = hasAnyLegalMoves(newBoard, nextSide);
    if (!oppHasMoves) {
      // Checkmate or stalemate
      const isOppCheck = isSideInCheck(newBoard, nextSide);
      const reason = isOppCheck ? 'Chiếu Bí Tuyệt Sát!' : 'Đối phương Hết Nước Đi!';
      handleGameFinish(movingPiece.side, reason);
      return;
    }

    // Check if King was captured (flying general safeguard)
    if (targetPiece?.type === 'k') {
      handleGameFinish(movingPiece.side, 'Tướng Soái Bị Trảm!');
      return;
    }

    // Clear any active hint
    setHintMove(null);

    // Add increment to moving player's clock
    if (movingPiece.side === 'red') {
      setRedTime((prev) => prev + room.increment);
    } else {
      setBlackTime((prev) => prev + room.increment);
    }

    // Switch turn
    setCurrentTurn(nextSide);
    if (isSideInCheck(newBoard, nextSide)) {
      soundManager.playCheckAlert();
    }
  };

  // Timer countdown hook (paused if unlimited timeLimit === 0)
  useEffect(() => {
    if (gameOver || initialTime === 0) return;

    const timer = setInterval(() => {
      if (currentTurn === 'red') {
        setRedTime((prev) => {
          if (prev <= 1) {
            handleTimeout('red');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            handleTimeout('black');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTurn, gameOver, initialTime]);

  // Handle timeout loss
  const handleTimeout = (timedOutSide: Side) => {
    setGameOver(true);
    const winSide: Side = timedOutSide === 'red' ? 'black' : 'red';
    setWinner(winSide);
    setGameOverReason(
      timedOutSide === mySide
        ? 'Bạn đã hết thời gian tu đạo (Thua cuộc)'
        : 'Đối thủ đã hết thời gian tu đạo (Chiến thắng)'
    );
    endGameFinalize(winSide);
  };

  const isCurrentAi =
    !gameOver &&
    ((currentTurn === 'black' && opponentPlayer.side === 'black' && opponentPlayer.isAi) ||
      (currentTurn === 'red' && opponentPlayer.side === 'red' && opponentPlayer.isAi));

  const isAiThinking = isCurrentAi;

  // AI Turn Handling with selectable difficulty
  useEffect(() => {
    if (gameOver) return;

    if (isCurrentAi) {
      const thinkDuration = 500 + Math.random() * 700;

      const aiTimer = setTimeout(() => {
        // AI difficulty maps to selected level (1 to 6) or fallback to realm level
        const botLevel = opponentPlayer.aiDifficultyLevel || Math.min(6, Math.max(1, opponentPlayer.realmLevel));
        const best = findBestMove(board, currentTurn, botLevel);

        if (best) {
          executeMove(best.from, best.to);
        } else {
          // AI has no moves -> checkmate / stalemate loss
          handleGameFinish(mySide, 'Đối phương cùng đường mạt lộ, thúc thủ quy hàng!');
        }
      }, thinkDuration);

      return () => clearTimeout(aiTimer);
    }
  }, [currentTurn, gameOver, opponentPlayer, isCurrentAi, board, mySide]);

  // User board cell click
  const handleCellClick = (r: number, c: number) => {
    if (gameOver) return;
    if (currentTurn !== mySide) return; // not your turn!

    const clickedPiece = board[r][c];

    // Case 1: Already selected a piece
    if (selectedPos) {
      // Check if clicked square is one of the valid legal moves
      const isValid = validMoves.some((m) => m.r === r && m.c === c);
      if (isValid) {
        executeMove(selectedPos, { r, c });
        return;
      }

      // If clicked another piece of own side -> change selection
      if (clickedPiece && clickedPiece.side === mySide) {
        setSelectedPos({ r, c });
        setValidMoves(getLegalMoves(board, r, c));
        soundManager.playPieceMove();
        return;
      }

      // Otherwise cancel selection
      setSelectedPos(null);
      setValidMoves([]);
      return;
    }

    // Case 2: Selecting own piece
    if (clickedPiece && clickedPiece.side === mySide) {
      const moves = getLegalMoves(board, r, c);
      setSelectedPos({ r, c });
      setValidMoves(moves);
      soundManager.playPieceMove();
    }
  };

  // Resign (Nhận thua)
  const handleResign = () => {
    if (gameOver) return;
    const oppSide: Side = mySide === 'red' ? 'black' : 'red';
    handleGameFinish(oppSide, 'Bạn đã nhận thua (Quy hàng luận đạo)');
  };

  // Offer draw
  const handleOfferDraw = () => {
    if (gameOver) return;
    // If playing AI, accept draw if material is roughly balanced
    if (opponentPlayer.isAi) {
      handleGameFinish('draw', 'Hai bên bắt tay hòa hoãn, dĩ hòa vi quý');
    } else {
      handleGameFinish('draw', 'Hai bên đồng ý thủ hòa');
    }
  };

  // Takeback (Xin đi lại - solo mode against AI only)
  const handleTakeback = () => {
    if (gameOver || !opponentPlayer.isAi || moveHistory.length < 2) return;
    // Revert 2 moves (AI move and user move)
    const newHistory = moveHistory.slice(0, -2);
    // Replay history from initial board
    let tempBoard = cloneBoard(INITIAL_BOARD);
    newHistory.forEach((m) => {
      tempBoard[m.to.r][m.to.c] = tempBoard[m.from.r][m.from.c];
      tempBoard[m.from.r][m.from.c] = null;
    });
    setBoard(tempBoard);
    setMoveHistory(newHistory);
    setCurrentTurn(mySide);
    setSelectedPos(null);
    setValidMoves([]);
    setHintMove(null);
    setLastMove(
      newHistory.length > 0
        ? { from: newHistory[newHistory.length - 1].from, to: newHistory[newHistory.length - 1].to }
        : null
    );
  };

  // Get AI Hint (Thiên Cơ Chỉ Điểm)
  const handleGetHint = () => {
    if (gameOver || currentTurn !== mySide) return;
    const hint = getHintMove(board, mySide);
    setHintMove(hint);
    if (hint) {
      soundManager.playPieceMove();
    }
  };

  // Swap side with bot (Hoán Đổi Cầm Quân)
  const handleSwapSideWithBot = () => {
    if (gameOver || !opponentPlayer.isAi) return;
    const newSide: Side = mySide === 'red' ? 'black' : 'red';
    setMySide(newSide);
    setFlipped(newSide === 'black');
    setSelectedPos(null);
    setValidMoves([]);
    setHintMove(null);
    soundManager.playPieceMove();
  };

  // Format seconds to MM:SS or Unlimited
  const formatTime = (secs: number) => {
    if (initialTime === 0) return '∞ Vô Hạn';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Dynamic row/col coordinates according to board flipped state
  const getRenderR = (rowIdx: number) => (flipped ? 9 - rowIdx : rowIdx);
  const getRenderC = (colIdx: number) => (flipped ? 8 - colIdx : colIdx);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6 space-y-4">
      {/* Top Bar / Quick match status */}
      <div className="flex items-center justify-between bg-[#0d1424]/90 border border-amber-500/20 rounded-xl px-3 sm:px-5 py-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onReturnToLobby}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Thoát về sảnh"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="font-bold text-slate-200">{room.name}</span>
            <span className="text-slate-400 hidden sm:inline ml-2">
              • {room.isRanked ? 'Xếp Hạng ELO' : 'Tập Luyện'}
            </span>
          </div>
        </div>

        {/* Check indicator banner */}
        {isCheck && !gameOver && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/90 text-white font-bold text-xs animate-bounce shadow-lg shadow-rose-600/50">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>CHIẾU TƯỚNG!</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom Controls for Mobile / Small Screens */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-slate-300">
            <button
              onClick={zoomOut}
              className="p-1 sm:p-1.5 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors"
              title="Thu nhỏ bàn cờ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetZoom}
              className="px-1.5 py-0.5 text-[10px] font-mono hover:text-amber-300 transition-colors"
              title="Đặt lại tỉ lệ 100%"
            >
              {Math.round(boardZoom * 100)}%
            </button>
            <button
              onClick={zoomIn}
              className="p-1 sm:p-1.5 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors"
              title="Phóng to bàn cờ"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              soundManager.enabled = !soundOn;
              setSoundOn(!soundOn);
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            title="Âm thanh"
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setFlipped(!flipped)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1"
            title="Lật bàn cờ"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline text-[11px]">Lật Bàn</span>
          </button>
        </div>
      </div>

      {/* Center Layout: Left/Center Board (7-8 cols), Right Sidebar Controls (4-5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Board Container (8 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col items-center space-y-3">
          {/* Opponent Player Bar */}
          <div
            className={`w-full max-w-[560px] flex items-center justify-between px-3 sm:px-4 py-2 rounded-xl border transition-all ${
              currentTurn === opponentPlayer.side
                ? 'bg-gradient-to-r from-slate-900 via-[#151c30] to-slate-900 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {/* Glowing Avatar */}
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 flex-shrink-0"
                style={{
                  borderColor: opponentPlayer.frameColor,
                  boxShadow: `0 0 16px ${opponentPlayer.frameColor}80`,
                }}
              >
                <img
                  src={opponentPlayer.avatarUrl}
                  alt={opponentPlayer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                    {opponentPlayer.name}
                  </span>
                  {opponentPlayer.isAi && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 font-bold flex items-center gap-1">
                      <Bot className="w-3 h-3 text-purple-400" />
                      <span>Cấp {opponentPlayer.aiDifficultyLevel || opponentPlayer.realmLevel || 2}</span>
                    </span>
                  )}
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      opponentPlayer.side === 'red'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {opponentPlayer.side === 'red' ? 'Hồng (Tiên)' : 'Hắc (Hậu)'}
                  </span>
                </div>
                <div className="text-[10px] text-amber-300/90 truncate">
                  {opponentPlayer.title} • {opponentPlayer.realm} ({opponentPlayer.elo} ELO)
                </div>
                {/* Captured pieces by opponent */}
                <div className="flex items-center gap-1 mt-0.5 h-4">
                  {(opponentPlayer.side === 'red' ? capturedRed : capturedBlack).slice(-6).map((p, i) => (
                    <span key={i} className="text-[10px] text-slate-400 bg-slate-800/80 px-1 rounded">
                      {getPieceCharVi(p)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Timer & Turn Indicator */}
            <div className="flex items-center gap-2">
              {currentTurn === opponentPlayer.side && (
                <span className="hidden sm:inline-block text-[10px] font-semibold text-amber-400 animate-pulse">
                  {isAiThinking ? 'Đang cảm ngộ...' : 'Đang suy nghĩ...'}
                </span>
              )}
              <div
                className={`font-mono text-sm sm:text-base font-bold px-2.5 sm:px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
                  currentTurn === opponentPlayer.side
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 animate-pulse'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(opponentPlayer.side === 'red' ? redTime : blackTime)}</span>
              </div>
            </div>
          </div>

          {/* Real-time Advantage Bar */}
          {showAdvantageBar && (
            <div className="w-full max-w-[560px] bg-slate-900/90 border border-slate-800/80 rounded-xl px-3 py-1.5 space-y-1 text-xs shadow-md">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <span>Tiên (Đỏ)</span>
                  <span className="font-mono text-[10px]">{advantage.advantagePercent}%</span>
                </span>
                <span className="text-slate-300 text-[10px] font-medium truncate max-w-[240px] text-center">
                  {advantage.textVi}
                </span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <span className="font-mono text-[10px]">{100 - advantage.advantagePercent}%</span>
                  <span>Hậu (Đen)</span>
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-500"
                  style={{ width: `${advantage.advantagePercent}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-500"
                  style={{ width: `${100 - advantage.advantagePercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Active Hint Banner (Thiên Cơ Chỉ Điểm) */}
          {hintMove && (
            <div className="w-full max-w-[560px] bg-gradient-to-r from-amber-950/90 via-purple-950/80 to-slate-900 border border-amber-500/50 rounded-xl p-2.5 sm:p-3 flex items-start gap-2.5 shadow-xl shadow-amber-950/40">
              <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="text-xs space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 font-serif flex items-center gap-1.5">
                    <span>Thiên Cơ Chỉ Điểm</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans">
                      Gợi Ý Nước Cờ
                    </span>
                  </span>
                  <button
                    onClick={() => setHintMove(null)}
                    className="text-slate-400 hover:text-slate-200 text-xs px-1 rounded hover:bg-slate-800"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-slate-200 font-medium">{hintMove.explanation}</p>
                <div className="text-[11px] text-amber-300 font-mono font-bold">
                  Nước đi: [{hintMove.from.r + 1}, {hintMove.from.c + 1}] ➔ [{hintMove.to.r + 1}, {hintMove.to.c + 1}] (Đã khoanh vùng trên bàn cờ)
                </div>
              </div>
            </div>
          )}

          {/* THE BATTLEFIELD: Authentic Imperial Jade Xiangqi Board with Pinch-To-Zoom (IMG_6633) */}
          <div
            ref={boardContainerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full flex justify-center overflow-x-auto overflow-y-hidden py-1 touch-pan-x touch-pan-y"
          >
            <div
              className={`relative w-full max-w-[560px] aspect-[8/9] rounded-xl shadow-2xl transition-transform origin-center overflow-hidden shrink-0 ${
                boardShake ? 'animate-wiggle' : ''
              }`}
              style={{
                transform: `scale(${boardZoom})`,
                boxShadow:
                  '0 25px 60px -5px rgba(0, 0, 0, 0.95), 0 0 35px rgba(16, 185, 129, 0.2)',
              }}
            >
              {/* Authentic Imperial Jade & Walnut Wood Board Canvas (IMG_6633) */}
              <JadeChessboard />

              {/* Interactive Piece Cells Grid (10 rows x 9 cols) */}
              <div className="relative z-10 w-full h-full grid grid-rows-10 grid-cols-9">
              {Array.from({ length: 10 }).map((_, rIdx) =>
                Array.from({ length: 9 }).map((_, cIdx) => {
                  const actualR = getRenderR(rIdx);
                  const actualC = getRenderC(cIdx);
                  const piece = board[actualR][actualC];

                  const isSelected = selectedPos?.r === actualR && selectedPos?.c === actualC;
                  const isValidTarget = validMoves.some((m) => m.r === actualR && m.c === actualC);
                  const isLastMoveSquare =
                    (lastMove?.from.r === actualR && lastMove?.from.c === actualC) ||
                    (lastMove?.to.r === actualR && lastMove?.to.c === actualC);
                  const isKingUnderCheck =
                    isCheck && piece?.type === 'k' && piece?.side === currentTurn;
                  const isHintFrom = hintMove?.from.r === actualR && hintMove?.from.c === actualC;
                  const isHintTo = hintMove?.to.r === actualR && hintMove?.to.c === actualC;

                  return (
                    <div
                      key={`${actualR}-${actualC}`}
                      onClick={() => handleCellClick(actualR, actualC)}
                      className="relative flex items-center justify-center cursor-pointer select-none group"
                    >
                      {/* Hint Source Square */}
                      {isHintFrom && (
                        <div className="absolute inset-0 z-20 rounded-full border-2 border-amber-400 bg-amber-400/25 animate-pulse pointer-events-none shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                      )}

                      {/* Hint Destination Target */}
                      {isHintTo && (
                        <div className="absolute z-25 flex items-center justify-center pointer-events-none">
                          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-emerald-400 bg-emerald-500/30 animate-ping" />
                          <span className="absolute -top-3 px-1 py-0.2 rounded bg-emerald-400 text-slate-950 font-bold text-[8px] sm:text-[9px] shadow whitespace-nowrap z-30">
                            GỢI Ý
                          </span>
                        </div>
                      )}

                      {/* Last move highlight square */}
                      {isLastMoveSquare && (
                        <div className="absolute w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-amber-400/20 border border-amber-400/40 pointer-events-none animate-pulse" />
                      )}

                      {/* Valid Move Indicator Dot / Target Ring */}
                      {isValidTarget && (
                        <div
                          className={`absolute z-20 rounded-full transition-transform transform group-hover:scale-125 ${
                            piece
                              ? 'w-9 h-9 sm:w-12 sm:h-12 border-2 border-rose-500 bg-rose-500/25 animate-ping'
                              : 'w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-pulse'
                          }`}
                        />
                      )}

                      {/* Piece Token */}
                      {piece && (
                        <div
                          className={`relative z-10 w-[84%] aspect-square rounded-full flex flex-col items-center justify-center font-serif transition-transform duration-200 active:scale-95 ${
                            piece.side === 'red'
                              ? 'bg-gradient-to-b from-[#b91c1c] via-[#881337] to-[#4c0519] border-2 border-[#fecdd3] text-[#ffe4e6] shadow-[0_4px_10px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)]'
                              : 'bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] border-2 border-[#67e8f9] text-[#e0f2fe] shadow-[0_4px_10px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.2)]'
                          } ${
                            isSelected
                              ? 'scale-110 ring-4 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.9)]'
                              : ''
                          } ${
                            isKingUnderCheck
                              ? 'ring-4 ring-rose-500 animate-bounce shadow-[0_0_30px_rgba(244,63,94,1)]'
                              : ''
                          }`}
                        >
                          {/* Inner carved character */}
                          <span
                            className={`text-base sm:text-2xl font-black leading-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] ${
                              piece.side === 'red' ? 'text-amber-200' : 'text-cyan-200'
                            }`}
                          >
                            {getPieceCharVi(piece)}
                          </span>

                          {/* Subtle Vietnamese subscript */}
                          <span
                            className={`text-[8px] sm:text-[9px] font-sans font-extrabold uppercase tracking-tighter opacity-80 ${
                              piece.side === 'red' ? 'text-rose-200' : 'text-cyan-200'
                            }`}
                          >
                            {getPieceNameVi(piece)}
                          </span>
                        </div>
                      )}

                      {/* Skill Effect Visual Overlay at cell */}
                      {activeSkillFx &&
                        activeSkillFx.row === actualR &&
                        activeSkillFx.col === actualC && (
                          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
                            {activeSkillFx.type === 'thunder' && (
                              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-cyan-400/40 animate-ping flex items-center justify-center">
                                <Zap className="w-10 h-10 sm:w-14 sm:h-14 text-yellow-300 fill-current drop-shadow-[0_0_20px_rgba(250,204,21,1)]" />
                              </div>
                            )}
                            {activeSkillFx.type === 'fire' && (
                              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-orange-500/40 animate-ping flex items-center justify-center">
                                <Flame className="w-10 h-10 sm:w-14 sm:h-14 text-orange-400 fill-current drop-shadow-[0_0_25px_rgba(249,115,22,1)]" />
                              </div>
                            )}
                            {activeSkillFx.type === 'sword' && (
                              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-purple-500/40 animate-spin flex items-center justify-center">
                                <Swords className="w-10 h-10 sm:w-14 sm:h-14 text-purple-200 drop-shadow-[0_0_20px_rgba(192,132,252,1)]" />
                              </div>
                            )}
                            {activeSkillFx.type === 'tai-chi' && (
                              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-amber-400/40 animate-pulse flex items-center justify-center font-serif text-3xl text-amber-300">
                                ☯
                              </div>
                            )}
                            {activeSkillFx.type === 'shield' && (
                              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-sky-400/40 animate-ping flex items-center justify-center">
                                <Shield className="w-10 h-10 sm:w-14 sm:h-14 text-sky-200 drop-shadow-[0_0_20px_rgba(56,189,248,1)]" />
                              </div>
                            )}
                            {activeSkillFx.type === 'slash' && (
                              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-rose-500/40 animate-ping flex items-center justify-center font-serif text-2xl font-bold text-rose-300">
                                斬
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Floating Skill Banner Notification across the board */}
            {activeSkillFx && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none px-4 py-2 rounded-xl bg-black/85 border border-amber-400 text-amber-300 font-bold text-sm sm:text-base tracking-wide shadow-2xl shadow-amber-500/50 animate-bounce">
                {activeSkillFx.skillName}
              </div>
            )}
            </div>
          </div>

          {/* Current User Player Bar */}
          <div
            className={`w-full max-w-[560px] flex items-center justify-between px-3 sm:px-4 py-2 rounded-xl border transition-all ${
              currentTurn === myPlayer.side
                ? 'bg-gradient-to-r from-slate-900 via-[#151c30] to-slate-900 border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {/* Glowing Avatar */}
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 flex-shrink-0"
                style={{
                  borderColor: myPlayer.frameColor,
                  boxShadow: `0 0 16px ${myPlayer.frameColor}80`,
                }}
              >
                <img src={myPlayer.avatarUrl} alt={myPlayer.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                    {myPlayer.name} (Bạn)
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      myPlayer.side === 'red'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {myPlayer.side === 'red' ? 'Hồng (Tiên)' : 'Hắc (Hậu)'}
                  </span>
                </div>
                <div className="text-[10px] text-amber-300/90 truncate">
                  {myPlayer.title} • {myPlayer.realm} ({myPlayer.elo} ELO)
                </div>
                {/* Captured pieces by you */}
                <div className="flex items-center gap-1 mt-0.5 h-4">
                  {(myPlayer.side === 'red' ? capturedRed : capturedBlack).slice(-6).map((p, i) => (
                    <span key={i} className="text-[10px] text-slate-400 bg-slate-800/80 px-1 rounded">
                      {getPieceCharVi(p)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Timer & Turn Indicator */}
            <div className="flex items-center gap-2">
              {currentTurn === myPlayer.side && (
                <span className="hidden sm:inline-block text-[10px] font-semibold text-emerald-400 animate-pulse">
                  Đến lượt bạn xuất chiêu!
                </span>
              )}
              <div
                className={`font-mono text-sm sm:text-base font-bold px-2.5 sm:px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
                  currentTurn === myPlayer.side
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 animate-pulse'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(myPlayer.side === 'red' ? redTime : blackTime)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Move History, In-Game Controls & Banter (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Action Control Buttons */}
          <div className="bg-[#0d1424] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-amber-400" />
              <span>Pháp Lệnh Bàn Cờ</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={handleOfferDraw}
                disabled={gameOver}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Handshake className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cầu Hòa</span>
              </button>

              <button
                onClick={handleResign}
                disabled={gameOver}
                className="py-2 px-3 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/30 font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Flag className="w-3.5 h-3.5 text-rose-400" />
                <span>Nhận Thua</span>
              </button>

              {opponentPlayer.isAi && (
                <>
                  {/* Hint Button */}
                  <button
                    onClick={handleGetHint}
                    disabled={gameOver || currentTurn !== mySide}
                    className="col-span-1 py-2 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                    title="Nhận gợi ý nước đi tối ưu (Thiên Cơ Chỉ Điểm)"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gợi Ý Nước Đi</span>
                  </button>

                  {/* Swap Sides with Bot */}
                  <button
                    onClick={handleSwapSideWithBot}
                    disabled={gameOver}
                    className="col-span-1 py-2 px-3 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/30 font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                    title="Đổi bên cầm quân với bot để thử nghiệm thế cờ"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Đổi Bên</span>
                  </button>

                  {/* Takeback */}
                  <button
                    onClick={handleTakeback}
                    disabled={gameOver || moveHistory.length < 2}
                    className="col-span-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    title="Đi lại 1 nước (Chỉ áp dụng khi luyện cờ với AI)"
                  >
                    <Repeat className="w-3.5 h-3.5 text-amber-400" />
                    <span>Xin Đi Lại (Hồi Cờ Luận Đạo)</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Move History Transcript */}
          <div className="bg-[#0d1424] border border-slate-800 rounded-xl p-3.5 flex flex-col h-[280px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-200">
              <div className="flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-400" />
                <span>Biên Bản Ván Đấu</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {Math.ceil(moveHistory.length / 2)} Hiệp
              </span>
            </div>

            <div className="flex-1 overflow-y-auto py-2 space-y-1 text-xs font-mono">
              {moveHistory.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Khai bàn, vạn sự khởi đầu nan...</p>
              ) : (
                Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, idx) => {
                  const redMove = moveHistory[idx * 2];
                  const blackMove = moveHistory[idx * 2 + 1];
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-12 py-1 px-2 rounded hover:bg-slate-900/80 transition-colors text-[11px]"
                    >
                      <span className="col-span-2 text-slate-500 font-bold">{idx + 1}.</span>
                      <span className="col-span-5 text-rose-300 font-medium truncate">
                        {redMove?.notation || ''}
                      </span>
                      <span className="col-span-5 text-cyan-300 font-medium truncate">
                        {blackMove?.notation || ''}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal with ELO & Cultivation Rewards */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#0d1424] border-2 border-amber-400 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] space-y-5 text-center relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-amber-500/10 blur-2xl" />

            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                {winner === mySide ? (
                  <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
                ) : (
                  <Swords className="w-8 h-8 text-slate-400" />
                )}
              </div>

              <h2
                className={`text-2xl font-extrabold font-serif ${
                  winner === mySide
                    ? 'text-amber-300'
                    : winner === 'draw'
                    ? 'text-cyan-300'
                    : 'text-rose-400'
                }`}
              >
                {winner === mySide
                  ? 'CHIẾN THẮNG ĐẮC ĐẠO!'
                  : winner === 'draw'
                  ? 'BẮT TAY HÒA HOÃN'
                  : 'THẤT BẠI LĨNH NGỘ'}
              </h2>
              <p className="text-xs text-slate-300">{gameOverReason}</p>
            </div>

            {/* Cultivation Rewards Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs text-left">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Kỳ Lực Đạo Hạnh (ELO):</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    winner === mySide
                      ? 'text-emerald-400'
                      : winner === 'draw'
                      ? 'text-slate-300'
                      : 'text-rose-400'
                  }`}
                >
                  {winner === mySide ? '+25 ELO' : winner === 'draw' ? '+0 ELO' : '-18 ELO'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tu Vi Tích Lũy:</span>
                <span className="font-mono font-bold text-cyan-300">
                  +{winner === mySide ? '150' : winner === 'draw' ? '50' : '30'} Tu Vi
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Linh Thạch Thu Hoạch:</span>
                <span className="font-mono font-bold text-amber-300">
                  +{winner === mySide ? '50' : winner === 'draw' ? '15' : '5'} Linh Thạch
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={onReturnToLobby}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
              >
                Về Sảnh Chờ
              </button>
              <button
                onClick={() => {
                  setBoard(INITIAL_BOARD);
                  setMoveHistory([]);
                  setSelectedPos(null);
                  setValidMoves([]);
                  setLastMove(null);
                  setCurrentTurn('red');
                  setGameOver(false);
                  setWinner(null);
                  setRedTime(initialTime);
                  setBlackTime(initialTime);
                  setCapturedRed([]);
                  setCapturedBlack([]);
                }}
                className="py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/30 transition-all"
              >
                Tái Đấu Ván Mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
