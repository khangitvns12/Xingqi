'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Edit2,
  Trash2,
  UserX,
  UserCheck,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { UserAccount } from '../../lib/storage/userStore';
import { CULTIVATION_REALMS, getRealmByLevel } from '../../lib/cultivation/realms';
import AvatarWithFrame from '../AvatarWithFrame';

interface AdminUsersTabProps {
  accounts: UserAccount[];
  onUpdateUser: (updatedUser: UserAccount) => void;
  onBanUser: (targetUser: UserAccount, reason: string) => void;
  onUnbanUser: (userId: string, daoName: string) => void;
  onKickUser: (userId: string, daoName: string) => void;
  onDeleteUser: (userId: string, daoName: string) => void;
}

export default function AdminUsersTab({
  accounts,
  onUpdateUser,
  onBanUser,
  onUnbanUser,
  onKickUser,
  onDeleteUser,
}: AdminUsersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'online' | 'banned'>('all');
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [banTargetUser, setBanTargetUser] = useState<UserAccount | null>(null);
  const [banReasonInput, setBanReasonInput] = useState('Dùng dị thuật can thiệp bàn cờ / Vi phạm quy chế');

  const filteredAccounts = accounts.filter((acc) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        acc.username.toLowerCase().includes(q) ||
        acc.daoName.toLowerCase().includes(q) ||
        acc.sect.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (userFilter === 'online') return acc.isOnline;
    if (userFilter === 'banned') return acc.isBanned;
    return true;
  });

  const onlineCount = accounts.filter((a) => a.isOnline).length;
  const bannedCount = accounts.filter((a) => a.isBanned).length;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onUpdateUser(editingUser);
    setEditingUser(null);
  };

  const handleConfirmBan = () => {
    if (!banTargetUser) return;
    onBanUser(banTargetUser, banReasonInput);
    setBanTargetUser(null);
  };

  return (
    <div className="space-y-4">
      {/* Stats overview banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Tổng Đạo Hữu</span>
          <span className="text-base font-bold text-slate-100 font-mono">{accounts.length}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
          <span className="text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Đang Online
          </span>
          <span className="text-base font-bold text-emerald-400 font-mono">{onlineCount}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between">
          <span className="text-rose-300">Đã Khóa (Ban)</span>
          <span className="text-base font-bold text-rose-400 font-mono">{bannedCount}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
          <span className="text-amber-300">Quyền Admin</span>
          <span className="text-base font-bold text-amber-400 font-mono">
            {accounts.filter((a) => a.role === 'admin').length}
          </span>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setUserFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              userFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Tất Cả
          </button>
          <button
            type="button"
            onClick={() => setUserFilter('online')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              userFilter === 'online'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Online ({onlineCount})
          </button>
          <button
            type="button"
            onClick={() => setUserFilter('banned')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              userFilter === 'banned'
                ? 'bg-rose-600 text-slate-100 shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Đã Bị Ban ({bannedCount})
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên đăng nhập, đạo hiệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
          />
        </div>
      </div>

      {/* Users list table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold text-[11px]">
              <th className="p-3">Đạo Hữu / Tài Khoản</th>
              <th className="p-3">Cảnh Giới (Cấp)</th>
              <th className="p-3">ELO / Tu Vi</th>
              <th className="p-3">Linh Thạch</th>
              <th className="p-3">Trạng Thái</th>
              <th className="p-3 text-right">Thao Tác Quản Trị</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredAccounts.map((acc) => {
              const realm = getRealmByLevel(acc.realmLevel);
              const isAdmin = acc.role === 'admin' || acc.username === 'admin';

              return (
                <tr
                  key={acc.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    acc.isBanned ? 'bg-rose-950/20' : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <AvatarWithFrame
                        avatarUrl={acc.avatarUrl}
                        daoName={acc.daoName}
                        realmLevel={acc.realmLevel}
                        frameId={acc.selectedFrameId}
                        size="sm"
                        showOnlineDot={true}
                        isOnline={acc.isOnline}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-200">{acc.daoName}</span>
                          {isAdmin && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                              Admin
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">@{acc.username}</span>
                        <span className="text-[10px] text-slate-500 ml-2">({acc.sect})</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${realm.badgeBg}`}>
                      Cấp {acc.realmLevel}: {realm.name}
                    </span>
                  </td>

                  <td className="p-3 font-mono">
                    <div className="text-amber-300 font-bold">{acc.elo} ELO</div>
                    <div className="text-[10px] text-slate-400">{acc.exp} Tu Vi</div>
                  </td>

                  <td className="p-3 font-mono text-cyan-300 font-bold">
                    💎 {acc.spiritStones.toLocaleString()}
                  </td>

                  <td className="p-3">
                    {acc.isBanned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-500/60 font-bold text-[10px]">
                        <AlertTriangle className="w-3 h-3" /> Đã Khóa
                      </span>
                    ) : acc.isOnline ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Ngoại tuyến</span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {/* Edit user button */}
                      <button
                        type="button"
                        onClick={() => setEditingUser(acc)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                        title="Chỉnh sửa tài khoản & cấp độ cảnh giới"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                      </button>

                      {/* Kick button */}
                      {!isAdmin && (
                        <button
                          type="button"
                          onClick={() => onKickUser(acc.id, acc.daoName)}
                          className="p-1.5 rounded bg-orange-950/50 hover:bg-orange-900/70 text-orange-300 border border-orange-700/50 transition-colors cursor-pointer"
                          title="Trục xuất (Kick) khỏi bàn / sảnh"
                        >
                          <LogOut className="w-3.5 h-3.5 text-orange-400" />
                        </button>
                      )}

                      {/* Ban / Unban button */}
                      {!isAdmin &&
                        (acc.isBanned ? (
                          <button
                            type="button"
                            onClick={() => onUnbanUser(acc.id, acc.daoName)}
                            className="p-1.5 rounded bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-700/50 transition-colors cursor-pointer"
                            title="Mở khóa đạo tịch (Unban)"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setBanTargetUser(acc)}
                            className="p-1.5 rounded bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-700/50 transition-colors cursor-pointer"
                            title="Khóa tài khoản (Ban)"
                          >
                            <UserX className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                        ))}

                      {/* Delete account button */}
                      {!isAdmin && (
                        <button
                          type="button"
                          onClick={() => onDeleteUser(acc.id, acc.daoName)}
                          className="p-1.5 rounded bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-300 border border-slate-800 transition-colors cursor-pointer"
                          title="Tiêu hủy tài khoản"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0d1424] border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>Chỉnh Sửa Đạo Tịch: {editingUser.daoName}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Đạo Hiệu</label>
                  <input
                    type="text"
                    value={editingUser.daoName}
                    onChange={(e) => setEditingUser({ ...editingUser, daoName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Môn Phái</label>
                  <input
                    type="text"
                    value={editingUser.sect}
                    onChange={(e) => setEditingUser({ ...editingUser, sect: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cảnh Giới Tu Vi</label>
                  <select
                    value={editingUser.realmLevel}
                    onChange={(e) => setEditingUser({ ...editingUser, realmLevel: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200"
                  >
                    {CULTIVATION_REALMS.map((r) => (
                      <option key={r.level} value={r.level}>
                        Cấp {r.level}: {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kỳ Lực (ELO)</label>
                  <input
                    type="number"
                    value={editingUser.elo}
                    onChange={(e) => setEditingUser({ ...editingUser, elo: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Điểm Tu Vi (EXP)</label>
                  <input
                    type="number"
                    value={editingUser.exp}
                    onChange={(e) => setEditingUser({ ...editingUser, exp: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Linh Thạch</label>
                  <input
                    type="number"
                    value={editingUser.spiritStones}
                    onChange={(e) => setEditingUser({ ...editingUser, spiritStones: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-cyan-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Vai Trò Hệ Thống</label>
                <select
                  value={editingUser.role || 'user'}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'user' | 'admin' })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="user">Đệ Tử Tiên Giới (User Thường)</option>
                  <option value="admin">Quản Trị Viên (Administrator)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BAN USER */}
      {banTargetUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0d1424] border-2 border-rose-500/60 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 border-b border-slate-800 pb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-slate-100">Khóa Đạo Tịch (Ban) Người Dùng</h3>
            </div>

            <p className="text-xs text-slate-300">
              Bạn đang chuẩn bị khóa tài khoản của{' '}
              <span className="font-bold text-amber-300">{banTargetUser.daoName}</span> (@{banTargetUser.username}). Người dùng bị khóa sẽ không thể tiếp tục luận đạo.
            </p>

            <div>
              <label className="block text-slate-300 font-medium mb-1 text-xs">Lý Do Khóa (Ban Reason)</label>
              <textarea
                value={banReasonInput}
                onChange={(e) => setBanReasonInput(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setBanTargetUser(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmBan}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-950 cursor-pointer"
              >
                Xác Nhận Khóa Đạo Tịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
