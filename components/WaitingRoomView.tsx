'use client';

import { useState } from 'react';
import { Swords, ArrowLeftRight, Play, UserPlus, Bot, Shield, Clock, Copy, Check, ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { GamePlayer, GameRoom, Side } from '../lib/xiangqi/types';
import { UserAccount } from '../lib/storage/userStore';
import { getRealmByLevel } from '../lib/cultivation/realms';
import { AI_CULTIVATOR_RIVALS } from '../lib/xiangqi/ai';

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

  const redPlayer = room.players.red;
  const blackPlayer = room.players.black;

  const isHost = room.hostId === currentUser.id;
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
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Navigation & Room Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1424]/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onLeaveRoom}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Rời phòng về sảnh"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-100">{room.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
                Phòng Chờ
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1 text-cyan-300">
                <Clock className="w-3.5 h-3.5" />
                {room.timeLimit} phút + {room.increment}s
              </span>
              <span>•</span>
              <span className="text-amber-400">{room.isRanked ? 'Xếp Hạng ELO' : 'Giao Hữu'}</span>
              <span>•</span>
              <span>Mã Bàn: <span className="font-mono text-slate-300">{room.id}</span></span>
            </div>
          </div>
        </div>

        {/* Invite / Share button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã Sao Chép Mã' : 'Mời Đạo Hữu'}</span>
          </button>
        </div>
      </div>

      {/* Two Seats: Red (Tiên Thủ) vs Black (Hậu Thủ) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Red Seat (Tiên Thủ / Quân Đỏ) */}
        <div className="rounded-2xl border-2 border-rose-500/40 bg-gradient-to-b from-rose-950/20 via-[#0d1424] to-[#0d1424] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[260px]">
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
                {/* Glowing Avatar */}
                <div
                  className="w-16 h-16 rounded-full overflow-hidden border-2 transition-transform hover:scale-105"
                  style={{
                    borderColor: redPlayer.frameColor,
                    boxShadow: `0 0 25px ${redPlayer.frameColor}80`,
                  }}
                >
                  <img src={redPlayer.avatarUrl} alt={redPlayer.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                    {redPlayer.name}
                    {redPlayer.isAi && <Bot className="w-3.5 h-3.5 text-purple-400" />}
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
              <p className="text-xs text-slate-400">Tiên tọa trống, đang đợi đạo hữu nhập tịch...</p>
            </div>
          )}

          {/* Seat footer actions */}
          <div className="mt-4 pt-3 border-t border-rose-500/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">Bàn Cờ Tiên Giới</span>
          </div>
        </div>

        {/* Black Seat (Hậu Thủ / Quân Đen) */}
        <div className="rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 via-[#0d1424] to-[#0d1424] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[260px]">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-900 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              <h3 className="font-bold text-cyan-300 text-sm tracking-wide">HẬU THỦ (HẮC QUÂN)</h3>
            </div>
            <span className="text-xs text-cyan-400/80 font-mono">Đi Sau</span>
          </div>

          {blackPlayer ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {/* Glowing Avatar */}
                <div
                  className="w-16 h-16 rounded-full overflow-hidden border-2 transition-transform hover:scale-105"
                  style={{
                    borderColor: blackPlayer.frameColor,
                    boxShadow: `0 0 25px ${blackPlayer.frameColor}80`,
                  }}
                >
                  <img src={blackPlayer.avatarUrl} alt={blackPlayer.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                    {blackPlayer.name}
                    {blackPlayer.isAi && <Bot className="w-3.5 h-3.5 text-purple-400" />}
                  </h4>
                  <p className="text-xs text-amber-300 font-medium">{blackPlayer.title}</p>
                  <p className="text-xs text-cyan-300 font-mono mt-0.5">
                    {blackPlayer.realm} • {blackPlayer.elo} ELO
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-200/90 flex items-center justify-between">
                <span>Trạng thái vị trí:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Sẵn Sàng
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <UserPlus className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400">Tiên tọa trống, đang đợi đối thủ gia nhập...</p>
              {/* Button to invite AI Bot */}
              <button
                onClick={onAddAiBot}
                className="px-4 py-2 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-semibold flex items-center gap-2 shadow"
              >
                <Bot className="w-4 h-4 text-purple-400" />
                <span>Mời Tiên Nhân AI Ghép Bàn</span>
              </button>
            </div>
          )}

          {/* Seat footer actions */}
          <div className="mt-4 pt-3 border-t border-cyan-500/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">Bàn Cờ Tiên Giới</span>
          </div>
        </div>
      </div>

      {/* Control Action Bar & In-Room Chat */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Actions (5 cols) */}
        <div className="md:col-span-5 bg-[#0d1424] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Thao Tác Bàn Cờ</span>
            </h4>
            <p className="text-xs text-slate-400">
              Hai bên đều đã vào vị trí, bấm &ldquo;Bắt Đầu Luận Đạo&rdquo; để khai chiến. Tính năng cân bằng đảm bảo công bằng tuyệt đối.
            </p>
          </div>

          <div className="space-y-2.5">
            {/* Swap side button */}
            <button
              onClick={onSwapSide}
              className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4 text-amber-400" />
              <span>Đổi Phe (Hồng Quân ⇄ Hắc Quân)</span>
            </button>

            {/* Start Game button */}
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                canStart
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 shadow-orange-500/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{canStart ? 'Khai Bàn Luận Đạo (Bắt Đầu)' : 'Đang Chờ Đủ 2 Đạo Hữu...'}</span>
            </button>
          </div>
        </div>

        {/* Room Chat (7 cols) */}
        <div className="md:col-span-7 bg-[#0d1424] border border-slate-800 rounded-2xl p-4 flex flex-col h-[260px] justify-between">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Đàm Đạo Phòng Chờ</span>
          </div>

          <div className="flex-1 overflow-y-auto py-2.5 space-y-2 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className="bg-slate-900/60 rounded-lg p-2 space-y-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-amber-300">{m.sender}</span>
                  <span className="text-slate-500">{m.time}</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="Gửi lời chào trước trận chiến..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
