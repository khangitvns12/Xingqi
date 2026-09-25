'use client';

import React, { useState } from 'react';
import { MessageSquare, Users, Eye, Send, Swords } from 'lucide-react';
import { UserAccount } from '../../lib/storage/userStore';
import { getRealmByLevel } from '../../lib/cultivation/realms';
import { AI_CULTIVATOR_RIVALS, AiCultivator } from '../../lib/xiangqi/ai';
import AvatarWithFrame from '../AvatarWithFrame';

export interface ChatMessage {
  id: string;
  sender: string;
  realm: string;
  title: string;
  avatarUrl: string;
  frameId?: string;
  message: string;
  time: string;
  isSystem?: boolean;
}

interface LobbyWorldChatProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  onlineAccounts: UserAccount[];
  onlineCount?: number;
  onInspectCultivator: (user: UserAccount) => void;
  onInspectBySender: (sender: string, avatarUrl: string, realm: string, title: string) => void;
  onChallengeAi: (rival: AiCultivator) => void;
}

export default function LobbyWorldChat({
  messages,
  onSendMessage,
  onlineAccounts,
  onlineCount,
  onInspectCultivator,
  onInspectBySender,
  onChallengeAi,
}: LobbyWorldChatProps) {
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'online'>('chat');
  const [inputMsg, setInputMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    onSendMessage(inputMsg.trim());
    setInputMsg('');
  };

  return (
    <div className="rounded-2xl border-2 border-emerald-500/30 bg-[#062420]/95 flex flex-col h-[380px] shadow-[0_0_25px_rgba(4,28,24,0.8)] overflow-hidden">
      {/* Tabbed Header */}
      <div className="px-3 py-2 border-b border-emerald-500/25 flex items-center justify-between bg-[#041a17]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSidebarTab('chat')}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer font-xianxia ${
              sidebarTab === 'chat'
                ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'text-emerald-300/70 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-300" />
            <span>Truyền Âm</span>
          </button>
          <button
            type="button"
            id="lobby-online-tab"
            onClick={() => setSidebarTab('online')}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer font-xianxia ${
              sidebarTab === 'online'
                ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'text-emerald-300/70 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-300" />
            <span>Đạo Hữu Online</span>
          </button>
        </div>
        <span className="text-[10px] text-teal-300 flex items-center gap-1 font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
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
                  <div className="shrink-0">
                    <AvatarWithFrame
                      avatarUrl={m.avatarUrl}
                      daoName={m.sender}
                      realmLevel={1}
                      frameId={m.frameId}
                      size="xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onInspectBySender(m.sender, m.avatarUrl, m.realm, m.title)}
                    className="font-semibold text-teal-300 hover:text-white text-[11px] truncate max-w-[130px] hover:underline cursor-pointer flex items-center gap-1 text-left font-xianxia"
                    title="Nhấp để xem hồ sơ của đạo hữu này"
                  >
                    <span>{m.sender}</span>
                  </button>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-xianxia">
                    {m.realm}
                  </span>
                  <span className="text-[9px] text-emerald-400/60 ml-auto">{m.time}</span>
                </div>
                <p
                  className={`text-[11px] leading-relaxed rounded-xl p-2.5 border ${
                    m.isSystem
                      ? 'bg-teal-950/60 text-teal-100 border-teal-500/40 shadow-sm'
                      : 'bg-[#031815]/80 text-emerald-100 border-emerald-500/20'
                  }`}
                >
                  {m.message}
                </p>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="p-2 border-t border-emerald-500/25 bg-[#041a17] flex gap-1.5">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Nhập truyền âm đàm đạo..."
              className="flex-1 bg-[#021310] border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-emerald-600 focus:outline-none focus:border-teal-400"
            />
            <button
              type="submit"
              className="p-2 rounded-xl jade-button-primary transition-colors cursor-pointer text-white shadow"
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
                  <div className="shrink-0">
                    <AvatarWithFrame
                      avatarUrl={cult.avatarUrl}
                      daoName={cult.daoName}
                      realmLevel={cult.realmLevel}
                      frameId={cult.selectedFrameId}
                      size="sm"
                    />
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
                    onClick={() => onInspectCultivator(cult)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
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
                <div className="shrink-0">
                  <AvatarWithFrame
                    avatarUrl={rival.avatarUrl}
                    daoName={rival.name}
                    realmLevel={rival.realmLevel}
                    frameId={rival.frameColor ? 'frame_emerald_lotus' : undefined}
                    size="sm"
                  />
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
                  onClick={() => onInspectBySender(rival.name, rival.avatarUrl, rival.realm, rival.title)}
                  className="p-1 sm:px-2 sm:py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Xem hồ sơ tu tiên"
                >
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span className="hidden sm:inline">Hồ Sơ</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChallengeAi(rival)}
                  className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40 transition-colors flex items-center gap-1 cursor-pointer"
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
  );
}
