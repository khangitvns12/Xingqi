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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#0d1424] border-2 border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.3)] p-6 text-center space-y-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-current animate-bounce" />
            <span>Tầm Đạo Trực Tuyến</span>
          </div>
          <h3 className="text-xl font-bold font-serif text-slate-100">
            {foundRival ? 'ĐÃ TÌM THẤY KỲ PHÙNG ĐỊCH THỦ!' : 'Đang Ghép Cặp Theo ELO...'}
          </h3>
          <p className="text-xs text-slate-400">
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
              className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/40 animate-spin"
              style={{ animationDuration: '14s' }}
            />
            {/* Middle pulsing ring */}
            <div className="absolute inset-3 rounded-full border border-cyan-400/50 animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.3)]" />
            {/* Center Yin-Yang Tai-Chi */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-slate-900 via-amber-950/40 to-slate-900 border-2 border-amber-400 flex items-center justify-center font-serif text-4xl text-amber-300 shadow-xl shadow-amber-500/20 animate-pulse">
              ☯
            </div>
          </div>
        ) : (
          /* Match Found Preview */
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-400/60 flex items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-300">
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
              <h4 className="font-bold text-slate-100 text-sm">{foundRival.name}</h4>
              <p className="text-xs text-amber-300 font-medium">{foundRival.title}</p>
              <p className="text-xs text-cyan-300 font-mono mt-0.5">
                {foundRival.realm} • {foundRival.elo} ELO
              </p>
            </div>
          </div>
        )}

        {/* ELO Range and Timer */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-around text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">KHOẢNG ELO</span>
            <span className="text-amber-300 font-bold">
              {eloMin} - {eloMax}
            </span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px]">THỜI GIAN CHỜ</span>
            <span className="text-cyan-300 font-bold">00:{seconds.toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Cancel Button */}
        {!foundRival && (
          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            <span>Hủy Tìm Trận</span>
          </button>
        )}
      </div>
    </div>
  );
}
