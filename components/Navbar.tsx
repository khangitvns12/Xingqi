'use client';

import { Volume2, VolumeX, Trophy, User, Sparkles, ScrollText, LogIn, LogOut, Swords, Bot, ShoppingBag, Shield } from 'lucide-react';
import { CultivationRealm, DAOIST_TITLES, getRealmByLevel } from '../lib/cultivation/realms';
import { UserAccount } from '../lib/storage/userStore';
import { soundManager } from '../lib/audio/soundFx';
import AvatarWithFrame from './AvatarWithFrame';

interface NavbarProps {
  user: UserAccount;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenProfile: () => void;
  onOpenLeaderboard: () => void;
  onOpenPatchNotes: () => void;
  onOpenAuth: () => void;
  onLogout?: () => void;
  onOpenShop?: () => void;
  onOpenAdmin?: () => void;
  onOpenBotMatch?: () => void;
  onReturnToLobby?: () => void;
  inGame?: boolean;
  onlineCount?: number;
}

export default function Navbar({
  user,
  soundEnabled,
  onToggleSound,
  onOpenProfile,
  onOpenLeaderboard,
  onOpenPatchNotes,
  onOpenAuth,
  onLogout,
  onOpenShop,
  onOpenAdmin,
  onOpenBotMatch,
  onReturnToLobby,
  inGame = false,
  onlineCount,
}: NavbarProps) {
  const realm: CultivationRealm = getRealmByLevel(user.realmLevel);
  const activeTitle = DAOIST_TITLES.find((t) => t.id === user.selectedTitleId)?.name || 'Kỳ Đạo Đạo Đồng';
  const isAdmin = user.role === 'admin' || user.username === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 bg-[#080d1a]/90 backdrop-blur-md px-3 sm:px-6 py-2.5 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div
          onClick={onReturnToLobby}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
          title="Về Sảnh Chính Tiên Giới"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-500 via-rose-600 to-purple-800 p-0.5 shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0d1322] rounded-[7px] flex items-center justify-center font-serif text-amber-300 font-bold text-lg sm:text-xl">
              <span>仙</span>
            </div>
            {/* Pulsing spirit dot */}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-bold tracking-wide bg-gradient-to-r from-amber-200 via-amber-400 to-rose-300 bg-clip-text text-transparent font-serif">
                Tiên Kỳ Đạo
              </span>
              <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-medium">
                v1.3 Quản Trị
              </span>
              {/* Online Users Pill in Header */}
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-semibold shadow-sm"
                title="Số đạo hữu hiện đang trực tuyến tu đạo"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                <span>{onlineCount || 1} Online</span>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate max-w-[140px] sm:max-w-none">
              Cờ Tướng Tu Chân Trực Tuyến
            </p>
          </div>
        </div>

        {/* Center / Cultivation & Spirit Stones Display */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Realm badge */}
          <div
            onClick={onOpenProfile}
            className={`cursor-pointer px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105 ${realm.badgeBg} ${realm.auraCss}`}
            title="Nhấn để xem Cảnh Giới & Đột Phá Tu Vi"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-semibold">{realm.name}</span>
            <span className="text-[11px] opacity-75">({user.elo} ELO)</span>
          </div>

          {/* Linh Thạch */}
          <div
            onClick={onOpenShop || onOpenProfile}
            className="cursor-pointer px-2.5 py-1 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-1.5 hover:border-cyan-400 transition-colors"
            title="Nhấn để vào Tiên Các Shop"
          >
            <span className="text-cyan-400 text-sm">💎</span>
            <span className="font-bold">{user.spiritStones.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">Linh Thạch</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* In-Game Return button if active */}
          {inGame && onReturnToLobby && (
            <button
              onClick={onReturnToLobby}
              className="px-2 sm:px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
              title="Rời bàn cờ về Sảnh"
            >
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Sảnh Chờ</span>
            </button>
          )}

          {/* Tiên Các / Shop Linh Thạch */}
          {onOpenShop && (
            <button
              onClick={onOpenShop}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Vào Tiên Các (Cửa Hàng Khung Viền & Pháp Tướng)"
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Tiên Các Shop</span>
            </button>
          )}

          {/* Play vs Bot Button */}
          {onOpenBotMatch && (
            <button
              onClick={onOpenBotMatch}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm shadow-purple-950/40"
              title="Chơi Với Bot (Chọn Độ Khó)"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="hidden md:inline">Đấu Bot</span>
            </button>
          )}

          {/* Leaderboard button */}
          <button
            onClick={onOpenLeaderboard}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Bảng Vàng Phong Thần"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">Phong Thần</span>
          </button>

          {/* ADMIN BUTTON (If user is administrator) */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-gradient-to-r from-amber-600/40 via-purple-600/40 to-amber-600/40 hover:from-amber-600/60 hover:to-purple-600/60 text-amber-200 border border-amber-400/60 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-950/50 animate-pulse"
              title="Mở Bảng Quản Trị Viên (Admin Panel)"
            >
              <Shield className="w-4 h-4 text-amber-300 fill-amber-300/30" />
              <span className="hidden sm:inline">Quản Trị</span>
            </button>
          )}

          {/* Patch Notes / Updates */}
          <button
            onClick={onOpenPatchNotes}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Ngọc Giản Cập Nhật"
          >
            <ScrollText className="w-4 h-4 text-purple-400" />
            <span className="hidden xl:inline">Cập Nhật</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            title={soundEnabled ? 'Tắt âm thanh Tiên Hiệp' : 'Bật âm thanh Tiên Hiệp'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Player Profile Badge with Avatar & Custom Frame */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-1 pr-2 sm:pr-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 hover:border-amber-400/60 transition-all group"
            title="Xem Hồ Sơ Tu Tiên & Đổi Danh Hiệu"
          >
            <AvatarWithFrame
              avatarUrl={user.avatarUrl}
              daoName={user.daoName}
              realmLevel={user.realmLevel}
              frameId={user.selectedFrameId}
              size="sm"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors truncate max-w-[90px] lg:max-w-[120px]">
                {user.daoName}
              </div>
              <div className="text-[10px] text-amber-400/80 truncate max-w-[90px] lg:max-w-[120px]">
                {activeTitle}
              </div>
            </div>
          </button>

          {/* Account Logout */}
          {!user.isGuest && onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title={`Đăng xuất khỏi ${user.daoName}`}
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span className="hidden md:inline">Đăng Xuất</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
