'use client';

import { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Trophy,
  User,
  Sparkles,
  ScrollText,
  LogIn,
  LogOut,
  Swords,
  Bot,
  ShoppingBag,
  Shield,
  Cloud,
  RefreshCw,
  Gem,
} from 'lucide-react';
import { CultivationRealm, DAOIST_TITLES, getRealmByLevel } from '../lib/cultivation/realms';
import { UserAccount, syncUserFromCloud } from '../lib/storage/userStore';
import { syncItemsFromCloud } from '../lib/cultivation/shopAndFrames';
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
  const [syncingCloud, setSyncingCloud] = useState(false);
  const realm: CultivationRealm = getRealmByLevel(user.realmLevel);
  const activeTitle = DAOIST_TITLES.find((t) => t.id === user.selectedTitleId)?.name || 'Kỳ Đạo Đạo Đồng';
  const isAdmin = user.role === 'admin' || user.username === 'admin';

  const handleQuickSync = async () => {
    if (syncingCloud) return;
    setSyncingCloud(true);
    try {
      await Promise.all([syncUserFromCloud(), syncItemsFromCloud()]);
    } catch {
      // ignore
    } finally {
      setTimeout(() => setSyncingCloud(false), 500);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-500/25 bg-[#041a17]/95 backdrop-blur-md px-3 sm:px-6 py-2.5 shadow-[0_4px_25px_rgba(2,18,15,0.7)] text-emerald-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div
          onClick={onReturnToLobby}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
          title="Về Sảnh Chính Tiên Giới"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-600 to-emerald-900 p-0.5 shadow-md shadow-emerald-900/50 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#052420] rounded-[9px] flex items-center justify-center font-xianxia text-emerald-200 font-bold text-lg sm:text-xl border border-emerald-400/40">
              <span className="text-glow-jade">仙</span>
            </div>
            {/* Pulsing spirit dot */}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-teal-300 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-bold tracking-wide text-white font-xianxia text-glow-jade">
                Tiên Kỳ Đạo
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono font-bold shadow-sm">
                v1.3.1
              </span>
              {/* Online Users Pill */}
              <div
                className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-semibold shadow-sm"
                title="Số đạo hữu hiện đang trực tuyến tu đạo"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                <span className="hidden xs:inline">{onlineCount || 1} Đạo Hữu</span>
                <span className="xs:hidden">{onlineCount || 1}</span>
              </div>
            </div>
            {/* Subtitle with mobile realm & stones indicator */}
            <div className="flex items-center gap-2">
              <p className="text-[10px] sm:text-xs text-emerald-300/70 truncate max-w-[110px] sm:max-w-none font-xianxia">
                Cờ Tướng Tu Chân • Ngọc Bích Tiên Cảnh
              </p>
              {/* Mobile Quick Stones Badge */}
              <div
                onClick={onOpenShop || onOpenProfile}
                className="md:hidden flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-mono text-teal-300 cursor-pointer active:scale-95 transition-transform"
              >
                <span>💎</span>
                <span className="font-bold">{user.spiritStones.toLocaleString()}</span>
              </div>
            </div>
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
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span className="font-bold font-xianxia text-white">{realm.name}</span>
            <span className="text-[11px] opacity-80 text-emerald-200">({user.elo} ELO)</span>
          </div>

          {/* Linh Thạch */}
          <div
            onClick={onOpenShop || onOpenProfile}
            className="cursor-pointer px-2.5 py-1 rounded-full bg-[#052420]/90 border border-emerald-500/40 text-xs font-mono text-teal-300 flex items-center gap-1.5 hover:border-emerald-400 transition-colors shadow-sm"
            title="Nhấn để vào Tiên Các Shop"
          >
            <span className="text-teal-400 text-sm">💎</span>
            <span className="font-bold text-white">{user.spiritStones.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-300/80">Linh Thạch</span>
          </div>

          {/* Cloud Sync Status Button */}
          <button
            onClick={handleQuickSync}
            disabled={syncingCloud}
            className="px-2.5 py-1 rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-1.5 transition-all"
            title="Đồng bộ dữ liệu máy chủ đám mây (Máy tính & Di động)"
          >
            <Cloud className="w-3.5 h-3.5 text-teal-400" />
            <RefreshCw className={`w-2.5 h-2.5 ${syncingCloud ? 'animate-spin text-teal-300' : 'text-emerald-400'}`} />
            <span className="hidden lg:inline">{syncingCloud ? 'Đang đồng bộ...' : 'Đám Mây'}</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* In-Game Return button if active */}
          {inGame && onReturnToLobby && (
            <button
              onClick={onReturnToLobby}
              className="px-2 sm:px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/40 text-xs font-medium flex items-center gap-1 transition-colors"
              title="Rời bàn cờ về Sảnh"
            >
              <Swords className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Sảnh Chờ</span>
            </button>
          )}

          {/* Tiên Các / Shop Linh Thạch */}
          {onOpenShop && (
            <button
              onClick={onOpenShop}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl jade-button-primary text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              title="Vào Tiên Các (Cửa Hàng Khung Viền & Pháp Tướng)"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-100" />
              <span className="hidden sm:inline font-xianxia font-bold">Tiên Các</span>
            </button>
          )}

          {/* Play vs Bot Button */}
          {onOpenBotMatch && (
            <button
              onClick={onOpenBotMatch}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-teal-950/60 hover:bg-teal-900/70 text-teal-200 border border-teal-500/40 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
              title="Đấu Với Kỳ Ma / Bot Tiên Nhân"
            >
              <Bot className="w-4 h-4 text-teal-300" />
              <span className="hidden md:inline font-xianxia">Đấu Bot</span>
            </button>
          )}

          {/* Leaderboard button */}
          <button
            onClick={onOpenLeaderboard}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#062924]/80 hover:bg-[#093d36] text-emerald-200 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Bảng Vàng Phong Thần"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span className="hidden lg:inline font-xianxia">Phong Thần</span>
          </button>

          {/* ADMIN BUTTON (If user is administrator) */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/40 via-teal-600/40 to-emerald-600/40 hover:from-emerald-600/60 hover:to-teal-600/60 text-emerald-200 border border-emerald-400/60 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/50"
              title="Mở Bảng Quản Trị Viên (Admin Panel)"
            >
              <Shield className="w-4 h-4 text-teal-300 fill-teal-300/30" />
              <span className="hidden sm:inline font-xianxia">Quản Trị</span>
            </button>
          )}

          {/* Patch Notes / Updates */}
          <button
            onClick={onOpenPatchNotes}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Ngọc Giản Cập Nhật"
          >
            <ScrollText className="w-4 h-4 text-emerald-300" />
            <span className="hidden xl:inline font-xianxia">Cập Nhật</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-200 border border-emerald-500/30 transition-colors"
            title={soundEnabled ? 'Tắt âm thanh Tiên Hiệp' : 'Bật âm thanh Tiên Hiệp'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-teal-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-emerald-600" />
            )}
          </button>

          {/* Player Profile Badge with Avatar & Custom Frame */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-1 pr-2 sm:pr-3 py-1 rounded-full bg-[#052420]/90 border border-emerald-500/40 hover:border-emerald-300 transition-all group"
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
              <div className="text-xs font-bold text-white group-hover:text-teal-200 transition-colors truncate max-w-[90px] lg:max-w-[120px] font-xianxia">
                {user.daoName}
              </div>
              <div className="text-[10px] text-teal-300/80 truncate max-w-[90px] lg:max-w-[120px]">
                {activeTitle}
              </div>
            </div>
          </button>

          {/* Account Logout */}
          {!user.isGuest && onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-medium flex items-center gap-1.5 transition-colors"
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
