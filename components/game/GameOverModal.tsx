'use client';

import React from 'react';
import { Trophy, Swords } from 'lucide-react';
import { Side } from '../../lib/xiangqi/types';

interface GameOverModalProps {
  winner: Side | 'draw' | null;
  mySide: Side;
  gameOverReason: string;
  onReturnToLobby: () => void;
  onRematch: () => void;
}

const GameOverModal = React.memo(function GameOverModal({
  winner,
  mySide,
  gameOverReason,
  onReturnToLobby,
  onRematch,
}: GameOverModalProps) {
  const isWinner = winner === mySide;
  const isDraw = winner === 'draw';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(4,28,24,0.9)] space-y-5 text-center relative overflow-hidden text-emerald-100 font-xianxia">
        <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-teal-500/10 blur-2xl" />

        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border-2 border-teal-400 flex items-center justify-center text-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.5)]">
            {isWinner ? (
              <Trophy className="w-8 h-8 text-teal-300 animate-bounce" />
            ) : (
              <Swords className="w-8 h-8 text-emerald-400/70" />
            )}
          </div>

          <h2
            className={`text-2xl font-extrabold text-glow-jade ${
              isWinner ? 'text-white' : isDraw ? 'text-teal-300' : 'text-rose-400'
            }`}
          >
            {isWinner
              ? 'CHIẾN THẮNG ĐẮC ĐẠO!'
              : isDraw
              ? 'BẮT TAY HÒA HOÃN'
              : 'THẤT BẠI LĨNH NGỘ'}
          </h2>
          <p className="text-xs text-emerald-300/80">{gameOverReason}</p>
        </div>

        {/* Cultivation Rewards Breakdown */}
        <div className="p-3.5 rounded-xl bg-[#031815] border border-emerald-500/30 space-y-2.5 text-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-emerald-300/70">Kỳ Lực Đạo Hạnh (ELO):</span>
            <span
              className={`font-mono font-bold text-sm ${
                isWinner ? 'text-emerald-400' : isDraw ? 'text-emerald-300' : 'text-rose-400'
              }`}
            >
              {isWinner ? '+25 ELO' : isDraw ? '+0 ELO' : '-18 ELO'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-emerald-300/70">Tu Vi Tích Lũy:</span>
            <span className="font-mono font-bold text-teal-300">
              +{isWinner ? '150' : isDraw ? '50' : '30'} Tu Vi
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-emerald-300/70">Linh Thạch Thu Hoạch:</span>
            <span className="font-mono font-bold text-white">
              +{isWinner ? '50' : isDraw ? '15' : '5'} Linh Thạch
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onReturnToLobby}
            className="py-2.5 rounded-xl bg-[#031815] hover:bg-[#062923] text-emerald-200 border border-emerald-500/30 font-semibold text-xs transition-colors cursor-pointer"
          >
            Về Sảnh Chờ
          </button>
          <button
            onClick={onRematch}
            className="py-2.5 rounded-xl jade-button-primary text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
          >
            Tái Đấu Ván Mới
          </button>
        </div>
      </div>
    </div>
  );
});

export default GameOverModal;
