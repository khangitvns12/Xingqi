'use client';

import React from 'react';
import { LogOut, AlertTriangle, ShieldCheck, UserCheck, ArrowRightLeft } from 'lucide-react';
import { UserAccount } from '../lib/storage/userStore';
import { getRealmByLevel } from '../lib/cultivation/realms';
import AvatarWithFrame from './AvatarWithFrame';

interface LogoutModalProps {
  user: UserAccount;
  inGame?: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  onSwitchAccount?: () => void;
}

export default function LogoutModal({
  user,
  inGame = false,
  onClose,
  onConfirmLogout,
  onSwitchAccount,
}: LogoutModalProps) {
  const realm = getRealmByLevel(user.realmLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(4,28,24,0.9)] overflow-hidden text-emerald-100 font-xianxia">
        {/* Header */}
        <div className="relative bg-[#041d1a] p-5 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-inner">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white text-glow-jade">
                Xác Nhận Đăng Xuất
              </h3>
              <p className="text-xs text-rose-300/80">Rời phiên tu tiên hiện tại</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-400/80 hover:text-white text-lg leading-none p-1 rounded-lg hover:bg-emerald-900/40 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Active Cultivator Card */}
          <div className="p-3.5 rounded-xl bg-[#031815] border border-emerald-500/30 flex items-center gap-3">
            <AvatarWithFrame
              avatarUrl={user.avatarUrl}
              daoName={user.daoName}
              realmLevel={user.realmLevel}
              frameId={user.selectedFrameId}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm truncate">{user.daoName}</span>
                {user.role === 'admin' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-teal-300 border border-emerald-500/40 font-bold font-sans">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-[11px] text-teal-300/80 font-medium">@{user.username}</div>
              <div className="flex items-center gap-2 text-[10px] text-emerald-300/60 mt-1">
                <span className={`px-1.5 py-0.5 rounded border ${realm.badgeBg}`}>{realm.name}</span>
                <span>•</span>
                <span className="font-mono text-teal-300 font-semibold">{user.elo} ELO</span>
                <span>•</span>
                <span className="text-white font-mono">💎 {user.spiritStones.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* In-Game Warning if active */}
          {inGame && (
            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="block font-semibold text-amber-300">Cảnh Báo Đang Trong Trận Đấu:</strong>
                Đạo hữu đang trong bàn cờ hoặc phòng ghép. Đăng xuất lúc này sẽ tự động rời trận đấu và hủy phiên chờ.
              </div>
            </div>
          )}

          {/* Safe Persistence Guarantee */}
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200/90 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Toàn bộ tu vi, linh thạch, danh hiệu và thành tích của đạo hữu đã được lưu lại an toàn trên Thiên Đạo Bảng. Đạo hữu có thể đăng nhập lại bất cứ lúc nào!
            </div>
          </div>

          {/* Explanatory text */}
          <p className="text-emerald-300/70 leading-relaxed text-[11px]">
            Sau khi đăng xuất, hệ thống sẽ chuyển đạo hữu về trạng thái <span className="text-white font-semibold">Khách Vãng Lai</span>. Đạo hữu vẫn có thể xem trận, đánh cờ tự do hoặc đăng nhập tài khoản khác.
          </p>

          {/* Action buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={onConfirmLogout}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-600 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-rose-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Xác Nhận Đăng Xuất Khỏi Tài Khoản</span>
            </button>

            {onSwitchAccount && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchAccount();
                }}
                className="w-full py-2 px-4 rounded-xl bg-[#031815] hover:bg-[#062923] text-teal-200 border border-emerald-500/30 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-teal-300" />
                <span>Đổi Sang Tài Khoản Khác</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl bg-transparent hover:bg-emerald-950/40 text-emerald-400/80 hover:text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Ở lại (Hủy bỏ)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
