'use client';

import { useState } from 'react';
import { LogIn, LogOut, UserPlus, Shield, Sparkles, Check } from 'lucide-react';
import { loadAllAccounts, UserAccount } from '../lib/storage/userStore';

interface AuthModalProps {
  currentUser: UserAccount;
  onClose: () => void;
  onSwitchAccount: (account: UserAccount) => void;
  onRegisterAccount: (newAccount: UserAccount) => void;
  onLogout?: () => void;
  required?: boolean;
}

export default function AuthModal({
  currentUser,
  onClose,
  onSwitchAccount,
  onRegisterAccount,
  onLogout,
  required = false,
}: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [daoName, setDaoName] = useState('');
  const [sect, setSect] = useState('Tiên Kỳ Các');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const accounts = loadAllAccounts();

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên tài khoản.');
      return;
    }

    if (isRegister) {
      if (!daoName.trim()) {
        setErrorMsg('Vui lòng nhập Đạo Hiệu tu tiên.');
        return;
      }

      // Check if username already exists
      const existing = accounts.find((a) => a.username.toLowerCase() === username.trim().toLowerCase());
      if (existing) {
        setErrorMsg('Tên tài khoản này đã có đạo hữu sử dụng.');
        return;
      }

      const newAccount: UserAccount = {
        id: 'user_' + Date.now(),
        username: username.trim(),
        daoName: daoName.trim(),
        sect: sect.trim() || 'Tán Tu',
        avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
        elo: 1200,
        realmLevel: 1,
        exp: 0,
        spiritStones: 200,
        pills: { 'Tụ Khí Đan': 3 },
        selectedTitleId: 'title_1',
        selectedAvatarId: 'av_1',
        unlockedTitleIds: ['title_1'],
        unlockedAvatarIds: ['av_1'],
        stats: {
          totalMatches: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          winStreak: 0,
          maxWinStreak: 0,
          highestElo: 1200,
        },
        createdAt: Date.now(),
      };

      onRegisterAccount(newAccount);
      setSuccessMsg('Đăng ký tài khoản tu tiên thành công!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      // Login
      const found = accounts.find(
        (a) => a.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (!found) {
        setErrorMsg('Không tìm thấy tài khoản đạo hữu. Vui lòng kiểm tra lại hoặc đăng ký mới.');
        return;
      }

      // Check ban status
      if (found.isBanned) {
        setErrorMsg(`Tài khoản đã bị Quản Trị Viên cấm đăng nhập (Bị Ban). Lý do: ${found.banReason || 'Vi phạm Thiên Quy'}`);
        return;
      }

      // Password verification
      if (found.username.toLowerCase() === 'admin') {
        if (password !== 'admin123') {
          setErrorMsg('Mật khẩu quản trị viên không chính xác! (Mật khẩu: admin123)');
          return;
        }
      } else if (found.password && password && found.password !== password) {
        setErrorMsg('Mật khẩu không chính xác. Vui lòng nhập lại!');
        return;
      }

      onSwitchAccount(found);
      setSuccessMsg(`Đăng nhập thành công! Hoan nghênh ${found.daoName} quy vị.`);
      setTimeout(() => {
        onClose();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-md bg-[#0d1424] border-2 border-amber-500/40 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                {isRegister ? 'Đăng Ký Đạo Tịch Tiên Giới' : 'Đăng Nhập Tài Khoản'}
              </h3>
              <p className="text-[11px] text-slate-400">Lưu trữ đạo hạnh và thành tích tu tiên</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (required && currentUser.isGuest) {
                setErrorMsg('⚠️ Đạo hữu cần Đăng Nhập hoặc Đăng Ký tài khoản trước mới có thể bước vào Tiên Kỳ Giới!');
                return;
              }
              onClose();
            }}
            className="text-slate-400 hover:text-slate-200 text-lg leading-none p-1 rounded hover:bg-slate-800 transition-colors"
            title={required && currentUser.isGuest ? 'Cần đăng nhập hoặc đăng ký trước' : 'Đóng'}
          >
            ✕
          </button>
        </div>

        {/* Required initial visit notice */}
        {required && currentUser.isGuest && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/90 via-purple-950/70 to-slate-900 border border-amber-500/60 shadow-lg text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Yêu Cầu Đăng Nhập / Đăng Ký Lần Đầu</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Để bảo lưu đạo hạnh, ELO, pháp bảo tu chân và tham gia luận đạo trên Phong Thần Bảng, đạo hữu cần <strong className="text-amber-300">Đăng Nhập</strong> hoặc <strong className="text-amber-300">Đăng Ký</strong> tài khoản trước khi vào sảnh cờ.
            </p>
          </div>
        )}

        {/* Current session banner */}
        {!currentUser.isGuest ? (
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 block font-medium">Tài khoản đang sử dụng:</span>
              <div className="flex items-center gap-2 mt-0.5 truncate">
                <span className="text-xs font-bold text-slate-100 truncate">{currentUser.daoName}</span>
                <span className="text-[10px] text-amber-400 font-mono shrink-0">@{currentUser.username}</span>
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="py-1 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                title={`Đăng xuất khỏi ${currentUser.daoName}`}
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Đăng Xuất</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300 flex items-center justify-between">
            <span>Đang ở chế độ: <strong>Khách Vãng Lai</strong> (chưa liên kết tài khoản)</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Tên Tài Khoản</label>
            <input
              type="text"
              placeholder="ví dụ: daohuuxian"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Mật Khẩu Đạo Tịch</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Đạo Hiệu Nhân Vật</label>
                <input
                  type="text"
                  placeholder="ví dụ: Thanh Phong Chân Nhân, Bạch Y Kiếm Khách"
                  value={daoName}
                  onChange={(e) => setDaoName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tông Môn / Tiên Môn</label>
                <input
                  type="text"
                  placeholder="ví dụ: Thục Sơn Kiếm Phái, Thanh Vân Môn"
                  value={sect}
                  onChange={(e) => setSect(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all"
          >
            {isRegister ? 'Tạo Tài Khoản Tiên Môn' : 'Đăng Nhập'}
          </button>
        </form>

        {/* Switch mode */}
        <div className="pt-2 text-center text-xs text-slate-400">
          {isRegister ? (
            <span>
              Đã có đạo tịch?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-amber-400 font-semibold hover:underline"
              >
                Đăng nhập ngay
              </button>
            </span>
          ) : (
            <span>
              Chưa có tài khoản tu tiên?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-amber-400 font-semibold hover:underline"
              >
                Đăng ký mới
              </button>
            </span>
          )}
        </div>

        {/* List of existing saved accounts */}
        {accounts.length > 0 && !isRegister && (
          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Tài khoản đã lưu:</span>
              <span className="text-[10px] text-amber-400/90 font-mono">Tài khoản admin: admin / admin123</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {accounts.map((acc) => {
                const isSelected = acc.id === currentUser.id;
                const isAdmin = acc.role === 'admin' || acc.username === 'admin';
                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      if (acc.isBanned) {
                        setErrorMsg(`Tài khoản ${acc.daoName} đã bị cấm đăng nhập (Bị Ban).`);
                        return;
                      }
                      onSwitchAccount(acc);
                      onClose();
                    }}
                    className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                      acc.isBanned
                        ? 'border-rose-900/60 bg-rose-950/30 text-rose-400 opacity-70 cursor-not-allowed'
                        : isSelected
                        ? 'border-amber-400 bg-amber-950/30 text-amber-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{acc.daoName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">@{acc.username}</span>
                      {isAdmin && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          Admin
                        </span>
                      )}
                      {acc.isBanned && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-900/40 text-rose-300 border border-rose-700/60 font-bold">
                          Bị Ban
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{acc.elo} ELO</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
