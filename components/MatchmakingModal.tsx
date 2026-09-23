'use client';

import { useState, useEffect } from 'react';
import { Zap, Swords, X, Compass, Sparkles } from 'lucide-react';
import { UserAccount } from '../lib/storage/userStore';
import { AI_CULTIVATOR_RIVALS, AiCultivator } from '../lib/xiangqi/ai';

interface MatchmakingModalProps {
  user: UserAccount;
  onMatchFound: (matchedRival: AiCultivator) => void;
  onCancel: () => void;
}

export default function MatchmakingModal({
  user,
  onMatchFound,
  onCancel,
}: MatchmakingModalProps) {
  const [seconds, setSeconds] = useState(0);
  const [foundRival, setFoundRival] = useState<AiCultivator | null>(null);

  // ELO search range
  const eloMin = Math.max(1000, user.elo - 60 - seconds * 15);
  const eloMax = user.elo + 60 + seconds * 15;

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Pick rival whose ELO is closest to user
    const matchTimer = setTimeout(() => {
      // Find suitable AI cultivator rival close to player's ELO
      let sorted = [...AI_CULTIVATOR_RIVALS].sort(
        (a, b) => Math.abs(a.elo - user.elo) - Math.abs(b.elo - user.elo)
      );
      const chosen = sorted[0] || AI_CULTIVATOR_RIVALS[0];
      setFoundRival(chosen);

      // Auto start after 1.5s preview
      setTimeout(() => {
        onMatchFound(chosen);
      }, 1500);
    }, 2800);

    return () => {
      clearInterval(timer);
      clearTimeout(matchTimer);
    };
  }, [user.elo, onMatchFound]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(4,28,24,0.9)] p-6 text-center space-y-6 relative overflow-hidden text-emerald-100 font-xianxia">
        {/* Background glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-teal-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-teal-300 fill-current animate-bounce" />
            <span>Tầm Đạo Trực Tuyến</span>
          </div>
          <h3 className="text-xl font-bold text-white text-glow-jade">
            {foundRival ? 'ĐÃ TÌM THẤY KỲ PHÙNG ĐỊCH THỦ!' : 'Đang Ghép Cặp Theo ELO...'}
          </h3>
          <p className="text-xs text-emerald-300/70">
            {foundRival
              ? 'Chuẩn bị nhập trận luận kỳ!'
              : 'Dò tìm đạo hữu có kỳ lực tương đương trong tam giới'}
          </p>
        </div>

        {/* Center: Spinning Bagua Daoist Compass Array */}
        {!foundRival ? (
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
            {/* Outer rotating runic ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/40 animate-spin"
              style={{ animationDuration: '14s' }}
            />
            {/* Middle pulsing ring */}
            <div className="absolute inset-3 rounded-full border border-teal-400/50 animate-pulse shadow-[0_0_20px_rgba(20,184,166,0.3)]" />
            {/* Center Yin-Yang Tai-Chi */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#021310] via-[#052b24] to-[#021310] border-2 border-emerald-400 flex items-center justify-center font-serif text-4xl text-teal-300 shadow-xl shadow-teal-500/20 animate-pulse">
              ☯
            </div>
          </div>
        ) : (
          /* Match Found Preview */
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-[#05241f] to-emerald-950/60 border border-teal-400/60 flex items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-300">
            {/* Found rival avatar */}
            <div
              className="w-16 h-16 rounded-full overflow-hidden border-2"
              style={{
                borderColor: foundRival.frameColor,
                boxShadow: `0 0 25px ${foundRival.frameColor}90`,
              }}
            >
              <img src={foundRival.avatarUrl} alt={foundRival.name} className="w-full h-full object-cover" />
            </div>

            <div className="text-left">
              <h4 className="font-bold text-white text-sm">{foundRival.name}</h4>
              <p className="text-xs text-teal-300 font-medium">{foundRival.title}</p>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">
                {foundRival.realm} • {foundRival.elo} ELO
              </p>
            </div>
          </div>
        )}

        {/* ELO Range and Timer */}
        <div className="bg-[#021310]/80 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-around text-xs font-mono">
          <div>
            <span className="text-emerald-400/60 block text-[10px] font-sans">KHOẢNG ELO</span>
            <span className="text-teal-300 font-bold">
              {eloMin} - {eloMax}
            </span>
          </div>
          <div className="w-px h-6 bg-emerald-500/30" />
          <div>
            <span className="text-emerald-400/60 block text-[10px] font-sans">THỜI GIAN CHỜ</span>
            <span className="text-white font-bold">00:{seconds.toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Cancel Button */}
        {!foundRival && (
          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl bg-[#031815] hover:bg-[#062923] text-emerald-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-emerald-500/30 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Hủy Tìm Trận</span>
          </button>
        )}
      </div>
    </div>
  );
}
