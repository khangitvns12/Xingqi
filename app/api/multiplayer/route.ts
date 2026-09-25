import { NextRequest, NextResponse } from 'next/server';
import {
  recordHeartbeat,
  getActiveOnlineUsers,
  addWorldChatMessage,
  getWorldChatMessages,
  getAllServerRooms,
  createServerRoom,
  getServerRoomState,
  joinServerRoom,
  startServerGame,
  makeServerMove,
  resignServerGame,
  offerServerDraw,
  acceptServerDraw,
  leaveServerRoom,
} from '@/lib/server/multiplayerStore';
import { loadServerCloudStore, upsertAccountInServer } from '@/lib/server/cloudStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'lobby_sync';

  try {
    if (action === 'room_sync') {
      const roomId = searchParams.get('roomId');
      if (!roomId) {
        return NextResponse.json({ success: false, error: 'Thiếu roomId' }, { status: 400 });
      }
      const state = getServerRoomState(roomId);
      return NextResponse.json({
        success: true,
        state,
      });
    }

    if (action === 'get_session') {
      return NextResponse.json({
        success: true,
        account: null,
      });
    }

    // Default: lobby_sync
    const onlineUsers = getActiveOnlineUsers();
    const rooms = getAllServerRooms();
    const chatMessages = getWorldChatMessages();

    return NextResponse.json({
      success: true,
      onlineUsers,
      rooms,
      chatMessages,
      sessionAccount: null,
    });
  } catch (err: any) {
    console.error('[Multiplayer API] GET Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'HEARTBEAT') {
      const { user, status, roomId } = body;
      if (user && user.id) {
        recordHeartbeat(user, status || 'lobby', roomId);
      }
      return NextResponse.json({
        success: true,
        onlineUsers: getActiveOnlineUsers(),
      });
    }

    if (action === 'SET_SESSION') {
      return NextResponse.json({ success: true });
    }

    if (action === 'SEND_CHAT') {
      const { sender, realm, title, avatarUrl, frameId, message } = body;
      if (!message || !message.trim()) {
        return NextResponse.json({ success: false, error: 'Nội dung tin nhắn trống' }, { status: 400 });
      }

      const newMsg = addWorldChatMessage({
        sender: sender || 'Vô Danh Tu Sĩ',
        realm: realm || 'Phàm Nhân',
        title: title || 'Kỳ Đạo Đạo Đồng',
        avatarUrl: avatarUrl || '',
        frameId: frameId || '',
        message: message.trim(),
      });

      return NextResponse.json({
        success: true,
        message: newMsg,
        chatMessages: getWorldChatMessages(),
      });
    }

    if (action === 'CREATE_ROOM') {
      const { room } = body;
      if (!room || !room.id) {
        return NextResponse.json({ success: false, error: 'Dữ liệu phòng không hợp lệ' }, { status: 400 });
      }
      const state = createServerRoom(room);
      return NextResponse.json({ success: true, state });
    }

    if (action === 'JOIN_ROOM') {
      const { roomId, player } = body;
      if (!roomId || !player) {
        return NextResponse.json({ success: false, error: 'Thiếu thông tin vào phòng' }, { status: 400 });
      }
      const state = joinServerRoom(roomId, player);
      if (!state) {
        return NextResponse.json({ success: false, error: 'Phòng không tồn tại hoặc đã bị hủy' }, { status: 404 });
      }
      return NextResponse.json({ success: true, state });
    }

    if (action === 'START_GAME') {
      const { roomId } = body;
      const state = startServerGame(roomId);
      if (!state) {
        return NextResponse.json({ success: false, error: 'Phòng không tồn tại' }, { status: 404 });
      }
      return NextResponse.json({ success: true, state });
    }

    if (action === 'MAKE_MOVE') {
      const { roomId, from, to, piece, notation, side, redTime, blackTime, captured, skillFx } = body;
      const state = makeServerMove(roomId, {
        from,
        to,
        piece,
        notation,
        side,
        redTime,
        blackTime,
        captured,
        skillFx,
      });

      if (!state) {
        return NextResponse.json({ success: false, error: 'Nước đi không hợp lệ hoặc ván đấu đã kết thúc' }, { status: 400 });
      }

      return NextResponse.json({ success: true, state });
    }

    if (action === 'RESIGN') {
      const { roomId, side } = body;
      const state = resignServerGame(roomId, side);
      return NextResponse.json({ success: true, state });
    }

    if (action === 'OFFER_DRAW') {
      const { roomId, side } = body;
      const state = offerServerDraw(roomId, side);
      return NextResponse.json({ success: true, state });
    }

    if (action === 'ACCEPT_DRAW') {
      const { roomId } = body;
      const state = acceptServerDraw(roomId);
      return NextResponse.json({ success: true, state });
    }

    if (action === 'LEAVE_ROOM') {
      const { roomId, userId } = body;
      leaveServerRoom(roomId, userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Hành động không xác định' }, { status: 400 });
  } catch (err: any) {
    console.error('[Multiplayer API] POST Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
