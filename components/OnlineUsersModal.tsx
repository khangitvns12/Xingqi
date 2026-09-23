'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Eye, Swords, Shield, Sparkles } from 'lucide-react';
import { UserAccount, getOnlineAccounts, syncUserFromCloud } from '../lib/storage/userStore';
import { CultivationRealm, DAOIST_TITLES, getRealmByLevel } from '../lib/cultivation/realms';
import AvatarWithFrame from './AvatarWithFrame';

interface OnlineUsersModalProps {
  currentUser: UserAccount;
  onClose: () => void;
  onViewProfile: (targetUser: UserAccount) => void;
  onChallengePlayer?: (targetUser: UserAccount) => void;
}

export default function OnlineUsersModal({
  currentUser,
  onClose,
  onViewProfile,
  onChallengePlayer,
}: OnlineUsersModalProps) {
  const [onlineUsers, setOnlineUsers] = useState<UserAccount[]>(() => getOnlineAccounts(currentUser));
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(getOnlineAccounts(currentUser));
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await syncUserFromCloud();
      setOnlineUsers(getOnlineAccounts(currentUser));
    } catch {
      // ignore
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const filteredUsers = onlineUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      u.daoName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.sect && u.sect.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(4,28,24,0.9)] overflow-hidden flex flex-col max-h-[90vh] text-emerald-100 font-xianxia">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#041d1a] border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-teal-300 shadow-md">
              <Users className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#041d1a] shadow-[0_0_8px_#34d399]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white text-glow-jade">
                  Đạo Hữu Trực Tuyến
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-[11px] font-mono text-emerald-300 font-bold">
                  {onlineUsers.length} Online
                </span>
              </div>
              <p className="text-xs text-emerald-300/70 font-sans">
                Các vị tu sĩ chân thực đang có mặt trong Tiên Giới Kỳ Đạo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 hover:text-white transition-colors"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-300' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-emerald-400/80 hover:text-white text-xl leading-none p-2 rounded-xl hover:bg-emerald-900/40 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 bg-[#031916]/60 border-b border-emerald-500/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Đạo hiệu, Tông môn hoặc Tên người dùng..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-100 placeholder-emerald-600/70 focus:outline-none focus:border-emerald-400 transition-colors font-sans"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5 text-xs">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-emerald-400/60 space-y-2 font-sans">
              <Users className="w-10 h-10 mx-auto text-emerald-600/50 mb-2" />
              <p className="text-sm font-semibold text-emerald-300">
                {searchQuery ? 'Không tìm thấy đạo hữu phù hợp.' : 'Hiện tại chưa có thêm đạo hữu nào khác đang trực tuyến.'}
              </p>
              <p className="text-xs text-emerald-500/70">
                Đạo hữu có thể chia sẻ đường dẫn để mời hảo hữu cùng bước vào Tiên Cảnh luận cờ!
              </p>
            </div>
          ) : (
            filteredUsers.map((target) => {
              const realm: CultivationRealm = getRealmByLevel(target.realmLevel);
              const title =
                DAOIST_TITLES.find((t) => t.id === target.selectedTitleId)?.name || 'Kỳ Đạo Tu Sĩ';
              const isSelf = target.id === currentUser.id;
              const matches = target.stats?.totalMatches || 0;
              const wins = target.stats?.wins || 0;
              const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;

              return (
                <div
                  key={target.id}
                  className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isSelf
                      ? 'border-teal-400/80 bg-emerald-950/70 shadow-md shadow-teal-500/10'
                      : 'border-emerald-500/25 bg-[#041d19]/70 hover:border-emerald-500/50 hover:bg-[#062923]'
                  }`}
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                      <AvatarWithFrame
                        avatarUrl={target.avatarUrl}
                        daoName={target.daoName}
                        realmLevel={target.realmLevel}
                        frameId={target.selectedFrameId}
                        size="md"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#041d19] shadow-[0_0_6px_#34d399]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-white truncate text-glow-jade">
                          {target.daoName}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-500/40 font-mono">
                            Bạn
                          </span>
                        )}
                        {(target.role === 'admin' || target.username === 'admin') && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-0.5">
                            <Shield className="w-2.5 h-2.5 text-amber-400" />
                            Admin
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-emerald-300/80 truncate mt-0.5 font-sans">
                        <span className="text-teal-300">{title}</span>
                        <span>•</span>
                        <span className="text-emerald-400/90">{target.sect || 'Tán Tu'}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${realm.badgeBg} ${realm.auraCss}`}
                        >
                          {realm.name}
                        </span>
                        <span className="text-[10px] font-mono text-amber-300 font-bold">
                          {target.elo} ELO
                        </span>
                        <span className="text-[10px] text-emerald-400/70 font-sans">
                          {wins}T / {matches} trận ({winRate}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onViewProfile(target)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer hover:border-emerald-300"
                      title="Xem hồ sơ & trang bị của đạo hữu"
                    >
                      <Eye className="w-3.5 h-3.5 text-teal-300" />
                      <span className="hidden sm:inline">Hồ Sơ</span>
                    </button>

                    {!isSelf && onChallengePlayer && (
                      <button
                        type="button"
                        onClick={() => onChallengePlayer(target)}
                        className="px-2.5 py-1.5 rounded-xl jade-button-primary text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                        title={`Gửi lời khiêu chiến luận cờ tới ${target.daoName}`}
                      >
                        <Swords className="w-3.5 h-3.5 text-white" />
                        <span className="hidden sm:inline">Khiêu Chiến</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
