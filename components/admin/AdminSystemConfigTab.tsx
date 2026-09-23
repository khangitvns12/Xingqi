'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Shield,
  Save,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Database,
  Coins,
  Crown,
  KeyRound,
  FileCode,
} from 'lucide-react';
import {
  SystemConfig,
  loadSystemConfig,
  saveSystemConfig,
  UserAccount,
  DEFAULT_SYSTEM_CONFIG,
} from '../../lib/storage/userStore';
import {
  CustomFrame,
  DharmaIdol,
  CustomArtifact,
  CustomTitle,
} from '../../lib/cultivation/shopAndFrames';
import { CULTIVATION_REALMS, CULTIVATOR_AVATARS, DAOIST_TITLES } from '../../lib/cultivation/realms';
import AvatarWithFrame from '../AvatarWithFrame';

interface AdminSystemConfigTabProps {
  accounts: UserAccount[];
  frames: CustomFrame[];
  dharmaList: DharmaIdol[];
  artifactList: CustomArtifact[];
  titleList: CustomTitle[];
  onConfigSaved: (msg: string) => void;
  onFullDataReload: () => void;
}

export default function AdminSystemConfigTab({
  accounts,
  frames,
  dharmaList,
  artifactList,
  titleList,
  onConfigSaved,
  onFullDataReload,
}: AdminSystemConfigTabProps) {
  const [config, setConfig] = useState<SystemConfig>(() => loadSystemConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const saved = saveSystemConfig(config);
      setConfig(saved);
      onConfigSaved('Đã lưu cấu hình khởi tạo tài khoản vào Cơ sở dữ liệu mã hóa!');
    } catch {
      alert('Không thể lưu cấu hình hệ thống.');
    } finally {
      setIsSaving(false);
    }
  };

  // Export encrypted database backup
  const handleExportDatabase = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'EXPORT_ENCRYPTED_DB' }),
      });

      if (!res.ok) throw new Error('Không thể tải tệp mã hóa từ máy chủ');
      const data = await res.json();

      if (data.success && data.encryptedBackup) {
        const blob = new Blob([JSON.stringify(data.encryptedBackup, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tien_ky_database_${Date.now()}.enc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onConfigSaved('Đã xuất và tải về tệp cơ sở dữ liệu mã hóa (.enc) an toàn!');
      } else {
        throw new Error('Dữ liệu xuất không hợp lệ');
      }
    } catch (err: any) {
      alert(`Lỗi xuất database: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Restore encrypted database backup
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsRestoring(true);
        setRestoreStatus('Đang xác thực và giải mã cơ sở dữ liệu...');
        const content = event.target?.result as string;
        const encryptedPayload = JSON.parse(content);

        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'RESTORE_ENCRYPTED_DB',
            encryptedPayload,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setRestoreStatus('Khôi phục cơ sở dữ liệu mã hóa thành công!');
          onFullDataReload();
          onConfigSaved('Khôi phục toàn bộ database từ tệp mã hóa thành công!');
        } else {
          setRestoreStatus(`Lỗi: ${data.error}`);
        }
      } catch (err: any) {
        setRestoreStatus(`Lỗi đọc tệp mã hóa: ${err.message}`);
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 text-xs text-emerald-100">
      {/* Encryption & Database Status Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border-2 border-emerald-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-inner">
            <Database className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold font-xianxia text-white text-glow-jade">
                Cơ Sở Dữ Liệu Tiên Giới Mã Hóa (AES-256-GCM)
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                Bảo Mật Cao Cấp
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/80 mt-0.5">
              Mọi tài khoản, khung avatar, pháp tướng, pháp bảo, danh hiệu và ảnh tải lên được mã hóa tự động trước khi lưu trữ
            </p>
          </div>
        </div>

        {/* Database Quick Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-emerald-500/30 text-center">
            <span className="text-[10px] text-emerald-400 block">Tài Khoản</span>
            <span className="text-xs font-bold text-white">{accounts.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-emerald-500/30 text-center">
            <span className="text-[10px] text-emerald-400 block">Khung Avatar</span>
            <span className="text-xs font-bold text-white">{frames.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-emerald-500/30 text-center">
            <span className="text-[10px] text-emerald-400 block">Pháp Tướng</span>
            <span className="text-xs font-bold text-white">{dharmaList.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-emerald-500/30 text-center">
            <span className="text-[10px] text-emerald-400 block">Pháp Bảo</span>
            <span className="text-xs font-bold text-white">{artifactList.length}</span>
          </div>
        </div>
      </div>

      {/* Database Backup & Restore Actions */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
        <h5 className="font-bold text-teal-300 text-xs flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>Sao Lưu & Khôi Phục Toàn Bộ Database (.enc)</span>
        </h5>
        <p className="text-[11px] text-slate-400">
          Xuất toàn bộ hệ thống (dữ liệu admin thay đổi, hình ảnh, khung, pháp bảo, tài khoản) thành tệp mã hóa bảo mật hoặc khôi phục bất cứ lúc nào.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExportDatabase}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Đang mã hóa & xuất...' : 'Tải Về Tệp Database Mã Hóa (.enc)'}</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileRestore}
            accept=".enc,.json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isRestoring}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-emerald-500/40 font-bold text-xs shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isRestoring ? 'Đang khôi phục...' : 'Khôi Phục Database Từ Tệp (.enc)'}</span>
          </button>
        </div>

        {restoreStatus && (
          <div className="p-2.5 rounded-lg bg-black/60 border border-emerald-500/40 text-[11px] text-teal-200">
            {restoreStatus}
          </div>
        )}
      </div>

      {/* Main Section: System Defaults for User Account Creation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-400" />
              <span>Thiết Lập Thông Số Mặc Định Khi User Tạo Tài Khoản</span>
            </h4>
            <p className="text-[11px] text-emerald-400/80">
              Admin tùy chỉnh thông số khởi đầu: Avatar, Khung, Pháp Bảo, Pháp Tướng, Linh Thạch, Cảnh Giới khi tân thủ đăng ký.
            </p>
          </div>
          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu Cấu Hình Mặc Định'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Column 1: Configuration Form */}
          <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-emerald-500/20">
            {/* Default Avatar Selection */}
            <div className="space-y-2">
              <label className="font-bold text-white text-xs block">Ảnh Đại Diện (Avatar) Mặc Định:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.defaultAvatarUrl}
                  onChange={(e) => setConfig({ ...config, defaultAvatarUrl: e.target.value })}
                  placeholder="Nhập link ảnh avatar mặc định..."
                  className="flex-1 bg-slate-900 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>

              {/* Quick Pick from Cultivator Avatars */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {CULTIVATOR_AVATARS.slice(0, 6).map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() =>
                      setConfig({ ...config, defaultAvatarUrl: av.url, defaultAvatarId: av.id })
                    }
                    className={`relative w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 transition-transform active:scale-95 ${
                      config.defaultAvatarUrl === av.url ? 'border-amber-400 scale-105' : 'border-slate-700 opacity-70'
                    }`}
                  >
                    <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Default Frame */}
            <div className="space-y-1.5">
              <label className="font-bold text-white text-xs block">Khung Avatar Mặc Định Lúc Tạo:</label>
              <select
                value={config.defaultFrameId || ''}
                onChange={(e) => setConfig({ ...config, defaultFrameId: e.target.value || undefined })}
                className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value="">Không có (Dùng khung mặc định theo cảnh giới)</option>
                {frames.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.rarity})
                  </option>
                ))}
              </select>
            </div>

            {/* Default Dharma Idol */}
            <div className="space-y-1.5">
              <label className="font-bold text-white text-xs block">Pháp Tướng Kim Thân Mặc Định:</label>
              <select
                value={config.defaultDharmaId || ''}
                onChange={(e) => setConfig({ ...config, defaultDharmaId: e.target.value || undefined })}
                className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value="">Không trang bị pháp tướng lúc tạo</option>
                {dharmaList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.title})
                  </option>
                ))}
              </select>
            </div>

            {/* Default Artifact */}
            <div className="space-y-1.5">
              <label className="font-bold text-white text-xs block">Pháp Bảo Thượng Cổ Mặc Định:</label>
              <select
                value={config.defaultArtifactId || ''}
                onChange={(e) => setConfig({ ...config, defaultArtifactId: e.target.value || undefined })}
                className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value="">Không trang bị pháp bảo lúc tạo</option>
                {artifactList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.rarity})
                  </option>
                ))}
              </select>
            </div>

            {/* Default Title */}
            <div className="space-y-1.5">
              <label className="font-bold text-white text-xs block">Danh Hiệu Tiên Hiệp Mặc Định:</label>
              <select
                value={config.defaultTitleId || 'title_1'}
                onChange={(e) => setConfig({ ...config, defaultTitleId: e.target.value })}
                className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-400 cursor-pointer"
              >
                {DAOIST_TITLES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Yêu cầu cấp {t.unlockedAtRealm})
                  </option>
                ))}
                {titleList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Tùy chỉnh)
                  </option>
                ))}
              </select>
            </div>

            {/* Numeric Defaults: Stones, Elo, Realm */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-amber-300 text-[11px] block">Linh Thạch:</label>
                <input
                  type="number"
                  min="0"
                  value={config.defaultSpiritStones}
                  onChange={(e) => setConfig({ ...config, defaultSpiritStones: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-teal-300 text-[11px] block">Điểm ELO:</label>
                <input
                  type="number"
                  min="500"
                  max="3500"
                  value={config.defaultElo}
                  onChange={(e) => setConfig({ ...config, defaultElo: Math.max(500, parseInt(e.target.value) || 1200) })}
                  className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-purple-300 text-[11px] block">Cảnh Giới:</label>
                <select
                  value={config.defaultRealmLevel}
                  onChange={(e) => setConfig({ ...config, defaultRealmLevel: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-2 py-1.5 text-xs text-white outline-none focus:border-emerald-400 cursor-pointer"
                >
                  {CULTIVATION_REALMS.map((r) => (
                    <option key={r.level} value={r.level}>
                      Cấp {r.level} ({r.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Starting Pills */}
            <div className="space-y-1.5 pt-1">
              <label className="font-bold text-white text-[11px] block">Đan Dược Tặng Kèm Khởi Đầu:</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                  <span className="text-emerald-300 text-[11px]">Tụ Khí Đan:</span>
                  <input
                    type="number"
                    min="0"
                    value={config.defaultPills?.['Tụ Khí Đan'] || 0}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        defaultPills: {
                          ...config.defaultPills,
                          'Tụ Khí Đan': Math.max(0, parseInt(e.target.value) || 0),
                        },
                      })
                    }
                    className="w-14 text-right bg-transparent text-white font-mono text-xs outline-none"
                  />
                </div>
                <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                  <span className="text-teal-300 text-[11px]">Trúc Cơ Đan:</span>
                  <input
                    type="number"
                    min="0"
                    value={config.defaultPills?.['Trúc Cơ Đan'] || 0}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        defaultPills: {
                          ...config.defaultPills,
                          'Trúc Cơ Đan': Math.max(0, parseInt(e.target.value) || 0),
                        },
                      })
                    }
                    className="w-14 text-right bg-transparent text-white font-mono text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Live Preview Card */}
          <div className="space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Xem Trước Hồ Sơ Tân Thủ Khi Đăng Ký:</span>
              </h5>
              <button
                type="button"
                onClick={() => setConfig({ ...DEFAULT_SYSTEM_CONFIG, lastUpdated: Date.now() })}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 underline"
              >
                Khôi phục chuẩn mặc định
              </button>
            </div>

            {/* Preview Card */}
            <div className="flex-1 p-5 rounded-2xl bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/40 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
              {/* Avatar with configured default frame */}
              <AvatarWithFrame
                avatarUrl={config.defaultAvatarUrl}
                daoName="Tân Thủ Đạo Hữu"
                realmLevel={config.defaultRealmLevel}
                frameId={config.defaultFrameId}
                size="lg"
              />

              <div className="space-y-1">
                <h4 className="text-base font-bold font-xianxia text-white text-glow-jade">
                  Tân Thủ Đạo Hữu
                </h4>
                <p className="text-xs text-amber-300 font-medium">
                  {DAOIST_TITLES.find((t) => t.id === config.defaultTitleId)?.name ||
                    titleList.find((t) => t.id === config.defaultTitleId)?.name ||
                    'Kỳ Đạo Đạo Đồng'}
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-300/80 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-[10px] font-bold">
                    {CULTIVATION_REALMS.find((r) => r.level === config.defaultRealmLevel)?.name || 'Luyện Khí Kỳ'}
                  </span>
                  <span>•</span>
                  <span className="text-teal-300 font-mono font-bold">{config.defaultElo} ELO</span>
                </div>
              </div>

              {/* Badges of default gifts */}
              <div className="w-full pt-3 border-t border-emerald-500/20 grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-black/40 border border-emerald-500/20 text-center">
                  <span className="text-slate-400 block text-[10px]">Linh Thạch Tân Thủ</span>
                  <span className="font-bold text-amber-300 font-mono flex items-center justify-center gap-1">
                    <Coins className="w-3 h-3 text-amber-400" />
                    {config.defaultSpiritStones}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-black/40 border border-emerald-500/20 text-center">
                  <span className="text-slate-400 block text-[10px]">Đan Dược Tặng Kèm</span>
                  <span className="font-bold text-teal-300">
                    {(config.defaultPills?.['Tụ Khí Đan'] || 0) + (config.defaultPills?.['Trúc Cơ Đan'] || 0)} viên
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-black/40 border border-emerald-500/20 text-center col-span-2">
                  <span className="text-slate-400 block text-[10px]">Trang Bị Khởi Đầu:</span>
                  <div className="flex items-center justify-center gap-3 mt-1 text-[10px]">
                    <span className="text-emerald-300">
                      Khung: {frames.find((f) => f.id === config.defaultFrameId)?.name || 'Theo cảnh giới'}
                    </span>
                    <span>•</span>
                    <span className="text-purple-300">
                      Pháp Bảo: {artifactList.find((a) => a.id === config.defaultArtifactId)?.name || 'Chưa có'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirm Save CTA */}
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Đang lưu vào Database...' : 'Lưu Thay Đổi Này Vào Database Mã Hóa'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
