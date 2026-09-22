'use client';

import { useState } from 'react';
import { Trophy, Medal, Crown, Sparkles, Filter, ShieldCheck, User } from 'lucide-react';
import { generateLeaderboard, LeaderboardEntry, UserAccount } from '../lib/storage/userStore';

interface LeaderboardModalProps {
  currentUser: UserAccount;
  onClose: () => void;
  onViewProfile?: (targetUser: UserAccount) => void;
}

export default function LeaderboardModal({ currentUser, onClose, onViewProfile }: LeaderboardModalProps) {
  const [filterType, setFilterType] = useState<'all' | 'sect'>('all');
  const entries: LeaderboardEntry[] = generateLeaderboard(currentUser);

  const handleEntryClick = (entry: LeaderboardEntry) => {
    if (!onViewProfile) return;
    const targetAcc: UserAccount = entry.account || {
      id: entry.id || 'leader_' + entry.rank,
      username: entry.name.toLowerCase().replace(/\s+/g, '_'),
      daoName: entry.name,
      sect: entry.sect,
      avatarUrl: entry.avatarUrl,
      elo: entry.elo,
      realmLevel: entry.realmLevel,
      exp: entry.realmLevel * 1000,
      spiritStones: 500,
      pills: {},
      selectedTitleId: 'title_' + Math.min(entry.realmLevel, 10),
      selectedAvatarId: 'av_' + Math.min(entry.realmLevel, 10),
      unlockedTitleIds: ['title_' + Math.min(entry.realmLevel, 10)],
      unlockedAvatarIds: ['av_' + Math.min(entry.realmLevel, 10)],
      stats: {
        totalMatches: Math.round(entry.wins / (entry.winRate / 100 || 0.8)),
        wins: entry.wins,
        draws: 5,
        losses: Math.max(0, Math.round(entry.wins / (entry.winRate / 100 || 0.8)) - entry.wins - 5),
        winStreak: 3,
        maxWinStreak: 8,
        highestElo: entry.elo,
      },
      createdAt: 1720000000000,
    };
    onViewProfile(targetAcc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-[#0d1424] border-2 border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-100 flex items-center gap-2">
                Phong Thần Bảng • Thiên Kiêu Tam Giới
              </h3>
              <p className="text-xs text-slate-400">
                Xếp hạng cao thủ cờ tướng tu chân theo Kỳ Lực Đạo Hạnh (ELO)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xl leading-none p-1"
          >
            ✕
          </button>
        </div>

        {/* Entries List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-2 text-xs">
          {entries.map((entry) => {
            const isTop1 = entry.rank === 1;
            const isTop2 = entry.rank === 2;
            const isTop3 = entry.rank === 3;

            return (
              <div
                key={entry.rank}
                onClick={() => handleEntryClick(entry)}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer group ${
                  entry.isCurrentUser
                    ? 'border-amber-400 bg-amber-950/40 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400 hover:bg-amber-900/50'
                    : isTop1
                    ? 'border-yellow-500/60 bg-gradient-to-r from-yellow-950/30 via-slate-900 to-slate-900 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-900/30'
                    : 'border-slate-800 bg-slate-900/60 hover:border-amber-500/60 hover:bg-slate-850'
                }`}
                title="Nhấp để xem chi tiết hồ sơ tu tiên của đạo hữu này"
              >
                {/* Rank & Player Details */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Badge */}
                  <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center font-bold font-mono">
                    {isTop1 ? (
                      <Crown className="w-6 h-6 text-yellow-400 fill-current" />
                    ) : isTop2 ? (
                      <Medal className="w-5 h-5 text-slate-300 fill-current" />
                    ) : isTop3 ? (
                      <Medal className="w-5 h-5 text-amber-600 fill-current" />
                    ) : (
                      <span className="text-slate-400 text-sm">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-slate-700 flex-shrink-0 group-hover:border-amber-400 transition-colors">
                    <img src={entry.avatarUrl} alt={entry.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-200 text-sm truncate group-hover:text-amber-300 transition-colors">
                        {entry.name}
                      </h4>
                      {entry.isCurrentUser && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold">
                          Bạn
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-amber-400/90 truncate">
                      {entry.title} • <span className="text-slate-400">{entry.realm}</span>
                    </div>
                  </div>
                </div>

                {/* Stats & View Profile Action */}
                <div className="flex items-center gap-3">
                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="font-mono text-sm sm:text-base font-bold text-amber-400">
                      {entry.elo} ELO
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {entry.wins} thắng ({entry.winRate}%)
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800/80 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-300 border border-slate-700/50 group-hover:border-amber-500/40 transition-colors">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Hệ thống tự động cập nhật xếp hạng theo thời gian thực.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
