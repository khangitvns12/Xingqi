'use client';

import { useState, useEffect } from 'react';
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
  Cloud,
  RefreshCw,
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
  syncItemsFromCloud,
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
  const [isSyncing, setIsSyncing] = useState(false);

  const [frames, setFrames] = useState<CustomFrame[]>(() => loadCustomFrames().filter((f) => f.inShop));
  const [dharmaIdols, setDharmaIdols] = useState<DharmaIdol[]>(() => loadDharmaIdols().filter((d) => d.inShop));
  const [artifacts, setArtifacts] = useState<CustomArtifact[]>(() => loadCustomArtifacts().filter((a) => a.inShop));
  const [customTitles, setCustomTitles] = useState<CustomTitle[]>(() => loadCustomTitles().filter((t) => t.inShop));

  // Reload data from local & cloud
  const reloadData = () => {
    setFrames(loadCustomFrames().filter((f) => f.inShop));
    setDharmaIdols(loadDharmaIdols().filter((d) => d.inShop));
    setArtifacts(loadCustomArtifacts().filter((a) => a.inShop));
    setCustomTitles(loadCustomTitles().filter((t) => t.inShop));
  };

  useEffect(() => {
    // Background cloud sync on opening shop
    syncItemsFromCloud().then(() => {
      reloadData();
    });
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncItemsFromCloud();
      reloadData();
      showMsg('Đã đồng bộ kho bảo vật Tiên Các từ máy chủ!', 'success');
    } catch {
      showMsg('Không thể kết nối máy chủ đồng bộ.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

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
        colors: [artifact.auraColor, '#10b981', '#14b8a6', '#ffffff'],
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
        colors: [frame.glowColor, '#10b981', '#ffffff'],
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
        colors: [dharma.auraColor, '#10b981', '#14b8a6', '#ffffff'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(4,28,24,0.9)] overflow-hidden flex flex-col max-h-[92vh] text-emerald-100">
        {/* Header */}
        <div className="relative bg-[#041d1a] px-4 py-3 sm:px-6 sm:py-4 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl jade-button-primary flex items-center justify-center text-white shadow-lg">
              <ShoppingBag className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-xianxia text-white text-glow-jade">
                  Tiên Các • Cửa Hàng Linh Thạch
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-teal-300 border border-emerald-500/40 font-mono font-bold">
                  BẢO VẬT TIÊN GIỚI
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80">
                Sở hữu Khung Viền tùy chỉnh, Pháp Tướng hiển thị, Pháp Bảo hộ thân & Đan Dược
              </p>
            </div>
          </div>

          {/* User's Spirit Stones balance & Cloud Sync */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-2.5 py-1.5 rounded-xl bg-[#031815] border border-emerald-500/40 hover:border-teal-400 text-teal-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Đồng bộ lại khung viền và bảo vật mới nhất từ đám mây"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline font-xianxia">Đồng Bộ</span>
            </button>

            <div className="px-3 py-1.5 rounded-xl bg-[#021310] border border-emerald-500/40 flex items-center gap-2 shadow-inner">
              <span className="text-sm">💎</span>
              <span className="font-mono font-bold text-teal-300 text-sm">
                {user.spiritStones.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-300/80 hidden sm:inline">Linh Thạch</span>
            </div>

            <button
              onClick={onClose}
              className="text-emerald-300/70 hover:text-white text-xl leading-none p-1 transition-colors"
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
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-400/50'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center border-b border-emerald-500/25 bg-[#031815] px-4 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('frames')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap font-xianxia ${
              activeTab === 'frames'
                ? 'border-teal-400 text-teal-200 font-bold'
                : 'border-transparent text-emerald-400/70 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-teal-400" />
            <span>Khung Viền Tu Tiên ({frames.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('dharma')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap font-xianxia ${
              activeTab === 'dharma'
                ? 'border-teal-400 text-teal-200 font-bold'
                : 'border-transparent text-emerald-400/70 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Pháp Tướng ({dharmaIdols.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('artifacts')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap font-xianxia ${
              activeTab === 'artifacts'
                ? 'border-teal-400 text-teal-200 font-bold'
                : 'border-transparent text-emerald-400/70 hover:text-white'
            }`}
          >
            <Gem className="w-4 h-4 text-teal-300" />
            <span>Pháp Bảo ({artifacts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('titles')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap font-xianxia ${
              activeTab === 'titles'
                ? 'border-teal-400 text-teal-200 font-bold'
                : 'border-transparent text-emerald-400/70 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>Danh Hiệu Ảnh ({customTitles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pills')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap font-xianxia ${
              activeTab === 'pills'
                ? 'border-teal-400 text-teal-200 font-bold'
                : 'border-transparent text-emerald-400/70 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-emerald-300" />
            <span>Đan Dược Đột Phá</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: KHUNG VIỀN */}
          {activeTab === 'frames' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-emerald-300/80">
                  Khung viền hào quang bao quanh Avatar nhân vật trên bàn cờ, hồ sơ và bảng xếp hạng.
                </p>
                {user.role === 'admin' && onOpenAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                    className="text-[11px] text-teal-300 hover:underline flex items-center gap-1 font-semibold font-xianxia"
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
                          ? 'border-teal-400 bg-emerald-950/60 shadow-lg shadow-emerald-950/50'
                          : isOwned
                          ? 'border-emerald-500/40 bg-[#062520]/80'
                          : 'border-emerald-500/25 bg-[#041a17]/60'
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
                          <h4 className="font-bold text-white text-sm truncate font-xianxia">{frame.name}</h4>
                          <span
                            className="text-[10px] px-1.5 py-0.2 rounded font-semibold inline-block my-0.5"
                            style={{ backgroundColor: `${frame.glowColor}22`, color: frame.glowColor }}
                          >
                            {frame.rarity}
                          </span>
                          <div className="font-mono text-teal-300 font-bold text-xs mt-0.5">
                            💎 {frame.price.toLocaleString()} Linh Thạch
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-emerald-200/70 line-clamp-2 leading-relaxed">
                        {frame.description}
                      </p>

                      <div className="pt-2 border-t border-emerald-500/20">
                        {isEquipped ? (
                          <div className="w-full py-2 rounded-xl bg-emerald-900/60 text-teal-200 border border-teal-500/40 font-bold text-center flex items-center justify-center gap-1.5 font-xianxia">
                            <Check className="w-3.5 h-3.5" />
                            <span>Đang Sử Dụng</span>
                          </div>
                        ) : isOwned ? (
                          <button
                            onClick={() => handleBuyFrame(frame)}
                            className="w-full py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-teal-100 border border-emerald-500/40 font-bold transition-colors font-xianxia"
                          >
                            Trang Bị Khung
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyFrame(frame)}
                            disabled={!canAfford}
                            className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all font-xianxia ${
                              canAfford
                                ? 'jade-button-primary shadow-md'
                                : 'bg-[#021310] text-emerald-600 cursor-not-allowed border border-emerald-500/20'
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
                <p className="text-emerald-300/80">
                  Pháp Tướng Kim Thân hiển thị uy nghi lộng lẫy tại Trang Profile nhân vật của bạn.
                </p>
                {user.role === 'admin' && onOpenAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                    className="text-[11px] text-teal-300 hover:underline flex items-center gap-1 font-semibold font-xianxia"
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
                          ? 'border-teal-400 bg-emerald-950/60 shadow-xl shadow-emerald-950/50'
                          : isOwned
                          ? 'border-emerald-500/40 bg-[#062520]/80'
                          : 'border-emerald-500/25 bg-[#041a17]/60'
                      }`}
                    >
                      {/* Image showcase */}
                      <div className="relative h-44 w-full bg-[#02110f] overflow-hidden group">
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
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md font-xianxia"
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
                            <h4 className="font-bold text-white text-sm font-xianxia">{dharma.name}</h4>
                            <span className="font-mono text-teal-300 font-bold text-xs">
                              💎 {dharma.price.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-300 font-medium block mt-0.5 font-xianxia">
                            {dharma.title}
                          </span>
                          <p className="text-[11px] text-emerald-200/70 line-clamp-2 mt-1.5 leading-relaxed">
                            {dharma.description}
                          </p>
                        </div>

                        <div className="pt-2.5 border-t border-emerald-500/20">
                          {isEquipped ? (
                            <div className="w-full py-2 rounded-xl bg-emerald-900/60 text-teal-200 border border-teal-500/40 font-bold text-center flex items-center justify-center gap-1.5 font-xianxia">
                              <Check className="w-3.5 h-3.5" />
                              <span>Đang Hiển Thị Profile</span>
                            </div>
                          ) : isOwned ? (
                            <button
                              onClick={() => handleBuyDharma(dharma)}
                              className="w-full py-2 rounded-xl jade-button-primary text-white font-bold transition-all shadow font-xianxia"
                            >
                              Hiển Thị Pháp Thân
                            </button>
                          ) : !isRealmMet ? (
                            <div className="w-full py-2 rounded-xl bg-[#021310] text-emerald-600 border border-emerald-500/20 text-center flex items-center justify-center gap-1.5 font-xianxia">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Cần Đạt Cấp {dharma.minRealmLevel}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleBuyDharma(dharma)}
                              disabled={!canAfford}
                              className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all font-xianxia ${
                                canAfford
                                  ? 'jade-button-primary shadow-md'
                                  : 'bg-[#021310] text-emerald-600 cursor-not-allowed border border-emerald-500/20'
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
                <p className="text-emerald-300/80">
                  Pháp bảo hộ mệnh thượng cổ, hỗ trợ ảnh động GIF / WebP phát quang vĩnh cửu.
                </p>
                {onOpenAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                    className="text-[11px] text-teal-300 hover:underline font-medium font-xianxia"
                  >
                    + Thêm Pháp Bảo Mới (Admin)
                  </button>
                )}
              </div>

              {artifacts.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#041a17]/50 border border-emerald-500/20 text-center text-emerald-300/60 font-xianxia">
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
                            ? 'border-teal-400 bg-emerald-950/60 shadow-xl shadow-emerald-950/50'
                            : isOwned
                            ? 'border-emerald-500/40 bg-[#062520]/80'
                            : 'border-emerald-500/25 bg-[#041a17]/60'
                        }`}
                      >
                        <div className="relative h-44 w-full bg-[#02110f] overflow-hidden group">
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
                            <span className="px-2 py-0.5 rounded bg-black/70 text-[9px] font-bold text-teal-200">
                              {art.rarity}
                            </span>
                            {art.isAnimated && (
                              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-400/40 text-[9px] font-bold text-teal-200">
                                Ảnh Động
                              </span>
                            )}
                          </div>
                          <div className="absolute top-2.5 right-2.5">
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md font-xianxia"
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
                              <h4 className="font-bold text-white text-sm font-xianxia">{art.name}</h4>
                              <span className="font-mono text-teal-300 font-bold text-xs">
                                💎 {art.price.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-[11px] text-emerald-300 font-medium block mt-0.5 font-xianxia">
                              {art.effect}
                            </span>
                            <p className="text-[11px] text-emerald-200/70 line-clamp-2 mt-1.5 leading-relaxed">
                              {art.description}
                            </p>
                          </div>

                          <div className="pt-2.5 border-t border-emerald-500/20">
                            {isEquipped ? (
                              <div className="w-full py-2 rounded-xl bg-emerald-900/60 text-teal-200 border border-teal-500/40 font-bold text-center flex items-center justify-center gap-1.5 font-xianxia">
                                <Check className="w-3.5 h-3.5" />
                                <span>Đang Trang Bị</span>
                              </div>
                            ) : isOwned ? (
                              <button
                                onClick={() => handleBuyArtifact(art)}
                                className="w-full py-2 rounded-xl jade-button-primary text-white font-bold transition-all shadow font-xianxia"
                              >
                                Trang Bị Ngay
                              </button>
                            ) : !isRealmMet ? (
                              <div className="w-full py-2 rounded-xl bg-[#021310] text-emerald-600 border border-emerald-500/20 text-center flex items-center justify-center gap-1.5 font-xianxia">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Cần Cảnh Giới Cấp {art.minRealmLevel}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleBuyArtifact(art)}
                                disabled={!canAfford}
                                className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all font-xianxia ${
                                  canAfford
                                    ? 'jade-button-primary shadow-md'
                                    : 'bg-[#021310] text-emerald-600 cursor-not-allowed border border-emerald-500/20'
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
                <p className="text-emerald-300/80">
                  Sắc phong danh hiệu thượng cổ với huy hiệu ảnh (GIF / PNG) độc tôn.
                </p>
                {onOpenAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                    className="text-[11px] text-teal-300 hover:underline font-medium font-xianxia"
                  >
                    + Thêm Danh Hiệu (Admin)
                  </button>
                )}
              </div>

              {customTitles.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#041a17]/50 border border-emerald-500/20 text-center text-emerald-300/60 font-xianxia">
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
                            ? 'border-teal-400 bg-emerald-950/60 shadow-lg'
                            : isOwned
                            ? 'border-emerald-500/40 bg-[#062520]/80'
                            : 'border-emerald-500/25 bg-[#041a17]/60'
                        }`}
                      >
                        {title.badgeImageUrl ? (
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-emerald-500/40 bg-[#021310] shadow-md">
                            <img src={title.badgeImageUrl} alt={title.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <span className="text-3xl shrink-0">{title.icon || '👑'}</span>
                        )}

                        <div className="flex-1 min-w-0 space-y-1.5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className={`font-bold text-sm truncate font-xianxia ${title.textColor}`}>{title.name}</h4>
                              <span className="font-mono text-teal-300 font-bold text-xs">
                                💎 {price.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-200/70 line-clamp-2 leading-relaxed">
                              {title.description}
                            </p>
                          </div>

                          <div className="pt-2 flex items-center justify-between border-t border-emerald-500/20">
                            <span className="text-[10px] text-emerald-400/60">
                              Cần Cảnh Giới Cấp {title.unlockedAtRealm}
                            </span>
                            {isEquipped ? (
                              <span className="text-[10px] font-bold text-teal-300 font-xianxia">✓ Đang Đeo</span>
                            ) : isOwned ? (
                              <button
                                onClick={() => handleBuyTitle(title)}
                                className="px-3 py-1 rounded-xl jade-button-primary text-white font-bold text-[10px] font-xianxia"
                              >
                                Đeo Ngay
                              </button>
                            ) : !isRealmMet ? (
                              <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-xianxia">
                                <Lock className="w-3 h-3" /> Chưa Đủ Cấp
                              </span>
                            ) : (
                              <button
                                onClick={() => handleBuyTitle(title)}
                                disabled={!canAfford}
                                className={`px-3 py-1 rounded-xl font-bold text-[10px] font-xianxia ${
                                  canAfford
                                    ? 'jade-button-primary text-white'
                                    : 'bg-[#021310] text-emerald-600 cursor-not-allowed'
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
              <p className="text-emerald-300/80">
                Đan dược thượng phẩm gia tăng 15% xác suất độ kiếp thành công khi đột phá cảnh giới mới.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {[
                  {
                    name: 'Tụ Khí Đan',
                    price: 60,
                    desc: 'Dùng cho đột phá Luyện Khí Kỳ -> Trúc Cơ Kỳ.',
                    color: 'text-emerald-300',
                    border: 'border-emerald-500/30',
                  },
                  {
                    name: 'Trúc Cơ Đan',
                    price: 180,
                    desc: 'Dùng cho đột phá Trúc Cơ Kỳ -> Kim Đan Kỳ.',
                    color: 'text-teal-300',
                    border: 'border-teal-500/30',
                  },
                  {
                    name: 'Hàng Long Kim Đan',
                    price: 450,
                    desc: 'Dùng cho đột phá Kim Đan -> Nguyên Anh.',
                    color: 'text-emerald-200',
                    border: 'border-emerald-400/30',
                  },
                  {
                    name: 'Cửu Chuyển Hoàn Hồn Đan',
                    price: 1200,
                    desc: 'Dùng cho đột phá các đại cảnh giới thượng thừa.',
                    color: 'text-white',
                    border: 'border-emerald-300/40',
                  },
                ].map((pill) => {
                  const ownedCount = user.pills[pill.name] || 0;
                  const canAfford = user.spiritStones >= pill.price;

                  return (
                    <div
                      key={pill.name}
                      className={`p-4 rounded-xl border bg-[#062420]/80 flex flex-col justify-between space-y-3 ${pill.border}`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold font-xianxia ${pill.color}`}>{pill.name}</h4>
                          <span className="text-[10px] text-emerald-400/80">Có: {ownedCount}</span>
                        </div>
                        <div className="font-mono text-teal-300 font-bold text-xs mt-1">
                          💎 {pill.price} Linh Thạch
                        </div>
                        <p className="text-[11px] text-emerald-200/70 mt-1.5">{pill.desc}</p>
                      </div>

                      <button
                        onClick={() => handleBuyPill(pill.name, pill.price)}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all font-xianxia ${
                          canAfford
                            ? 'bg-emerald-950 hover:bg-emerald-900 text-teal-100 border border-emerald-500/40'
                            : 'bg-[#021310] text-emerald-600 cursor-not-allowed border border-emerald-500/20'
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
