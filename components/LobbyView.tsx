'use client';

import React, { useState, useEffect } from 'react';
import {
  Swords,
  Zap,
  PlusCircle,
  MessageSquare,
  Sparkles,
  Bot,
  ShoppingBag,
  Shield,
  LogOut,
  LogIn,
} from 'lucide-react';
import { GameRoom } from '../lib/xiangqi/types';
import {
  UserAccount,
  SEED_ACCOUNTS,
  loadAllAccounts,
  findAccountByDaoName,
} from '../lib/storage/userStore';
import { DAOIST_TITLES, getRealmByLevel } from '../lib/cultivation/realms';
import { AiCultivator } from '../lib/xiangqi/ai';
import AvatarWithFrame from './AvatarWithFrame';
import LobbyRoomList from './lobby/LobbyRoomList';
import LobbyWorldChat, { ChatMessage } from './lobby/LobbyWorldChat';
import LobbyCreateRoomModal from './lobby/LobbyCreateRoomModal';
import LobbyAiModal from './lobby/LobbyAiModal';

interface LobbyViewProps {
  user: UserAccount;
  rooms: GameRoom[];
  onlineCount?: number;
  chatMessages?: ChatMessage[];
  onSendChatMessage?: (text: string) => void;
  onlineAccountsList?: UserAccount[];
  onStartMatchmaking: () => void;
  onCreateRoom: (options: {
    name: string;
    timeLimit: number;
    increment: number;
    isRanked: boolean;
    password?: string;
  }) => void;
  onJoinRoom: (room: GameRoom) => void;
  onChallengeAi: (rival: AiCultivator) => void;
  onOpenBotMatch?: () => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
  onViewUserProfile?: (targetUser: UserAccount) => void;
  onOpenPatchNotes: () => void;
  onOpenShop?: () => void;
  onOpenAdmin?: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onOpenOnlineUsers?: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'Hệ Thống Tiên Giới',
    realm: 'Vô Thượng',
    title: 'Thiên Đạo',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    message: 'Chào mừng các vị đạo hữu giá lâm Tiên Kỳ Đạo! Bản cập nhật v1.2 đã khai mở Phong Thần Bảng.',
    time: 'Vừa xong',
    isSystem: true,
  },
  {
    id: 'm2',
    sender: 'Thanh Phong Trưởng Lão',
    realm: 'Trúc Cơ Kỳ',
    title: 'Bạch Vân Kỳ Sĩ',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    message: 'Có vị đạo hữu nào ELO tầm 1300-1400 muốn cùng lão phu luận đạo 1 ván 10 phút không?',
    time: '1 phút trước',
  },
  {
    id: 'm3',
    sender: 'Độc Cô Kiếm Ma',
    realm: 'Hóa Thần Kỳ',
    title: 'Thần Toán Chân Quân',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    message: 'Vừa thắng 1 ván thuận pháo, thu về 50 Linh Thạch và 30 điểm Đạo Hạnh!',
    time: '3 phút trước',
  },
  {
    id: 'm4',
    sender: 'Bạch Vân Đạo Đồng',
    realm: 'Luyện Khí Kỳ',
    title: 'Kỳ Đạo Đạo Đồng',
    avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    message: 'Tiểu đạo vừa đột phá Luyện Khí tầng 3, xin bái kiến chư vị tiền bối!',
    time: '5 phút trước',
  },
];

export default function LobbyView({
  user,
  rooms,
  onlineCount,
  chatMessages,
  onSendChatMessage,
  onlineAccountsList,
  onStartMatchmaking,
  onCreateRoom,
  onJoinRoom,
  onChallengeAi,
  onOpenBotMatch,
  onOpenLeaderboard,
  onOpenProfile,
  onViewUserProfile,
  onOpenPatchNotes,
  onOpenShop,
  onOpenAdmin,
  onOpenAuth,
  onLogout,
  onOpenOnlineUsers,
}: LobbyViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [mobileLobbyTab, setMobileLobbyTab] = useState<'rooms' | 'community'>('rooms');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  const activeMessages = (chatMessages && chatMessages.length > 0) ? chatMessages : localMessages;

  // Active online accounts
  const [polledAccounts, setPolledAccounts] = useState<UserAccount[]>(() =>
    SEED_ACCOUNTS.filter((a) => a.isOnline && a.id !== user.id && !a.isBanned)
  );

  useEffect(() => {
    if (onlineAccountsList && onlineAccountsList.length > 0) return;
    const syncOnline = () => {
      const all = loadAllAccounts();
      setPolledAccounts(all.filter((a) => a.isOnline && a.id !== user.id && !a.isBanned));
    };
    const interval = setInterval(syncOnline, 4000);
    return () => clearInterval(interval);
  }, [user.id, onlineAccountsList]);

  const onlineAccounts = (onlineAccountsList && onlineAccountsList.length > 0)
    ? onlineAccountsList.filter((a) => a.id !== user.id && !a.isBanned)
    : polledAccounts;

  const handleInspectCultivator = (target: UserAccount) => {
    if (onViewUserProfile) {
      onViewUserProfile(target);
    }
  };

  const handleInspectBySender = (
    senderName: string,
    fallbackAvatar?: string,
    fallbackRealm?: string,
    fallbackTitle?: string
  ) => {
    if (!onViewUserProfile) return;
    const found = findAccountByDaoName(senderName);
    if (found) {
      onViewUserProfile(found);
      return;
    }
    const synth: UserAccount = {
      id: 'cult_synth_' + encodeURIComponent(senderName),
      username: senderName.toLowerCase().replace(/\s+/g, '_'),
      daoName: senderName,
      sect: 'Tán Tu Cửu Châu',
      avatarUrl:
        fallbackAvatar ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      elo: 1450,
      realmLevel: 3,
      exp: 3000,
      spiritStones: 350,
      pills: {},
      selectedAvatarId: 'av_default',
      unlockedTitleIds: ['t1', 't3'],
      unlockedAvatarIds: ['av_default'],
      createdAt: Date.now(),
      stats: { wins: 28, losses: 14, draws: 3, totalMatches: 45, winStreak: 3, maxWinStreak: 5, highestElo: 1520 },
      isOnline: true,
      selectedTitleId: 't3',
    };
    onViewUserProfile(synth);
  };

  const userRealm = getRealmByLevel(user.realmLevel);
  const activeTitle = DAOIST_TITLES.find((t) => t.id === user.selectedTitleId)?.name || 'Kỳ Đạo Đạo Đồng';

  const handleSendChatMessage = (text: string) => {
    if (onSendChatMessage) {
      onSendChatMessage(text);
    }
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: user.daoName,
      realm: userRealm.name,
      title: activeTitle,
      avatarUrl: user.avatarUrl,
      message: text,
      time: 'Vừa xong',
    };
    setLocalMessages((prev) => [...prev, newMsg]);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner: Daoist Jade Palace Header */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-[#062420] via-[#041a17] to-[#021310] p-5 sm:p-7 shadow-[0_0_40px_rgba(4,28,24,0.8)] text-emerald-100">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-9xl font-xianxia text-emerald-500/10 select-none pointer-events-none hidden md:block">
          棋
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="font-xianxia font-bold tracking-wide">Cửu Châu Tiên Kỳ Giới • Sảnh Chờ Luận Đạo</span>
              </div>
              <button
                type="button"
                id="lobby-online-badge"
                onClick={onOpenOnlineUsers}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#052420] hover:bg-[#07362f] border border-emerald-500/40 hover:border-teal-400 text-emerald-300 text-xs font-semibold shadow-sm transition-all cursor-pointer group"
                title="Nhấn để xem danh sách đạo hữu đang trực tuyến"
              >
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_6px_#2dd4bf]" />
                <span>
                  Đang Trực Tuyến: <strong className="text-white font-mono">{onlineCount || 1}</strong> Đạo Hữu
                </span>
                <span className="text-[10px] text-teal-300 underline underline-offset-2 opacity-80 group-hover:opacity-100">
                  (Xem)
                </span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-xianxia text-white tracking-tight text-glow-jade">
              Thao Túng Thiên Bàn, <span className="bg-gradient-to-r from-emerald-200 via-teal-300 to-white bg-clip-text text-transparent">Chứng Đạo Tiên Kỳ</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl leading-relaxed">
              Mỗi nước cờ là một bước tu chân. Ghép trận theo ELO, bắt quân tung chiêu thức ngũ hành lôi hỏa, tích lũy tu vi phá kiếp thăng tiên trên Phong Thần Bảng!
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="w-full md:w-auto flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Rapid ELO Matchmaking Button */}
            <button
              type="button"
              onClick={onStartMatchmaking}
              className="w-full sm:w-auto flex-1 sm:flex-none px-5 py-3 rounded-xl jade-button-primary font-xianxia font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Zap className="w-5 h-5 text-emerald-100 fill-current animate-bounce" />
              <span>Ghép Nhanh Theo ELO</span>
            </button>

            {/* Create Room Button */}
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#062420] hover:bg-[#0a3832] text-emerald-200 border border-emerald-400/50 hover:border-emerald-300 font-xianxia font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>Tạo Bàn Cờ</span>
            </button>

            {/* Challenge AI / Bot */}
            <button
              type="button"
              onClick={() => {
                if (onOpenBotMatch) {
                  onOpenBotMatch();
                } else {
                  setShowAiModal(true);
                }
              }}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-teal-950/70 hover:bg-teal-900/80 text-teal-200 border border-teal-500/50 hover:border-teal-300 font-xianxia font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-950/40 group cursor-pointer"
            >
              <Bot className="w-4 h-4 text-teal-300 group-hover:scale-110 transition-transform" />
              <span>Chơi Với Bot</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/25 text-teal-200 border border-teal-500/40 font-mono font-bold">
                Chọn Độ Khó
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center p-1 bg-[#052420] border border-emerald-500/30 rounded-xl shadow-md">
        <button
          type="button"
          onClick={() => setMobileLobbyTab('rooms')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 font-xianxia cursor-pointer ${
            mobileLobbyTab === 'rooms'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
              : 'text-emerald-300/70 hover:text-white'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Bàn Cờ Sảnh Chờ ({rooms.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileLobbyTab('community')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 font-xianxia cursor-pointer ${
            mobileLobbyTab === 'community'
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
              : 'text-emerald-300/70 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Đàm Đạo & Tu Chân</span>
        </button>
      </div>

      {/* Main Grid: Left Rooms List (8 cols), Right Chat & Stats (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Room Lobby & Search (8 cols) */}
        <div className={`lg:col-span-8 space-y-4 ${mobileLobbyTab === 'rooms' ? 'block' : 'hidden lg:block'}`}>
          <LobbyRoomList
            rooms={rooms}
            onJoinRoom={onJoinRoom}
            onOpenCreateModal={() => setShowCreateModal(true)}
            onInspectHost={(hostName) => handleInspectBySender(hostName)}
          />
        </div>

        {/* Right Column: World Chat & Your Cultivation Progress (4 cols) */}
        <div className={`lg:col-span-4 space-y-4 ${mobileLobbyTab === 'community' ? 'block' : 'hidden lg:block'}`}>
          {/* Quick Cultivation Card with Frame */}
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-[#062c26] via-[#041d1a] to-[#021311] p-4 relative overflow-hidden shadow-[0_0_30px_rgba(4,28,24,0.8)]">
            <div className="flex items-center gap-3">
              <div
                onClick={onOpenProfile}
                className="cursor-pointer transition-transform hover:scale-105 shrink-0"
                title="Nhấn để xem Hồ Sơ Tu Tiên & Đột Phá"
              >
                <AvatarWithFrame
                  avatarUrl={user.avatarUrl}
                  daoName={user.daoName}
                  realmLevel={user.realmLevel}
                  frameId={user.selectedFrameId}
                  size="lg"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white truncate font-xianxia">{user.daoName}</h4>
                  <span className="text-xs font-mono font-bold text-teal-300">{user.elo} ELO</span>
                </div>
                <div className="text-xs text-emerald-300/90 font-medium truncate font-xianxia">{activeTitle}</div>
                <div className="text-[11px] text-emerald-200/70 mt-0.5">{userRealm.name} • {user.sect}</div>
                <div className="text-[10px] text-teal-300 font-mono font-bold mt-0.5">
                  💎 {user.spiritStones.toLocaleString()} Linh Thạch
                </div>
              </div>
            </div>

            {/* EXP / Tu Vi Bar */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-300/70">Tu Vi Cảnh Giới:</span>
                <span className="font-mono text-teal-300 font-semibold">
                  {user.exp} / {userRealm.requiredExp}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#02110f] overflow-hidden p-0.5 border border-emerald-500/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-white transition-all duration-500 shadow-[0_0_8px_#10b981]"
                  style={{ width: `${Math.min(100, Math.round((user.exp / userRealm.requiredExp) * 100))}%` }}
                />
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="mt-3.5 pt-3 border-t border-emerald-500/20 grid grid-cols-3 text-center text-[11px]">
              <div>
                <span className="block text-emerald-400/60 font-medium">Thắng/Tổng</span>
                <span className="font-bold text-white">
                  {user.stats?.wins ?? 0}/{user.stats?.totalMatches ?? 0}
                </span>
              </div>
              <div>
                <span className="block text-emerald-400/60 font-medium">Tỷ Lệ Thắng</span>
                <span className="font-bold text-teal-300">
                  {(user.stats?.totalMatches ?? 0) > 0
                    ? Math.round(((user.stats?.wins ?? 0) / user.stats.totalMatches) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div>
                <span className="block text-emerald-400/60 font-medium">Liên Thắng</span>
                <span className="font-bold text-emerald-300">🔥 {user.stats?.winStreak ?? 0}</span>
              </div>
            </div>

            {/* Quick Shortcuts: Shop and Admin */}
            <div className="mt-3.5 pt-3 border-t border-emerald-500/20 flex items-center gap-2">
              {onOpenShop && (
                <button
                  type="button"
                  onClick={onOpenShop}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-teal-950/60 hover:bg-teal-900/80 text-teal-200 border border-teal-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors font-xianxia cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-teal-300" />
                  <span>Tiên Các Shop 💎</span>
                </button>
              )}
              {(user.role === 'admin' || user.username === 'admin') && onOpenAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-400/50 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors font-xianxia cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-teal-300" />
                  <span>Quản Trị Viên</span>
                </button>
              )}
            </div>

            {/* Account Switch / Logout Action Row */}
            <div className="mt-2.5 flex items-center gap-2">
              {user.isGuest ? (
                onOpenAuth && (
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="w-full py-2 px-3 rounded-xl jade-button-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md font-xianxia cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Đăng Nhập Lưu Đạo Tịch</span>
                  </button>
                )
              ) : (
                <>
                  {onOpenAuth && (
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/30 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors font-xianxia cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5 text-teal-400" />
                      <span>Đổi Tài Khoản</span>
                    </button>
                  )}
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="py-1.5 px-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title={`Đăng xuất khỏi ${user.daoName}`}
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Đăng Xuất</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* World Chat & Online Cultivators Box */}
          <LobbyWorldChat
            messages={activeMessages}
            onSendMessage={handleSendChatMessage}
            onlineAccounts={onlineAccounts}
            onlineCount={onlineCount}
            onInspectCultivator={handleInspectCultivator}
            onInspectBySender={handleInspectBySender}
            onChallengeAi={onChallengeAi}
          />
        </div>
      </div>

      {/* Modal: Create Custom Room */}
      <LobbyCreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={onCreateRoom}
      />

      {/* Modal: Select AI Cultivator Rival */}
      <LobbyAiModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onChallengeAi={onChallengeAi}
      />
    </div>
  );
}
