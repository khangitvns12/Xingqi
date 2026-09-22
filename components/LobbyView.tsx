'use client';

import { useState, useEffect } from 'react';
import {
  Swords,
  Zap,
  PlusCircle,
  Users,
  Trophy,
  MessageSquare,
  Search,
  Sparkles,
  Flame,
  ShieldAlert,
  Bot,
  Clock,
  Send,
  Eye,
  Lock,
  ShoppingBag,
  Shield,
  LogOut,
  LogIn,
} from 'lucide-react';
import { GameRoom } from '../lib/xiangqi/types';
import { UserAccount, SEED_ACCOUNTS, loadAllAccounts, findAccountByDaoName, findAccountById } from '../lib/storage/userStore';
import { CULTIVATION_REALMS, DAOIST_TITLES, getRealmByLevel } from '../lib/cultivation/realms';
import { AI_CULTIVATOR_RIVALS, AiCultivator } from '../lib/xiangqi/ai';
import AvatarWithFrame from './AvatarWithFrame';

interface LobbyViewProps {
  user: UserAccount;
  rooms: GameRoom[];
  onlineCount?: number;
  onStartMatchmaking: () => void;
  onCreateRoom: (options: { name: string; timeLimit: number; increment: number; isRanked: boolean; password?: string }) => void;
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
}

interface ChatMessage {
  id: string;
  sender: string;
  realm: string;
  title: string;
  avatarUrl: string;
  message: string;
  time: string;
  isSystem?: boolean;
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
}: LobbyViewProps) {
  const [filterTab, setFilterTab] = useState<'all' | 'waiting' | 'blitz' | 'ranked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'online'>('chat');

  // Form states for creating room
  const [roomName, setRoomName] = useState(`Bàn Cờ Của ${user.daoName}`);
  const [roomTime, setRoomTime] = useState<number>(10);
  const [roomIncrement, setRoomIncrement] = useState<number>(5);
  const [isRanked, setIsRanked] = useState(true);
  const [roomPassword, setRoomPassword] = useState('');

  // World chat state
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputMsg, setInputMsg] = useState('');

  // Get active accounts for online list (initialized with SEED_ACCOUNTS for consistent SSR & hydration)
  const [onlineAccounts, setOnlineAccounts] = useState<UserAccount[]>(() =>
    SEED_ACCOUNTS.filter((a) => a.isOnline && a.id !== user.id && !a.isBanned)
  );

  useEffect(() => {
    const syncOnline = () => {
      const all = loadAllAccounts();
      setOnlineAccounts(all.filter((a) => a.isOnline && a.id !== user.id && !a.isBanned));
    };
    syncOnline();
    const interval = setInterval(syncOnline, 4000);
    return () => clearInterval(interval);
  }, [user.id]);

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
    // Synthetic account for online disciples / AI masters
    const synth: UserAccount = {
      id: 'cult_synth_' + encodeURIComponent(senderName),
      username: senderName.toLowerCase().replace(/\s+/g, '_'),
      daoName: senderName,
      sect: 'Tán Tu Cửu Châu',
      avatarUrl: fallbackAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      elo: 1450,
      realmLevel: 3,
      exp: 3000,
      spiritStones: 350,
      pills: {},
      selectedTitleId: 'title_3',
      selectedAvatarId: 'av_3',
      unlockedTitleIds: ['title_3'],
      unlockedAvatarIds: ['av_3'],
      stats: {
        totalMatches: 48,
        wins: 32,
        draws: 4,
        losses: 12,
        winStreak: 2,
        maxWinStreak: 6,
        highestElo: 1490,
      },
      createdAt: 1720000000000,
    };
    onViewUserProfile(synth);
  };

  const userRealm = getRealmByLevel(user.realmLevel);
  const activeTitle = DAOIST_TITLES.find((t) => t.id === user.selectedTitleId)?.name || 'Kỳ Đạo Đạo Đồng';

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: user.daoName,
      realm: userRealm.name,
      title: activeTitle,
      avatarUrl: user.avatarUrl,
      message: inputMsg.trim(),
      time: 'Vừa xong',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRoom({
      name: roomName.trim() || `Bàn Cờ Của ${user.daoName}`,
      timeLimit: roomTime,
      increment: roomIncrement,
      isRanked,
      password: roomPassword.trim() ? roomPassword.trim() : undefined,
    });
    setShowCreateModal(false);
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase()) && !r.hostName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterTab === 'waiting') return r.status === 'waiting';
    if (filterTab === 'blitz') return r.timeLimit <= 5;
    if (filterTab === 'ranked') return r.isRanked;
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Top Banner / Tu Tiên Aura Showcase */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#121829] via-[#0f172a] to-[#1e152e] p-4 sm:p-7 shadow-2xl shadow-amber-950/20">
        {/* Background Daoist Array ambient graphics */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-9xl font-serif text-amber-500/5 select-none pointer-events-none hidden md:block">
          棋
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Cửu Châu Tiên Kỳ Giới • Sảnh Chờ Luận Đạo</span>
              </div>
              <div
                id="lobby-online-badge"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Đang Trực Tuyến: <strong className="text-white font-mono">{onlineCount || 18}</strong> Đạo Hữu</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif text-slate-100 tracking-tight">
              Thao Túng Thiên Bàn, <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-rose-400 bg-clip-text text-transparent">Chứng Đạo Tiên Kỳ</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Mỗi nước cờ là một bước tu chân. Ghép trận theo ELO, bắt quân tung chiêu thức ngũ hành lôi hỏa, tích lũy tu vi phá kiếp thăng tiên trên Phong Thần Bảng!
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="w-full md:w-auto flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Rapid ELO Matchmaking Button */}
            <button
              onClick={onStartMatchmaking}
              className="w-full sm:w-auto flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Zap className="w-5 h-5 text-slate-950 fill-current animate-bounce" />
              <span>Ghép Nhanh Theo ELO</span>
            </button>

            {/* Create Room Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/40 hover:border-amber-400 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Tạo Bàn Cờ</span>
            </button>

            {/* Challenge AI / Bot with Difficulty Selection */}
            <button
              onClick={() => {
                if (onOpenBotMatch) {
                  onOpenBotMatch();
                } else {
                  setShowAiModal(true);
                }
              }}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 hover:from-purple-900 hover:to-indigo-900 text-purple-200 border border-purple-500/50 hover:border-purple-400 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-950/40 group"
            >
              <Bot className="w-4 h-4 text-purple-300 group-hover:scale-110 transition-transform" />
              <span>Chơi Với Bot</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/25 text-purple-300 border border-purple-500/40 font-mono font-bold">
                Chọn Độ Khó
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Rooms List (8 cols), Right Chat & Stats (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Room Lobby & Search (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter tabs & Search row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d1322]/80 border border-slate-800 p-2 sm:p-2.5 rounded-xl">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  filterTab === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                Tất Cả ({rooms.length})
              </button>
              <button
                onClick={() => setFilterTab('waiting')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  filterTab === 'waiting'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                Đang Chờ
              </button>
              <button
                onClick={() => setFilterTab('blitz')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  filterTab === 'blitz'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                Cờ Chớp (≤5p)
              </button>
              <button
                onClick={() => setFilterTab('ranked')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  filterTab === 'ranked'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                Tính ELO
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm bàn cờ, đạo hữu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/70"
              />
            </div>
          </div>

          {/* Room Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredRooms.length === 0 ? (
              <div className="col-span-full py-12 text-center rounded-xl border border-dashed border-slate-800 bg-[#0d1322]/40 text-slate-400 space-y-3">
                <Swords className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm">Chưa có bàn cờ nào phù hợp bộ lọc.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition-colors"
                >
                  Tạo Bàn Cờ Mới
                </button>
              </div>
            ) : (
              filteredRooms.map((room) => {
                const isFull = room.status === 'playing' || (room.players.red && room.players.black);
                return (
                  <div
                    key={room.id}
                    className="relative group rounded-xl border border-slate-800 hover:border-amber-500/50 bg-[#0d1424]/90 p-4 transition-all duration-200 hover:shadow-xl hover:shadow-black/60 flex flex-col justify-between"
                  >
                    {/* Top status line */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-1">
                            {room.name}
                          </h3>
                          {room.password && <Lock className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <span>Chủ bàn:</span>
                          <button
                            type="button"
                            onClick={() => handleInspectBySender(room.hostName)}
                            className="text-amber-400 hover:text-amber-300 font-medium hover:underline cursor-pointer"
                            title="Xem thông tin chi tiết của chủ bàn"
                          >
                            {room.hostName}
                          </button>
                        </p>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap border ${
                          room.status === 'waiting'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 animate-pulse'
                            : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {room.status === 'waiting' ? '● Đang Chờ' : '⚔️ Đang Đấu'}
                      </span>
                    </div>

                    {/* Room Meta Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mb-3.5">
                      <span className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {room.timeLimit}p + {room.increment}s
                      </span>
                      <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-amber-300">
                        {room.hostRealm} ({room.hostElo} ELO)
                      </span>
                      <span className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                        <Eye className="w-3 h-3 text-purple-400" />
                        {room.spectatorCount} Đạo Hữu
                      </span>
                    </div>

                    {/* Action button */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="text-[11px] text-slate-500">
                        {room.isRanked ? (
                          <span className="text-amber-400/80 font-medium">⚡ Xếp Hạng ELO</span>
                        ) : (
                          <span>Giao Hữu Tự Do</span>
                        )}
                      </div>

                      <button
                        onClick={() => onJoinRoom(room)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          room.status === 'waiting'
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {room.status === 'waiting' ? (
                          <>
                            <Swords className="w-3.5 h-3.5" />
                            <span>Vào Khiêu Chiến</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem Trận Đấu</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: World Chat & Your Cultivation Progress (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Your Quick Cultivation Card with Glowing Frame */}
          <div className="rounded-xl border border-amber-500/30 bg-[#0d1424]/95 p-4 relative overflow-hidden shadow-xl">
            <div className="flex items-center gap-3">
              {/* Glowing Avatar with Frame */}
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
                  <h4 className="text-sm font-bold text-slate-100 truncate">{user.daoName}</h4>
                  <span className="text-xs font-mono font-bold text-amber-400">{user.elo} ELO</span>
                </div>
                <div className="text-xs text-amber-300/90 font-medium truncate">{activeTitle}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{userRealm.name} • {user.sect}</div>
                <div className="text-[10px] text-cyan-300 font-mono font-bold mt-0.5">
                  💎 {user.spiritStones.toLocaleString()} Linh Thạch
                </div>
              </div>
            </div>

            {/* EXP / Tu Vi Bar */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Tu Vi Cảnh Giới:</span>
                <span className="font-mono text-cyan-300 font-semibold">
                  {user.exp} / {userRealm.requiredExp}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((user.exp / userRealm.requiredExp) * 100))}%` }}
                />
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="mt-3.5 pt-3 border-t border-slate-800 grid grid-cols-3 text-center text-[11px]">
              <div>
                <span className="block text-slate-500">Thắng/Tổng</span>
                <span className="font-bold text-slate-200">
                  {user.stats.wins}/{user.stats.totalMatches}
                </span>
              </div>
              <div>
                <span className="block text-slate-500">Tỷ Lệ Thắng</span>
                <span className="font-bold text-emerald-400">
                  {user.stats.totalMatches > 0
                    ? Math.round((user.stats.wins / user.stats.totalMatches) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div>
                <span className="block text-slate-500">Liên Thắng</span>
                <span className="font-bold text-amber-400">🔥 {user.stats.winStreak}</span>
              </div>
            </div>

            {/* Quick Shortcuts: Shop and Admin */}
            <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center gap-2">
              {onOpenShop && (
                <button
                  onClick={onOpenShop}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Tiên Các Shop 💎</span>
                </button>
              )}
              {(user.role === 'admin' || user.username === 'admin') && onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Quản Trị Viên</span>
                </button>
              )}
            </div>

            {/* Account Switch / Logout Action Row */}
            <div className="mt-2.5 flex items-center gap-2">
              {user.isGuest ? (
                onOpenAuth && (
                  <button
                    onClick={onOpenAuth}
                    className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Đăng Nhập Lưu Đạo Tịch</span>
                  </button>
                )
              ) : (
                <>
                  {onOpenAuth && (
                    <button
                      onClick={onOpenAuth}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Đổi Tài Khoản</span>
                    </button>
                  )}
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="py-1.5 px-2.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
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

          {/* World Chat & Online Cultivators Tabbed Box */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1424]/90 flex flex-col h-[380px] shadow-lg overflow-hidden">
            {/* Tabbed Header */}
            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSidebarTab('chat')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    sidebarTab === 'chat'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Truyền Âm</span>
                </button>
                <button
                  type="button"
                  id="lobby-online-tab"
                  onClick={() => setSidebarTab('online')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    sidebarTab === 'online'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đạo Hữu Online</span>
                </button>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {onlineCount || Math.max(18, onlineAccounts.length + 18)} Online
              </span>
            </div>

            {/* TAB 1: World Chat */}
            {sidebarTab === 'chat' && (
              <>
                <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                  {messages.map((m) => (
                    <div key={m.id} className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInspectBySender(m.sender, m.avatarUrl, m.realm, m.title)}
                          className="font-semibold text-amber-300 hover:text-amber-200 text-[11px] truncate max-w-[130px] hover:underline cursor-pointer flex items-center gap-1 text-left"
                          title="Nhấp để xem hồ sơ của đạo hữu này"
                        >
                          <Eye className="w-2.5 h-2.5 text-slate-400 opacity-60" />
                          <span>{m.sender}</span>
                        </button>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                          {m.realm}
                        </span>
                        <span className="text-[9px] text-slate-500 ml-auto">{m.time}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed rounded-lg p-2 ${
                        m.isSystem ? 'bg-purple-950/40 text-purple-200 border border-purple-800/40' : 'bg-slate-900/60 text-slate-300'
                      }`}>
                        {m.message}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 bg-slate-900/70 flex gap-1.5">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Nhập truyền âm đàm đạo..."
                    className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/70"
                  />
                  <button
                    type="submit"
                    className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
                    title="Gửi truyền âm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            )}

            {/* TAB 2: Online Cultivators List */}
            {sidebarTab === 'online' && (
              <div className="flex-1 p-2.5 overflow-y-auto space-y-2 text-xs">
                <div className="text-[11px] text-slate-400 px-1 py-0.5 flex items-center justify-between">
                  <span>Các vị đạo hữu đang có mặt tại sảnh:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {onlineAccounts.length + 3} người
                  </span>
                </div>

                {/* Registered online accounts */}
                {onlineAccounts.map((cult) => {
                  const rInfo = getRealmByLevel(cult.realmLevel);
                  return (
                    <div
                      key={cult.id}
                      className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between gap-2 transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 shrink-0">
                          <img src={cult.avatarUrl} alt={cult.daoName} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-200 text-xs truncate">{cult.daoName}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                              Online
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-400/90 truncate">
                            {rInfo.name} • <span className="font-mono text-slate-400">{cult.elo} ELO</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleInspectCultivator(cult)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 transition-colors flex items-center gap-1"
                          title="Xem thông tin chi tiết hồ sơ đạo hữu"
                        >
                          <Eye className="w-3 h-3 text-cyan-400" />
                          <span>Hồ Sơ</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Active Daoist AI masters constantly online to practice with */}
                {AI_CULTIVATOR_RIVALS.slice(0, 4).map((rival) => (
                  <div
                    key={rival.id}
                    className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 flex items-center justify-between gap-2 transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 shrink-0">
                        <img src={rival.avatarUrl} alt={rival.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-200 text-xs truncate">{rival.name}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                            {rival.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-400/90 truncate">
                          {rival.realm} • <span className="font-mono text-slate-400">{rival.elo} ELO</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleInspectBySender(rival.name, rival.avatarUrl, rival.realm, rival.title)}
                        className="p-1 sm:px-2 sm:py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 transition-colors flex items-center gap-1"
                        title="Xem hồ sơ tu tiên"
                      >
                        <Eye className="w-3 h-3 text-cyan-400" />
                        <span className="hidden sm:inline">Hồ Sơ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onChallengeAi(rival)}
                        className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40 transition-colors flex items-center gap-1"
                        title="Thách đấu cờ tướng"
                      >
                        <Swords className="w-3 h-3 text-amber-400" />
                        <span>Đấu</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create Custom Room */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0d1424] border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-slate-100">Khai Lập Tiên Bàn</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên Tiên Bàn</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Thời Gian (Phút/Bên)</label>
                  <select
                    value={roomTime}
                    onChange={(e) => setRoomTime(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value={3}>3 Phút (Cực Chớp)</option>
                    <option value={5}>5 Phút (Cờ Chớp)</option>
                    <option value={10}>10 Phút (Tiêu Chuẩn)</option>
                    <option value={15}>15 Phút (Cờ Nhanh)</option>
                    <option value={20}>20 Phút (Trầm Tư)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cộng Giây / Nước</label>
                  <select
                    value={roomIncrement}
                    onChange={(e) => setRoomIncrement(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value={0}>+0 giây</option>
                    <option value={3}>+3 giây</option>
                    <option value={5}>+5 giây</option>
                    <option value={10}>+10 giây</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Mật Khẩu Bàn (Để trống nếu công khai)</label>
                <input
                  type="text"
                  placeholder="Không mật khẩu"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rankedCheck"
                  checked={isRanked}
                  onChange={(e) => setIsRanked(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <label htmlFor="rankedCheck" className="text-slate-300 cursor-pointer select-none">
                  Thi Đấu Tính Điểm Xếp Hạng ELO & Tu Vi
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/30"
                >
                  Khai Lập Bàn Cờ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Select AI Cultivator Rival */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#0d1424] border border-purple-500/40 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-slate-100">Chọn Tiên Nhân Khiêu Chiến (Luyện Cờ Với AI)</h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {AI_CULTIVATOR_RIVALS.map((rival) => (
                <div
                  key={rival.id}
                  className="p-3.5 rounded-xl border border-slate-800 hover:border-purple-500/60 bg-slate-900/70 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full overflow-hidden border-2"
                      style={{ borderColor: rival.frameColor }}
                    >
                      <img src={rival.avatarUrl} alt={rival.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{rival.name}</h4>
                      <p className="text-[11px] text-amber-300">{rival.realm} • {rival.elo} ELO</p>
                      <p className="text-[10px] text-slate-400">{rival.sect}</p>
                    </div>
                  </div>

                  <p className="italic text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                    &ldquo;{rival.quotes.greeting}&rdquo;
                  </p>

                  <button
                    onClick={() => {
                      setShowAiModal(false);
                      onChallengeAi(rival);
                    }}
                    className="w-full py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-1.5 shadow"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Luận Đạo Ngay</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
