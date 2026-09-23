'use client';

import React, { useState } from 'react';
import { Search, Swords, Lock, Clock, Eye } from 'lucide-react';
import { GameRoom } from '../../lib/xiangqi/types';

interface LobbyRoomListProps {
  rooms: GameRoom[];
  onJoinRoom: (room: GameRoom) => void;
  onOpenCreateModal: () => void;
  onInspectHost: (hostName: string) => void;
}

export default function LobbyRoomList({
  rooms,
  onJoinRoom,
  onOpenCreateModal,
  onInspectHost,
}: LobbyRoomListProps) {
  const [filterTab, setFilterTab] = useState<'all' | 'waiting' | 'blitz' | 'ranked'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = rooms.filter((r) => {
    if (filterTab === 'waiting' && r.status !== 'waiting') return false;
    if (filterTab === 'blitz' && r.timeLimit > 5) return false;
    if (filterTab === 'ranked' && !r.isRanked) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.hostName.toLowerCase().includes(q) ||
        r.hostRealm.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-3.5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer font-xianxia ${
              filterTab === 'all'
                ? 'bg-emerald-600 text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'text-emerald-300/70 hover:text-white hover:bg-emerald-950/60'
            }`}
          >
            Tất Cả ({rooms.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('waiting')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer font-xianxia ${
              filterTab === 'waiting'
                ? 'bg-emerald-600 text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'text-emerald-300/70 hover:text-white hover:bg-emerald-950/60'
            }`}
          >
            Đang Chờ
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('blitz')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer font-xianxia ${
              filterTab === 'blitz'
                ? 'bg-emerald-600 text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'text-emerald-300/70 hover:text-white hover:bg-emerald-950/60'
            }`}
          >
            Cờ Chớp (≤5p)
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('ranked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer font-xianxia ${
              filterTab === 'ranked'
                ? 'bg-emerald-600 text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'text-emerald-300/70 hover:text-white hover:bg-emerald-950/60'
            }`}
          >
            Tính ELO
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input
            type="text"
            placeholder="Tìm bàn cờ, đạo hữu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#031815] border border-emerald-500/40 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-emerald-600 focus:outline-none focus:border-teal-400"
          />
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-xl border border-dashed border-emerald-500/30 bg-[#052420]/40 text-emerald-300/80 space-y-3">
            <Swords className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-xianxia">Chưa có bàn cờ nào phù hợp bộ lọc.</p>
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="px-4 py-2 rounded-xl jade-button-primary text-xs font-bold font-xianxia shadow cursor-pointer"
            >
              Tạo Bàn Cờ Mới
            </button>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div
              key={room.id}
              className="relative group rounded-xl border border-emerald-500/30 hover:border-teal-400 bg-[#062420]/90 p-4 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-950/60 flex flex-col justify-between"
            >
              {/* Top status line */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white group-hover:text-teal-200 transition-colors line-clamp-1 font-xianxia">
                      {room.name}
                    </h3>
                    {room.password && <Lock className="w-3 h-3 text-teal-300 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-emerald-300/70 mt-0.5 flex items-center gap-1">
                    <span>Chủ bàn:</span>
                    <button
                      type="button"
                      onClick={() => onInspectHost(room.hostName)}
                      className="text-teal-300 hover:text-white font-medium hover:underline cursor-pointer font-xianxia"
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
                      ? 'bg-emerald-950/80 text-emerald-200 border-emerald-400/50 animate-pulse'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {room.status === 'waiting' ? '● Đang Chờ' : '⚔️ Đang Đấu'}
                </span>
              </div>

              {/* Room Meta Badges */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-emerald-200/70 mb-3.5">
                <span className="flex items-center gap-1 bg-[#031916] px-2 py-0.5 rounded border border-emerald-500/30 text-teal-300">
                  <Clock className="w-3 h-3 text-teal-400" />
                  {room.timeLimit}p + {room.increment}s
                </span>
                <span className="bg-[#031916] px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-200 font-xianxia font-semibold">
                  {room.hostRealm} ({room.hostElo} ELO)
                </span>
                <span className="flex items-center gap-1 bg-[#031916] px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-300">
                  <Eye className="w-3 h-3 text-teal-400" />
                  {room.spectatorCount} Đạo Hữu
                </span>
              </div>

              {/* Action button */}
              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                <div className="text-[11px] text-emerald-400/70">
                  {room.isRanked ? (
                    <span className="text-teal-300 font-medium">⚡ Xếp Hạng ELO</span>
                  ) : (
                    <span>Giao Hữu Tự Do</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onJoinRoom(room)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all font-xianxia cursor-pointer ${
                    room.status === 'waiting'
                      ? 'jade-button-primary shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-emerald-950 hover:bg-emerald-900 text-teal-200 border border-teal-500/40'
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
          ))
        )}
      </div>
    </div>
  );
}
