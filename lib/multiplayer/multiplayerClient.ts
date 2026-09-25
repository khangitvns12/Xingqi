import { UserAccount } from '../storage/userStore';
import { GamePlayer, GameRoom, Move, BoardState, Side, Position } from '../xiangqi/types';
import { ChatMessage, ServerGameRoomState, RealtimeEvent } from '../server/multiplayerStore';
import { getRealmByLevel, DAOIST_TITLES } from '../cultivation/realms';

export type { ChatMessage, ServerGameRoomState, RealtimeEvent };

export interface LobbySyncResult {
  onlineUsers: UserAccount[];
  rooms: GameRoom[];
  chatMessages: ChatMessage[];
  sessionAccount: UserAccount | null;
}

type RealtimeListener = (event: RealtimeEvent) => void;
const clientSubscribers = new Set<RealtimeListener>();
let activeEventSource: EventSource | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

export function subscribeRealtimeStream(listener: RealtimeListener): () => void {
  clientSubscribers.add(listener);

  if (typeof window !== 'undefined' && !activeEventSource) {
    initEventSource();
  }

  return () => {
    clientSubscribers.delete(listener);
    if (clientSubscribers.size === 0 && activeEventSource) {
      activeEventSource.close();
      activeEventSource = null;
    }
  };
}

function initEventSource() {
  if (typeof window === 'undefined') return;
  if (activeEventSource) {
    try {
      activeEventSource.close();
    } catch {
      // ignore
    }
  }

  try {
    const es = new EventSource('/api/multiplayer/stream');
    activeEventSource = es;

    es.onmessage = (e) => {
      try {
        if (!e.data || e.data.startsWith(':')) return;
        const parsed = JSON.parse(e.data) as RealtimeEvent;
        if (parsed && parsed.type) {
          clientSubscribers.forEach((fn) => {
            try {
              fn(parsed);
            } catch {
              // ignore
            }
          });
        }
      } catch {
        // ignore parse error
      }
    };

    es.onerror = () => {
      es.close();
      activeEventSource = null;
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          if (clientSubscribers.size > 0) {
            initEventSource();
          }
        }, 3000);
      }
    };
  } catch {
    // EventSource fallback
  }
}

export async function syncLobbyData(user?: UserAccount): Promise<LobbySyncResult | null> {
  try {
    const params = new URLSearchParams();
    params.set('action', 'lobby_sync');
    if (user && user.id && !user.isGuest) {
      params.set('userId', user.id);
    }

    const res = await fetch(`/api/multiplayer?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success) return null;

    // Send heartbeat in background if user is active
    if (user && user.id && !user.isGuest) {
      fetch('/api/multiplayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'HEARTBEAT',
          user,
          status: 'lobby',
        }),
      }).catch(() => {});
    }

    return {
      onlineUsers: data.onlineUsers || [],
      rooms: data.rooms || [],
      chatMessages: data.chatMessages || [],
      sessionAccount: null,
    };
  } catch {
    return null;
  }
}

export async function sendWorldChat(user: UserAccount, message: string): Promise<ChatMessage | null> {
  try {
    const realm = getRealmByLevel(user.realmLevel).name;
    const title = DAOIST_TITLES.find((t) => t.id === user.selectedTitleId)?.name || 'Kỳ Đạo Đạo Đồng';

    const res = await fetch('/api/multiplayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SEND_CHAT',
        sender: user.daoName,
        realm,
        title,
        avatarUrl: user.avatarUrl,
        frameId: user.selectedFrameId || '',
        message,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.message || null;
  } catch {
    return null;
  }
}

export async function createRoomOnServer(room: GameRoom): Promise<ServerGameRoomState | null> {
  try {
    const res = await fetch('/api/multiplayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CREATE_ROOM',
        room,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.state || null;
  } catch {
    return null;
  }
}

export async function joinRoomOnServer(roomId: string, player: GamePlayer): Promise<ServerGameRoomState | null> {
  try {
    const res = await fetch('/api/multiplayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'JOIN_ROOM',
        roomId,
        player,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.state || null;
  } catch {
    return null;
  }
}

export async function startRoomOnServer(roomId: string): Promise<ServerGameRoomState | null> {
  try {
    const res = await fetch('/api/multiplayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'START_GAME',
        roomId,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.state || null;
  } catch {
    return null;
  }
}

export async function syncRoomState(roomId: string): Promise<ServerGameRoomState | null> {
  try {
    const res = await fetch(`/api/multiplayer?action=room_sync&roomId=${encodeURIComponent(roomId)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.state || null;
  } catch {
    return null;
  }
}

export async function submitMoveToServer(
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
): Promise<ServerGameRoomState | null> {
  try {
    const res = await fetch('/api/multiplayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'MAKE_MOVE',
        roomId,
        ...params,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.state || null;
  } catch {
    return null;
  }
}

export async function resignGameOnServer(roomId: string, side: Side): Promise<ServerGameRoomState | null> {
  try {
    const res = await fetch('/api/multiplayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'RESIGN',
        roomId,
        side,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.state || null;
  } catch {
    return null;
  }
}

export async function offerDrawOnServer(roomId: string, side: Side): Promise<ServerGameRoomState | null> {
  try {
    const res = await fetch('/api/multiplayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'OFFER_DRAW',
        roomId,
        side,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.state || null;
  } catch {
    return null;
  }
}

export async function acceptDrawOnServer(roomId: string): Promise<ServerGameRoomState | null> {
  try {
    const res = await fetch('/api/multiplayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ACCEPT_DRAW',
        roomId,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.state || null;
  } catch {
    return null;
  }
}

export async function leaveRoomOnServer(roomId: string, userId: string): Promise<boolean> {
  try {
    await fetch('/api/multiplayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'LEAVE_ROOM',
        roomId,
        userId,
      }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function getSessionAccount(): Promise<UserAccount | null> {
  try {
    const res = await fetch('/api/multiplayer?action=get_session', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.account || null;
  } catch {
    return null;
  }
}
