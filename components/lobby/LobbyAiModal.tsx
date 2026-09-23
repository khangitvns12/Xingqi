'use client';

import React from 'react';
import { Bot, Swords } from 'lucide-react';
import { AI_CULTIVATOR_RIVALS, AiCultivator } from '../../lib/xiangqi/ai';

interface LobbyAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChallengeAi: (rival: AiCultivator) => void;
}

export default function LobbyAiModal({
  isOpen,
  onClose,
  onChallengeAi,
}: LobbyAiModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_0_40px_rgba(4,28,24,0.9)] space-y-4 max-h-[90vh] overflow-y-auto text-emerald-100">
        <div className="flex items-center justify-between border-b border-emerald-500/25 pb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-teal-300" />
            <h3 className="font-xianxia font-bold text-white text-base">
              Chọn Tiên Nhân Khiêu Chiến (Luyện Cờ Với AI)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-emerald-300/70 hover:text-white text-lg leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {AI_CULTIVATOR_RIVALS.map((rival) => (
            <div
              key={rival.id}
              className="p-3.5 rounded-xl border border-emerald-500/30 hover:border-teal-400 bg-[#031916]/80 space-y-2.5 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full overflow-hidden border-2 shrink-0"
                  style={{ borderColor: rival.frameColor }}
                >
                  <img
                    src={rival.avatarUrl}
                    alt={rival.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm font-xianxia">{rival.name}</h4>
                  <p className="text-[11px] text-teal-300 font-xianxia">
                    {rival.realm} • {rival.elo} ELO
                  </p>
                  <p className="text-[10px] text-emerald-400/70">{rival.sect}</p>
                </div>
              </div>

              <p className="italic text-[11px] text-emerald-200/80 bg-[#02110f] p-2 rounded-lg border border-emerald-500/20 font-xianxia">
                &ldquo;{rival.quotes.greeting}&rdquo;
              </p>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onChallengeAi(rival);
                }}
                className="w-full py-2 rounded-xl jade-button-primary font-xianxia font-bold flex items-center justify-center gap-1.5 shadow cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Luận Đạo Ngay</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
