'use client';

import React from 'react';
import { Bot, Clock } from 'lucide-react';
import { GamePlayer, Piece } from '../../lib/xiangqi/types';
import { getPieceCharVi } from '../../lib/xiangqi/rules';
import AvatarWithFrame from '../AvatarWithFrame';

interface GamePlayerBarProps {
  player: GamePlayer;
  isCurrentTurn: boolean;
  timeLeft: number;
  initialTime: number;
  capturedPieces: Piece[];
  isAiThinking?: boolean;
  isSelf?: boolean;
}

const GamePlayerBar = React.memo(function GamePlayerBar({
  player,
  isCurrentTurn,
  timeLeft,
  initialTime,
  capturedPieces,
  isAiThinking,
  isSelf,
}: GamePlayerBarProps) {
  const formatTime = (secs: number) => {
    if (initialTime === 0) return '∞ Vô Hạn';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`w-full max-w-[560px] flex items-center justify-between px-3 sm:px-4 py-2 rounded-xl border transition-all ${
        isCurrentTurn
          ? 'bg-gradient-to-r from-[#082a25] via-[#0b3831] to-[#082a25] border-teal-400/80 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
          : 'bg-[#041d1a]/90 border-emerald-500/20'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <AvatarWithFrame
          avatarUrl={player.avatarUrl}
          daoName={player.name}
          realmLevel={player.realmLevel || 2}
          size="sm"
          isOnline={true}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-white truncate">
              {player.name}
            </span>
            {player.isAi && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-teal-300 border border-emerald-500/40 font-bold flex items-center gap-1 font-sans">
                <Bot className="w-3 h-3 text-teal-300" />
                <span>Cấp {player.aiDifficultyLevel || player.realmLevel || 2}</span>
              </span>
            )}
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-bold font-sans ${
                player.side === 'red'
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  : 'bg-teal-950 text-teal-300 border border-teal-500/40'
              }`}
            >
              {player.side === 'red' ? 'Hồng (Tiên)' : 'Hắc (Hậu)'}
            </span>
          </div>
          <div className="text-[10px] text-teal-300/80 truncate">
            {player.title} • {player.realm} ({player.elo} ELO)
          </div>
          {/* Captured pieces */}
          <div className="flex items-center gap-1 mt-0.5 h-4">
            {capturedPieces.slice(-6).map((p, i) => (
              <span
                key={i}
                className="text-[10px] text-emerald-300 bg-[#021310] px-1 rounded border border-emerald-500/20"
              >
                {getPieceCharVi(p)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Timer & Turn Indicator */}
      <div className="flex items-center gap-2">
        {isCurrentTurn && (
          <span className="hidden sm:inline-block text-[10px] font-semibold text-teal-300 animate-pulse">
            {isAiThinking
              ? 'Đang cảm ngộ...'
              : isSelf
              ? 'Đến lượt bạn xuất chiêu!'
              : 'Đang suy nghĩ...'}
          </span>
        )}
        <div
          className={`font-mono text-sm sm:text-base font-bold px-2.5 sm:px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
            isCurrentTurn
              ? 'bg-teal-950/80 text-teal-200 border-teal-500/60 animate-pulse'
              : 'bg-[#021310] text-emerald-400/60 border-emerald-900/40'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>
    </div>
  );
});

export default GamePlayerBar;
