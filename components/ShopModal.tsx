'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Sparkles,
  Check,
  Zap,
  Lock,
  Flame,
  Shield,
  Award,
  Gem,
} from 'lucide-react';
import { UserAccount } from '../lib/storage/userStore';
import {
  CustomFrame,
  DharmaIdol,
  CustomArtifact,
  CustomTitle,
  loadCustomFrames,
  loadDharmaIdols,
  loadCustomArtifacts,
  loadCustomTitles,
} from '../lib/cultivation/shopAndFrames';
import { getRealmByLevel } from '../lib/cultivation/realms';
import AvatarWithFrame from './AvatarWithFrame';
import { soundManager } from '../lib/audio/soundFx';

interface ShopModalProps {
  user: UserAccount;
  onClose: () => void;
  onUpdateUser: (data: Partial<UserAccount>) => void;
  onOpenAdmin?: () => void;
}

export default function ShopModal({
  user,
  onClose,
  onUpdateUser,
  onOpenAdmin,
}: ShopModalProps) {
  const [activeTab, setActiveTab] = useState<'frames' | 'dharma' | 'artifacts' | 'titles' | 'pills'>('frames');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const frames = loadCustomFrames().filter((f) => f.inShop);
  const dharmaIdols = loadDharmaIdols().filter((d) => d.inShop);
  const artifacts = loadCustomArtifacts().filter((a) => a.inShop);
  const customTitles = loadCustomTitles().filter((t) => t.inShop);

  const userUnlockedFrames = user.unlockedFrameIds || [];
  const userUnlockedDharma = user.unlockedDharmaIds || [];
  const userUnlockedArtifacts = user.unlockedArtifactIds || [];
  const userUnlockedTitles = user.unlockedTitleIds || [];

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  // Buy Artifact
  const handleBuyArtifact = (artifact: CustomArtifact) => {
    if (userUnlockedArtifacts.includes(artifact.id)) {
      onUpdateUser({ selectedArtifactId: artifact.id });
      showMsg(`Đã trang bị Pháp Bảo [${artifact.name}]!`);
      return;
    }

    if (user.realmLevel < artifact.minRealmLevel) {
      showMsg(`Cảnh giới chưa đủ! Cần ${getRealmByLevel(artifact.minRealmLevel).name} để ngự trị pháp bảo này.`, 'error');
      return;
    }

    if (user.spiritStones < artifact.price) {
      showMsg('Không đủ Linh Thạch! Hãy thi đấu cờ để thu thập thêm.', 'error');
      return;
    }

    soundManager.playBreakthrough();
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [artifact.auraColor, '#f59e0b', '#06b6d4'],
      });
    } catch {
      // ignore
    }

    const newUnlocked = [...userUnlockedArtifacts, artifact.id];
    onUpdateUser({
      spiritStones: user.spiritStones - artifact.price,
      unlockedArtifactIds: newUnlocked,
      selectedArtifactId: artifact.id,
    });
    showMsg(`Thu phục thành công Pháp Bảo [${artifact.name}]!`);
  };

  // Buy Custom Title
  const handleBuyTitle = (title: CustomTitle) => {
    if (userUnlockedTitles.includes(title.id)) {
      onUpdateUser({ selectedTitleId: title.id });
      showMsg(`Đã mang Danh Hiệu [${title.name}]!`);
      return;
    }

    if (user.realmLevel < title.unlockedAtRealm) {
      showMsg(`Cảnh giới chưa đủ! Cần cấp ${title.unlockedAtRealm} để thọ nhận danh hiệu này.`, 'error');
      return;
    }

    const price = title.price ?? 0;
    if (user.spiritStones < price) {
      showMsg('Không đủ Linh Thạch!', 'error');
      return;
    }

    soundManager.playBreakthrough();
    const newUnlocked = [...userUnlockedTitles, title.id];
    onUpdateUser({
      spiritStones: user.spiritStones - price,
      unlockedTitleIds: newUnlocked,
      selectedTitleId: title.id,
    });
    showMsg(`Sắc phong thành công Danh Hiệu [${title.name}]!`);
  };

  // Buy Frame
  const handleBuyFrame = (frame: CustomFrame) => {
    if (userUnlockedFrames.includes(frame.id)) {
      // Equip
      onUpdateUser({ selectedFrameId: frame.id });
      showMsg(`Đã trang bị [${frame.name}] thành công!`);
      return;
    }

    if (user.spiritStones < frame.price) {
      showMsg('Không đủ Linh Thạch! Hãy thắng các ván đấu cờ để tích lũy thêm.', 'error');
      return;
    }

    // Purchase
    soundManager.playBreakthrough();
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: [frame.glowColor, '#f59e0b', '#06b6d4'],
      });
    } catch {
      // ignore
    }

    const newUnlocked = [...userUnlockedFrames, frame.id];
    onUpdateUser({
      spiritStones: user.spiritStones - frame.price,
      unlockedFrameIds: newUnlocked,
      selectedFrameId: frame.id,
    });
    showMsg(`Mua thành công và trang bị [${frame.name}]!`);
  };

  // Buy Dharma Idol
  const handleBuyDharma = (dharma: DharmaIdol) => {
    if (userUnlockedDharma.includes(dharma.id)) {
      onUpdateUser({ selectedDharmaId: dharma.id });
      showMsg(`Đã hiển thị Pháp Tướng [${dharma.name}] trên trang Profile!`);
      return;
    }

    if (user.realmLevel < dharma.minRealmLevel) {
      showMsg(`Cảnh giới chưa đủ! Cần đạt ${getRealmByLevel(dharma.minRealmLevel).name} để lĩnh ngộ pháp tướng này.`, 'error');
      return;
    }

    if (user.spiritStones < dharma.price) {
      showMsg('Linh Thạch không đủ để đúc Pháp Thân!', 'error');
      return;
    }

    // Purchase
    soundManager.playBreakthrough();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: [dharma.auraColor, '#f59e0b', '#a855f7'],
      });
    } catch {
      // ignore
    }

    const newUnlocked = [...userUnlockedDharma, dharma.id];
    onUpdateUser({
      spiritStones: user.spiritStones - dharma.price,
      unlockedDharmaIds: newUnlocked,
      selectedDharmaId: dharma.id,
    });
    showMsg(`Chúc mừng đạo hữu ngưng tụ thành công Pháp Tướng [${dharma.name}]!`);
  };

  // Buy Pills
  const handleBuyPill = (name: string, price: number) => {
    if (user.spiritStones < price) {
      showMsg('Không đủ Linh Thạch để mua đan dược!', 'error');
      return;
    }

    const updatedPills = { ...user.pills };
    updatedPills[name] = (updatedPills[name] || 0) + 1;

    onUpdateUser({
      spiritStones: user.spiritStones - price,
      pills: updatedPills,
    });
    showMsg(`Đã mua 1 viên [${name}]!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-4xl bg-[#0c1222] border-2 border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-[#151c33] to-slate-900 px-4 py-3 sm:px-6 sm:py-4 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
              <ShoppingBag className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-serif text-slate-100">
                  Tiên Các • Cửa Hàng Linh Thạch
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                  BẢO VẬT TIÊN GIỚI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sử dụng Linh Thạch tích lũy để sở hữu Khung Avatar tùy chỉnh, Pháp Tướng hiển thị & Đan Dược
              </p>
            </div>
          </div>

          {/* User's Spirit Stones balance */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 flex items-center gap-2 shadow-inner">
              <span className="text-sm">💎</span>
              <span className="font-mono font-bold text-cyan-300 text-sm">
                {user.spiritStones.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">Linh Thạch</span>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 text-xl leading-none p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 border-b ${
              feedback.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-600/50'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-600/50'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/70 px-4 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('frames')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'frames'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Khung Viền Tu Tiên ({frames.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('dharma')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'dharma'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Pháp Tướng ({dharmaIdols.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('artifacts')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'artifacts'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gem className="w-4 h-4" />
            <span>Pháp Bảo ({artifacts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('titles')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'titles'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Danh Hiệu Ảnh ({customTitles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pills')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'pills'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Đan Dược Đột Phá</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: KHUNG VIỀN */}
          {activeTab === 'frames' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-400">
                  Khung viền hào quang bao quanh Avatar nhân vật trên bàn cờ, hồ sơ và bảng xếp hạng.
                </p>
                {user.role === 'admin' && onOpenAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    + Quản trị: Tải lên khung viền mới
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {frames.map((frame) => {
                  const isOwned = userUnlockedFrames.includes(frame.id);
                  const isEquipped = user.selectedFrameId === frame.id;
                  const canAfford = user.spiritStones >= frame.price;

                  return (
                    <div
                      key={frame.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                        isEquipped
                          ? 'border-amber-400 bg-amber-950/30 shadow-lg shadow-amber-500/20'
                          : isOwned
                          ? 'border-slate-700 bg-slate-900/70'
                          : 'border-slate-800 bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Live Avatar with this frame */}
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                          <AvatarWithFrame
                            avatarUrl={user.avatarUrl}
                            daoName={user.daoName}
                            realmLevel={user.realmLevel}
                            frameId={frame.id}
                            size="md"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-100 text-sm truncate">{frame.name}</h4>
                          <span
                            className="text-[10px] px-1.5 py-0.2 rounded font-semibold inline-block my-0.5"
                            style={{ backgroundColor: `${frame.glowColor}22`, color: frame.glowColor }}
                          >
                            {frame.rarity}
                          </span>
                          <div className="font-mono text-cyan-300 font-bold text-xs mt-0.5">
                            💎 {frame.price.toLocaleString()} Linh Thạch
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {frame.description}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80">
                        {isEquipped ? (
                          <div className="w-full py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-center flex items-center justify-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            <span>Đang Sử Dụng</span>
                          </div>
                        ) : isOwned ? (
                          <button
                            onClick={() => handleBuyFrame(frame)}
                            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition-colors"
                          >
                            Trang Bị Khung
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyFrame(frame)}
                            disabled={!canAfford}
                            className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                              canAfford
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            }`}
                          >
                            <span>Mua Với {frame.price} 💎</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PHÁP TƯỚNG (DHARMA IDOLS) */}
          {activeTab === 'dharma' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-400">
                  Pháp Tướng Kim Thân hiển thị uy nghi lộng lẫy tại Trang Profile nhân vật của bạn.
                </p>
                {user.role === 'admin' && onOpenAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                    className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    + Quản trị: Thêm Pháp Tướng mới
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dharmaIdols.map((dharma) => {
                  const isOwned = userUnlockedDharma.includes(dharma.id);
                  const isEquipped = user.selectedDharmaId === dharma.id;
                  const isRealmMet = user.realmLevel >= dharma.minRealmLevel;
                  const canAfford = user.spiritStones >= dharma.price;

                  return (
                    <div
                      key={dharma.id}
                      className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                        isEquipped
                          ? 'border-purple-400 bg-purple-950/30 shadow-xl shadow-purple-950/40'
                          : isOwned
                          ? 'border-slate-700 bg-slate-900/70'
                          : 'border-slate-800 bg-slate-900/40'
                      }`}
                    >
                      {/* Image showcase */}
                      <div className="relative h-44 w-full bg-slate-950 overflow-hidden group">
                        <img
                          src={dharma.imageUrl}
                          alt={dharma.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            boxShadow: `inset 0 0 24px ${dharma.auraColor}66`,
                          }}
                        />
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md"
                            style={{
                              backgroundColor: `${dharma.auraColor}33`,
                              color: dharma.auraColor,
                              border: `1px solid ${dharma.auraColor}66`,
                            }}
                          >
                            Cần {getRealmByLevel(dharma.minRealmLevel).name}
                          </span>
                        </div>
                      </div>

                      {/* Info & Action */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-100 text-sm">{dharma.name}</h4>
                            <span className="font-mono text-cyan-300 font-bold text-xs">
                              💎 {dharma.price.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[11px] text-amber-300 font-medium block mt-0.5">
                            {dharma.title}
                          </span>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                            {dharma.description}
                          </p>
                        </div>

                        <div className="pt-2.5 border-t border-slate-800/80">
                          {isEquipped ? (
                            <div className="w-full py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold text-center flex items-center justify-center gap-1.5">
                              <Check className="w-3.5 h-3.5" />
                              <span>Đang Hiển Thị Profile</span>
                            </div>
                          ) : isOwned ? (
                            <button
                              onClick={() => handleBuyDharma(dharma)}
                              className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold transition-all shadow"
                            >
                              Hiển Thị Pháp Thân
                            </button>
                          ) : !isRealmMet ? (
                            <div className="w-full py-2 rounded-xl bg-slate-900 text-slate-500 border border-slate-800 text-center flex items-center justify-center gap-1.5">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Cần Đạt Cấp {dharma.minRealmLevel}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleBuyDharma(dharma)}
                              disabled={!canAfford}
                              className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                                canAfford
                                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-950/40'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                              }`}
                            >
                              <span>Lĩnh Ngộ ({dharma.price} 💎)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: PHÁP BẢO TU CHÂN (ARTIFACTS) */}
          {activeTab === 'artifacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-400">
                  Pháp bảo hộ mệnh thượng cổ, hỗ trợ ảnh động GIF / WebP phát quang vĩnh cửu.
                </p>
                {onOpenAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
                  >
                    + Thêm Pháp Bảo Mới (Admin)
                  </button>
                )}
              </div>

              {artifacts.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400">
                  Hiện chưa có Pháp Bảo nào được niêm yết trong Tiên Các. Hãy liên hệ Quản Trị Viên!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {artifacts.map((art) => {
                    const isOwned = userUnlockedArtifacts.includes(art.id);
                    const isEquipped = user.selectedArtifactId === art.id;
                    const canAfford = user.spiritStones >= art.price;
                    const isRealmMet = user.realmLevel >= art.minRealmLevel;

                    return (
                      <div
                        key={art.id}
                        className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                          isEquipped
                            ? 'border-amber-400 bg-amber-950/30 shadow-xl shadow-amber-950/40'
                            : isOwned
                            ? 'border-slate-700 bg-slate-900/70'
                            : 'border-slate-800 bg-slate-900/40'
                        }`}
                      >
                        <div className="relative h-44 w-full bg-slate-950 overflow-hidden group">
                          <img
                            src={art.imageUrl}
                            alt={art.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ boxShadow: `inset 0 0 24px ${art.auraColor}66` }}
                          />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded bg-black/70 text-[9px] font-bold text-amber-300">
                              {art.rarity}
                            </span>
                            {art.isAnimated && (
                              <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-[9px] font-bold text-purple-200">
                                Ảnh Động
                              </span>
                            )}
                          </div>
                          <div className="absolute top-2.5 right-2.5">
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md"
                              style={{
                                backgroundColor: `${art.auraColor}33`,
                                color: art.auraColor,
                                border: `1px solid ${art.auraColor}66`,
                              }}
                            >
                              Cần Cấp {art.minRealmLevel}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-slate-100 text-sm">{art.name}</h4>
                              <span className="font-mono text-cyan-300 font-bold text-xs">
                                💎 {art.price.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-[11px] text-amber-300 font-medium block mt-0.5">
                              {art.effect}
                            </span>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                              {art.description}
                            </p>
                          </div>

                          <div className="pt-2.5 border-t border-slate-800/80">
                            {isEquipped ? (
                              <div className="w-full py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-center flex items-center justify-center gap-1.5">
                                <Check className="w-3.5 h-3.5" />
                                <span>Đang Trang Bị</span>
                              </div>
                            ) : isOwned ? (
                              <button
                                onClick={() => handleBuyArtifact(art)}
                                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow"
                              >
                                Trang Bị Ngay
                              </button>
                            ) : !isRealmMet ? (
                              <div className="w-full py-2 rounded-xl bg-slate-900 text-slate-500 border border-slate-800 text-center flex items-center justify-center gap-1.5">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Cần Cảnh Giới Cấp {art.minRealmLevel}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleBuyArtifact(art)}
                                disabled={!canAfford}
                                className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                                  canAfford
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-950/40'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                }`}
                              >
                                <span>Thu Phục ({art.price} 💎)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: DANH HIỆU ẢNH (TITLES) */}
          {activeTab === 'titles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-400">
                  Sắc phong danh hiệu thượng cổ với huy hiệu ảnh (GIF / PNG) độc tôn.
                </p>
                {onOpenAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
                  >
                    + Thêm Danh Hiệu (Admin)
                  </button>
                )}
              </div>

              {customTitles.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400">
                  Chưa có Danh Hiệu Ảnh nào được niêm yết trong Tiên Các.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {customTitles.map((title) => {
                    const price = title.price ?? 0;
                    const isOwned = userUnlockedTitles.includes(title.id);
                    const isEquipped = user.selectedTitleId === title.id;
                    const canAfford = user.spiritStones >= price;
                    const isRealmMet = user.realmLevel >= title.unlockedAtRealm;

                    return (
                      <div
                        key={title.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                          isEquipped
                            ? 'border-amber-400 bg-amber-950/30 shadow-lg'
                            : isOwned
                            ? 'border-slate-700 bg-slate-900/70'
                            : 'border-slate-800 bg-slate-900/40'
                        }`}
                      >
                        {title.badgeImageUrl ? (
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-amber-500/40 bg-slate-950 shadow-md">
                            <img src={title.badgeImageUrl} alt={title.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <span className="text-3xl shrink-0">{title.icon || '👑'}</span>
                        )}

                        <div className="flex-1 min-w-0 space-y-1.5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className={`font-bold text-sm truncate ${title.textColor}`}>{title.name}</h4>
                              <span className="font-mono text-cyan-300 font-bold text-xs">
                                💎 {price.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {title.description}
                            </p>
                          </div>

                          <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                            <span className="text-[10px] text-slate-500">
                              Cần Cảnh Giới Cấp {title.unlockedAtRealm}
                            </span>
                            {isEquipped ? (
                              <span className="text-[10px] font-bold text-amber-300">✓ Đang Đeo</span>
                            ) : isOwned ? (
                              <button
                                onClick={() => handleBuyTitle(title)}
                                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px]"
                              >
                                Đeo Ngay
                              </button>
                            ) : !isRealmMet ? (
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Chưa Đủ Cấp
                              </span>
                            ) : (
                              <button
                                onClick={() => handleBuyTitle(title)}
                                disabled={!canAfford}
                                className={`px-3 py-1 rounded-lg font-bold text-[10px] ${
                                  canAfford
                                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                Mua ({price} 💎)
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ĐAN DƯỢC */}
          {activeTab === 'pills' && (
            <div className="space-y-4">
              <p className="text-slate-400">
                Đan dược thượng phẩm gia tăng 15% xác suất độ kiếp thành công khi đột phá cảnh giới mới.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {[
                  {
                    name: 'Tụ Khí Đan',
                    price: 60,
                    desc: 'Dùng cho đột phá Luyện Khí Kỳ -> Trúc Cơ Kỳ.',
                    color: 'text-emerald-400',
                    border: 'border-emerald-500/30',
                  },
                  {
                    name: 'Trúc Cơ Đan',
                    price: 180,
                    desc: 'Dùng cho đột phá Trúc Cơ Kỳ -> Kim Đan Kỳ.',
                    color: 'text-cyan-400',
                    border: 'border-cyan-500/30',
                  },
                  {
                    name: 'Hàng Long Kim Đan',
                    price: 450,
                    desc: 'Dùng cho đột phá Kim Đan -> Nguyên Anh.',
                    color: 'text-amber-400',
                    border: 'border-amber-500/30',
                  },
                  {
                    name: 'Cửu Chuyển Hoàn Hồn Đan',
                    price: 1200,
                    desc: 'Dùng cho đột phá các đại cảnh giới thượng thừa.',
                    color: 'text-purple-400',
                    border: 'border-purple-500/30',
                  },
                ].map((pill) => {
                  const ownedCount = user.pills[pill.name] || 0;
                  const canAfford = user.spiritStones >= pill.price;

                  return (
                    <div
                      key={pill.name}
                      className={`p-4 rounded-xl border bg-slate-900/60 flex flex-col justify-between space-y-3 ${pill.border}`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold ${pill.color}`}>{pill.name}</h4>
                          <span className="text-[10px] text-slate-400">Có: {ownedCount}</span>
                        </div>
                        <div className="font-mono text-cyan-300 font-bold text-xs mt-1">
                          💎 {pill.price} Linh Thạch
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5">{pill.desc}</p>
                      </div>

                      <button
                        onClick={() => handleBuyPill(pill.name, pill.price)}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                          canAfford
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-400'
                            : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                        }`}
                      >
                        <span>Mua 1 Viên</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
