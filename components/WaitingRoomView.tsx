'use client';

import { useState, useEffect } from 'react';
import { Swords, ArrowLeftRight, Play, UserPlus, Bot, Shield, Clock, Copy, Check, ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { GamePlayer, GameRoom, Side } from '../lib/xiangqi/types';
import { UserAccount } from '../lib/storage/userStore';
import { getRealmByLevel } from '../lib/cultivation/realms';
import { AI_CULTIVATOR_RIVALS } from '../lib/xiangqi/ai';
import { syncRoomState, startRoomOnServer, subscribeRealtimeStream } from '../lib/multiplayer/multiplayerClient';
import AvatarWithFrame from './AvatarWithFrame';

interface WaitingRoomViewProps {
  room: GameRoom;
  currentUser: UserAccount;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onSwapSide: () => void;
  onAddAiBot: () => void;
}

export default function WaitingRoomView({
  room,
  currentUser,
  onStartGame,
  onLeaveRoom,
  onSwapSide,
  onAddAiBot,
}: WaitingRoomViewProps) {
  const [liveRoom, setLiveRoom] = useState<GameRoom>(room);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([
    {
      sender: 'Hệ Thống',
      text: `Tiên Bàn [${room.name}] đã thiết lập. Đang chờ đạo hữu nhập tịch.`,
      time: 'Vừa xong',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isReady, setIsReady] = useState(false);

  // Real-time SSE stream subscription for instant room updates (join, leave, swap, start)
  useEffect(() => {
    const unsub = subscribeRealtimeStream((event) => {
      if (event.type === 'room_update' && event.data.roomId === room.id) {
        setLiveRoom(event.data.state.room);
        if (event.data.state.room.status === 'playing') {
          onStartGame();
        }
      }
    });

    return () => unsub();
  }, [room.id, onStartGame]);

  // Fallback poll room state periodically from server
  useEffect(() => {
    let active = true;
    const poll = async () => {
      if (!room.id) return;
      const state = await syncRoomState(room.id);
      if (active && state && state.room) {
        setLiveRoom(state.room);
        if (state.room.status === 'playing') {
          onStartGame();
        }
      }
    };
    poll();
    const timer = setInterval(poll, 1500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [room.id, onStartGame]);

  const redPlayer = liveRoom.players.red;
  const blackPlayer = liveRoom.players.black;

  const isHost = liveRoom.hostId === currentUser.id;
  const isPlayerInRoom = (redPlayer?.id === currentUser.id) || (blackPlayer?.id === currentUser.id);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        sender: currentUser.daoName,
        text: chatInput.trim(),
        time: 'Vừa xong',
      },
    ]);
    setChatInput('');
  };

  const canStart = Boolean(redPlayer && blackPlayer);

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 font-xianxia text-emerald-100">
      {/* Top Navigation & Room Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-[0_0_40px_rgba(4,28,24,0.8)]">
        <div className="flex items-center gap-3">
          <button
            onClick={onLeaveRoom}
            className="p-2 rounded-xl bg-[#021310] hover:bg-[#062420] text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
            title="Rời phòng về sảnh"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white text-glow-jade">{room.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-teal-300 border border-emerald-500/40 font-mono">
                Phòng Chờ
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-emerald-300/70 mt-1">
              <span className="flex items-center gap-1 text-teal-300 font-sans">
                <Clock className="w-3.5 h-3.5" />
                {room.timeLimit} phút + {room.increment}s
              </span>
              <span>•</span>
              <span className="text-amber-300">{room.isRanked ? 'Xếp Hạng ELO' : 'Giao Hữu'}</span>
              <span>•</span>
              <span>Mã Bàn: <span className="font-mono text-white">{room.id}</span></span>
            </div>
          </div>
        </div>

        {/* Invite / Share button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="px-3.5 py-2 rounded-xl bg-[#031815] hover:bg-[#062822] text-teal-200 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã Sao Chép Mã' : 'Mời Đạo Hữu'}</span>
          </button>
        </div>
      </div>

      {/* Two Seats: Red (Tiên Thủ) vs Black (Hậu Thủ) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Red Seat (Tiên Thủ / Quân Đỏ) */}
        <div className="rounded-2xl border-2 border-rose-500/40 bg-gradient-to-b from-rose-950/20 via-[#041d1a] to-[#021310] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[260px]">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.8)]" />
              <h3 className="font-bold text-rose-300 text-sm tracking-wide">TIÊN THỦ (HỒNG QUÂN)</h3>
            </div>
            <span className="text-xs text-rose-400/80 font-mono">Đi Trước</span>
          </div>

          {redPlayer ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {/* Glowing Avatar With Frame */}
                <div className="shrink-0 transition-transform hover:scale-105">
                  <AvatarWithFrame
                    avatarUrl={redPlayer.avatarUrl}
                    daoName={redPlayer.name}
                    realmLevel={redPlayer.realmLevel}
                    frameId={redPlayer.selectedFrameId}
                    size="lg"
                  />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                    {redPlayer.name}
                    {redPlayer.isAi && <Bot className="w-3.5 h-3.5 text-teal-300" />}
                  </h4>
                  <p className="text-xs text-amber-300 font-medium">{redPlayer.title}</p>
                  <p className="text-xs text-rose-300 font-mono mt-0.5">
                    {redPlayer.realm} • {redPlayer.elo} ELO
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/20 text-xs text-rose-200/90 flex items-center justify-between">
                <span>Trạng thái vị trí:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Sẵn Sàng
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-rose-500/40 flex items-center justify-center text-rose-400">
                <UserPlus className="w-6 h-6" />
              </div>
              <p className="text-xs text-emerald-300/60">Tiên tọa trống, đang đợi đạo hữu nhập tịch...</p>
            </div>
          )}

          {/* Seat footer actions */}
          <div className="mt-4 pt-3 border-t border-rose-500/10 flex items-center justify-between">
            <span className="text-[11px] text-emerald-400/60 font-mono">Bàn Cờ Tiên Giới</span>
          </div>
        </div>

        {/* Black Seat (Hậu Thủ / Quân Đen) */}
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-[#041d1a] to-[#021310] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[260px]">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-teal-600 shadow-[0_0_10px_rgba(13,148,136,0.8)]" />
              <h3 className="font-bold text-teal-300 text-sm tracking-wide">HẬU THỦ (HẮC QUÂN)</h3>
            </div>
            <span className="text-xs text-teal-400/80 font-mono">Đi Sau</span>
          </div>

          {blackPlayer ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {/* Glowing Avatar With Frame */}
                <div className="shrink-0 transition-transform hover:scale-105">
                  <AvatarWithFrame
                    avatarUrl={blackPlayer.avatarUrl}
                    daoName={blackPlayer.name}
                    realmLevel={blackPlayer.realmLevel}
                    frameId={blackPlayer.selectedFrameId}
                    size="lg"
                  />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                    {blackPlayer.name}
                    {blackPlayer.isAi && <Bot className="w-3.5 h-3.5 text-teal-300" />}
                  </h4>
                  <p className="text-xs text-amber-300 font-medium">{blackPlayer.title}</p>
                  <p className="text-xs text-teal-300 font-mono mt-0.5">
                    {blackPlayer.realm} • {blackPlayer.elo} ELO
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#031815] border border-emerald-500/20 text-xs text-teal-200/90 flex items-center justify-between">
                <span>Trạng thái vị trí:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Sẵn Sàng
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-500/40 flex items-center justify-center text-teal-400">
                <UserPlus className="w-6 h-6" />
              </div>
              <p className="text-xs text-emerald-300/60">Tiên tọa trống, đang đợi đối thủ gia nhập...</p>
              {/* Button to invite AI Bot */}
              <button
                onClick={onAddAiBot}
                className="px-4 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-teal-200 text-xs font-semibold flex items-center gap-2 shadow cursor-pointer"
              >
                <Bot className="w-4 h-4 text-teal-400" />
                <span>Mời Tiên Nhân AI Ghép Bàn</span>
              </button>
            </div>
          )}

          {/* Seat footer actions */}
          <div className="mt-4 pt-3 border-t border-emerald-500/10 flex items-center justify-between">
            <span className="text-[11px] text-emerald-400/60 font-mono">Bàn Cờ Tiên Giới</span>
          </div>
        </div>
      </div>

      {/* Control Action Bar & In-Room Chat */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Actions (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#082a25] to-[#041d1a] border border-emerald-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-400" />
              <span>Thao Tác Bàn Cờ</span>
            </h4>
            <p className="text-xs text-emerald-300/70">
              Hai bên đều đã vào vị trí, bấm &ldquo;Bắt Đầu Luận Đạo&rdquo; để khai chiến. Tính năng cân bằng đảm bảo công bằng tuyệt đối.
            </p>
          </div>

          <div className="space-y-2.5">
            {/* Swap side button */}
            <button
              onClick={onSwapSide}
              className="w-full py-2.5 rounded-xl bg-[#021310] hover:bg-[#062420] text-emerald-200 border border-emerald-500/30 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4 text-teal-300" />
              <span>Đổi Phe (Hồng Quân ⇄ Hắc Quân)</span>
            </button>

            {/* Start Game button */}
            <button
              onClick={async () => {
                if (room.id) {
                  await startRoomOnServer(room.id);
                }
                onStartGame();
              }}
              disabled={!canStart}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer ${
                canStart
                  ? 'jade-button-primary text-white shadow-emerald-950/60'
                  : 'bg-[#021310] text-emerald-500/40 cursor-not-allowed border border-emerald-900/40'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{canStart ? 'Khai Bàn Luận Đạo (Bắt Đầu)' : 'Đang Chờ Đủ 2 Đạo Hữu...'}</span>
            </button>
          </div>
        </div>

        {/* Room Chat (7 cols) */}
        <div className="md:col-span-7 bg-gradient-to-b from-[#082a25] to-[#041d1a] border border-emerald-500/30 rounded-2xl p-4 flex flex-col h-[260px] justify-between">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20 text-xs font-semibold text-teal-300">
            <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
            <span>Đàm Đạo Phòng Chờ</span>
          </div>

          <div className="flex-1 overflow-y-auto py-2.5 space-y-2 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className="bg-[#021310]/70 border border-emerald-500/10 rounded-lg p-2 space-y-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-teal-300">{m.sender}</span>
                  <span className="text-emerald-400/50 font-sans">{m.time}</span>
                </div>
                <p className="text-emerald-100 text-xs leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-emerald-500/20">
            <input
              type="text"
              placeholder="Gửi lời chào trước trận chiến..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-[#021310] border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-emerald-400/40 focus:outline-none focus:border-teal-400"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
