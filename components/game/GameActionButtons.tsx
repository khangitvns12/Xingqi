'use client';

import React from 'react';
import { Swords, Handshake, Flag, Lightbulb, Repeat, Shuffle } from 'lucide-react';
import { Side } from '../../lib/xiangqi/types';

interface GameActionButtonsProps {
  gameOver: boolean;
  isAi: boolean;
  currentTurn: Side;
  mySide: Side;
  historyLength: number;
  onOfferDraw: () => void;
  onResign: () => void;
  onGetHint: () => void;
  onSwapSides?: () => void;
  onTakeback: () => void;
}

const GameActionButtons = React.memo(function GameActionButtons({
  gameOver,
  isAi,
  currentTurn,
  mySide,
  historyLength,
  onOfferDraw,
  onResign,
  onGetHint,
  onSwapSides,
  onTakeback,
}: GameActionButtonsProps) {
  return (
    <div className="bg-[#051c18]/90 border border-emerald-500/30 rounded-xl p-3.5 space-y-2.5">
      <h4 className="text-xs font-bold text-emerald-200 flex items-center gap-1.5 font-xianxia">
        <Swords className="w-4 h-4 text-teal-400" />
        <span>Pháp Lệnh Bàn Cờ</span>
      </h4>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          onClick={onOfferDraw}
          disabled={gameOver}
          className="py-2 px-3 rounded-lg bg-[#021310] hover:bg-[#062420] text-emerald-200 border border-emerald-500/30 font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Handshake className="w-3.5 h-3.5 text-teal-400" />
          <span>Cầu Hòa</span>
        </button>

        <button
          onClick={onResign}
          disabled={gameOver}
          className="py-2 px-3 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Flag className="w-3.5 h-3.5 text-rose-400" />
          <span>Nhận Thua</span>
        </button>

        {isAi && (
          <>
            <button
              onClick={onGetHint}
              disabled={gameOver || currentTurn !== mySide}
              className="col-span-1 py-2 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
              title="Nhận gợi ý nước đi tối ưu (Thiên Cơ Chỉ Điểm)"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Gợi Ý Nước Đi</span>
            </button>

            {onSwapSides && (
              <button
                onClick={onSwapSides}
                disabled={gameOver}
                className="col-span-1 py-2 px-3 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/30 font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
                title="Đổi bên cầm quân với bot để thử nghiệm thế cờ"
              >
                <Shuffle className="w-3.5 h-3.5 text-purple-400" />
                <span>Đổi Bên</span>
              </button>
            )}

            <button
              onClick={onTakeback}
              disabled={gameOver || historyLength < 2}
              className="col-span-2 py-2 px-3 rounded-lg bg-[#021310] hover:bg-[#062420] text-emerald-200 border border-emerald-500/30 font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              title="Đi lại 1 nước (Chỉ áp dụng khi luyện cờ với AI)"
            >
              <Repeat className="w-3.5 h-3.5 text-teal-400" />
              <span>Xin Đi Lại (Hồi Cờ Luận Đạo)</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
});

export default GameActionButtons;
