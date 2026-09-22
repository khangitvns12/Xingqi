'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Zap,
  Award,
  Flame,
  Check,
  Shield,
  Trophy,
  Swords,
  Edit2,
  Lock,
  LogOut,
  Wand2,
  Gem,
} from 'lucide-react';
import {
  CULTIVATION_REALMS,
  CULTIVATOR_AVATARS,
  CultivationRealm,
  DAOIST_TITLES,
  getRealmByLevel,
} from '../lib/cultivation/realms';
import { UserAccount } from '../lib/storage/userStore';
import {
  loadCustomFrames,
  saveCustomFrames,
  loadDharmaIdols,
  loadCustomArtifacts,
  loadCustomTitles,
  CustomFrame,
  DharmaIdol,
  CustomArtifact,
  CustomTitle,
} from '../lib/cultivation/shopAndFrames';
import { soundManager } from '../lib/audio/soundFx';
import AvatarWithFrame from './AvatarWithFrame';
import AiFrameAlignModal from './AiFrameAlignModal';

interface ProfileModalProps {
  user: UserAccount;
  onClose: () => void;
  onUpdateUser: (updated: Partial<UserAccount>) => void;
  onOpenShop?: () => void;
  onLogout?: () => void;
  isReadOnly?: boolean;
  onChallengePlayer?: (targetUser: UserAccount) => void;
}

export default function ProfileModal({
  user,
  onClose,
  onUpdateUser,
  onOpenShop,
  onLogout,
  isReadOnly = false,
  onChallengePlayer,
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'realm' | 'dharma' | 'artifacts' | 'frames' | 'titles' | 'avatars' | 'stats'>('realm');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempDaoName, setTempDaoName] = useState(user.daoName);
  const [tempSect, setTempSect] = useState(user.sect);
  const [breakthroughMsg, setBreakthroughMsg] = useState<{ type: 'success' | 'fail'; text: string } | null>(null);
  const [showAiAlignModal, setShowAiAlignModal] = useState(false);

  const currentRealm = getRealmByLevel(user.realmLevel);
  const nextRealm = getRealmByLevel(user.realmLevel + 1);
  const isMaxRealm = user.realmLevel >= 10;

  const allFrames = loadCustomFrames();
  const allDharma = loadDharmaIdols();
  const allArtifacts = loadCustomArtifacts();
  const allCustomTitles = loadCustomTitles();

  const equippedDharma: DharmaIdol | undefined = allDharma.find((d) => d.id === user.selectedDharmaId) || allDharma[0];
  const equippedArtifact: CustomArtifact | undefined = allArtifacts.find((a) => a.id === user.selectedArtifactId);

  const unlockedFrames = allFrames.filter((f) => (user.unlockedFrameIds || []).includes(f.id));
  const unlockedDharma = allDharma.filter((d) => (user.unlockedDharmaIds || []).includes(d.id));
  const unlockedArtifacts = allArtifacts.filter((a) => (user.unlockedArtifactIds || []).includes(a.id));

  const canBreakthrough = user.exp >= currentRealm.requiredExp && !isMaxRealm;

  const handleBreakthrough = () => {
    if (!canBreakthrough) return;

    // Success probability
    const successRate = currentRealm.breakthroughRate;
    const hasPill = (user.pills[currentRealm.pillNeeded] || 0) > 0;
    const effectiveRate = hasPill ? Math.min(100, successRate + 15) : successRate;

    const roll = Math.random() * 100;
    if (roll <= effectiveRate) {
      // Success!
      soundManager.playBreakthrough();
      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#06b6d4', '#10b981', '#a855f7', '#f43f5e'],
        });
      } catch {
        // ignore
      }

      const updatedPills = { ...user.pills };
      if (hasPill) {
        updatedPills[currentRealm.pillNeeded] -= 1;
      }

      const newLevel = user.realmLevel + 1;
      const newRealm = getRealmByLevel(newLevel);
      const unlockedTitle = DAOIST_TITLES.find((t) => t.unlockedAtRealm === newLevel);

      const newUnlockedTitles = [...user.unlockedTitleIds];
      if (unlockedTitle && !newUnlockedTitles.includes(unlockedTitle.id)) {
        newUnlockedTitles.push(unlockedTitle.id);
      }

      onUpdateUser({
        realmLevel: newLevel,
        exp: user.exp - currentRealm.requiredExp,
        pills: updatedPills,
        unlockedTitleIds: newUnlockedTitles,
        spiritStones: user.spiritStones + 100, // breakthrough reward
      });

      setBreakthroughMsg({
        type: 'success',
        text: `⚡ ĐỘT PHÁ THÀNH CÔNG! Đạo hữu đã bước vào [${newRealm.name}], thần thông đại trần!`,
      });
    } else {
      // Failure
      soundManager.playPieceMove();
      setBreakthroughMsg({
        type: 'fail',
        text: 'Đột phá thất bại do tâm ma quấy nhiễu! Hãy tích lũy thêm tu vi và dùng Đan Dược để gia tăng tỷ lệ.',
      });
    }
  };

  const handleSaveProfileNames = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempDaoName.trim() || isReadOnly) return;
    onUpdateUser({
      daoName: tempDaoName.trim(),
      sect: tempSect.trim() || 'Tán Tu',
    });
    setIsEditingName(false);
  };

  const handleSaveNewFrame = (newFrame: CustomFrame, equipImmediately: boolean) => {
    const updatedAllFrames = [newFrame, ...allFrames];
    saveCustomFrames(updatedAllFrames);

    const updatedUnlocked = Array.from(new Set([...(user.unlockedFrameIds || []), newFrame.id]));
    const updates: Partial<UserAccount> = {
      unlockedFrameIds: updatedUnlocked,
    };
    if (equipImmediately) {
      updates.selectedFrameId = newFrame.id;
    }
    onUpdateUser(updates);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-[#0d1424] border-2 border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Glowing Daoist Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 border-b border-amber-500/30 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Read Only Notice Badge */}
          {isReadOnly && (
            <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
              <span>Đang Xem Hồ Sơ Đạo Hữu</span>
            </div>
          )}

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-4">
              {/* Centerpiece: Glowing Cultivation Frame Avatar with Custom Frame */}
              <AvatarWithFrame
                avatarUrl={user.avatarUrl}
                daoName={user.daoName}
                realmLevel={user.realmLevel}
                frameId={user.selectedFrameId}
                size="lg"
              />

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-100">{user.daoName}</h3>
                  {!isReadOnly && (
                    <button
                      onClick={() => setIsEditingName(!isEditingName)}
                      className="p-1 rounded text-slate-400 hover:text-amber-400 transition-colors"
                      title="Chỉnh sửa đạo hiệu"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isReadOnly && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        user.isOnline
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {user.isOnline ? '🟢 Online' : '⚪ Offline'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-300/90 font-medium">
                  {DAOIST_TITLES.find((t) => t.id === user.selectedTitleId)?.name || 'Kỳ Đạo Đạo Đồng'}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${currentRealm.badgeBg}`}>
                    {currentRealm.name}
                  </span>
                  <span>•</span>
                  <span className="text-amber-400 font-mono font-semibold">{user.elo} ELO</span>
                  <span>•</span>
                  <span>{user.sect}</span>
                </div>

                {/* Display Equipped Dharma Idol & Artifact */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {equippedDharma && (
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-sm"
                      style={{
                        borderColor: `${equippedDharma.auraColor}88`,
                        backgroundColor: `${equippedDharma.auraColor}22`,
                        color: equippedDharma.auraColor,
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Pháp Tướng: {equippedDharma.name}</span>
                    </div>
                  )}
                  {equippedArtifact && (
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-sm"
                      style={{
                        borderColor: `${equippedArtifact.auraColor}88`,
                        backgroundColor: `${equippedArtifact.auraColor}22`,
                        color: equippedArtifact.auraColor,
                      }}
                    >
                      <Gem className="w-3 h-3" />
                      <span>Pháp Bảo: {equippedArtifact.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isReadOnly && onChallengePlayer && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onChallengePlayer(user);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                  title={`Thách đấu cờ tướng với ${user.daoName}`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Thách Đấu</span>
                </button>
              )}
              {!isReadOnly && !user.isGuest && onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  title={`Đăng xuất khỏi ${user.daoName}`}
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Đăng Xuất</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 text-xl leading-none p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick edit form */}
          {isEditingName && (
            <form onSubmit={handleSaveProfileNames} className="mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap gap-2 text-xs">
              <input
                type="text"
                value={tempDaoName}
                onChange={(e) => setTempDaoName(e.target.value)}
                placeholder="Đạo Hiệu Mới"
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-400 flex-1 min-w-[140px]"
                required
              />
              <input
                type="text"
                value={tempSect}
                onChange={(e) => setTempSect(e.target.value)}
                placeholder="Tông Môn / Tiên Phái"
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-400 flex-1 min-w-[140px]"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                Lưu
              </button>
            </form>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('realm')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'realm'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Cảnh Giới & Đột Phá
          </button>
          <button
            onClick={() => setActiveTab('dharma')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'dharma'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pháp Tướng ({unlockedDharma.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('artifacts')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'artifacts'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gem className="w-3.5 h-3.5" />
            <span>Pháp Bảo ({unlockedArtifacts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('frames')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'frames'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Khung Viền Avatar</span>
          </button>
          <button
            onClick={() => setActiveTab('titles')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'titles'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Kho Danh Hiệu
          </button>
          <button
            onClick={() => setActiveTab('avatars')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'avatars'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Chân Dung Avatar
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Chiến Tích & Thống Kê
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: CẢNH GIỚI & ĐỘT PHÁ */}
          {activeTab === 'realm' && (
            <div className="space-y-4 text-xs">
              {breakthroughMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium leading-relaxed ${
                    breakthroughMsg.type === 'success'
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                      : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                  }`}
                >
                  {breakthroughMsg.text}
                </div>
              )}

              {/* Current Realm Card */}
              <div className="p-4 rounded-xl border border-amber-500/30 bg-slate-900/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">Cảnh giới hiện tại:</span>
                    <h4 className="text-base font-bold text-amber-300">{currentRealm.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Yêu cầu ELO:</span>
                    <p className="font-mono text-cyan-300 font-bold">{currentRealm.minElo}+ ELO</p>
                  </div>
                </div>

                <p className="italic text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  &ldquo;{currentRealm.tagline}&rdquo;
                </p>

                {/* Progress to next realm */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Tu Vi Tích Lũy:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {user.exp} / {currentRealm.requiredExp} Tu Vi
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-950 p-0.5 border border-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.round((user.exp / currentRealm.requiredExp) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Breakthrough Action */}
                {!isReadOnly ? (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                    <div className="text-slate-400">
                      Tỷ lệ độ kiếp: <span className="font-bold text-emerald-400">{currentRealm.breakthroughRate}%</span>
                      {(user.pills[currentRealm.pillNeeded] || 0) > 0 && (
                        <span className="text-cyan-300 ml-1.5">(Có {currentRealm.pillNeeded} +15%)</span>
                      )}
                    </div>

                    <button
                      onClick={handleBreakthrough}
                      disabled={!canBreakthrough}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        canBreakthrough
                          ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 shadow-lg shadow-orange-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>{canBreakthrough ? 'Đột Phá Cảnh Giới Ngay' : 'Chưa Đủ Tu Vi Đột Phá'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-slate-400 text-xs">
                    <span>Tu vi tích lũy: {user.exp}/{currentRealm.requiredExp} EXP</span>
                    <span className="font-semibold text-amber-300">Đang tu luyện cảnh giới này</span>
                  </div>
                )}
              </div>

              {/* 10 Realms Overview List */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-300">10 Cảnh Giới Tu Tiên Tiên Kỳ:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CULTIVATION_REALMS.map((realm) => {
                    const isPassed = user.realmLevel >= realm.level;
                    const isCurrent = user.realmLevel === realm.level;
                    return (
                      <div
                        key={realm.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                          isCurrent
                            ? 'border-amber-400 bg-amber-950/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                            : isPassed
                            ? 'border-emerald-500/40 bg-slate-900/60 text-slate-300'
                            : 'border-slate-800 bg-slate-950/40 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: realm.glowColor }}
                          />
                          <span className={isCurrent ? 'font-bold text-amber-300' : ''}>
                            {realm.name}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] opacity-75">{realm.minElo}+ ELO</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PHÁP TƯỚNG KIM THÂN (HIỂN THỊ PHÁP TƯỚNG TRANG PROFILE) */}
          {activeTab === 'dharma' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-purple-300 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Pháp Thân Uy Áp Chiếu Rọi Tam Giới</span>
                  </h4>
                  <p className="text-slate-400 mt-0.5">
                    Pháp Tướng ngưng tụ từ đạo hạnh, hiển linh trên hồ sơ và uy áp đối thủ khi lâm trận.
                  </p>
                </div>
                {onOpenShop && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenShop();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                  >
                    <span>Tiên Các Shop 💎</span>
                  </button>
                )}
              </div>

              {/* Main Showcase of Equipped Dharma Idol */}
              {equippedDharma && (
                <div
                  className="relative rounded-2xl overflow-hidden border p-5 sm:p-6 bg-slate-950 flex flex-col sm:flex-row items-center gap-6 shadow-2xl"
                  style={{
                    borderColor: equippedDharma.auraColor,
                    boxShadow: `0 0 30px ${equippedDharma.auraColor}33`,
                  }}
                >
                  <div
                    className="relative w-44 h-52 sm:w-52 sm:h-64 rounded-xl overflow-hidden shrink-0 border-2 shadow-xl"
                    style={{ borderColor: equippedDharma.auraColor }}
                  >
                    <img
                      src={equippedDharma.imageUrl}
                      alt={equippedDharma.name}
                      className="w-full h-full object-cover animate-pulse"
                      style={{ animationDuration: '4s' }}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ boxShadow: `inset 0 0 25px ${equippedDharma.auraColor}77` }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-bold text-amber-300">
                      {equippedDharma.title}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <div>
                      <span
                        className="text-[11px] font-semibold uppercase tracking-wider block"
                        style={{ color: equippedDharma.auraColor }}
                      >
                        Pháp Tướng Đang Hiển Thị
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-100 mt-1">
                        {equippedDharma.name}
                      </h3>
                      <p className="text-amber-300 font-medium text-xs mt-0.5">
                        Tước Hiệu: {equippedDharma.title}
                      </p>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-xs">
                      {equippedDharma.description}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[11px]">
                        Hào quang: <span style={{ color: equippedDharma.auraColor }}>{equippedDharma.auraColor}</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[11px]">
                        Cảnh giới yêu cầu: {getRealmByLevel(equippedDharma.minRealmLevel).name}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Unlocked Dharma Idols Collection */}
              <div className="space-y-2 pt-2">
                <h5 className="font-bold text-slate-200">Kho Pháp Tướng Đã Sở Hữu ({unlockedDharma.length}):</h5>
                {unlockedDharma.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-slate-400">
                    Đạo hữu chưa ngưng tụ Pháp Tướng nào. Hãy vào Tiên Các Shop để lĩnh ngộ!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {unlockedDharma.map((dh) => {
                      const isEquipped = user.selectedDharmaId === dh.id;
                      return (
                        <div
                          key={dh.id}
                          onClick={() => onUpdateUser({ selectedDharmaId: dh.id })}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isEquipped
                              ? 'border-purple-400 bg-purple-950/40 shadow-lg shadow-purple-950/40'
                              : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                          }`}
                        >
                          <div className="relative h-24 rounded-lg overflow-hidden mb-2">
                            <img src={dh.imageUrl} alt={dh.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="font-bold text-slate-200 truncate">{dh.name}</div>
                          <div className="text-[10px] text-amber-300 truncate">{dh.title}</div>
                          <div className="mt-2 text-center">
                            {isEquipped ? (
                              <span className="text-purple-300 font-bold text-[10px]">✓ Đang Hiển Thị</span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Bấm Để Hiển Thị</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PHÁP BẢO TU CHÂN (ARTIFACTS) */}
          {activeTab === 'artifacts' && (
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div>
                  <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                    <Gem className="w-4 h-4" />
                    <span>Pháp Bảo Bản Mệnh ({unlockedArtifacts.length}/{allArtifacts.length})</span>
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Trang bị bảo vật giúp gia tăng uy thế, hiển thị ảnh động GIF/WebP tiên khí bảo hộ
                  </p>
                </div>
                {!isReadOnly && onOpenShop && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenShop();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-semibold"
                  >
                    Tiên Các Shop 💎
                  </button>
                )}
              </div>

              {/* Currently equipped artifact display */}
              {equippedArtifact && (
                <div
                  className="p-4 rounded-xl border flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 shadow-lg"
                  style={{
                    borderColor: `${equippedArtifact.auraColor}88`,
                    boxShadow: `0 0 20px ${equippedArtifact.auraColor}33`,
                  }}
                >
                  <div
                    className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden shrink-0 border-2"
                    style={{ borderColor: equippedArtifact.auraColor }}
                  >
                    <img
                      src={equippedArtifact.imageUrl}
                      alt={equippedArtifact.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ boxShadow: `inset 0 0 20px ${equippedArtifact.auraColor}66` }}
                    />
                    <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-bold text-amber-300">
                      {equippedArtifact.rarity}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Pháp Bảo Đang Trang Bị
                      </span>
                      <h3 className="text-lg font-bold text-slate-100 flex items-center justify-center sm:justify-start gap-2">
                        <span>{equippedArtifact.name}</span>
                        {equippedArtifact.isAnimated && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Ảnh Động
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-amber-300/90 font-medium mt-0.5">
                        {equippedArtifact.effect}
                      </p>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {equippedArtifact.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[10px]">
                        Hào quang: <span style={{ color: equippedArtifact.auraColor }}>{equippedArtifact.auraColor}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[10px]">
                        Cần Cảnh Giới: {getRealmByLevel(equippedArtifact.minRealmLevel).name}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Unlocked Artifacts List */}
              <div className="space-y-2 pt-2">
                <h5 className="font-bold text-slate-200">Kho Pháp Bảo Đã Khắc Tên ({unlockedArtifacts.length}):</h5>
                {unlockedArtifacts.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-slate-400">
                    Đạo hữu chưa thu phục Pháp Bảo nào. Hãy vào Tiên Các Shop hoặc luyện hoá từ cảnh giới!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {unlockedArtifacts.map((art) => {
                      const isEquipped = user.selectedArtifactId === art.id;
                      return (
                        <div
                          key={art.id}
                          onClick={() => onUpdateUser({ selectedArtifactId: art.id })}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isEquipped
                              ? 'border-amber-400 bg-amber-950/40 shadow-lg shadow-amber-500/20'
                              : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                          }`}
                        >
                          <div className="relative h-24 rounded-lg overflow-hidden mb-2 bg-slate-950">
                            <img src={art.imageUrl} alt={art.name} className="w-full h-full object-cover" />
                            {art.isAnimated && (
                              <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/70 text-[8px] font-bold text-amber-300">
                                GIF/WebP
                              </span>
                            )}
                            <span className="absolute top-1 right-1 px-1 py-0.2 rounded bg-black/70 text-[8px] font-bold text-slate-200">
                              {art.rarity}
                            </span>
                          </div>
                          <div className="font-bold text-slate-200 truncate">{art.name}</div>
                          <div className="text-[10px] text-amber-300/80 truncate">{art.effect}</div>
                          <div className="mt-2 text-center">
                            {isEquipped ? (
                              <span className="text-amber-400 font-bold text-[10px]">✓ Đang Mang</span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Bấm Để Mang</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: KHUNG VIỀN AVATAR */}
          {activeTab === 'frames' && (
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div>
                  <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Khung Viền Avatar Tiên Hiệp</span>
                  </h4>
                  <p className="text-slate-400 mt-0.5">
                    Trang bị khung viền tỏa sáng lộng lẫy quanh chân dung nhân vật.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => setShowAiAlignModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-purple-950/40 flex items-center gap-1.5 transition-all"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>✨ AI Canh Chỉnh Khung</span>
                    </button>
                  )}
                  {onOpenShop && !isReadOnly && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenShop();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md"
                    >
                      Tiên Các Shop 💎
                    </button>
                  )}
                </div>
              </div>

              {/* Frames List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Default: No custom frame */}
                <div
                  onClick={() => !isReadOnly && onUpdateUser({ selectedFrameId: undefined })}
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-between text-center space-y-2 ${
                    !isReadOnly ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    !user.selectedFrameId
                      ? 'border-amber-400 bg-amber-950/40 shadow-lg shadow-amber-500/20'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                  }`}
                >
                  <AvatarWithFrame
                    avatarUrl={user.avatarUrl}
                    daoName={user.daoName}
                    realmLevel={user.realmLevel}
                    size="md"
                  />
                  <div className="font-bold text-slate-200">Hào Quang Cảnh Giới</div>
                  <p className="text-[10px] text-slate-400">Tự động theo cảnh giới tu vi</p>
                  <div className="text-[10px] font-bold text-amber-400">
                    {!user.selectedFrameId ? '✓ Đang Dùng' : 'Mặc Định'}
                  </div>
                </div>

                {/* Unlocked Frames */}
                {unlockedFrames.map((frame) => {
                  const isSelected = user.selectedFrameId === frame.id;
                  return (
                    <div
                      key={frame.id}
                      onClick={() => !isReadOnly && onUpdateUser({ selectedFrameId: frame.id })}
                      className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-between text-center space-y-2 ${
                        !isReadOnly ? 'cursor-pointer' : 'cursor-default'
                      } ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/40 shadow-lg shadow-amber-500/20'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                      }`}
                    >
                      <AvatarWithFrame
                        avatarUrl={user.avatarUrl}
                        daoName={user.daoName}
                        realmLevel={user.realmLevel}
                        frameId={frame.id}
                        size="md"
                      />
                      <div className="font-bold text-slate-200 truncate w-full">{frame.name}</div>
                      <p className="text-[10px] text-amber-300/90">{frame.rarity}</p>
                      {frame.scale && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 font-mono">
                          AI Canh Chỉnh ({frame.scale}x)
                        </span>
                      )}
                      <div className="mt-1">
                        {isSelected ? (
                          <span className="text-amber-400 font-bold text-[10px]">✓ Đang Dùng</span>
                        ) : isReadOnly ? (
                          <span className="text-slate-500 text-[10px]">Đã Sở Hữu</span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Bấm Để Dùng</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DANH HIỆU TIÊN HIỆP */}
          {activeTab === 'titles' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-400">
                Mở khóa các danh hiệu thượng cổ bằng cách nâng cao cảnh giới tu chân và nhận sắc phong từ Thiên Đạo (hỗ trợ ảnh đại diện / huy hiệu phong thần).
              </p>

              {/* Custom Titles with Badge Image from Admin */}
              {allCustomTitles.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-bold text-amber-300">Danh Hiệu Phong Thần & Huy Hiệu Ảnh:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allCustomTitles.map((title) => {
                      const isUnlocked = user.unlockedTitleIds.includes(title.id) || user.realmLevel >= title.unlockedAtRealm;
                      const isEquipped = user.selectedTitleId === title.id;

                      return (
                        <div
                          key={title.id}
                          className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                            isEquipped
                              ? 'border-amber-400 bg-amber-950/40 shadow-lg shadow-amber-500/20'
                              : isUnlocked
                              ? 'border-slate-700 bg-slate-900/60'
                              : 'border-slate-800 bg-slate-950/40 opacity-60'
                          }`}
                        >
                          {title.badgeImageUrl ? (
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-amber-400/60 shadow-md bg-slate-950">
                              <img src={title.badgeImageUrl} alt={title.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <span className="text-2xl shrink-0">{title.icon || '👑'}</span>
                          )}
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className={`font-bold text-xs truncate ${title.textColor}`}>{title.name}</h4>
                              {isEquipped ? (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold shrink-0">
                                  Đang Đeo
                                </span>
                              ) : isUnlocked ? (
                                <button
                                  onClick={() => onUpdateUser({ selectedTitleId: title.id })}
                                  className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold shrink-0 cursor-pointer"
                                >
                                  Trang Bị
                                </button>
                              ) : (
                                <span className="text-[9px] flex items-center gap-1 text-slate-500 shrink-0">
                                  <Lock className="w-3 h-3" /> Cần Cấp {title.unlockedAtRealm}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-2">{title.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Standard Daoist Titles */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h5 className="font-bold text-slate-300">Danh Hiệu Kỳ Đạo Truyền Thống:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DAOIST_TITLES.map((title) => {
                    const isUnlocked = user.unlockedTitleIds.includes(title.id);
                    const isEquipped = user.selectedTitleId === title.id;

                    return (
                      <div
                        key={title.id}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                          isEquipped
                            ? 'border-amber-400 bg-amber-950/40 shadow-lg shadow-amber-500/20'
                            : isUnlocked
                            ? 'border-slate-700 bg-slate-900/60'
                            : 'border-slate-800 bg-slate-950/40 opacity-60'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-lg">{title.icon}</span>
                            {isEquipped ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                                Đang Đeo
                              </span>
                            ) : isUnlocked ? (
                              <button
                                onClick={() => onUpdateUser({ selectedTitleId: title.id })}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold cursor-pointer"
                              >
                                Trang Bị
                              </button>
                            ) : (
                              <span className="text-[10px] flex items-center gap-1 text-slate-500">
                                <Lock className="w-3 h-3" /> Cần {getRealmByLevel(title.unlockedAtRealm).name}
                              </span>
                            )}
                          </div>
                          <h4 className={`font-bold text-sm ${title.textColor}`}>{title.name}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{title.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PHÁP TƯỚNG (AVATAR) */}
          {activeTab === 'avatars' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-400">Chọn pháp tướng phù hợp với cảnh giới tu vi của bạn.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CULTIVATOR_AVATARS.map((av) => {
                  const isUnlocked = user.realmLevel >= av.minRealmLevel;
                  const isSelected = user.avatarUrl === av.url;

                  return (
                    <div
                      key={av.id}
                      onClick={() => {
                        if (isUnlocked) {
                          onUpdateUser({ avatarUrl: av.url, selectedAvatarId: av.id });
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all text-center space-y-2 cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/30'
                          : isUnlocked
                          ? 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
                          : 'border-slate-800 bg-slate-950/40 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-slate-700">
                        <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="font-bold text-slate-200 truncate">{av.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {isUnlocked ? (
                          isSelected ? (
                            <span className="text-amber-400 font-bold">✓ Đang Sử Dụng</span>
                          ) : (
                            <span className="text-slate-300">Nhấn Để Chọn</span>
                          )
                        ) : (
                          <span>Cần Cảnh Giới Cấp {av.minRealmLevel}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CHIẾN TÍCH & THỐNG KÊ */}
          {activeTab === 'stats' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-500 text-[11px] block">Tổng Ván Đấu</span>
                  <span className="text-lg font-bold text-slate-100">{user.stats.totalMatches}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-500 text-[11px] block">Thắng Trận</span>
                  <span className="text-lg font-bold text-emerald-400">{user.stats.wins}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-500 text-[11px] block">Tỷ Lệ Thắng</span>
                  <span className="text-lg font-bold text-amber-400">
                    {user.stats.totalMatches > 0
                      ? Math.round((user.stats.wins / user.stats.totalMatches) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-500 text-[11px] block">Liên Thắng Tối Đa</span>
                  <span className="text-lg font-bold text-rose-400">🔥 {user.stats.maxWinStreak}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h5 className="font-bold text-slate-200">Đạo Hạnh & Tài Phú:</h5>
                <div className="flex items-center justify-between text-slate-300">
                  <span>ELO Cao Nhất Từng Đạt:</span>
                  <span className="font-mono font-bold text-amber-400">{user.stats.highestElo} ELO</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Linh Thạch Hiện Có:</span>
                  <span className="font-mono font-bold text-cyan-300">💎 {user.spiritStones.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Trúc Cơ Đan Dự Trữ:</span>
                  <span className="font-mono font-bold text-purple-300">
                    {user.pills['Trúc Cơ Đan'] || 0} Viên
                  </span>
                </div>
              </div>

              {/* Account management and logout */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Tài Khoản Đang Đăng Nhập</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-slate-200">{user.daoName}</span>
                    <span className="text-[11px] text-amber-400/80 font-mono">@{user.username}</span>
                    {user.isGuest && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Khách Vãng Lai
                      </span>
                    )}
                  </div>
                </div>

                {!isReadOnly && !user.isGuest && onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Đăng Xuất Tài Khoản</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Avatar Frame Alignment Modal */}
      {showAiAlignModal && (
        <AiFrameAlignModal
          user={user}
          onClose={() => setShowAiAlignModal(false)}
          onSaveFrame={handleSaveNewFrame}
        />
      )}
    </div>
  );
}
