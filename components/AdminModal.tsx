'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Image as ImageIcon,
  Sparkles,
  Gem,
  Award,
  RefreshCw,
  Settings,
} from 'lucide-react';
import {
  loadAllAccounts,
  updateUserByAdmin,
  banUserByAdmin,
  unbanUserByAdmin,
  kickUserByAdmin,
  deleteUserByAdmin,
  UserAccount,
  syncUserFromCloud,
} from '../lib/storage/userStore';
import {
  CustomFrame,
  DharmaIdol,
  CustomArtifact,
  CustomTitle,
  loadCustomFrames,
  saveCustomFrames,
  loadDharmaIdols,
  saveDharmaIdols,
  loadCustomArtifacts,
  saveCustomArtifacts,
  loadCustomTitles,
  saveCustomTitles,
  syncItemsFromCloud,
} from '../lib/cultivation/shopAndFrames';
import AiFrameAlignModal from './AiFrameAlignModal';
import AdminUsersTab from './admin/AdminUsersTab';
import AdminFramesTab from './admin/AdminFramesTab';
import AdminDharmaTab from './admin/AdminDharmaTab';
import AdminArtifactsTab from './admin/AdminArtifactsTab';
import AdminTitlesTab from './admin/AdminTitlesTab';
import AdminSystemConfigTab from './admin/AdminSystemConfigTab';

function generateCustomId(prefix: string): string {
  return `${prefix}_custom_${Date.now()}`;
}

interface AdminModalProps {
  currentUser: UserAccount;
  onClose: () => void;
  onAccountUpdated: () => void;
}

export default function AdminModal({
  currentUser,
  onClose,
  onAccountUpdated,
}: AdminModalProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'frames' | 'dharma' | 'artifacts' | 'titles' | 'system'>('users');
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [adminNotice, setAdminNotice] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Data states
  const [accounts, setAccounts] = useState<UserAccount[]>(() => loadAllAccounts());
  const [frames, setFrames] = useState<CustomFrame[]>(() => loadCustomFrames());
  const [dharmaList, setDharmaList] = useState<DharmaIdol[]>(() => loadDharmaIdols());
  const [artifactList, setArtifactList] = useState<CustomArtifact[]>(() => loadCustomArtifacts());
  const [titleList, setTitleList] = useState<CustomTitle[]>(() => loadCustomTitles());

  const [showAiFrameModal, setShowAiFrameModal] = useState(false);

  const reloadAllData = () => {
    setAccounts(loadAllAccounts());
    setFrames(loadCustomFrames());
    setDharmaList(loadDharmaIdols());
    setArtifactList(loadCustomArtifacts());
    setTitleList(loadCustomTitles());
    onAccountUpdated();
  };

  useEffect(() => {
    Promise.all([syncUserFromCloud(), syncItemsFromCloud()]).then(() => {
      reloadAllData();
    });
  }, []);

  const handleManualCloudSync = async () => {
    setIsSyncingCloud(true);
    try {
      await Promise.all([syncUserFromCloud(), syncItemsFromCloud()]);
      reloadAllData();
      showFeedback('Đã đồng bộ toàn bộ dữ liệu Tiên Giới từ Đám Mây thành công!', 'success');
    } catch {
      showFeedback('Không thể kết nối máy chủ đồng bộ.', 'error');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const showFeedback = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setAdminNotice({ type, text });
    setTimeout(() => {
      setAdminNotice(null);
    }, 4000);
  };

  const refreshAccounts = () => {
    setAccounts(loadAllAccounts());
    onAccountUpdated();
  };

  // --- USER ACTIONS ---
  const handleUpdateUser = (updatedUser: UserAccount) => {
    updateUserByAdmin(updatedUser.id, {
      daoName: updatedUser.daoName.trim(),
      sect: updatedUser.sect.trim(),
      realmLevel: Number(updatedUser.realmLevel),
      elo: Number(updatedUser.elo),
      spiritStones: Number(updatedUser.spiritStones),
      exp: Number(updatedUser.exp),
      role: updatedUser.role || 'user',
    });
    refreshAccounts();
    showFeedback(`Đã cập nhật dữ liệu tài khoản [${updatedUser.daoName}] thành công!`);
  };

  const handleBanUser = (targetUser: UserAccount, reason: string) => {
    banUserByAdmin(targetUser.id, reason);
    refreshAccounts();
    showFeedback(`Đã khóa đạo tịch (Ban) người dùng [${targetUser.daoName}]!`, 'info');
  };

  const handleUnbanUser = (userId: string, daoName: string) => {
    unbanUserByAdmin(userId);
    refreshAccounts();
    showFeedback(`Đã mở khóa đạo tịch (Unban) cho [${daoName}]!`);
  };

  const handleKickUser = (userId: string, daoName: string) => {
    kickUserByAdmin(userId);
    refreshAccounts();
    showFeedback(`Đã trục xuất (Kick) [${daoName}] khỏi sảnh cờ!`, 'info');
  };

  const handleDeleteUser = (userId: string, daoName: string) => {
    if (confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản [${daoName}]?`)) {
      deleteUserByAdmin(userId);
      refreshAccounts();
      showFeedback(`Đã tiêu hủy tài khoản [${daoName}] khỏi thiên đạo!`, 'info');
    }
  };

  // --- FRAME ACTIONS ---
  const handleCreateFrame = (frameData: Omit<CustomFrame, 'id' | 'createdAt'>) => {
    const newFrame: CustomFrame = {
      ...frameData,
      id: generateCustomId('frame'),
      createdAt: Date.now(),
    };
    const updated = [newFrame, ...frames];
    setFrames(updated);
    saveCustomFrames(updated);
    showFeedback(`Đã thêm khung viền [${newFrame.name}] vào hệ thống!`);
  };

  const handleToggleFrameShop = (frameId: string) => {
    const updated = frames.map((f) => (f.id === frameId ? { ...f, inShop: !f.inShop } : f));
    setFrames(updated);
    saveCustomFrames(updated);
    showFeedback('Đã cập nhật trạng thái Khung trong Shop!');
  };

  const handleDeleteFrame = (frameId: string, frameName: string) => {
    if (confirm(`Xác nhận xóa khung viền [${frameName}]?`)) {
      const updated = frames.filter((f) => f.id !== frameId);
      setFrames(updated);
      saveCustomFrames(updated);
      showFeedback(`Đã xóa khung viền [${frameName}]!`, 'info');
    }
  };

  const handleAdminAiFrameSave = (savedFrame: CustomFrame) => {
    const updated = [savedFrame, ...frames];
    setFrames(updated);
    saveCustomFrames(updated);
    setShowAiFrameModal(false);
    showFeedback(`AI đã thiết lập khung [${savedFrame.name}] chuẩn tỉ lệ!`);
  };

  // --- DHARMA ACTIONS ---
  const handleCreateDharma = (dharmaData: Omit<DharmaIdol, 'id' | 'createdAt'>) => {
    const newDharma: DharmaIdol = {
      ...dharmaData,
      id: generateCustomId('dharma'),
      createdAt: Date.now(),
    };
    const updated = [newDharma, ...dharmaList];
    setDharmaList(updated);
    saveDharmaIdols(updated);
    showFeedback(`Đã thêm Pháp Tướng [${newDharma.name}] vào Tiên Các Shop!`);
  };

  const handleToggleDharmaShop = (id: string) => {
    const updated = dharmaList.map((d) => (d.id === id ? { ...d, inShop: !d.inShop } : d));
    setDharmaList(updated);
    saveDharmaIdols(updated);
    showFeedback('Đã cập nhật trạng thái Pháp Tướng trong Shop!');
  };

  const handleDeleteDharma = (id: string, name: string) => {
    if (confirm(`Xác nhận xóa Pháp Tướng [${name}]?`)) {
      const updated = dharmaList.filter((d) => d.id !== id);
      setDharmaList(updated);
      saveDharmaIdols(updated);
      showFeedback(`Đã xóa Pháp Tướng [${name}]!`, 'info');
    }
  };

  // --- ARTIFACT ACTIONS ---
  const handleCreateArtifact = (artifactData: Omit<CustomArtifact, 'id' | 'createdAt'>) => {
    const newArtifact: CustomArtifact = {
      ...artifactData,
      id: generateCustomId('artifact'),
      createdAt: Date.now(),
    };
    const updated = [newArtifact, ...artifactList];
    setArtifactList(updated);
    saveCustomArtifacts(updated);
    showFeedback(`Đã thêm Pháp Bảo [${newArtifact.name}] vào hệ thống!`);
  };

  const handleToggleArtifactShop = (id: string) => {
    const updated = artifactList.map((a) => (a.id === id ? { ...a, inShop: !a.inShop } : a));
    setArtifactList(updated);
    saveCustomArtifacts(updated);
    showFeedback('Đã cập nhật trạng thái Pháp Bảo trong Shop!');
  };

  const handleDeleteArtifact = (id: string, name: string) => {
    if (confirm(`Xác nhận xóa Pháp Bảo [${name}]?`)) {
      const updated = artifactList.filter((a) => a.id !== id);
      setArtifactList(updated);
      saveCustomArtifacts(updated);
      showFeedback(`Đã xóa Pháp Bảo [${name}]!`, 'info');
    }
  };

  // --- TITLE ACTIONS ---
  const handleCreateTitle = (titleData: Omit<CustomTitle, 'id' | 'createdAt'>) => {
    const newTitle: CustomTitle = {
      ...titleData,
      id: generateCustomId('title'),
      createdAt: Date.now(),
    };
    const updated = [newTitle, ...titleList];
    setTitleList(updated);
    saveCustomTitles(updated);
    showFeedback(`Đã thêm Danh Hiệu [${newTitle.name}] vào hệ thống!`);
  };

  const handleToggleTitleShop = (id: string) => {
    const updated = titleList.map((t) => (t.id === id ? { ...t, inShop: !t.inShop } : t));
    setTitleList(updated);
    saveCustomTitles(updated);
    showFeedback('Đã cập nhật trạng thái Danh Hiệu trong Shop!');
  };

  const handleDeleteTitle = (id: string, name: string) => {
    if (confirm(`Xác nhận xóa Danh Hiệu [${name}]?`)) {
      const updated = titleList.filter((t) => t.id !== id);
      setTitleList(updated);
      saveCustomTitles(updated);
      showFeedback(`Đã xóa Danh Hiệu [${name}]!`, 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(4,28,24,0.9)] overflow-hidden flex flex-col max-h-[94vh] text-emerald-100">
        {/* Admin Header */}
        <div className="relative bg-[#041d1a] px-4 py-3 sm:px-6 sm:py-4 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-700 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-xianxia text-white text-glow-jade">
                  Thiên Đạo Chấp Pháp Các
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-teal-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  ADMIN PANEL
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/70 font-xianxia">
                Quyền quản trị tối cao: Quản lý đệ tử, ban/kick, duyệt khung viền & pháp tướng Tiên Các
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualCloudSync}
              disabled={isSyncingCloud}
              className="px-2.5 py-1.5 rounded-lg bg-[#021310] hover:bg-[#062420] text-teal-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Đồng bộ lại toàn bộ dữ liệu khung viền, pháp tướng, đệ tử với đám mây"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline font-xianxia">Đồng Bộ Đám Mây</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-emerald-400/80 hover:text-white text-xl leading-none p-1.5 rounded-lg hover:bg-emerald-900/40 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Global Notice bar */}
        {adminNotice && (
          <div
            className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 border-b ${
              adminNotice.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-600/60'
                : adminNotice.type === 'info'
                ? 'bg-cyan-950/90 text-cyan-200 border-cyan-600/60'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-600/60'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{adminNotice.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/70 px-4 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản Lý Tài Khoản ({accounts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('frames')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'frames'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Thêm Khung Tùy Chỉnh ({frames.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dharma')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dharma'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Pháp Tướng ({dharmaList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('artifacts')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'artifacts'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gem className="w-4 h-4" />
            <span>Pháp Bảo ({artifactList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('titles')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'titles'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Danh Hiệu Ảnh ({titleList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'system'
                ? 'border-emerald-400 text-emerald-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cấu Hình Khởi Tạo & Database Mã Hóa</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'users' && (
            <AdminUsersTab
              accounts={accounts}
              onUpdateUser={handleUpdateUser}
              onBanUser={handleBanUser}
              onUnbanUser={handleUnbanUser}
              onKickUser={handleKickUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'frames' && (
            <AdminFramesTab
              frames={frames}
              currentUser={currentUser}
              onCreateFrame={handleCreateFrame}
              onToggleShop={handleToggleFrameShop}
              onDeleteFrame={handleDeleteFrame}
              onOpenAiModal={() => setShowAiFrameModal(true)}
            />
          )}

          {activeTab === 'dharma' && (
            <AdminDharmaTab
              dharmaList={dharmaList}
              onCreateDharma={handleCreateDharma}
              onToggleShop={handleToggleDharmaShop}
              onDeleteDharma={handleDeleteDharma}
            />
          )}

          {activeTab === 'artifacts' && (
            <AdminArtifactsTab
              artifactList={artifactList}
              onCreateArtifact={handleCreateArtifact}
              onToggleShop={handleToggleArtifactShop}
              onDeleteArtifact={handleDeleteArtifact}
            />
          )}

          {activeTab === 'titles' && (
            <AdminTitlesTab
              titleList={titleList}
              onCreateTitle={handleCreateTitle}
              onToggleShop={handleToggleTitleShop}
              onDeleteTitle={handleDeleteTitle}
            />
          )}

          {activeTab === 'system' && (
            <AdminSystemConfigTab
              accounts={accounts}
              frames={frames}
              dharmaList={dharmaList}
              artifactList={artifactList}
              titleList={titleList}
              onConfigSaved={(msg) => showFeedback(msg, 'success')}
              onFullDataReload={reloadAllData}
            />
          )}
        </div>
      </div>

      {/* AI Frame Alignment Modal for Admin */}
      {showAiFrameModal && (
        <AiFrameAlignModal
          user={currentUser}
          onClose={() => setShowAiFrameModal(false)}
          onSaveFrame={handleAdminAiFrameSave}
        />
      )}
    </div>
  );
}
