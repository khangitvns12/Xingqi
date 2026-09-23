'use client';

import { useState, useRef, useEffect } from 'react';
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
  Users,
  ChevronDown,
} from 'lucide-react';
import { CultivationRealm, DAOIST_TITLES, getRealmByLevel } from '../lib/cultivation/realms';
import { UserAccount, syncUserFromCloud } from '../lib/storage/userStore';
import { syncItemsFromCloud } from '../lib/cultivation/shopAndFrames';
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
  onOpenOnlineUsers?: () => void;
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
  onOpenOnlineUsers,
}: NavbarProps) {
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  const realm: CultivationRealm = getRealmByLevel(user.realmLevel);
  const activeTitle = DAOIST_TITLES.find((t) => t.id === user.selectedTitleId)?.name || 'Kỳ Đạo Đạo Đồng';
  const isAdmin = user.role === 'admin' || user.username === 'admin';

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setShowAvatarMenu(false);
      }
    };
    if (showAvatarMenu) {
      document.addEventListener('pointerdown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [showAvatarMenu]);

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
    <header className="sticky top-0 z-40 w-full border-b border-emerald-500/25 bg-[#041a17]/95 backdrop-blur-md px-2.5 sm:px-6 py-2 shadow-[0_4px_25px_rgba(2,18,15,0.7)] text-emerald-100 font-xianxia">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Brand / Logo */}
        <div
          onClick={onReturnToLobby}
          className="flex items-center gap-2 cursor-pointer group select-none flex-shrink-0"
          title="Về Sảnh Chính Tiên Giới"
        >
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-600 to-emerald-900 p-0.5 shadow-md shadow-emerald-900/50 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#052420] rounded-[9px] flex items-center justify-center text-emerald-200 font-bold text-base sm:text-xl border border-emerald-400/40">
              <span className="text-glow-jade">仙</span>
            </div>
            {/* Pulsing spirit dot */}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-teal-300 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-bold tracking-wide text-white text-glow-jade">
                Tiên Kỳ Đạo
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono font-bold shadow-sm hidden xs:inline">
                v1.3.1
              </span>
              {/* Online Users Pill (Clickable -> Opens Online List) */}
              <button
                type="button"
                onClick={onOpenOnlineUsers}
                className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-950/90 hover:bg-emerald-900/90 border border-emerald-500/40 hover:border-teal-400 text-emerald-300 text-[10px] font-mono font-semibold shadow-sm transition-all cursor-pointer group"
                title="Nhấn để xem danh sách đạo hữu đang trực tuyến"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                <span>{onlineCount || 1} Online</span>
                <Users className="w-2.5 h-2.5 text-teal-400 opacity-70 group-hover:opacity-100" />
              </button>
            </div>
            {/* Subtitle */}
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] sm:text-xs text-emerald-300/70 truncate max-w-[100px] xs:max-w-none">
                Cờ Tướng Tu Chân
              </p>
              {/* Mobile Quick Stones Badge */}
              <div
                onClick={onOpenShop || onOpenProfile}
                className="md:hidden flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-mono text-teal-300 cursor-pointer active:scale-95 transition-transform"
                title="Linh Thạch hiện có"
              >
                <span>💎</span>
                <span className="font-bold">{user.spiritStones.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Cultivation & Spirit Stones Display (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Realm badge */}
          <div
            onClick={onOpenProfile}
            className={`cursor-pointer px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105 ${realm.badgeBg} ${realm.auraCss}`}
            title="Nhấn để xem Cảnh Giới & Đột Phá Tu Vi"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span className="font-bold text-white">{realm.name}</span>
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

          {/* CLOUD SYNC: ONLY VISIBLE TO ADMIN */}
          {isAdmin && (
            <button
              onClick={handleQuickSync}
              disabled={syncingCloud}
              className="px-2.5 py-1 rounded-full bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Đồng bộ dữ liệu máy chủ đám mây (Dành cho Quản trị viên)"
            >
              <Cloud className="w-3.5 h-3.5 text-teal-400" />
              <RefreshCw className={`w-2.5 h-2.5 ${syncingCloud ? 'animate-spin text-teal-300' : 'text-emerald-400'}`} />
              <span className="hidden lg:inline">{syncingCloud ? 'Đang đồng bộ...' : 'Đồng Bộ'}</span>
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* In-Game Return button if active */}
          {inGame && onReturnToLobby && (
            <button
              onClick={onReturnToLobby}
              className="px-2 sm:px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/40 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
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
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl jade-button-primary text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Vào Tiên Các (Cửa Hàng Khung Viền & Pháp Tướng)"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-100" />
              <span className="hidden sm:inline font-bold">Tiên Các</span>
            </button>
          )}

          {/* Play vs Bot Button (Hidden on small mobile, available via avatar dropdown) */}
          {onOpenBotMatch && (
            <button
              onClick={onOpenBotMatch}
              className="hidden sm:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-teal-950/60 hover:bg-teal-900/70 text-teal-200 border border-teal-500/40 text-xs font-medium items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Đấu Với Kỳ Ma / Bot Tiên Nhân"
            >
              <Bot className="w-4 h-4 text-teal-300" />
              <span className="hidden md:inline">Đấu Bot</span>
            </button>
          )}

          {/* Leaderboard button (Hidden on mobile, in avatar dropdown) */}
          <button
            onClick={onOpenLeaderboard}
            className="hidden md:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#062924]/80 hover:bg-[#093d36] text-emerald-200 border border-emerald-500/30 text-xs font-medium items-center gap-1.5 transition-all cursor-pointer"
            title="Bảng Vàng Phong Thần"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span className="hidden lg:inline">Phong Thần</span>
          </button>

          {/* ADMIN BUTTON (Hidden on mobile, in avatar dropdown) */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="hidden md:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/40 via-teal-600/40 to-emerald-600/40 hover:from-emerald-600/60 hover:to-teal-600/60 text-emerald-200 border border-emerald-400/60 text-xs font-bold items-center gap-1.5 transition-all shadow-md shadow-emerald-950/50 cursor-pointer"
              title="Mở Bảng Quản Trị Viên (Admin Panel)"
            >
              <Shield className="w-4 h-4 text-teal-300 fill-teal-300/30" />
              <span className="hidden lg:inline">Quản Trị</span>
            </button>
          )}

          {/* Patch Notes / Updates (Hidden on mobile, in avatar dropdown) */}
          <button
            onClick={onOpenPatchNotes}
            className="hidden lg:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 text-xs font-medium items-center gap-1.5 transition-colors cursor-pointer"
            title="Ngọc Giản Cập Nhật"
          >
            <ScrollText className="w-4 h-4 text-emerald-300" />
            <span className="hidden xl:inline">Cập Nhật</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-1.5 sm:p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-200 border border-emerald-500/30 transition-colors cursor-pointer"
            title={soundEnabled ? 'Tắt âm thanh Tiên Hiệp' : 'Bật âm thanh Tiên Hiệp'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-teal-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-emerald-600" />
            )}
          </button>

          {/* AVATAR WITH DROPDOWN MENU */}
          <div className="relative" ref={avatarMenuRef}>
            <button
              type="button"
              onClick={() => setShowAvatarMenu((prev) => !prev)}
              className="flex items-center gap-1.5 pl-1 pr-1.5 sm:pr-2.5 py-0.5 sm:py-1 rounded-full bg-[#052420]/90 border border-emerald-500/40 hover:border-emerald-300 transition-all cursor-pointer group"
              title="Nhấn để mở danh mục chức năng"
            >
              <AvatarWithFrame
                avatarUrl={user.avatarUrl}
                daoName={user.daoName}
                realmLevel={user.realmLevel}
                frameId={user.selectedFrameId}
                size="sm"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white group-hover:text-teal-200 transition-colors truncate max-w-[80px] lg:max-w-[110px]">
                  {user.daoName}
                </div>
                <div className="text-[10px] text-teal-300/80 truncate max-w-[80px] lg:max-w-[110px] font-sans">
                  {activeTitle}
                </div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-emerald-400 transition-transform duration-200 ${
                  showAvatarMenu ? 'rotate-180 text-teal-300' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Container */}
            {showAvatarMenu && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-[#041c18] border-2 border-emerald-500/40 rounded-2xl shadow-[0_10px_40px_rgba(2,18,15,0.9)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-emerald-100">
                {/* User Summary Header */}
                <div
                  onClick={() => {
                    setShowAvatarMenu(false);
                    onOpenProfile();
                  }}
                  className="p-3 bg-gradient-to-b from-[#062c26] to-[#041c18] border-b border-emerald-500/30 cursor-pointer hover:bg-[#07362f] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AvatarWithFrame
                      avatarUrl={user.avatarUrl}
                      daoName={user.daoName}
                      realmLevel={user.realmLevel}
                      frameId={user.selectedFrameId}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-white truncate text-glow-jade">
                          {user.daoName}
                        </span>
                        {isAdmin && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-teal-300/90 truncate font-sans">{activeTitle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.2 rounded-full border font-bold ${realm.badgeBg}`}>
                          {realm.name}
                        </span>
                        <span className="text-[10px] font-mono text-amber-300 font-bold">
                          {user.elo} ELO
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Stones pill */}
                  <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                    <span className="text-emerald-400/80 font-sans">Linh thạch tu hành:</span>
                    <span className="font-mono text-teal-300 font-bold flex items-center gap-1">
                      <span>💎</span> {user.spiritStones.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Menu List */}
                <div className="p-1.5 space-y-0.5 text-xs font-sans">
                  {/* Hồ Sơ */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAvatarMenu(false);
                      onOpenProfile();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-emerald-900/50 flex items-center gap-2.5 text-emerald-200 transition-colors text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-teal-400" />
                    <span className="font-xianxia text-sm">Hồ Sơ Tu Tiên & Đột Phá</span>
                  </button>

                  {/* Bảng Xếp Hạng Phong Thần */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAvatarMenu(false);
                      onOpenLeaderboard();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-emerald-900/50 flex items-center gap-2.5 text-emerald-200 transition-colors text-left cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="font-xianxia text-sm">Bảng Vàng Phong Thần</span>
                  </button>

                  {/* Danh sách Online */}
                  {onOpenOnlineUsers && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAvatarMenu(false);
                        onOpenOnlineUsers();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-emerald-900/50 flex items-center gap-2.5 text-emerald-200 transition-colors text-left cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span className="font-xianxia text-sm">
                        Đạo Hữu Trực Tuyến ({onlineCount || 1})
                      </span>
                    </button>
                  )}

                  {/* Tiên Các Shop */}
                  {onOpenShop && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAvatarMenu(false);
                        onOpenShop();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-emerald-900/50 flex items-center gap-2.5 text-emerald-200 transition-colors text-left cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      <span className="font-xianxia text-sm">Tiên Các (Cửa Hàng)</span>
                    </button>
                  )}

                  {/* Đấu Với Bot */}
                  {onOpenBotMatch && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAvatarMenu(false);
                        onOpenBotMatch();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-emerald-900/50 flex items-center gap-2.5 text-emerald-200 transition-colors text-left cursor-pointer"
                    >
                      <Bot className="w-4 h-4 text-teal-400" />
                      <span className="font-xianxia text-sm">Đấu Với Kỳ Ma (Bot)</span>
                    </button>
                  )}

                  {/* Ngọc Giản Cập Nhật */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAvatarMenu(false);
                      onOpenPatchNotes();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-emerald-900/50 flex items-center gap-2.5 text-emerald-200 transition-colors text-left cursor-pointer"
                  >
                    <ScrollText className="w-4 h-4 text-emerald-400" />
                    <span className="font-xianxia text-sm">Ngọc Giản Cập Nhật</span>
                  </button>

                  {/* Quản Trị Viên (Admin) */}
                  {isAdmin && onOpenAdmin && (
                    <>
                      <div className="border-t border-emerald-500/20 my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setShowAvatarMenu(false);
                          onOpenAdmin();
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-emerald-900 hover:to-teal-900 border border-emerald-500/30 flex items-center gap-2.5 text-teal-200 font-bold transition-colors text-left cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-teal-400 fill-teal-400/20" />
                        <span className="font-xianxia text-sm">Quản Trị Viên (Admin)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleQuickSync();
                        }}
                        disabled={syncingCloud}
                        className="w-full px-3 py-2 rounded-xl hover:bg-emerald-900/50 flex items-center gap-2.5 text-emerald-300 transition-colors text-left cursor-pointer"
                      >
                        <Cloud className="w-4 h-4 text-teal-400" />
                        <span className="font-xianxia text-sm flex items-center gap-1.5">
                          {syncingCloud ? 'Đang Đồng Bộ Đám Mây...' : 'Đồng Bộ Đám Mây'}
                          <RefreshCw className={`w-3 h-3 ${syncingCloud ? 'animate-spin' : ''}`} />
                        </span>
                      </button>
                    </>
                  )}

                  {/* Đăng Xuất / Đổi Tài Khoản */}
                  <div className="border-t border-emerald-500/20 my-1" />
                  {!user.isGuest && onLogout ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAvatarMenu(false);
                        onLogout();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-rose-950/60 text-rose-300 hover:text-rose-200 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span className="font-xianxia text-sm font-bold">Đăng Xuất Tài Khoản</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAvatarMenu(false);
                        onOpenAuth();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-emerald-900/60 text-teal-300 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 text-teal-400" />
                      <span className="font-xianxia text-sm font-bold">Đăng Nhập / Đăng Ký</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
