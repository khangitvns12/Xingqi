'use client';

import React, { useState } from 'react';
import { Sparkles, Trash2, RefreshCw, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { STORAGE_KEY, ACCOUNTS_STORAGE_KEY, SYSTEM_CONFIG_KEY } from '../lib/storage/userTypes';

interface ClearCacheModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export default function ClearCacheModal({ isOpen, onClose, onSuccessToast }: ClearCacheModalProps) {
  const [clearing, setClearing] = useState(false);
  const [showFullResetConfirm, setShowFullResetConfirm] = useState(false);

  if (!isOpen) return null;

  // Option 1: Quick cache clear (Preserves account & credentials, wipes temporary assets & connection cache)
  const handleQuickClearCache = async () => {
    setClearing(true);
    try {
      // 1. Clear browser caches (ServiceWorker/CacheStorage) if available
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cacheKeys = await window.caches.keys();
          await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
        } catch {
          // ignore
        }
      }

      // 2. Clear sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }

      // 3. Clear temporary keys in localStorage (keep user account & accounts list)
      if (typeof window !== 'undefined') {
        const preserveKeys = new Set([STORAGE_KEY, ACCOUNTS_STORAGE_KEY, SYSTEM_CONFIG_KEY]);
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && !preserveKeys.has(key)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }

      onSuccessToast('Đã dọn dẹp toàn bộ bộ nhớ đệm thành công! Tiên vực thanh tịnh, tài khoản của đạo hữu vẫn được bảo toàn.');
      onClose();
      // Reload soft after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('Clear cache error:', err);
      onSuccessToast('Đã làm mới dữ liệu bộ nhớ đệm!');
      onClose();
    } finally {
      setClearing(false);
    }
  };

  // Option 2: Full factory reset (Wipes everything including localStorage)
  const handleFullReset = async () => {
    setClearing(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        if ('caches' in window) {
          const cacheKeys = await window.caches.keys();
          await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
        }
        // Also clear IndexedDB
        if ('indexedDB' in window) {
          try {
            window.indexedDB.deleteDatabase('tien_ky_dao_db');
          } catch {
            // ignore
          }
        }
      }

      onSuccessToast('Đã thanh lọc toàn diện và đặt lại cài đặt gốc thành công!');
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch {
      window.location.reload();
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(4,28,24,0.9)] overflow-hidden flex flex-col text-emerald-100 font-xianxia">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#041d1a] border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-950/80 border border-teal-500/50 flex items-center justify-center text-teal-300 shadow-md">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white text-glow-jade flex items-center gap-2">
                Thanh Lọc Tiên Khí • Xóa Bộ Nhớ Đệm
              </h3>
              <p className="text-xs text-emerald-300/70 font-sans">
                Giải phóng dữ liệu đệm trình duyệt, khắc phục lỗi không đồng bộ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-400/80 hover:text-white text-xl leading-none p-1 rounded-lg hover:bg-emerald-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Card 1: Fast Clear Cache (Recommended) */}
          <div className="p-4 rounded-xl border border-teal-500/40 bg-[#062420]/80 hover:border-teal-400 transition-all space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-teal-900/50 border border-teal-400/40 text-teal-300 flex-shrink-0 mt-0.5">
                <RefreshCw className={`w-5 h-5 ${clearing ? 'animate-spin' : ''}`} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-teal-200 flex items-center gap-1.5">
                  <span>Dọn Dẹp Nhanh Bộ Nhớ Đệm (Khuyên dùng)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-500/40 font-sans">
                    An toàn
                  </span>
                </h4>
                <p className="text-xs text-emerald-300/80 font-sans leading-relaxed">
                  Xóa bộ nhớ đệm cache HTTP, danh sách phòng tạm, làm mới luồng truyền tin thời gian thực.
                  <strong className="text-teal-300 ml-1">Đạo tịch và tài khoản của bạn được giữ nguyên 100%.</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={clearing}
              onClick={handleQuickClearCache}
              className="w-full py-2.5 rounded-xl jade-button-primary text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{clearing ? 'Đang thanh lọc...' : 'Xóa Bộ Nhớ Đệm & Làm Mới Ngay'}</span>
            </button>
          </div>

          {/* Card 2: Deep Factory Reset */}
          <div className="p-4 rounded-xl border border-rose-500/30 bg-[#1c080b]/50 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-400 flex-shrink-0 mt-0.5">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-rose-300 flex items-center gap-1.5">
                  <span>Khôi Phục Cài Đặt Gốc (Xóa Sạch Dữ Liệu)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/40 font-sans">
                    Nguy hiểm
                  </span>
                </h4>
                <p className="text-xs text-rose-200/70 font-sans leading-relaxed">
                  Xóa toàn bộ đạo tịch đã lưu trong trình duyệt của thiết bị này và khởi động lại như lần đầu tải game.
                </p>
              </div>
            </div>

            {!showFullResetConfirm ? (
              <button
                type="button"
                disabled={clearing}
                onClick={() => setShowFullResetConfirm(true)}
                className="w-full py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Khôi Phục Cài Đặt Gốc...</span>
              </button>
            ) : (
              <div className="p-3 rounded-lg bg-rose-950/90 border border-rose-500/60 space-y-2 animate-in fade-in">
                <p className="text-[11px] text-rose-200 font-sans font-medium">
                  Đạo hữu có chắc chắn muốn xóa sạch toàn bộ tài khoản và cài đặt trên máy này?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={clearing}
                    onClick={handleFullReset}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Xác Nhận Xóa Hết
                  </button>
                  <button
                    type="button"
                    disabled={clearing}
                    onClick={() => setShowFullResetConfirm(false)}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/30 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#031815] border-t border-emerald-500/20 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
