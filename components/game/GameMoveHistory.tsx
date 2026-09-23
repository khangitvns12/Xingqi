'use client';

import React from 'react';
import { History } from 'lucide-react';
import { Move } from '../../lib/xiangqi/types';

interface GameMoveHistoryProps {
  moveHistory: Move[];
}

const GameMoveHistory = React.memo(function GameMoveHistory({
  moveHistory,
}: GameMoveHistoryProps) {
  const roundCount = Math.ceil(moveHistory.length / 2);

  return (
    <div className="bg-[#051c18]/90 border border-emerald-500/30 rounded-xl p-3.5 flex flex-col h-[280px]">
      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 text-xs font-bold text-white">
        <div className="flex items-center gap-1.5">
          <History className="w-4 h-4 text-teal-400" />
          <span>Biên Bản Ván Đấu</span>
        </div>
        <span className="text-[10px] text-emerald-300/80 font-mono">
          {roundCount} Hiệp
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-1 text-xs font-mono">
        {moveHistory.length === 0 ? (
          <p className="text-emerald-400/50 text-center py-8">Khai bàn, vạn sự khởi đầu nan...</p>
        ) : (
          Array.from({ length: roundCount }).map((_, idx) => {
            const redMove = moveHistory[idx * 2];
            const blackMove = moveHistory[idx * 2 + 1];
            return (
              <div
                key={idx}
                className="grid grid-cols-12 py-1 px-2 rounded hover:bg-emerald-950/60 transition-colors text-[11px]"
              >
                <span className="col-span-2 text-emerald-400/60 font-bold">{idx + 1}.</span>
                <span className="col-span-5 text-rose-300 font-medium truncate">
                  {redMove?.notation || ''}
                </span>
                <span className="col-span-5 text-teal-300 font-medium truncate">
                  {blackMove?.notation || ''}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

export default GameMoveHistory;
