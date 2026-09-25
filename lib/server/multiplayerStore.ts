import fs from 'fs';
import path from 'path';
import { UserAccount, sanitizeUserAccount, BOT_USER_IDS } from '../storage/userTypes';
import { GamePlayer, GameRoom, Move, BoardState, Side, Position } from '../xiangqi/types';
import { INITIAL_BOARD, cloneBoard, getPieceNameVi, getSkillTypeForPiece } from '../xiangqi/rules';
import { loadServerCloudStore, upsertAccountInServer, saveServerCloudStore } from './cloudStore';

export interface ChatMessage {
  id: string;
  sender: string;
  realm: string;
  title: string;
  avatarUrl: string;
  frameId?: string;
  message: string;
  time: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface ServerGameRoomState {
  room: GameRoom;
  board: BoardState;
  currentTurn: Side;
  moveHistory: Move[];
  version: number; // Increments on every move or status change
  redTime: number; // in seconds
  blackTime: number; // in seconds
  lastMoveTimestamp: number;
  drawOfferFrom?: Side;
  gameOver: boolean;
  winner?: Side | 'draw';
  gameOverReason?: string;
  lastActive: number;
}

export interface OnlinePresenceRecord {
  userId: string;
  account: UserAccount;
  lastPing: number;
  status: 'lobby' | 'waiting' | 'playing';
  roomId?: string;
}

export type RealtimeEvent =
  | { type: 'chat'; data: { message: ChatMessage; chatMessages: ChatMessage[] } }
  | { type: 'lobby_sync'; data: { onlineUsers: UserAccount[]; rooms: GameRoom[]; chatMessages: ChatMessage[] } }
  | { type: 'room_update'; data: { roomId: string; state: ServerGameRoomState } }
  | { type: 'room_deleted'; data: { roomId: string } };

type EventListener = (event: RealtimeEvent) => void;
const eventSubscribers = new Set<EventListener>();

export function subscribeRealtimeEvents(listener: EventListener): () => void {
  eventSubscribers.add(listener);
  return () => {
    eventSubscribers.delete(listener);
  };
}

export function broadcastRealtimeEvent(event: RealtimeEvent): void {
  eventSubscribers.forEach((fn) => {
    try {
      fn(event);
    } catch {
      // ignore
    }
  });
}

// In-memory runtime state for real-time multiplayer
const presenceMap = new Map<string, OnlinePresenceRecord>();
const roomMap = new Map<string, ServerGameRoomState>();
let chatMessages: ChatMessage[] = [
  {
    id: 'msg_sys_init',
    sender: 'Hệ Thống Tiên Giới',
    realm: 'Vô Thượng',
    title: 'Thiên Đạo',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    frameId: 'frame_celestial_gold',
    message: 'Chào mừng các vị đạo hữu giá lâm Tiên Kỳ Đạo! Toàn bộ kỳ sĩ trực tuyến có thể đàm đạo và luận kỳ cùng nhau trong thời gian thực.',
    time: 'Vừa xong',
    timestamp: Date.now() - 60000,
    isSystem: true,
  },
];

// Preserved chat file path
const DATA_DIR = path.join(process.cwd(), 'data');
const CHAT_BACKUP_FILE = path.join(DATA_DIR, 'world_chat.json');

// Try loading persisted chat on startup
try {
  if (fs.existsSync(CHAT_BACKUP_FILE)) {
    const raw = fs.readFileSync(CHAT_BACKUP_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      chatMessages = parsed;
    }
  }
} catch {
  // ignore
}

function persistChat(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CHAT_BACKUP_FILE, JSON.stringify(chatMessages.slice(-100), null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

// Cleanup stale sessions (older than 20 seconds)
export function pruneStalePresence(): void {
  const now = Date.now();
  for (const [userId, record] of presenceMap.entries()) {
    if (now - record.lastPing > 20000) {
      presenceMap.delete(userId);
    }
  }

  // Cleanup abandoned rooms (inactive for > 30 minutes)
  for (const [roomId, state] of roomMap.entries()) {
    if (now - state.lastActive > 30 * 60 * 1000) {
      roomMap.delete(roomId);
    }
  }
}

// Record heartbeat from client
export function recordHeartbeat(
  user: UserAccount,
  status: 'lobby' | 'waiting' | 'playing' = 'lobby',
  roomId?: string
): void {
  if (!user || !user.id || user.isGuest) return;
  if (BOT_USER_IDS.has(user.id)) return;

  const now = Date.now();
  const sanitized = sanitizeUserAccount(user);

  presenceMap.set(user.id, {
    userId: user.id,
    account: sanitized,
    lastPing: now,
    status,
    roomId,
  });
}

// Get all users currently online (ping within last 18 seconds)
export function getActiveOnlineUsers(): UserAccount[] {
  pruneStalePresence();
  const now = Date.now();
  const list: UserAccount[] = [];

  for (const record of presenceMap.values()) {
    if (now - record.lastPing <= 18000) {
      list.push({
        ...record.account,
        isOnline: true,
        lastActive: record.lastPing,
      });
    }
  }

  return list;
}

// World Chat
export function addWorldChatMessage(msg: {
  sender: string;
  realm: string;
  title: string;
  avatarUrl: string;
  frameId?: string;
  message: string;
  isSystem?: boolean;
}): ChatMessage {
  const now = Date.now();
  const newMsg: ChatMessage = {
    id: 'msg_' + now + '_' + Math.random().toString(36).substring(2, 6),
    sender: msg.sender,
    realm: msg.realm,
    title: msg.title,
    avatarUrl: msg.avatarUrl,
    frameId: msg.frameId || '',
    message: msg.message,
    time: 'Vừa xong',
    timestamp: now,
    isSystem: msg.isSystem,
  };

  chatMessages.push(newMsg);
  if (chatMessages.length > 150) {
    chatMessages = chatMessages.slice(-100);
  }
  persistChat();

  // Phát sóng tin nhắn thời gian thực lập tức tới toàn bộ người dùng
  broadcastRealtimeEvent({
    type: 'chat',
    data: {
      message: newMsg,
      chatMessages: getWorldChatMessages(),
    },
  });

  return newMsg;
}

export function getWorldChatMessages(): ChatMessage[] {
  const now = Date.now();
  return chatMessages.map((m) => {
    const elapsedSec = Math.floor((now - m.timestamp) / 1000);
    let timeStr = 'Vừa xong';
    if (elapsedSec >= 60 && elapsedSec < 3600) {
      timeStr = `${Math.floor(elapsedSec / 60)} phút trước`;
    } else if (elapsedSec >= 3600 && elapsedSec < 86400) {
      timeStr = `${Math.floor(elapsedSec / 3600)} giờ trước`;
    } else if (elapsedSec >= 86400) {
      timeStr = `${Math.floor(elapsedSec / 86400)} ngày trước`;
    }
    return {
      ...m,
      time: timeStr,
    };
  });
}

// Server Game Rooms
export function getAllServerRooms(): GameRoom[] {
  pruneStalePresence();
  return Array.from(roomMap.values()).map((state) => state.room);
}

export function createServerRoom(room: GameRoom): ServerGameRoomState {
  const now = Date.now();
  const timeLimitSeconds = (room.timeLimit || 10) * 60;

  const state: ServerGameRoomState = {
    room: {
      ...room,
      createdAt: now,
    },
    board: cloneBoard(INITIAL_BOARD),
    currentTurn: 'red',
    moveHistory: [],
    version: 1,
    redTime: timeLimitSeconds,
    blackTime: timeLimitSeconds,
    lastMoveTimestamp: now,
    gameOver: false,
    lastActive: now,
  };

  roomMap.set(room.id, state);

  // Phát sóng phòng mới thời gian thực tới sảnh và phòng chơi
  broadcastRealtimeEvent({
    type: 'room_update',
    data: { roomId: room.id, state },
  });
  broadcastRealtimeEvent({
    type: 'lobby_sync',
    data: {
      onlineUsers: getActiveOnlineUsers(),
      rooms: getAllServerRooms(),
      chatMessages: getWorldChatMessages(),
    },
  });

  return state;
}

export function getServerRoomState(roomId: string): ServerGameRoomState | null {
  const state = roomMap.get(roomId);
  if (!state) return null;
  state.lastActive = Date.now();
  return state;
}

export function joinServerRoom(roomId: string, player: GamePlayer): ServerGameRoomState | null {
  const state = roomMap.get(roomId);
  if (!state) return null;

  const currentRed = state.room.players.red;
  const currentBlack = state.room.players.black;

  // If player already in room
  if (currentRed?.id === player.id) {
    state.room.players.red = { ...currentRed, ...player };
  } else if (currentBlack?.id === player.id) {
    state.room.players.black = { ...currentBlack, ...player };
  } else if (!currentRed) {
    state.room.players.red = { ...player, side: 'red' };
  } else if (!currentBlack) {
    state.room.players.black = { ...player, side: 'black' };
  } else {
    // Both sides full -> spectator
    state.room.spectatorCount = (state.room.spectatorCount || 0) + 1;
  }

  state.version += 1;
  state.lastActive = Date.now();

  // Phát sóng cập nhật trạng thái phòng tức thì
  broadcastRealtimeEvent({
    type: 'room_update',
    data: { roomId, state },
  });
  broadcastRealtimeEvent({
    type: 'lobby_sync',
    data: {
      onlineUsers: getActiveOnlineUsers(),
      rooms: getAllServerRooms(),
      chatMessages: getWorldChatMessages(),
    },
  });

  return state;
}

export function startServerGame(roomId: string): ServerGameRoomState | null {
  const state = roomMap.get(roomId);
  if (!state) return null;

  state.room.status = 'playing';
  state.version += 1;
  state.lastActive = Date.now();

  broadcastRealtimeEvent({
    type: 'room_update',
    data: { roomId, state },
  });

  return state;
}

export function makeServerMove(
  roomId: string,
  params: {
    from: Position;
    to: Position;
    piece: any;
    notation: string;
    side: Side;
    redTime?: number;
    blackTime?: number;
    captured?: any;
    skillFx?: any;
  }
): ServerGameRoomState | null {
  const state = roomMap.get(roomId);
  if (!state || state.gameOver) return null;

  const now = Date.now();
  const movingPiece = state.board[params.from.r][params.from.c] || params.piece;
  const targetPiece = state.board[params.to.r][params.to.c];

  // Update board
  const newBoard = cloneBoard(state.board);
  newBoard[params.to.r][params.to.c] = movingPiece;
  newBoard[params.from.r][params.from.c] = null;
  state.board = newBoard;

  const moveRecord: Move = {
    from: params.from,
    to: params.to,
    piece: movingPiece,
    captured: targetPiece || params.captured || null,
    notation: params.notation,
    timestamp: now,
    skillFx: params.skillFx || (targetPiece ? getSkillTypeForPiece(movingPiece.type) : undefined),
  };

  state.moveHistory.push(moveRecord);

  // Switch turn
  state.currentTurn = params.side === 'red' ? 'black' : 'red';

  // Update timers
  if (typeof params.redTime === 'number') state.redTime = params.redTime;
  if (typeof params.blackTime === 'number') state.blackTime = params.blackTime;

  // Add increment
  if (params.side === 'red') {
    state.redTime += state.room.increment || 0;
  } else {
    state.blackTime += state.room.increment || 0;
  }

  // Clear pending draw offers on a move
  state.drawOfferFrom = undefined;

  state.version += 1;
  state.lastMoveTimestamp = now;
  state.lastActive = now;

  // Phát sóng nước đi tức thì (< 30ms) tới đối thủ
  broadcastRealtimeEvent({
    type: 'room_update',
    data: { roomId, state },
  });

  return state;
}

export function resignServerGame(roomId: string, resigningSide: Side): ServerGameRoomState | null {
  const state = roomMap.get(roomId);
  if (!state) return null;

  state.gameOver = true;
  state.winner = resigningSide === 'red' ? 'black' : 'red';
  state.gameOverReason = `${resigningSide === 'red' ? 'Bên Đỏ' : 'Bên Đen'} đã quy hàng nhận thua`;
  state.room.status = 'ended';
  state.version += 1;
  state.lastActive = Date.now();

  broadcastRealtimeEvent({
    type: 'room_update',
    data: { roomId, state },
  });

  return state;
}

export function offerServerDraw(roomId: string, side: Side): ServerGameRoomState | null {
  const state = roomMap.get(roomId);
  if (!state) return null;

  state.drawOfferFrom = side;
  state.version += 1;
  state.lastActive = Date.now();

  broadcastRealtimeEvent({
    type: 'room_update',
    data: { roomId, state },
  });

  return state;
}

export function acceptServerDraw(roomId: string): ServerGameRoomState | null {
  const state = roomMap.get(roomId);
  if (!state) return null;

  state.gameOver = true;
  state.winner = 'draw';
  state.gameOverReason = 'Hai bên đồng thuận thủ hòa';
  state.room.status = 'ended';
  state.drawOfferFrom = undefined;
  state.version += 1;
  state.lastActive = Date.now();

  broadcastRealtimeEvent({
    type: 'room_update',
    data: { roomId, state },
  });

  return state;
}

export function leaveServerRoom(roomId: string, userId: string): void {
  const state = roomMap.get(roomId);
  if (!state) return;

  if (state.room.players.red?.id === userId) {
    delete state.room.players.red;
  }
  if (state.room.players.black?.id === userId) {
    delete state.room.players.black;
  }

  // If both players left, remove room
  if (!state.room.players.red && !state.room.players.black) {
    roomMap.delete(roomId);
    broadcastRealtimeEvent({
      type: 'room_deleted',
      data: { roomId },
    });
  } else {
    state.version += 1;
    broadcastRealtimeEvent({
      type: 'room_update',
      data: { roomId, state },
    });
  }

  broadcastRealtimeEvent({
    type: 'lobby_sync',
    data: {
      onlineUsers: getActiveOnlineUsers(),
      rooms: getAllServerRooms(),
      chatMessages: getWorldChatMessages(),
    },
  });
}
