import { NextRequest } from 'next/server';
import {
  subscribeRealtimeEvents,
  getActiveOnlineUsers,
  getAllServerRooms,
  getWorldChatMessages,
  RealtimeEvent,
} from '@/lib/server/multiplayerStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Gửi dữ liệu khởi tạo ban đầu cho client ngay khi kết nối
      const initialPayload: RealtimeEvent = {
        type: 'lobby_sync',
        data: {
          onlineUsers: getActiveOnlineUsers(),
          rooms: getAllServerRooms(),
          chatMessages: getWorldChatMessages(),
        },
      };

      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialPayload)}\n\n`));
      } catch {
        // client closed immediately
      }

      // 2. Đăng ký nhận mọi sự kiện thời gian thực từ multiplayerStore
      const unsubscribe = subscribeRealtimeEvents((event: RealtimeEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // stream might be closed
        }
      });

      // 3. Heartbeat định kỳ 15 giây để duy trì kết nối HTTP keep-alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`));
        } catch {
          clearInterval(pingInterval);
          unsubscribe();
        }
      }, 15000);

      // 4. Dọn dẹp khi client ngắt kết nối
      req.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform, must-revalidate',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Vô hiệu hóa đệm Nginx/Proxy để truyền tin tức thì
    },
  });
}
