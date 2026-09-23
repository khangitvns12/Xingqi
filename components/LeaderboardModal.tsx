'use client';

import { Trophy, Crown, Medal, User } from 'lucide-react';
import { generateLeaderboard, LeaderboardEntry, UserAccount } from '../lib/storage/userStore';

interface LeaderboardModalProps {
  currentUser: UserAccount;
  onClose: () => void;
  onViewProfile?: (targetUser: UserAccount) => void;
}

export default function LeaderboardModal({ currentUser, onClose, onViewProfile }: LeaderboardModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(4,28,24,0.9)] overflow-hidden flex flex-col max-h-[90vh] text-emerald-100 font-xianxia">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#041d1a] border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-teal-300 shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white text-glow-jade flex items-center gap-2">
                Phong Thần Bảng • Thiên Kiêu Tam Giới
              </h3>
              <p className="text-xs text-emerald-300/70">
                Xếp hạng cao thủ cờ tướng tu chân theo Kỳ Lực Đạo Hạnh (ELO)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-400/80 hover:text-white text-xl leading-none p-1 rounded-lg hover:bg-emerald-900/40 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Entries List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-2 text-xs">
          {entries.length === 0 ? (
            <div className="text-center py-12 text-emerald-400/60 font-sans space-y-2">
              <Trophy className="w-10 h-10 mx-auto text-emerald-600/50 mb-2" />
              <p className="text-sm font-semibold text-emerald-300">
                Chưa có đạo hữu nào đăng ký tham gia Phong Thần Bảng.
              </p>
              <p className="text-xs text-emerald-500/70">
                Hãy tạo tài khoản hoặc thi đấu để ghi danh bảng vàng tiên giới!
              </p>
            </div>
          ) : (
            entries.map((entry) => {
            const isTop1 = entry.rank === 1;
            const isTop2 = entry.rank === 2;
            const isTop3 = entry.rank === 3;

            return (
              <div
                key={entry.rank}
                onClick={() => handleEntryClick(entry)}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer group ${
                  entry.isCurrentUser
                    ? 'border-teal-400 bg-emerald-950/70 shadow-lg shadow-teal-500/20 ring-1 ring-teal-400 hover:bg-emerald-900/60'
                    : isTop1
                    ? 'border-amber-400/70 bg-gradient-to-r from-amber-950/40 via-[#062923] to-[#041d1a] hover:border-amber-300 hover:shadow-lg'
                    : 'border-emerald-500/20 bg-[#041d19]/60 hover:border-emerald-500/50 hover:bg-[#062a24]'
                }`}
                title="Nhấp để xem chi tiết hồ sơ tu tiên của đạo hữu này"
              >
                {/* Rank & Player Details */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Badge */}
                  <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center font-bold font-mono">
                    {isTop1 ? (
                      <Crown className="w-6 h-6 text-amber-300 fill-current" />
                    ) : isTop2 ? (
                      <Medal className="w-5 h-5 text-slate-300 fill-current" />
                    ) : isTop3 ? (
                      <Medal className="w-5 h-5 text-amber-600 fill-current" />
                    ) : (
                      <span className="text-emerald-400/70 text-sm">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-emerald-500/40 flex-shrink-0 group-hover:border-teal-300 transition-colors">
                    <img src={entry.avatarUrl} alt={entry.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-emerald-100 text-sm truncate group-hover:text-teal-200 transition-colors">
                        {entry.name}
                      </h4>
                      {entry.isCurrentUser && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500 text-slate-950 font-bold font-sans">
                          Bạn
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-teal-300/80 truncate">
                      {entry.title} • <span className="text-emerald-400/60">{entry.realm}</span>
                    </div>
                  </div>
                </div>

                {/* Stats & View Profile Action */}
                <div className="flex items-center gap-3">
                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="font-mono text-sm sm:text-base font-bold text-teal-300">
                      {entry.elo} ELO
                    </div>
                    <div className="text-[10px] text-emerald-400/60 font-sans">
                      {entry.wins} thắng ({entry.winRate}%)
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-[#021310] group-hover:bg-emerald-500/20 text-emerald-400 group-hover:text-teal-200 border border-emerald-500/30 group-hover:border-teal-400 transition-colors">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          }))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-500/20 bg-[#031815] flex items-center justify-between text-xs text-emerald-300/70">
          <span>Hệ thống tự động cập nhật xếp hạng theo thời gian thực.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#062822] hover:bg-[#0a3830] text-emerald-100 border border-emerald-500/30 font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
