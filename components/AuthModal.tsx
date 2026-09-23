'use client';

import { useState, useEffect } from 'react';
import {
  LogIn,
  LogOut,
  UserPlus,
  Shield,
  Sparkles,
  Check,
  Cloud,
  RefreshCw,
  Scroll,
  Flame,
  Crown,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { loadAllAccounts, UserAccount, syncUserFromCloud, loadSystemConfig } from '../lib/storage/userStore';
import { syncItemsFromCloud } from '../lib/cultivation/shopAndFrames';

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [accounts, setAccounts] = useState<UserAccount[]>(() => loadAllAccounts());

  // Auto-fetch latest accounts and items from server cloud when opening modal
  useEffect(() => {
    let mounted = true;
    const fetchCloud = async () => {
      setIsSyncing(true);
      try {
        await Promise.all([syncUserFromCloud(), syncItemsFromCloud()]);
        if (mounted) {
          setAccounts(loadAllAccounts());
          setCloudSynced(true);
        }
      } catch (e) {
        console.warn('Sync error in AuthModal:', e);
      } finally {
        if (mounted) setIsSyncing(false);
      }
    };
    fetchCloud();
    return () => {
      mounted = false;
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setErrorMsg('');
    try {
      await Promise.all([syncUserFromCloud(), syncItemsFromCloud()]);
      setAccounts(loadAllAccounts());
      setCloudSynced(true);
      setSuccessMsg('Đã đồng bộ dữ liệu Tiên Giới từ máy chủ đám mây thành công!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Không thể kết nối máy chủ đồng bộ.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên tài khoản tu chân.');
      return;
    }

    if (isRegister) {
      if (!daoName.trim()) {
        setErrorMsg('Vui lòng nhập Đạo Hiệu tu tiên.');
        return;
      }

      // Check if username already exists in current list
      const existing = accounts.find((a) => a.username.toLowerCase() === username.trim().toLowerCase());
      if (existing) {
        setErrorMsg('Tên tài khoản này đã có đạo hữu sử dụng. Vui lòng chọn tên khác.');
        return;
      }

      const sysConfig = loadSystemConfig();
      const unlockedFrames = sysConfig.defaultFrameId ? [sysConfig.defaultFrameId] : [];
      const unlockedDharma = sysConfig.defaultDharmaId ? [sysConfig.defaultDharmaId] : [];
      const unlockedArtifacts = sysConfig.defaultArtifactId ? [sysConfig.defaultArtifactId] : [];
      const unlockedTitles = Array.from(new Set(['title_1', sysConfig.defaultTitleId || 'title_1']));
      const unlockedAvatars = Array.from(new Set(['av_1', sysConfig.defaultAvatarId || 'av_1']));

      const newAccount: UserAccount = {
        id: 'user_' + Date.now(),
        username: username.trim(),
        password: password.trim(),
        daoName: daoName.trim(),
        sect: sect.trim() || 'Tán Tu Tiên Giới',
        avatarUrl: sysConfig.defaultAvatarUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
        elo: sysConfig.defaultElo || 1200,
        realmLevel: sysConfig.defaultRealmLevel || 1,
        exp: 0,
        spiritStones: sysConfig.defaultSpiritStones ?? 200,
        pills: sysConfig.defaultPills || { 'Tụ Khí Đan': 3 },
        selectedTitleId: sysConfig.defaultTitleId || 'title_1',
        selectedAvatarId: sysConfig.defaultAvatarId || 'av_1',
        selectedFrameId: sysConfig.defaultFrameId || undefined,
        selectedDharmaId: sysConfig.defaultDharmaId || undefined,
        selectedArtifactId: sysConfig.defaultArtifactId || undefined,
        unlockedTitleIds: unlockedTitles,
        unlockedAvatarIds: unlockedAvatars,
        unlockedFrameIds: unlockedFrames,
        unlockedDharmaIds: unlockedDharma,
        unlockedArtifactIds: unlockedArtifacts,
        stats: {
          totalMatches: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          winStreak: 0,
          maxWinStreak: 0,
          highestElo: sysConfig.defaultElo || 1200,
        },
        createdAt: Date.now(),
      };

      // Push to server cloud immediately
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SYNC_ACCOUNT', account: newAccount }),
        });
      } catch (err) {
        console.warn('Could not sync newly registered user immediately:', err);
      }

      onRegisterAccount(newAccount);
      setSuccessMsg('Chúc mừng đạo hữu nhập môn Tiên Kỳ Các thành công!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      // Login - always query server cloud first to get freshest items and equipped status
      setIsSyncing(true);
      let found: UserAccount | undefined;

      try {
        const res = await fetch(`/api/sync?username=${encodeURIComponent(username.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.account) {
            found = data.account;
          }
        }
      } catch {
        // network issue fallback to local
      } finally {
        setIsSyncing(false);
      }

      if (!found) {
        found = accounts.find((a) => a.username.toLowerCase() === username.trim().toLowerCase());
      }

      if (!found) {
        setErrorMsg('Không tìm thấy đạo tịch này trên Tiên Giới. Vui lòng kiểm tra lại hoặc Đăng Ký mới!');
        return;
      }

      // Check ban status
      if (found.isBanned) {
        setErrorMsg(`Tài khoản đã bị Thiên Đạo Chấp Pháp phong tỏa (Bị Ban). Lý do: ${found.banReason || 'Vi phạm môn quy'}`);
        return;
      }

      // Password verification
      if (found.username.toLowerCase() === 'admin') {
        if (password !== 'admin123') {
          setErrorMsg('Mật khẩu quản trị viên không chính xác. Vui lòng kiểm tra lại!');
          return;
        }
      } else if (found.password) {
        if (!password) {
          setErrorMsg('Vui lòng nhập mật khẩu để đăng nhập vào đạo tịch này.');
          return;
        }
        if (found.password !== password) {
          setErrorMsg('Mật khẩu không chính xác. Đạo hữu vui lòng kiểm tra lại!');
          return;
        }
      }

      // Sync and pull down all items to ensure this device has everything
      setIsSyncing(true);
      await Promise.all([syncUserFromCloud(), syncItemsFromCloud()]);
      setIsSyncing(false);

      // Re-read merged account from local storage to ensure all unlocked items/equipped frames are preserved
      const refreshedAccounts = loadAllAccounts();
      const freshUser = refreshedAccounts.find((a) => a.id === found!.id || a.username.toLowerCase() === found!.username.toLowerCase()) || found;

      onSwitchAccount(freshUser);
      setSuccessMsg(`Đăng nhập thành công! Hoan nghênh ${freshUser.daoName} ngự giá Tiên Giới.`);
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/40 rounded-2xl shadow-[0_0_40px_rgba(4,28,24,0.9)] p-5 sm:p-6 space-y-4 text-emerald-100 font-sans relative overflow-hidden">
        {/* Ethereal background accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-emerald-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-xianxia font-bold text-white text-base sm:text-lg tracking-wide text-glow-jade">
                {isRegister ? 'Đăng Ký Đạo Tịch Tiên Môn' : 'Đăng Nhập Đạo Tịch'}
              </h3>
              <p className="text-[11px] text-emerald-300/80 flex items-center gap-1">
                <span>Đồng bộ đa thiết bị (Máy tính & Điện thoại)</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (required && currentUser.isGuest) {
                setErrorMsg('⚠️ Đạo hữu cần Đăng Nhập hoặc Đăng Ký trước để lưu danh trên Tiên Giới!');
                return;
              }
              onClose();
            }}
            className="text-emerald-300/70 hover:text-white text-base leading-none p-1.5 rounded-lg hover:bg-emerald-900/40 transition-colors"
            title={required && currentUser.isGuest ? 'Cần đăng nhập hoặc đăng ký trước' : 'Đóng'}
          >
            ✕
          </button>
        </div>

        {/* Cloud Sync Status bar */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-[11px]">
          <div className="flex items-center gap-2 text-emerald-200">
            <Cloud className={`w-3.5 h-3.5 ${cloudSynced ? 'text-teal-400' : 'text-emerald-400'}`} />
            <span>Đám Mây Tiên Giới: <strong className="text-white">Đã kích hoạt đồng bộ</strong></span>
          </div>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-2 py-0.5 rounded-md bg-emerald-800/40 hover:bg-emerald-700/60 text-emerald-200 text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1 transition-all disabled:opacity-50"
            title="Tải dữ liệu mới nhất từ máy chủ"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng Bộ Ngay'}</span>
          </button>
        </div>

        {/* Required initial visit notice */}
        {required && currentUser.isGuest && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-[#041c19] border border-emerald-400/50 shadow-lg text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-300 font-bold font-xianxia text-sm">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Yêu Cầu Nhập Môn / Đăng Nhập</span>
            </div>
            <p className="text-emerald-100/90 text-[11px] leading-relaxed">
              Dữ liệu của đạo hữu (Khung viền, Pháp tướng, Pháp bảo, ELO, Linh thạch) sẽ được <strong className="text-white">đồng bộ xuyên suốt giữa Điện thoại và Máy tính</strong>. Vui lòng đăng nhập hoặc đăng ký tài khoản.
            </p>
          </div>
        )}

        {/* Current session banner */}
        {!currentUser.isGuest ? (
          <div className="p-2.5 rounded-xl bg-[#062420]/80 border border-emerald-500/30 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-emerald-300/70 block font-medium">Tài khoản đang ngự tại thiết bị:</span>
              <div className="flex items-center gap-2 mt-0.5 truncate">
                <span className="text-xs font-bold text-white font-xianxia truncate">{currentUser.daoName}</span>
                <span className="text-[10px] text-teal-300 font-mono shrink-0">@{currentUser.username}</span>
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="py-1 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                title={`Đăng xuất khỏi ${currentUser.daoName}`}
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300" />
                <span>Đăng Xuất</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200 flex items-center justify-between">
            <span>Đang ở chế độ: <strong className="text-white">Khách Vãng Lai</strong> (chưa liên kết đạo tịch)</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs shadow-lg">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-400/60 text-emerald-200 text-xs flex items-center gap-1.5 shadow-lg">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-emerald-200/90 font-medium mb-1">Tên Tài Khoản (Đăng nhập máy tính & di động)</label>
            <input
              type="text"
              placeholder="Nhập tên tài khoản của đạo hữu..."
              value={username}
              autoComplete="username"
              spellCheck={false}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#041c19] border border-emerald-500/40 rounded-xl px-3 py-2 text-white placeholder-emerald-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50"
              required
            />
          </div>

          <div>
            <label className="block text-emerald-200/90 font-medium mb-1">Mật Khẩu Đạo Tịch</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#041c19] border border-emerald-500/40 rounded-xl px-3 py-2 text-white placeholder-emerald-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50"
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-emerald-200/90 font-medium mb-1">Đạo Hiệu Tu Tiên</label>
                <input
                  type="text"
                  placeholder="ví dụ: Thanh Phong Chân Nhân, Bạch Y Kiếm Khách"
                  value={daoName}
                  onChange={(e) => setDaoName(e.target.value)}
                  className="w-full bg-[#041c19] border border-emerald-500/40 rounded-xl px-3 py-2 text-white placeholder-emerald-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-200/90 font-medium mb-1">Tông Môn / Tiên Môn</label>
                <input
                  type="text"
                  placeholder="ví dụ: Thục Sơn Kiếm Phái, Thanh Vân Môn, Tiên Kỳ Các"
                  value={sect}
                  onChange={(e) => setSect(e.target.value)}
                  className="w-full bg-[#041c19] border border-emerald-500/40 rounded-xl px-3 py-2 text-white placeholder-emerald-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl jade-button-primary font-xianxia font-bold text-sm tracking-wide shadow-lg transition-all"
          >
            {isRegister ? 'Ghi Danh Đạo Tịch Tiên Môn' : 'Đăng Nhập Tiên Giới'}
          </button>
        </form>

        {/* Switch mode */}
        <div className="pt-2 text-center text-xs text-emerald-300/80">
          {isRegister ? (
            <span>
              Đã có đạo tịch?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-teal-300 font-bold hover:underline"
              >
                Đăng nhập ngay
              </button>
            </span>
          ) : (
            <span>
              Chưa có đạo tịch tu chân?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-teal-300 font-bold hover:underline"
              >
                Đăng ký mới
              </button>
            </span>
          )}
        </div>

        {/* Security assurance banner */}
        <div className="pt-3 border-t border-emerald-500/20 text-[11px] text-emerald-400/80 flex items-center gap-2 justify-center">
          <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>Bảo mật an toàn: Mật khẩu và đạo tịch được mã hóa đồng bộ an toàn.</span>
        </div>
      </div>
    </div>
  );
}
