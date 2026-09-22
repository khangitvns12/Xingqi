'use client';

import { useState, useRef } from 'react';
import {
  Shield,
  Users,
  Image as ImageIcon,
  Sparkles,
  Edit2,
  Trash2,
  UserX,
  UserCheck,
  LogOut,
  Upload,
  Plus,
  Check,
  AlertTriangle,
  Flame,
  Search,
  Zap,
  ShoppingBag,
  Eye,
  Lock,
  Wand2,
  Gem,
  Award,
} from 'lucide-react';
import {
  loadAllAccounts,
  saveAllAccounts,
  updateUserByAdmin,
  banUserByAdmin,
  unbanUserByAdmin,
  kickUserByAdmin,
  deleteUserByAdmin,
  UserAccount,
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
} from '../lib/cultivation/shopAndFrames';
import { CULTIVATION_REALMS, getRealmByLevel } from '../lib/cultivation/realms';
import AvatarWithFrame from './AvatarWithFrame';
import AiFrameAlignModal from './AiFrameAlignModal';

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
  const [activeTab, setActiveTab] = useState<'users' | 'frames' | 'dharma' | 'artifacts' | 'titles'>('users');

  // User management state
  const [accounts, setAccounts] = useState<UserAccount[]>(() => loadAllAccounts());
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'online' | 'banned'>('all');
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [banTargetUser, setBanTargetUser] = useState<UserAccount | null>(null);
  const [banReasonInput, setBanReasonInput] = useState('Dùng dị thuật can thiệp bàn cờ / Vi phạm quy chế');
  const [adminNotice, setAdminNotice] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Frames state
  const [frames, setFrames] = useState<CustomFrame[]>(() => loadCustomFrames());
  const [newFrameName, setNewFrameName] = useState('');
  const [newFramePrice, setNewFramePrice] = useState(300);
  const [newFrameRarity, setNewFrameRarity] = useState<'Thượng Phẩm' | 'Cực Phẩm' | 'Tiên Phẩm' | 'Thần Phẩm'>('Tiên Phẩm');
  const [newFrameGlow, setNewFrameGlow] = useState('#f59e0b');
  const [newFrameDesc, setNewFrameDesc] = useState('Khung viền thần bí bảo vệ đạo hồn kỳ thủ.');
  const [newFrameInShop, setNewFrameInShop] = useState(true);
  const [newFrameImage, setNewFrameImage] = useState('');
  const frameFileInputRef = useRef<HTMLInputElement>(null);

  // Dharma Idols (Pháp Tướng) state
  const [dharmaList, setDharmaList] = useState<DharmaIdol[]>(() => loadDharmaIdols());
  const [newDharmaName, setNewDharmaName] = useState('');
  const [newDharmaTitle, setNewDharmaTitle] = useState('Thượng Cổ Thần Quân');
  const [newDharmaPrice, setNewDharmaPrice] = useState(800);
  const [newDharmaAura, setNewDharmaAura] = useState('#a855f7');
  const [newDharmaMinRealm, setNewDharmaMinRealm] = useState(3);
  const [newDharmaDesc, setNewDharmaDesc] = useState('Ngưng tụ từ khí phách thiên địa, uy chấn bát hoang.');
  const [newDharmaInShop, setNewDharmaInShop] = useState(true);
  const [newDharmaImage, setNewDharmaImage] = useState('');
  const [newDharmaAnimated, setNewDharmaAnimated] = useState(false);
  const dharmaFileInputRef = useRef<HTMLInputElement>(null);

  // Artifacts (Pháp Bảo) state
  const [artifactList, setArtifactList] = useState<CustomArtifact[]>(() => loadCustomArtifacts());
  const [newArtifactName, setNewArtifactName] = useState('');
  const [newArtifactRarity, setNewArtifactRarity] = useState<'Hạ Phẩm' | 'Trung Phẩm' | 'Thượng Phẩm' | 'Cực Phẩm' | 'Tiên Phẩm' | 'Thần Phẩm'>('Tiên Phẩm');
  const [newArtifactPrice, setNewArtifactPrice] = useState(1000);
  const [newArtifactAura, setNewArtifactAura] = useState('#f59e0b');
  const [newArtifactMinRealm, setNewArtifactMinRealm] = useState(4);
  const [newArtifactDesc, setNewArtifactDesc] = useState('Bản mệnh chí bảo ngưng tụ từ ngàn vạn linh mạch.');
  const [newArtifactEffect, setNewArtifactEffect] = useState('Gia tăng định lực và hào quang kỳ đạo khi nghênh chiến');
  const [newArtifactInShop, setNewArtifactInShop] = useState(true);
  const [newArtifactImage, setNewArtifactImage] = useState('');
  const [newArtifactAnimated, setNewArtifactAnimated] = useState(false);
  const artifactFileInputRef = useRef<HTMLInputElement>(null);

  // Custom Titles (Danh Hiệu Tùy Chỉnh) state
  const [titleList, setTitleList] = useState<CustomTitle[]>(() => loadCustomTitles());
  const [newTitleName, setNewTitleName] = useState('');
  const [newTitleDesc, setNewTitleDesc] = useState('Danh hiệu uy chấn tiên giới do Thiên Đạo ghi công.');
  const [newTitlePrice, setNewTitlePrice] = useState(500);
  const [newTitleRealm, setNewTitleRealm] = useState(3);
  const [newTitleTextColor, setNewTitleTextColor] = useState('text-amber-300');
  const [newTitleBgGradient, setNewTitleBgGradient] = useState('from-amber-900/60 to-purple-900/60 border-amber-400');
  const [newTitleBadgeImage, setNewTitleBadgeImage] = useState('');
  const [newTitleIcon, setNewTitleIcon] = useState('👑');
  const [newTitleInShop, setNewTitleInShop] = useState(true);
  const titleFileInputRef = useRef<HTMLInputElement>(null);

  const [showAiFrameModal, setShowAiFrameModal] = useState(false);

  const showFeedback = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setAdminNotice({ type, text });
    setTimeout(() => {
      setAdminNotice(null);
    }, 4000);
  };

  const refreshAccounts = () => {
    const list = loadAllAccounts();
    setAccounts(list);
    onAccountUpdated();
  };

  // User Actions
  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUserByAdmin(editingUser.id, {
      daoName: editingUser.daoName.trim(),
      sect: editingUser.sect.trim(),
      realmLevel: Number(editingUser.realmLevel),
      elo: Number(editingUser.elo),
      spiritStones: Number(editingUser.spiritStones),
      exp: Number(editingUser.exp),
      role: editingUser.role || 'user',
    });

    showFeedback(`Đã cập nhật dữ liệu tài khoản [${editingUser.daoName}] thành công!`);
    setEditingUser(null);
    refreshAccounts();
  };

  const handleBanUser = () => {
    if (!banTargetUser) return;
    banUserByAdmin(banTargetUser.id, banReasonInput);
    showFeedback(`Đã áp dụng lệnh cấm (Ban) đối với [${banTargetUser.daoName}].`, 'error');
    setBanTargetUser(null);
    refreshAccounts();
  };

  const handleUnbanUser = (userId: string, daoName: string) => {
    unbanUserByAdmin(userId);
    showFeedback(`Đã gỡ bỏ lệnh cấm (Unban) cho [${daoName}]!`, 'success');
    refreshAccounts();
  };

  const handleKickUser = (userId: string, daoName: string) => {
    kickUserByAdmin(userId);
    showFeedback(`Đã trục xuất (Kick) [${daoName}] khỏi bàn cờ / phiên hiện tại!`, 'info');
    refreshAccounts();
  };

  const handleDeleteUser = (userId: string, daoName: string) => {
    if (confirm(`Đạo hữu có chắc chắn muốn xóa vĩnh viễn đạo tịch của [${daoName}] không?`)) {
      deleteUserByAdmin(userId);
      showFeedback(`Đã tiêu hủy tài khoản [${daoName}].`, 'info');
      refreshAccounts();
    }
  };

  // Frame Actions
  const handleFrameFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setNewFrameImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateFrame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFrameName.trim()) {
      showFeedback('Vui lòng nhập tên khung viền!', 'error');
      return;
    }
    if (!newFrameImage.trim()) {
      showFeedback('Vui lòng tải lên ảnh khung viền (PNG đã xóa nền) hoặc dán URL ảnh!', 'error');
      return;
    }

    const newFrame: CustomFrame = {
      id: 'frame_custom_' + Date.now(),
      name: newFrameName.trim(),
      imageUrl: newFrameImage.trim(),
      price: Number(newFramePrice) || 0,
      inShop: newFrameInShop,
      rarity: newFrameRarity,
      glowColor: newFrameGlow,
      description: newFrameDesc.trim(),
      createdAt: Date.now(),
    };

    const updated = [newFrame, ...frames];
    setFrames(updated);
    saveCustomFrames(updated);
    showFeedback(`Đã thêm khung viền tùy chỉnh [${newFrame.name}] vào hệ thống${newFrame.inShop ? ' & Cửa Hàng Shop' : ''}!`);

    // Reset inputs
    setNewFrameName('');
    setNewFrameImage('');
    if (frameFileInputRef.current) frameFileInputRef.current.value = '';
  };

  const handleDeleteFrame = (id: string, name: string) => {
    if (confirm(`Xác nhận xóa khung viền [${name}]?`)) {
      const updated = frames.filter((f) => f.id !== id);
      setFrames(updated);
      saveCustomFrames(updated);
      showFeedback(`Đã xóa khung viền [${name}]!`, 'info');
    }
  };

  const handleToggleFrameShop = (id: string) => {
    const updated = frames.map((f) => {
      if (f.id === id) return { ...f, inShop: !f.inShop };
      return f;
    });
    setFrames(updated);
    saveCustomFrames(updated);
    showFeedback('Đã cập nhật trạng thái bán trong Shop!');
  };

  const handleAdminAiFrameSave = (newFrame: CustomFrame) => {
    const updated = [newFrame, ...frames];
    setFrames(updated);
    saveCustomFrames(updated);
    showFeedback(`Đã dùng AI canh chỉnh và thêm khung [${newFrame.name}] vào hệ thống!`);
  };

  // Dharma Actions
  const handleDharmaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setNewDharmaImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateDharma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDharmaName.trim()) {
      showFeedback('Vui lòng nhập tên Pháp Tướng!', 'error');
      return;
    }
    if (!newDharmaImage.trim()) {
      showFeedback('Vui lòng tải ảnh Pháp Tướng hoặc nhập link ảnh!', 'error');
      return;
    }

    const newDharma: DharmaIdol = {
      id: 'dharma_custom_' + Date.now(),
      name: newDharmaName.trim(),
      title: newDharmaTitle.trim(),
      imageUrl: newDharmaImage.trim(),
      auraColor: newDharmaAura,
      price: Number(newDharmaPrice) || 0,
      minRealmLevel: Number(newDharmaMinRealm) || 1,
      description: newDharmaDesc.trim(),
      inShop: newDharmaInShop,
      isAnimated: newDharmaAnimated || newDharmaImage.includes('.gif') || newDharmaImage.includes('.webp') || newDharmaImage.startsWith('data:image/gif'),
      createdAt: Date.now(),
    };

    const updated = [newDharma, ...dharmaList];
    setDharmaList(updated);
    saveDharmaIdols(updated);
    showFeedback(`Đã thêm Pháp Tướng [${newDharma.name}] vào Tiên Các Shop & Hệ Thống!`);

    // Reset inputs
    setNewDharmaName('');
    setNewDharmaImage('');
    setNewDharmaAnimated(false);
    if (dharmaFileInputRef.current) dharmaFileInputRef.current.value = '';
  };

  const handleDeleteDharma = (id: string, name: string) => {
    if (confirm(`Xác nhận xóa Pháp Tướng [${name}]?`)) {
      const updated = dharmaList.filter((d) => d.id !== id);
      setDharmaList(updated);
      saveDharmaIdols(updated);
      showFeedback(`Đã xóa Pháp Tướng [${name}]!`, 'info');
    }
  };

  const handleToggleDharmaShop = (id: string) => {
    const updated = dharmaList.map((d) => {
      if (d.id === id) return { ...d, inShop: !d.inShop };
      return d;
    });
    setDharmaList(updated);
    saveDharmaIdols(updated);
    showFeedback('Đã cập nhật trạng thái Pháp Tướng trong Shop!');
  };

  // Artifact Actions
  const handleArtifactFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.includes('gif') || file.type.includes('webp')) {
      setNewArtifactAnimated(true);
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setNewArtifactImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateArtifact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtifactName.trim()) {
      showFeedback('Vui lòng nhập tên Pháp Bảo!', 'error');
      return;
    }
    if (!newArtifactImage.trim()) {
      showFeedback('Vui lòng tải ảnh Pháp Bảo hoặc nhập link ảnh (hỗ trợ GIF/WebP)!', 'error');
      return;
    }

    const newArtifact: CustomArtifact = {
      id: 'artifact_custom_' + Date.now(),
      name: newArtifactName.trim(),
      imageUrl: newArtifactImage.trim(),
      auraColor: newArtifactAura,
      price: Number(newArtifactPrice) || 0,
      inShop: newArtifactInShop,
      rarity: newArtifactRarity,
      description: newArtifactDesc.trim(),
      effect: newArtifactEffect.trim(),
      minRealmLevel: Number(newArtifactMinRealm) || 1,
      isAnimated: newArtifactAnimated || newArtifactImage.includes('.gif') || newArtifactImage.includes('.webp') || newArtifactImage.startsWith('data:image/gif'),
      createdAt: Date.now(),
    };

    const updated = [newArtifact, ...artifactList];
    setArtifactList(updated);
    saveCustomArtifacts(updated);
    showFeedback(`Đã thêm Pháp Bảo tùy chỉnh [${newArtifact.name}] vào hệ thống & Shop!`);

    // Reset inputs
    setNewArtifactName('');
    setNewArtifactImage('');
    setNewArtifactAnimated(false);
    if (artifactFileInputRef.current) artifactFileInputRef.current.value = '';
  };

  const handleDeleteArtifact = (id: string, name: string) => {
    if (confirm(`Xác nhận xóa Pháp Bảo [${name}]?`)) {
      const updated = artifactList.filter((a) => a.id !== id);
      setArtifactList(updated);
      saveCustomArtifacts(updated);
      showFeedback(`Đã xóa Pháp Bảo [${name}]!`, 'info');
    }
  };

  const handleToggleArtifactShop = (id: string) => {
    const updated = artifactList.map((a) => {
      if (a.id === id) return { ...a, inShop: !a.inShop };
      return a;
    });
    setArtifactList(updated);
    saveCustomArtifacts(updated);
    showFeedback('Đã cập nhật trạng thái Pháp Bảo trong Shop!');
  };

  // Custom Title Actions
  const handleTitleBadgeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setNewTitleBadgeImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleName.trim()) {
      showFeedback('Vui lòng nhập tên Danh Hiệu!', 'error');
      return;
    }

    const newTitle: CustomTitle = {
      id: 'title_custom_' + Date.now(),
      name: newTitleName.trim(),
      description: newTitleDesc.trim(),
      unlockedAtRealm: Number(newTitleRealm) || 1,
      price: Number(newTitlePrice) || 0,
      inShop: newTitleInShop,
      textColor: newTitleTextColor,
      bgGradient: newTitleBgGradient,
      badgeImageUrl: newTitleBadgeImage.trim() || undefined,
      icon: newTitleIcon.trim() || '👑',
      createdAt: Date.now(),
    };

    const updated = [newTitle, ...titleList];
    setTitleList(updated);
    saveCustomTitles(updated);
    showFeedback(`Đã thêm Danh Hiệu bằng ảnh [${newTitle.name}] vào hệ thống!`);

    // Reset inputs
    setNewTitleName('');
    setNewTitleBadgeImage('');
    if (titleFileInputRef.current) titleFileInputRef.current.value = '';
  };

  const handleDeleteTitle = (id: string, name: string) => {
    if (confirm(`Xác nhận xóa Danh Hiệu [${name}]?`)) {
      const updated = titleList.filter((t) => t.id !== id);
      setTitleList(updated);
      saveCustomTitles(updated);
      showFeedback(`Đã xóa Danh Hiệu [${name}]!`, 'info');
    }
  };

  const handleToggleTitleShop = (id: string) => {
    const updated = titleList.map((t) => {
      if (t.id === id) return { ...t, inShop: !t.inShop };
      return t;
    });
    setTitleList(updated);
    saveCustomTitles(updated);
    showFeedback('Đã cập nhật trạng thái Danh Hiệu trong Shop!');
  };

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = acc.username.toLowerCase().includes(q) || acc.daoName.toLowerCase().includes(q) || acc.sect.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (userFilter === 'online') return acc.isOnline;
    if (userFilter === 'banned') return acc.isBanned;
    return true;
  });

  const onlineCount = accounts.filter((a) => a.isOnline).length;
  const bannedCount = accounts.filter((a) => a.isBanned).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
      <div className="w-full max-w-5xl bg-[#0a0f1d] border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Admin Header */}
        <div className="relative bg-gradient-to-r from-purple-950 via-slate-900 to-amber-950 px-4 py-3 sm:px-6 sm:py-4 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif text-slate-100">
                  Thiên Đạo Chấp Pháp Các
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                  ADMIN PANEL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Quyền quản trị tối cao: Quản lý đệ tử, ban/kick, duyệt khung viền & pháp tướng Tiên Các
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xl leading-none p-1.5 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
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
            onClick={() => setActiveTab('users')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản Lý Tài Khoản ({accounts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('frames')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'frames'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Thêm Khung Tùy Chỉnh ({frames.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('dharma')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'dharma'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Pháp Tướng ({dharmaList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('artifacts')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'artifacts'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gem className="w-4 h-4" />
            <span>Pháp Bảo ({artifactList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('titles')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'titles'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Danh Hiệu Ảnh ({titleList.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* ===================== TAB 1: USERS ===================== */}
          {activeTab === 'users' && (
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
                    onClick={() => setUserFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      userFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Tất Cả
                  </button>
                  <button
                    onClick={() => setUserFilter('online')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                      userFilter === 'online'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online ({onlineCount})
                  </button>
                  <button
                    onClick={() => setUserFilter('banned')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
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
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
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
                                onClick={() => setEditingUser(acc)}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                                title="Chỉnh sửa tài khoản & cấp độ cảnh giới"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                              </button>

                              {/* Kick button */}
                              {!isAdmin && (
                                <button
                                  onClick={() => handleKickUser(acc.id, acc.daoName)}
                                  className="p-1.5 rounded bg-orange-950/50 hover:bg-orange-900/70 text-orange-300 border border-orange-700/50 transition-colors"
                                  title="Trục xuất (Kick) khỏi bàn / sảnh"
                                >
                                  <LogOut className="w-3.5 h-3.5 text-orange-400" />
                                </button>
                              )}

                              {/* Ban / Unban button */}
                              {!isAdmin &&
                                (acc.isBanned ? (
                                  <button
                                    onClick={() => handleUnbanUser(acc.id, acc.daoName)}
                                    className="p-1.5 rounded bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-700/50 transition-colors"
                                    title="Mở khóa đạo tịch (Unban)"
                                  >
                                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setBanTargetUser(acc)}
                                    className="p-1.5 rounded bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-700/50 transition-colors"
                                    title="Khóa tài khoản (Ban)"
                                  >
                                    <UserX className="w-3.5 h-3.5 text-rose-400" />
                                  </button>
                                ))}

                              {/* Delete account button */}
                              {!isAdmin && (
                                <button
                                  onClick={() => handleDeleteUser(acc.id, acc.daoName)}
                                  className="p-1.5 rounded bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-300 border border-slate-800 transition-colors"
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
            </div>
          )}

          {/* ===================== TAB 2: CUSTOM FRAMES ===================== */}
          {activeTab === 'frames' && (
            <div className="space-y-5">
              {/* AI Auto Align Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-900 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-purple-950/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>AI Tự Động Canh Chỉnh & Khớp Tỉ Lệ Khung Avatar</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Tải ảnh khung viền PNG đã tách nền, AI Gemini sẽ phân tích đường viền và tự động tính toán hệ số Scale, Offset X/Y để khớp chuẩn với avatar nhân vật!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiFrameModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-900/50 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>✨ Mở Trợ Lý AI Canh Khung</span>
                </button>
              </div>

              {/* Creator Form: Upload transparent background frame */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-4">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Upload className="w-4 h-4" />
                  <span>Tải Lên Khung Viền Tùy Chỉnh (Đã Xóa Nền)</span>
                </div>

                <form onSubmit={handleCreateFrame} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Left: Inputs */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Tên Khung Viền</label>
                        <input
                          type="text"
                          placeholder="ví dụ: Khung Hắc Long Bát Quái"
                          value={newFrameName}
                          onChange={(e) => setNewFrameName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Phẩm Cấp Khung</label>
                        <select
                          value={newFrameRarity}
                          onChange={(e) => setNewFrameRarity(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                        >
                          <option value="Thượng Phẩm">Thượng Phẩm (Lam Quang)</option>
                          <option value="Cực Phẩm">Cực Phẩm (Lục Quang)</option>
                          <option value="Tiên Phẩm">Tiên Phẩm (Tử Quang)</option>
                          <option value="Thần Phẩm">Thần Phẩm (Hoàng Kim)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Giá Bán Linh Thạch (Shop)</label>
                        <input
                          type="number"
                          value={newFramePrice}
                          onChange={(e) => setNewFramePrice(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Màu Hào Quang Phát Sáng</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newFrameGlow}
                            onChange={(e) => setNewFrameGlow(e.target.value)}
                            className="w-10 h-9 rounded bg-transparent cursor-pointer border border-slate-700"
                          />
                          <input
                            type="text"
                            value={newFrameGlow}
                            onChange={(e) => setNewFrameGlow(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Mô Tả Tiên Hiệp</label>
                      <input
                        type="text"
                        placeholder="Mô tả nguồn gốc hoặc uy lực của khung viền..."
                        value={newFrameDesc}
                        onChange={(e) => setNewFrameDesc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* File Upload or Direct URL */}
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Tải Ảnh Khung (PNG trong suốt đã tách nền) hoặc Nhập URL
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={frameFileInputRef}
                          accept="image/*"
                          onChange={handleFrameFileUpload}
                          className="text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Hoặc dán URL ảnh PNG tách nền trực tiếp..."
                        value={newFrameImage}
                        onChange={(e) => setNewFrameImage(e.target.value)}
                        className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="frameShopCheck"
                        checked={newFrameInShop}
                        onChange={(e) => setNewFrameInShop(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <label htmlFor="frameShopCheck" className="text-slate-300 font-medium cursor-pointer">
                        Đưa ngay vào Cửa Hàng Shop Linh Thạch để đệ tử có thể mua
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Khung Viền Mới Vào Hệ Thống</span>
                    </button>
                  </div>

                  {/* Right: Live Preview */}
                  <div className="md:col-span-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-[11px] font-semibold text-slate-400">Xem Trước Trực Quan Khung Avatar</span>

                    {/* Preview Box */}
                    <div className="relative w-28 h-28 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 p-2">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-slate-600">
                        <img
                          src={currentUser.avatarUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {newFrameImage && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center scale-[1.42]">
                          <img
                            src={newFrameImage}
                            alt="preview-frame"
                            className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-amber-300">{newFrameName || 'Tên Khung Viền'}</h4>
                      <p className="text-[10px] text-slate-400">{newFrameRarity} • 💎 {newFramePrice} Linh Thạch</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                        newFrameInShop ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {newFrameInShop ? '✓ Có trong Shop' : 'Ẩn khỏi Shop'}
                      </span>
                    </div>
                  </div>
                </form>
              </div>

              {/* Frames List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200">Danh Sách Khung Viền Hiện Có ({frames.length})</h4>
                  <span className="text-slate-400 text-[11px]">Bấm nút Shop để bật/tắt bán trong Cửa Hàng</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {frames.map((frame) => (
                    <div
                      key={frame.id}
                      className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800">
                          <img
                            src={frame.imageUrl}
                            alt={frame.name}
                            className="w-11 h-11 object-contain drop-shadow"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-slate-100 truncate">{frame.name}</h5>
                          <span
                            className="text-[10px] px-1.5 py-0.2 rounded font-semibold inline-block my-0.5"
                            style={{ backgroundColor: `${frame.glowColor}22`, color: frame.glowColor }}
                          >
                            {frame.rarity}
                          </span>
                          <p className="text-[10px] text-cyan-300 font-mono font-bold">
                            💎 {frame.price.toLocaleString()} Linh Thạch
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2">{frame.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => handleToggleFrameShop(frame.id)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                            frame.inShop
                              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
                              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {frame.inShop ? '✓ Đang Bán Shop' : '✕ Chưa Bán'}
                        </button>

                        <button
                          onClick={() => handleDeleteFrame(frame.id, frame.name)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                          title="Xóa khung viền"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 3: DHARMA IDOLS (PHÁP TƯỚNG) ===================== */}
          {activeTab === 'dharma' && (
            <div className="space-y-5">
              {/* Dharma Creator Form */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-4">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Thêm Pháp Tướng Vào Shop (Hiển Thị Hoành Tráng Tại Hồ Sơ Profile)</span>
                </div>

                <form onSubmit={handleCreateDharma} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Inputs */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Tên Pháp Tướng</label>
                        <input
                          type="text"
                          placeholder="ví dụ: Hỗn Độn Ma Thần Pháp Tướng"
                          value={newDharmaName}
                          onChange={(e) => setNewDharmaName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Tước Hiệu Uy Áp</label>
                        <input
                          type="text"
                          placeholder="ví dụ: Vạn Cổ Thần Vương"
                          value={newDharmaTitle}
                          onChange={(e) => setNewDharmaTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Giá Linh Thạch</label>
                        <input
                          type="number"
                          value={newDharmaPrice}
                          onChange={(e) => setNewDharmaPrice(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-400 font-mono"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Cảnh Giới Tối Thiểu</label>
                        <select
                          value={newDharmaMinRealm}
                          onChange={(e) => setNewDharmaMinRealm(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-400"
                        >
                          {CULTIVATION_REALMS.map((r) => (
                            <option key={r.id} value={r.level}>
                              Cấp {r.level}: {r.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Hào Quang Khí</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newDharmaAura}
                            onChange={(e) => setNewDharmaAura(e.target.value)}
                            className="w-10 h-9 rounded bg-transparent cursor-pointer border border-slate-700"
                          />
                          <input
                            type="text"
                            value={newDharmaAura}
                            onChange={(e) => setNewDharmaAura(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Mô Tả Thần Thông Pháp Lực</label>
                      <input
                        type="text"
                        placeholder="Mô tả hào quang, truyền thuyết và uy thế của Pháp Thân..."
                        value={newDharmaDesc}
                        onChange={(e) => setNewDharmaDesc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Tải Ảnh Pháp Tướng Hoặc Nhập URL Ảnh (Hỗ trợ ảnh tĩnh, GIF hoặc WebP động)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={dharmaFileInputRef}
                          accept="image/*,.gif,.webp"
                          onChange={handleDharmaFileUpload}
                          className="text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Hoặc dán URL ảnh / ảnh động GIF, WebP trực tiếp..."
                        value={newDharmaImage}
                        onChange={(e) => setNewDharmaImage(e.target.value)}
                        className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-purple-400"
                      />
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="checkbox"
                          id="dharmaAnimatedCheck"
                          checked={newDharmaAnimated}
                          onChange={(e) => setNewDharmaAnimated(e.target.checked)}
                          className="rounded border-slate-700 text-purple-500 focus:ring-0"
                        />
                        <label htmlFor="dharmaAnimatedCheck" className="text-purple-300 font-medium cursor-pointer text-[11px]">
                          ⚡ Ảnh Động (GIF / WebP hiệu ứng pháp tướng chuyển động)
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="dharmaShopCheck"
                        checked={newDharmaInShop}
                        onChange={(e) => setNewDharmaInShop(e.target.checked)}
                        className="rounded border-slate-700 text-purple-500 focus:ring-0"
                      />
                      <label htmlFor="dharmaShopCheck" className="text-slate-300 font-medium cursor-pointer">
                        Mở bán trong Shop Tiên Các cho tất cả đệ tử tam giới
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-950/40 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Pháp Tướng Mới Vào Shop</span>
                    </button>
                  </div>

                  {/* Preview of Dharma */}
                  <div className="md:col-span-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-[11px] font-semibold text-slate-400">Hiển Thị Trên Profile</span>

                    <div
                      className="relative w-full h-44 rounded-xl overflow-hidden border flex items-center justify-center bg-slate-900"
                      style={{
                        borderColor: newDharmaAura,
                        boxShadow: `0 0 20px ${newDharmaAura}44`,
                      }}
                    >
                      {newDharmaImage ? (
                        <img
                          src={newDharmaImage}
                          alt="preview-dharma"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                        <div className="text-left">
                          <span className="text-[9px] text-amber-300 font-semibold block">{newDharmaTitle}</span>
                          <span className="text-xs font-bold text-white">{newDharmaName || 'Tên Pháp Thân'}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      💎 {newDharmaPrice} Linh Thạch • Cần {getRealmByLevel(newDharmaMinRealm).name}
                    </p>
                  </div>
                </form>
              </div>

              {/* Dharma List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200">Danh Sách Pháp Tướng ({dharmaList.length})</h4>
                  <span className="text-slate-400 text-[11px]">Được trang bị và tỏa sáng tại trang Profile người dùng</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {dharmaList.map((dharma) => (
                    <div
                      key={dharma.id}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col justify-between"
                    >
                      <div className="relative h-36 w-full bg-slate-950 overflow-hidden">
                        <img
                          src={dharma.imageUrl}
                          alt={dharma.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            boxShadow: `inset 0 0 20px ${dharma.auraColor}55`,
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md"
                            style={{ backgroundColor: `${dharma.auraColor}33`, color: dharma.auraColor, border: `1px solid ${dharma.auraColor}66` }}
                          >
                            Cần Cấp {dharma.minRealmLevel}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-slate-100 text-sm">{dharma.name}</h5>
                            <span className="font-mono text-cyan-300 font-bold text-xs">
                              💎 {dharma.price.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[10px] text-amber-300/90 font-medium block mt-0.5">
                            {dharma.title}
                          </span>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{dharma.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-2">
                          <button
                            onClick={() => handleToggleDharmaShop(dharma.id)}
                            className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                              dharma.inShop
                                ? 'bg-purple-950/60 border-purple-500/50 text-purple-300 hover:bg-purple-900/80'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {dharma.inShop ? '✓ Đang Bán Shop' : '✕ Chưa Bán'}
                          </button>

                          <button
                            onClick={() => handleDeleteDharma(dharma.id, dharma.name)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                            title="Xóa Pháp Tướng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 4: PHÁP BẢO (ARTIFACTS) ===================== */}
          {activeTab === 'artifacts' && (
            <div className="space-y-5">
              {/* Add Artifact Form */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Gem className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-slate-100 text-sm">Thêm Pháp Bảo Tu Chân Mới</h4>
                  </div>
                  <span className="text-[11px] text-amber-300 font-mono">
                    Hỗ trợ ảnh tĩnh, GIF & WebP động
                  </span>
                </div>

                <form onSubmit={handleCreateArtifact} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Tên Pháp Bảo</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Đông Hoàng Chung, Hỗn Độn Kiếm..."
                          value={newArtifactName}
                          onChange={(e) => setNewArtifactName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Phẩm Cấp</label>
                        <select
                          value={newArtifactRarity}
                          onChange={(e) => setNewArtifactRarity(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                        >
                          <option value="Hạ Phẩm">Hạ Phẩm</option>
                          <option value="Trung Phẩm">Trung Phẩm</option>
                          <option value="Thượng Phẩm">Thượng Phẩm</option>
                          <option value="Cực Phẩm">Cực Phẩm</option>
                          <option value="Tiên Phẩm">Tiên Phẩm</option>
                          <option value="Thần Phẩm">Thần Phẩm</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Giá Linh Thạch (Shop)</label>
                        <input
                          type="number"
                          value={newArtifactPrice}
                          onChange={(e) => setNewArtifactPrice(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Cảnh Giới Yêu Cầu</label>
                        <select
                          value={newArtifactMinRealm}
                          onChange={(e) => setNewArtifactMinRealm(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                        >
                          {CULTIVATION_REALMS.map((r) => (
                            <option key={r.level} value={r.level}>
                              Cấp {r.level}: {r.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Màu Hào Quang Bảo Vật</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newArtifactAura}
                            onChange={(e) => setNewArtifactAura(e.target.value)}
                            className="w-10 h-9 rounded bg-transparent cursor-pointer border border-slate-700"
                          />
                          <input
                            type="text"
                            value={newArtifactAura}
                            onChange={(e) => setNewArtifactAura(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Hiệu Ứng Tiên Khí</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Tăng 10% Exp tu vi, hào quang sát phạt..."
                          value={newArtifactEffect}
                          onChange={(e) => setNewArtifactEffect(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Mô Tả Nguồn Gốc</label>
                        <input
                          type="text"
                          placeholder="Mô tả thần thông, linh căn xuất xứ..."
                          value={newArtifactDesc}
                          onChange={(e) => setNewArtifactDesc(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Tải Ảnh Pháp Bảo (Hỗ trợ PNG, JPG, GIF, WebP động)
                      </label>
                      <input
                        type="file"
                        ref={artifactFileInputRef}
                        accept="image/*,.gif,.webp"
                        onChange={handleArtifactFileUpload}
                        className="text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="Hoặc dán URL ảnh / ảnh động GIF, WebP..."
                        value={newArtifactImage}
                        onChange={(e) => setNewArtifactImage(e.target.value)}
                        className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                      />
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="checkbox"
                          id="artifactAnimatedCheck"
                          checked={newArtifactAnimated}
                          onChange={(e) => setNewArtifactAnimated(e.target.checked)}
                          className="rounded border-slate-700 text-amber-500 focus:ring-0"
                        />
                        <label htmlFor="artifactAnimatedCheck" className="text-amber-300 font-medium cursor-pointer text-[11px]">
                          ⚡ Ảnh Động (GIF / WebP linh khí chuyển động)
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="artifactShopCheck"
                        checked={newArtifactInShop}
                        onChange={(e) => setNewArtifactInShop(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <label htmlFor="artifactShopCheck" className="text-slate-300 font-medium cursor-pointer">
                        Mở bán trong Tiên Các Shop cho kỳ thủ
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-bold shadow-lg shadow-amber-950/40 flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Pháp Bảo Mới</span>
                    </button>
                  </div>

                  {/* Preview Artifact */}
                  <div className="md:col-span-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-[11px] font-semibold text-slate-400">Xem Trước Pháp Bảo</span>
                    <div
                      className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 flex items-center justify-center bg-slate-900 shadow-xl"
                      style={{
                        borderColor: newArtifactAura,
                        boxShadow: `0 0 20px ${newArtifactAura}55`,
                      }}
                    >
                      {newArtifactImage ? (
                        <img
                          src={newArtifactImage}
                          alt="preview-artifact"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Gem className="w-12 h-12 text-amber-400 animate-pulse" />
                      )}
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-amber-300">
                        {newArtifactRarity}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-slate-100 text-sm block">{newArtifactName || 'Tên Pháp Bảo'}</span>
                      <span className="text-[10px] text-cyan-300 block">💎 {newArtifactPrice} Linh Thạch</span>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{newArtifactEffect}</p>
                    </div>
                  </div>
                </form>
              </div>

              {/* Artifacts List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200">Danh Sách Pháp Bảo Đang Có ({artifactList.length})</h4>
                  <span className="text-slate-400 text-[11px]">Được người chơi trang bị và kích hoạt hiệu ứng</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {artifactList.map((art) => (
                    <div
                      key={art.id}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col justify-between"
                    >
                      <div className="relative h-28 w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                        <img
                          src={art.imageUrl}
                          alt={art.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            boxShadow: `inset 0 0 16px ${art.auraColor}66`,
                          }}
                        />
                        <div className="absolute top-1.5 right-1.5 flex gap-1">
                          {art.isAnimated && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/80 text-slate-950">
                              GIF/Động
                            </span>
                          )}
                          <span
                            className="px-1.5 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-md"
                            style={{ backgroundColor: `${art.auraColor}33`, color: art.auraColor, border: `1px solid ${art.auraColor}66` }}
                          >
                            {art.rarity}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-slate-100 text-xs truncate">{art.name}</h5>
                            <span className="font-mono text-cyan-300 font-bold text-[11px]">
                              💎 {art.price.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-300/90 font-medium line-clamp-1">{art.effect}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{art.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-1">
                          <button
                            onClick={() => handleToggleArtifactShop(art.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                              art.inShop
                                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/80'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {art.inShop ? '✓ Đang Bán' : '✕ Chưa Bán'}
                          </button>

                          <button
                            onClick={() => handleDeleteArtifact(art.id, art.name)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                            title="Xóa Pháp Bảo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 5: DANH HIỆU BẰNG ẢNH (TITLES) ===================== */}
          {activeTab === 'titles' && (
            <div className="space-y-5">
              {/* Add Title Form */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <h4 className="font-bold text-slate-100 text-sm">Thêm Danh Hiệu Bằng Ảnh / Huy Hiệu Mới</h4>
                  </div>
                  <span className="text-[11px] text-purple-300">
                    Admin có thể tự thêm ảnh huy hiệu / GIF hiển thị cho danh hiệu
                  </span>
                </div>

                <form onSubmit={handleCreateTitle} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Tên Danh Hiệu</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Vạn Cổ Kỳ Đế, Trảm Tiên Thánh Nhân..."
                          value={newTitleName}
                          onChange={(e) => setNewTitleName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Biểu Tượng Icon (Emoji hoặc Ký Hiệu)</label>
                        <input
                          type="text"
                          placeholder="👑, ⚡, ⚔️, 🔥, 🏆..."
                          value={newTitleIcon}
                          onChange={(e) => setNewTitleIcon(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Cảnh Giới Mở Khóa</label>
                        <select
                          value={newTitleRealm}
                          onChange={(e) => setNewTitleRealm(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-400"
                        >
                          {CULTIVATION_REALMS.map((r) => (
                            <option key={r.level} value={r.level}>
                              Cấp {r.level}: {r.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Giá Linh Thạch (Nếu Bán Trong Shop)</label>
                        <input
                          type="number"
                          value={newTitlePrice}
                          onChange={(e) => setNewTitlePrice(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-400 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Mô Tả Danh Hiệu</label>
                      <input
                        type="text"
                        placeholder="Mô tả chiến công, vinh dự và khí tức..."
                        value={newTitleDesc}
                        onChange={(e) => setNewTitleDesc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Tải Ảnh Huy Hiệu Danh Hiệu (Hỗ trợ ảnh tĩnh, GIF, WebP)
                      </label>
                      <input
                        type="file"
                        ref={titleFileInputRef}
                        accept="image/*,.gif,.webp"
                        onChange={handleTitleBadgeUpload}
                        className="text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="Hoặc dán URL ảnh huy hiệu trực tiếp..."
                        value={newTitleBadgeImage}
                        onChange={(e) => setNewTitleBadgeImage(e.target.value)}
                        className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="titleShopCheck"
                        checked={newTitleInShop}
                        onChange={(e) => setNewTitleInShop(e.target.checked)}
                        className="rounded border-slate-700 text-purple-500 focus:ring-0"
                      />
                      <label htmlFor="titleShopCheck" className="text-slate-300 font-medium cursor-pointer">
                        Mở bán trong Tiên Các Shop
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-950/40 flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Danh Hiệu Tùy Chỉnh</span>
                    </button>
                  </div>

                  {/* Preview Title */}
                  <div className="md:col-span-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-[11px] font-semibold text-slate-400">Xem Trước Danh Hiệu</span>
                    <div className="p-3 w-full rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/50 via-purple-950/50 to-amber-950/50 flex items-center gap-2.5">
                      {newTitleBadgeImage ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-amber-400/60 shadow-md">
                          <img src={newTitleBadgeImage} alt="badge" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-2xl">{newTitleIcon || '👑'}</span>
                      )}
                      <div className="text-left min-w-0">
                        <span className="font-bold text-amber-300 text-xs block truncate">
                          {newTitleName || 'Tên Danh Hiệu'}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          Cần {getRealmByLevel(newTitleRealm).name}
                        </span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Titles List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200">Danh Hiệu Tùy Chỉnh ({titleList.length})</h4>
                  <span className="text-slate-400 text-[11px]">Danh hiệu có ảnh đại diện do Admin thiết lập</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {titleList.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-start gap-2.5">
                        {t.badgeImageUrl ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-amber-400/50 shadow-md">
                            <img src={t.badgeImageUrl} alt={t.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <span className="text-2xl">{t.icon || '👑'}</span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-amber-300 text-xs truncate">{t.name}</h5>
                            {t.price ? (
                              <span className="font-mono text-cyan-300 font-bold text-[10px]">
                                💎 {t.price}
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Cần Cấp {t.unlockedAtRealm}: {getRealmByLevel(t.unlockedAtRealm).name}
                          </span>
                          <p className="text-[10px] text-slate-300 line-clamp-2 mt-1">{t.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => handleToggleTitleShop(t.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                            t.inShop
                              ? 'bg-purple-950/60 border-purple-500/50 text-purple-300 hover:bg-purple-900/80'
                              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {t.inShop ? '✓ Đang Bán' : '✕ Chưa Bán'}
                        </button>

                        <button
                          onClick={() => handleDeleteTitle(t.id, t.name)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                          title="Xóa Danh Hiệu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: EDIT USER ACCOUNT & LEVEL */}
      {editingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0d1424] border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-slate-100">Chỉnh Sửa Tài Khoản Đạo Hữu</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Tài Khoản (Username)</label>
                <input
                  type="text"
                  value={editingUser.username}
                  disabled
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Đạo Hiệu</label>
                  <input
                    type="text"
                    value={editingUser.daoName}
                    onChange={(e) => setEditingUser({ ...editingUser, daoName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tông Môn</label>
                  <input
                    type="text"
                    value={editingUser.sect}
                    onChange={(e) => setEditingUser({ ...editingUser, sect: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Edit Cultivation Realm Level (Chỉnh sửa cấp độ user cấp dưới) */}
              <div>
                <label className="block text-amber-300 font-bold mb-1">
                  ⚡ Cảnh Giới Tu Vi (Cấp Độ 1 - 10)
                </label>
                <select
                  value={editingUser.realmLevel}
                  onChange={(e) => setEditingUser({ ...editingUser, realmLevel: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-3 py-2 text-amber-300 font-bold focus:outline-none"
                >
                  {CULTIVATION_REALMS.map((r) => (
                    <option key={r.id} value={r.level}>
                      Cấp {r.level} - {r.name} (Tối thiểu {r.minElo} ELO)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Điểm ELO</label>
                  <input
                    type="number"
                    value={editingUser.elo}
                    onChange={(e) => setEditingUser({ ...editingUser, elo: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tu Vi (EXP)</label>
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
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
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
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
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
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleBanUser}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-950"
              >
                Xác Nhận Khóa Đạo Tịch
              </button>
            </div>
          </div>
        </div>
      )}

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
