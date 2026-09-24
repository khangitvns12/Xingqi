'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LobbyView from '../components/LobbyView';
import WaitingRoomView from '../components/WaitingRoomView';
import GameView from '../components/GameView';
import ProfileModal from '../components/ProfileModal';
import LeaderboardModal from '../components/LeaderboardModal';
import AuthModal from '../components/AuthModal';
import PatchNotesModal from '../components/PatchNotesModal';
import MatchmakingModal from '../components/MatchmakingModal';
import BotMatchModal, { BotMatchConfig } from '../components/BotMatchModal';
import ShopModal from '../components/ShopModal';
import AdminModal from '../components/AdminModal';
import LogoutModal from '../components/LogoutModal';
import OnlineUsersModal from '../components/OnlineUsersModal';
import { GamePlayer, GameRoom, Side } from '../lib/xiangqi/types';
import {
  INITIAL_LOBBY_ROOMS,
  DEFAULT_USER,
  GUEST_USER,
  UserAccount,
  getOnlineUsersCount,
  useCurrentUser,
  loadUserProfile,
  checkUserKicked,
  logoutUser,
  syncUserFromCloud,
} from '../lib/storage/userStore';
import { syncItemsFromCloud } from '../lib/cultivation/shopAndFrames';
import { getRealmByLevel } from '../lib/cultivation/realms';
import { soundManager } from '../lib/audio/soundFx';
import { AiCultivator } from '../lib/xiangqi/ai';
import {
  syncLobbyData,
  sendWorldChat,
  createRoomOnServer,
  joinRoomOnServer,
  getSessionAccount,
} from '../lib/multiplayer/multiplayerClient';
import { ChatMessage } from '../lib/server/multiplayerStore';
import { BOT_USER_IDS } from '../lib/storage/userTypes';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function HomePage() {
  // Navigation view: 'lobby' | 'waiting' | 'game'
  const [currentView, setCurrentView] = useState<'lobby' | 'waiting' | 'game'>('lobby');

  // User Profile with synchronized external store (guarantees SSR & client hydration consistency)
  const [user, handleUpdateUser, setUser, logout] = useCurrentUser();

  // Rooms
  const [rooms, setRooms] = useState<GameRoom[]>(INITIAL_LOBBY_ROOMS);
  const [activeRoom, setActiveRoom] = useState<GameRoom | null>(null);

  // Live Multiplayer Data
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [onlineUsersList, setOnlineUsersList] = useState<UserAccount[]>([]);

  // Modals
  const [showProfile, setShowProfile] = useState(false);
  const [viewingProfileUser, setViewingProfileUser] = useState<UserAccount | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [showBotMatch, setShowBotMatch] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Online cultivators count (statically initialized to 1 to guarantee matching SSR & client initial render)
  const [onlineCount, setOnlineCount] = useState<number>(1);

  // Automatically sync all accounts, custom items, and settings from cloud database on startup
  useEffect(() => {
    Promise.all([syncUserFromCloud(), syncItemsFromCloud()]).catch((err) => {
      console.warn('[Sync] Initial cloud sync warning:', err);
    });

    // Auto-restore session if user identity cookie exists
    getSessionAccount().then((sessionAcc) => {
      if (sessionAcc && (user.isGuest || user.id === 'user_main')) {
        setUser(sessionAcc);
      }
    }).catch(() => {});
  }, []);

  // Real-time multiplayer lobby sync (rooms, online users, world chat)
  useEffect(() => {
    let isMounted = true;
    const pollLobby = async () => {
      try {
        const res = await syncLobbyData(user);
        if (isMounted && res) {
          if (Array.isArray(res.rooms)) {
            const serverRoomIds = new Set(res.rooms.map((r) => r.id));
            const baseRooms = INITIAL_LOBBY_ROOMS.filter((r) => !serverRoomIds.has(r.id));
            setRooms([...res.rooms, ...baseRooms]);
          }
          if (Array.isArray(res.onlineUsers)) {
            setOnlineUsersList(res.onlineUsers);
            setOnlineCount(Math.max(1, res.onlineUsers.length));
          }
          if (Array.isArray(res.chatMessages) && res.chatMessages.length > 0) {
            setChatMessages(res.chatMessages);
          }
          if (res.sessionAccount && user.isGuest) {
            setUser(res.sessionAccount);
          }
        }
      } catch {
        // network issue fallback
      }
    };

    pollLobby();
    const timer = setInterval(pollLobby, 2500);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [user.id, user.isGuest, setUser]);

  // Force authentication on first visit if user has not logged in (user.isGuest)
  const isAuthModalOpen = showAuth || Boolean(user?.isGuest);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' | 'warning' } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Sound
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Check if active user was kicked by administrator
  useEffect(() => {
    const timer = setInterval(() => {
      if (user && checkUserKicked(user.id)) {
        logout();
        setToast({
          type: 'warning',
          message: 'Tài khoản của bạn đã bị Quản Trị Viên đá khỏi phiên đăng nhập (Kick). Đã chuyển về Khách Vãng Lai.',
        });
        if (currentView !== 'lobby') {
          setCurrentView('lobby');
        }
      }
    }, 2500);
    return () => clearInterval(timer);
  }, [user, logout, currentView]);

  // Direct challenge from public profile viewing or online cultivators list
  const handleStartDirectMatch = (target: UserAccount) => {
    const isTargetBot = BOT_USER_IDS.has(target.id) || target.id.startsWith('ai_');
    const newRoom: GameRoom = {
      id: 'room_duel_' + Date.now().toString().slice(-4),
      name: `Luận Đạo: ${user.daoName} vs ${target.daoName}`,
      hostId: user.id,
      hostName: user.daoName,
      hostRealm: getRealmByLevel(user.realmLevel).name,
      hostElo: user.elo,
      timeLimit: 10,
      increment: 5,
      isRanked: true,
      status: 'playing',
      players: {
        red: {
          id: user.id,
          name: user.daoName,
          title: 'Kỳ Đạo Tu Sĩ',
          realm: getRealmByLevel(user.realmLevel).name,
          realmLevel: user.realmLevel,
          elo: user.elo,
          avatarUrl: user.avatarUrl,
          frameColor: '#f59e0b',
          side: 'red',
          timeLeft: 10 * 60,
          isAi: false,
        },
        black: {
          id: target.id,
          name: target.daoName,
          title: 'Kỳ Đạo Đạo Hữu',
          realm: getRealmByLevel(target.realmLevel).name,
          realmLevel: target.realmLevel,
          elo: target.elo,
          avatarUrl: target.avatarUrl,
          frameColor: '#38bdf8',
          side: 'black',
          timeLeft: 10 * 60,
          isAi: isTargetBot,
          aiDifficultyLevel: isTargetBot ? Math.min(6, Math.max(1, Math.ceil(target.realmLevel / 2))) : undefined,
        },
      },
      spectatorCount: 1,
      createdAt: Date.now(),
    };
    setActiveRoom(newRoom);
    setCurrentView('game');
    setToast({
      type: 'success',
      message: `Đã mở ván cờ luận đạo trực tiếp với ${target.daoName}!`,
    });
    createRoomOnServer(newRoom).catch(() => {});
  };

  // Handle Logout flow
  const handleOpenLogout = () => {
    setShowLogout(true);
  };

  const handleConfirmLogout = () => {
    const prevDaoName = user.daoName;
    logout();
    setShowLogout(false);
    setShowProfile(false);
    if (currentView !== 'lobby') {
      setCurrentView('lobby');
    }
    setToast({
      type: 'info',
      message: `Đã đăng xuất khỏi tài khoản ${prevDaoName}. Vui lòng đăng nhập hoặc đăng ký tài khoản để tiếp tục!`,
    });
    // Require authentication
    setShowAuth(true);
  };

  // Sound toggle
  const handleToggleSound = () => {
    soundManager.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Start ELO Matchmaking
  const handleStartMatchmaking = () => {
    setShowMatchmaking(true);
  };

  // Matchmaking found a rival!
  const handleMatchFound = (rival: AiCultivator) => {
    setShowMatchmaking(false);

    const userRealm = getRealmByLevel(user.realmLevel);
    const newRoom: GameRoom = {
      id: 'match_' + Date.now(),
      name: `Luận Đạo: ${user.daoName} vs ${rival.name}`,
      hostId: user.id,
      hostName: user.daoName,
      hostRealm: userRealm.name,
      hostElo: user.elo,
      timeLimit: 10,
      increment: 5,
      isRanked: true,
      status: 'playing',
      players: {
        red: {
          id: user.id,
          name: user.daoName,
          title: 'Đạo Hữu',
          realm: userRealm.name,
          realmLevel: user.realmLevel,
          elo: user.elo,
          avatarUrl: user.avatarUrl,
          frameColor: userRealm.glowColor,
          side: 'red',
          timeLeft: 600,
        },
        black: {
          id: rival.id,
          name: rival.name,
          title: rival.title,
          realm: rival.realm,
          realmLevel: rival.realmLevel,
          elo: rival.elo,
          avatarUrl: rival.avatarUrl,
          frameColor: rival.frameColor,
          side: 'black',
          isAi: true,
          timeLeft: 600,
        },
      },
      spectatorCount: 6,
      createdAt: Date.now(),
    };

    setActiveRoom(newRoom);
    setCurrentView('game');
  };

  // Create custom room
  const handleCreateRoom = (options: {
    name: string;
    timeLimit: number;
    increment: number;
    isRanked: boolean;
    password?: string;
  }) => {
    const userRealm = getRealmByLevel(user.realmLevel);
    const newRoom: GameRoom = {
      id: 'room_' + Date.now().toString().slice(-4),
      name: options.name,
      hostId: user.id,
      hostName: user.daoName,
      hostRealm: userRealm.name,
      hostElo: user.elo,
      timeLimit: options.timeLimit,
      increment: options.increment,
      isRanked: options.isRanked,
      password: options.password,
      status: 'waiting',
      players: {
        red: {
          id: user.id,
          name: user.daoName,
          title: 'Chủ Bàn',
          realm: userRealm.name,
          realmLevel: user.realmLevel,
          elo: user.elo,
          avatarUrl: user.avatarUrl,
          frameColor: userRealm.glowColor,
          side: 'red',
          timeLeft: options.timeLimit * 60,
          isAi: false,
        },
      },
      spectatorCount: 1,
      createdAt: Date.now(),
    };

    setRooms((prev) => [newRoom, ...prev]);
    setActiveRoom(newRoom);
    setCurrentView('waiting');

    createRoomOnServer(newRoom).catch(() => {});
  };

  // Join existing room
  const handleJoinRoom = (room: GameRoom) => {
    const userRealm = getRealmByLevel(user.realmLevel);

    // If room is already in progress -> enter as spectator/game
    if (room.status === 'playing') {
      setActiveRoom(room);
      setCurrentView('game');
      return;
    }

    const joiningPlayer: GamePlayer = {
      id: user.id,
      name: user.daoName,
      title: 'Đạo Hữu Khiêu Chiến',
      realm: userRealm.name,
      realmLevel: user.realmLevel,
      elo: user.elo,
      avatarUrl: user.avatarUrl,
      frameColor: userRealm.glowColor,
      side: room.players.red ? 'black' : 'red',
      timeLeft: room.timeLimit * 60,
      isAi: false,
    };

    // Join waiting room as black if empty
    const updatedRoom: GameRoom = {
      ...room,
      players: {
        ...room.players,
        [joiningPlayer.side]: room.players[joiningPlayer.side] || joiningPlayer,
      },
    };

    setActiveRoom(updatedRoom);
    setCurrentView('waiting');

    joinRoomOnServer(room.id, joiningPlayer).catch(() => {});
  };

  // Direct AI Challenge from Lobby
  const handleChallengeAi = (rival: AiCultivator) => {
    const userRealm = getRealmByLevel(user.realmLevel);
    const newRoom: GameRoom = {
      id: 'ai_duel_' + Date.now(),
      name: `Tầm Đạo: ${user.daoName} vs ${rival.name}`,
      hostId: user.id,
      hostName: user.daoName,
      hostRealm: userRealm.name,
      hostElo: user.elo,
      timeLimit: 10,
      increment: 5,
      isRanked: true,
      status: 'playing',
      players: {
        red: {
          id: user.id,
          name: user.daoName,
          title: 'Đạo Hữu',
          realm: userRealm.name,
          realmLevel: user.realmLevel,
          elo: user.elo,
          avatarUrl: user.avatarUrl,
          frameColor: userRealm.glowColor,
          side: 'red',
          timeLeft: 600,
        },
        black: {
          id: rival.id,
          name: rival.name,
          title: rival.title,
          realm: rival.realm,
          realmLevel: rival.realmLevel,
          elo: rival.elo,
          avatarUrl: rival.avatarUrl,
          frameColor: rival.frameColor,
          side: 'black',
          isAi: true,
          timeLeft: 600,
        },
      },
      spectatorCount: 3,
      createdAt: Date.now(),
    };

    setActiveRoom(newRoom);
    setCurrentView('game');
  };

  // Start Match vs Bot with selected difficulty and preferences
  const handleStartBotMatch = (config: BotMatchConfig) => {
    setShowBotMatch(false);
    const userRealm = getRealmByLevel(user.realmLevel);
    const botPreset = config.difficulty;

    const playerSide: Side =
      config.playerSide === 'random'
        ? Math.random() < 0.5
          ? 'red'
          : 'black'
        : config.playerSide;
    const botSide: Side = playerSide === 'red' ? 'black' : 'red';

    const playerTime = config.timeLimit === 0 ? 0 : config.timeLimit * 60;

    const userPlayer: GamePlayer = {
      id: user.id,
      name: user.daoName,
      title: 'Đạo Hữu',
      realm: userRealm.name,
      realmLevel: user.realmLevel,
      elo: user.elo,
      avatarUrl: user.avatarUrl,
      frameColor: userRealm.glowColor,
      side: playerSide,
      timeLeft: playerTime,
    };

    const botRival = botPreset.botRival;

    const botPlayer: GamePlayer = {
      id: botRival.id,
      name: `${botRival.name} (${botPreset.name})`,
      title: botRival.title,
      realm: botRival.realm,
      realmLevel: botRival.realmLevel,
      elo: botPreset.elo,
      avatarUrl: botRival.avatarUrl,
      frameColor: botPreset.color,
      side: botSide,
      isAi: true,
      aiDifficultyLevel: botPreset.level,
      timeLeft: playerTime,
    };

    const newRoom: GameRoom = {
      id: 'bot_match_' + Date.now(),
      name: `Luận Đạo Bot: ${user.daoName} vs ${botPreset.name} (Cấp ${botPreset.level})`,
      hostId: user.id,
      hostName: user.daoName,
      hostRealm: userRealm.name,
      hostElo: user.elo,
      timeLimit: config.timeLimit,
      increment: config.increment,
      isRanked: false,
      status: 'playing',
      players: {
        red: playerSide === 'red' ? userPlayer : botPlayer,
        black: playerSide === 'black' ? userPlayer : botPlayer,
      },
      spectatorCount: 0,
      createdAt: Date.now(),
    };

    setActiveRoom(newRoom);
    setCurrentView('game');
  };

  // In Waiting Room: Swap seats (Red vs Black)
  const handleSwapSide = () => {
    if (!activeRoom) return;
    const { red, black } = activeRoom.players;
    const swapped: GameRoom = {
      ...activeRoom,
      players: {
        red: black ? { ...black, side: 'red' } : undefined,
        black: red ? { ...red, side: 'black' } : undefined,
      },
    };
    setActiveRoom(swapped);
  };

  // In Waiting Room: Add AI Bot to empty black seat
  const handleAddAiBot = () => {
    if (!activeRoom) return;
    const botPlayer: GamePlayer = {
      id: 'ai_bot_match',
      name: 'Thanh Phong Trưởng Lão',
      title: 'Bạch Vân Kỳ Sĩ',
      realm: 'Trúc Cơ Kỳ',
      realmLevel: 2,
      elo: 1350,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      frameColor: '#06b6d4',
      side: 'black',
      isAi: true,
      timeLeft: activeRoom.timeLimit * 60,
    };

    setActiveRoom({
      ...activeRoom,
      players: {
        ...activeRoom.players,
        black: botPlayer,
      },
    });
  };

  // Start game from Waiting Room
  const handleStartGameFromWaitingRoom = () => {
    if (!activeRoom) return;
    setActiveRoom({
      ...activeRoom,
      status: 'playing',
    });
    setCurrentView('game');
  };

  // Game Ended (Result updates ELO, Tu Vi Exp, Linh Thach)
  const handleGameEnd = (result: {
    winnerSide: Side | 'draw';
    eloChange: number;
    expGained: number;
    spiritStonesGained: number;
  }) => {
    const isWin =
      (result.winnerSide === 'red' && activeRoom?.players.red?.id === user.id) ||
      (result.winnerSide === 'black' && activeRoom?.players.black?.id === user.id);
    const isDraw = result.winnerSide === 'draw';

    const currentStats = user.stats || {
      totalMatches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      winStreak: 0,
      maxWinStreak: 0,
      highestElo: user.elo || 1200,
    };

    const newWins = (currentStats.wins || 0) + (isWin ? 1 : 0);
    const newDraws = (currentStats.draws || 0) + (isDraw ? 1 : 0);
    const newLosses = (currentStats.losses || 0) + (!isWin && !isDraw ? 1 : 0);
    const newStreak = isWin ? (currentStats.winStreak || 0) + 1 : 0;
    const newMaxStreak = Math.max(currentStats.maxWinStreak || 0, newStreak);
    const newElo = Math.max(1000, (user.elo || 1200) + result.eloChange);
    const newHighestElo = Math.max(currentStats.highestElo || newElo, newElo);

    handleUpdateUser({
      elo: newElo,
      exp: (user.exp || 0) + result.expGained,
      spiritStones: (user.spiritStones || 0) + result.spiritStonesGained,
      stats: {
        totalMatches: (currentStats.totalMatches || 0) + 1,
        wins: newWins,
        draws: newDraws,
        losses: newLosses,
        winStreak: newStreak,
        maxWinStreak: newMaxStreak,
        highestElo: newHighestElo,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30">
      {/* Top Navbar */}
      <Navbar
        user={user}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenProfile={() => setShowProfile(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenPatchNotes={() => setShowPatchNotes(true)}
        onOpenAuth={() => setShowAuth(true)}
        onLogout={handleOpenLogout}
        onOpenShop={() => setShowShop(true)}
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenBotMatch={() => setShowBotMatch(true)}
        onReturnToLobby={() => setCurrentView('lobby')}
        inGame={currentView !== 'lobby'}
        onlineCount={onlineCount}
        onOpenOnlineUsers={() => setShowOnlineUsers(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {currentView === 'lobby' && (
          <LobbyView
            user={user}
            rooms={rooms}
            onlineCount={onlineCount}
            chatMessages={chatMessages}
            onlineAccountsList={onlineUsersList}
            onSendChatMessage={(text) => {
              sendWorldChat(user, text).catch(() => {});
            }}
            onStartMatchmaking={handleStartMatchmaking}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onChallengeAi={handleChallengeAi}
            onOpenBotMatch={() => setShowBotMatch(true)}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenProfile={() => setShowProfile(true)}
            onViewUserProfile={(target) => setViewingProfileUser(target)}
            onOpenPatchNotes={() => setShowPatchNotes(true)}
            onOpenShop={() => setShowShop(true)}
            onOpenAdmin={() => setShowAdmin(true)}
            onOpenAuth={() => setShowAuth(true)}
            onLogout={handleOpenLogout}
            onOpenOnlineUsers={() => setShowOnlineUsers(true)}
          />
        )}

        {currentView === 'waiting' && activeRoom && (
          <WaitingRoomView
            room={activeRoom}
            currentUser={user}
            onStartGame={handleStartGameFromWaitingRoom}
            onLeaveRoom={() => setCurrentView('lobby')}
            onSwapSide={handleSwapSide}
            onAddAiBot={handleAddAiBot}
          />
        )}

        {currentView === 'game' && activeRoom && (
          <GameView
            room={activeRoom}
            currentUser={user}
            onGameEnd={handleGameEnd}
            onReturnToLobby={() => setCurrentView('lobby')}
          />
        )}
      </main>

      {/* Modals */}
      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdateUser={handleUpdateUser}
          onOpenShop={() => setShowShop(true)}
          onLogout={handleOpenLogout}
        />
      )}

      {/* Public Profile View (Inspect Other Cultivators) */}
      {viewingProfileUser && (
        <ProfileModal
          user={viewingProfileUser}
          onClose={() => setViewingProfileUser(null)}
          onUpdateUser={() => {}}
          isReadOnly={viewingProfileUser.id !== user.id}
          onChallengePlayer={(target) => {
            setViewingProfileUser(null);
            handleStartDirectMatch(target);
          }}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          currentUser={user}
          onClose={() => setShowLeaderboard(false)}
          onViewProfile={(targetAcc) => {
            setShowLeaderboard(false);
            setViewingProfileUser(targetAcc);
          }}
        />
      )}

      {/* Online Cultivators Modal */}
      {showOnlineUsers && (
        <OnlineUsersModal
          currentUser={user}
          onClose={() => setShowOnlineUsers(false)}
          onViewProfile={(targetAcc) => {
            setShowOnlineUsers(false);
            setViewingProfileUser(targetAcc);
          }}
          onChallengePlayer={(targetAcc) => {
            setShowOnlineUsers(false);
            handleStartDirectMatch(targetAcc);
          }}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          currentUser={user}
          required={user.isGuest}
          onClose={() => {
            if (!user.isGuest) {
              setShowAuth(false);
            }
          }}
          onSwitchAccount={(acc) => {
            setUser(acc);
            setShowAuth(false);
            setToast({
              type: 'success',
              message: `Đã chuyển sang tài khoản ${acc.daoName} (@${acc.username}).`,
            });
          }}
          onRegisterAccount={(newAcc) => {
            setUser(newAcc);
            setShowAuth(false);
            setToast({
              type: 'success',
              message: `Chúc mừng đạo hữu ${newAcc.daoName} đã nhập môn thành công!`,
            });
          }}
          onLogout={handleOpenLogout}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogout && (
        <LogoutModal
          user={user}
          inGame={currentView !== 'lobby'}
          onClose={() => setShowLogout(false)}
          onConfirmLogout={handleConfirmLogout}
          onSwitchAccount={() => {
            setShowLogout(false);
            setShowAuth(true);
          }}
        />
      )}

      {showPatchNotes && (
        <PatchNotesModal onClose={() => setShowPatchNotes(false)} />
      )}

      {showMatchmaking && (
        <MatchmakingModal
          user={user}
          onMatchFound={handleMatchFound}
          onCancel={() => setShowMatchmaking(false)}
        />
      )}

      {/* Bot Match Difficulty & Mode Modal */}
      {showBotMatch && (
        <BotMatchModal
          user={user}
          onClose={() => setShowBotMatch(false)}
          onStartBotMatch={handleStartBotMatch}
        />
      )}

      {/* Tiên Các Shop Modal (Mua Khung Viền & Pháp Tướng bằng Linh Thạch) */}
      {showShop && (
        <ShopModal
          user={user}
          onClose={() => setShowShop(false)}
          onUpdateUser={handleUpdateUser}
          onOpenAdmin={() => {
            setShowShop(false);
            setShowAdmin(true);
          }}
        />
      )}

      {/* Admin Management Modal (Quản Trị Viên: Sửa User, Xem Online, Ban/Kick, Thêm Khung/Pháp Tướng Vào Shop) */}
      {showAdmin && (
        <AdminModal
          currentUser={user}
          onClose={() => setShowAdmin(false)}
          onAccountUpdated={() => {
            setUser(loadUserProfile());
          }}
        />
      )}

      {/* Floating System Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100%-2.5rem)] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div
            className={`p-3.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 ${
              toast.type === 'warning'
                ? 'bg-amber-950/95 border-amber-500/60 text-amber-200 shadow-amber-950/60'
                : toast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-200 shadow-emerald-950/60'
                : 'bg-slate-900/95 border-cyan-500/50 text-slate-200 shadow-slate-950/80'
            }`}
          >
            {toast.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs leading-relaxed font-medium">
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
