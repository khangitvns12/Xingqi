'use client';

import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

interface LobbyCreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (options: {
    name: string;
    timeLimit: number;
    increment: number;
    isRanked: boolean;
    password?: string;
  }) => void;
}

export default function LobbyCreateRoomModal({
  isOpen,
  onClose,
  onCreateRoom,
}: LobbyCreateRoomModalProps) {
  const [roomName, setRoomName] = useState('Luận Đạo Tiên Các');
  const [roomTime, setRoomTime] = useState<number>(10);
  const [roomIncrement, setRoomIncrement] = useState<number>(0);
  const [isRanked, setIsRanked] = useState<boolean>(true);
  const [roomPassword, setRoomPassword] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    onCreateRoom({
      name: roomName.trim(),
      timeLimit: roomTime,
      increment: roomIncrement,
      isRanked,
      password: roomPassword.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_0_40px_rgba(4,28,24,0.9)] space-y-4 text-emerald-100 font-sans">
        <div className="flex items-center justify-between border-b border-emerald-500/25 pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-teal-300" />
            <h3 className="font-xianxia font-bold text-white text-base">Khai Lập Tiên Bàn</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-emerald-300/70 hover:text-white text-lg leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-emerald-200/90 font-medium mb-1">Tên Tiên Bàn</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full bg-[#031815] border border-emerald-500/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-emerald-200/90 font-medium mb-1">Thời Gian (Phút/Bên)</label>
              <select
                value={roomTime}
                onChange={(e) => setRoomTime(Number(e.target.value))}
                className="w-full bg-[#031815] border border-emerald-500/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
              >
                <option value={3}>3 Phút (Cực Chớp)</option>
                <option value={5}>5 Phút (Cờ Chớp)</option>
                <option value={10}>10 Phút (Tiêu Chuẩn)</option>
                <option value={15}>15 Phút (Cờ Nhanh)</option>
                <option value={20}>20 Phút (Trầm Tư)</option>
              </select>
            </div>
            <div>
              <label className="block text-emerald-200/90 font-medium mb-1">Cộng Giây / Nước</label>
              <select
                value={roomIncrement}
                onChange={(e) => setRoomIncrement(Number(e.target.value))}
                className="w-full bg-[#031815] border border-emerald-500/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
              >
                <option value={0}>+0 giây</option>
                <option value={3}>+3 giây</option>
                <option value={5}>+5 giây</option>
                <option value={10}>+10 giây</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-emerald-200/90 font-medium mb-1">
              Mật Khẩu Bàn (Để trống nếu công khai)
            </label>
            <input
              type="text"
              placeholder="Không mật khẩu"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              className="w-full bg-[#031815] border border-emerald-500/40 rounded-xl px-3 py-2 text-white placeholder-emerald-600 focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="rankedCheck"
              checked={isRanked}
              onChange={(e) => setIsRanked(e.target.checked)}
              className="rounded border-emerald-500/40 text-emerald-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="rankedCheck" className="text-emerald-200 cursor-pointer select-none">
              Thi Đấu Tính Điểm Xếp Hạng ELO & Tu Vi
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-emerald-500/25">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-950/70 text-emerald-300 hover:bg-emerald-900 font-medium cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl jade-button-primary font-xianxia font-bold shadow-md cursor-pointer"
            >
              Khai Lập Bàn Cờ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
