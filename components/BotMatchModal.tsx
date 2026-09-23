'use client';

import { useState } from 'react';
import {
  Bot,
  Swords,
  Shield,
  Zap,
  Sparkles,
  Clock,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sliders,
  ChevronRight,
  Flame,
} from 'lucide-react';
import {
  BOT_DIFFICULTY_PRESETS,
  BotDifficultyConfig,
  BotDifficultyLevel,
} from '../lib/xiangqi/ai';
import { Side } from '../lib/xiangqi/types';
import { UserAccount } from '../lib/storage/userStore';

export interface BotMatchConfig {
  difficulty: BotDifficultyConfig;
  playerSide: Side | 'random';
  timeLimit: number; // 0 for unlimited, or minutes (3, 5, 10, 15)
  increment: number;
  enableHints: boolean;
  enableUndo: boolean;
  enableAdvantageBar: boolean;
}

interface BotMatchModalProps {
  user: UserAccount;
  onStartBotMatch: (config: BotMatchConfig) => void;
  onClose: () => void;
}

export default function BotMatchModal({
  user,
  onStartBotMatch,
  onClose,
}: BotMatchModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<BotDifficultyLevel>(2);
  const [playerSide, setPlayerSide] = useState<Side | 'random'>('red');
  const [timeLimit, setTimeLimit] = useState<number>(10);
  const [enableHints, setEnableHints] = useState<boolean>(true);
  const [enableUndo, setEnableUndo] = useState<boolean>(true);
  const [enableAdvantageBar, setEnableAdvantageBar] = useState<boolean>(true);

  const selectedPreset =
    BOT_DIFFICULTY_PRESETS.find((p) => p.level === selectedLevel) ||
    BOT_DIFFICULTY_PRESETS[1];

  const handleStart = () => {
    // Resolve random side if chosen
    let finalSide: Side = 'red';
    if (playerSide === 'random') {
      finalSide = Math.random() < 0.5 ? 'red' : 'black';
    } else {
      finalSide = playerSide;
    }

    onStartBotMatch({
      difficulty: selectedPreset,
      playerSide: finalSide,
      timeLimit,
      increment: timeLimit === 0 ? 0 : 5,
      enableHints,
      enableUndo,
      enableAdvantageBar,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(4,28,24,0.9)] p-4 sm:p-6 space-y-5 my-auto max-h-[95vh] overflow-y-auto text-emerald-100 font-xianxia">
        {/* Background glow effects */}
        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-emerald-500/30 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white text-glow-jade flex items-center gap-2">
                <span>Chế Độ Chơi Với Bot</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-teal-300 border border-emerald-500/40 font-medium">
                  Chọn Độ Khó
                </span>
              </h3>
              <p className="text-xs text-emerald-300/70">
                Luận đạo cùng Trí Giả Tiên Giới, rèn giũa kỳ đạo từ sơ học đến đỉnh phong
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#021310] hover:bg-[#062420] text-emerald-400 hover:text-white flex items-center justify-center transition-colors text-base border border-emerald-500/30"
          >
            ✕
          </button>
        </div>

        {/* Difficulty Selection Cards */}
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Chọn Cấp Độ Khó Của Bot (6 Cảnh Giới)</span>
            </label>
            <span className="text-[11px] text-amber-400 font-medium">
              Đang chọn: {selectedPreset.name} • {selectedPreset.elo} ELO
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {BOT_DIFFICULTY_PRESETS.map((preset) => {
              const isSelected = preset.level === selectedLevel;
              return (
                <div
                  key={preset.level}
                  onClick={() => setSelectedLevel(preset.level)}
                  className={`cursor-pointer rounded-xl p-3 border transition-all relative overflow-hidden flex flex-col justify-between select-none ${
                    isSelected
                      ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-amber-400 shadow-lg'
                      : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                  style={{
                    borderColor: isSelected ? preset.color : undefined,
                    boxShadow: isSelected ? `0 0 20px ${preset.glowColor}` : undefined,
                  }}
                >
                  {/* Selected check badge */}
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-slate-950 shadow"
                      style={{ backgroundColor: preset.color }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="space-y-2">
                    {/* Bot avatar & title */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className="relative w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0"
                        style={{ borderColor: preset.color }}
                      >
                        <img
                          src={preset.botRival.avatarUrl}
                          alt={preset.botRival.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                            style={{ backgroundColor: preset.color }}
                          >
                            Cấp {preset.level}
                          </span>
                          <h4 className="font-bold text-slate-100 text-xs truncate">
                            {preset.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-300 truncate font-serif">
                          {preset.botRival.name}
                        </p>
                        <p className="text-[10px] text-amber-400/90">
                          {preset.subName} • {preset.elo} ELO
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {preset.description}
                    </p>
                  </div>

                  {/* Character Quote Preview */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80">
                    <p className="text-[10px] italic text-slate-400 truncate">
                      &ldquo;{preset.botRival.quotes.greeting}&rdquo;
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Match Parameters */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-xs">
          {/* Pick Side */}
          <div className="space-y-2">
            <label className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              <span>2. Chọn Bên Cầm Quân</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPlayerSide('red')}
                className={`py-2 px-2 rounded-lg border font-semibold flex flex-col items-center gap-1 transition-all ${
                  playerSide === 'red'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-md shadow-rose-950/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-serif text-xs font-bold shadow">
                  帥
                </span>
                <span>Quân Đỏ (Đi Trước)</span>
              </button>

              <button
                type="button"
                onClick={() => setPlayerSide('random')}
                className={`py-2 px-2 rounded-lg border font-semibold flex flex-col items-center gap-1 transition-all ${
                  playerSide === 'random'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-md shadow-amber-950/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow">
                  🎲
                </span>
                <span>Ngẫu Nhiên</span>
              </button>

              <button
                type="button"
                onClick={() => setPlayerSide('black')}
                className={`py-2 px-2 rounded-lg border font-semibold flex flex-col items-center gap-1 transition-all ${
                  playerSide === 'black'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 border border-cyan-400 text-cyan-300 flex items-center justify-center font-serif text-xs font-bold shadow">
                  將
                </span>
                <span>Quân Đen (Đi Sau)</span>
              </button>
            </div>
          </div>

          {/* Pick Match Time */}
          <div className="space-y-2">
            <label className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>3. Thời Gian Trận Đấu</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '3 Phút', value: 3 },
                { label: '5 Phút', value: 5 },
                { label: '10 Phút', value: 10 },
                { label: 'Vô Hạn', value: 0 },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTimeLimit(t.value)}
                  className={`py-2 rounded-lg border font-medium text-center transition-all ${
                    timeLimit === t.value
                      ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 font-bold shadow-md shadow-cyan-950/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 italic">
              {timeLimit === 0
                ? 'Chế độ Vô Hạn: Không đếm ngược thời gian, thỏa sức suy ngẫm từng bước cờ.'
                : `Mỗi bên có ${timeLimit} phút suy nghĩ kèm +5 giây mỗi nước đi.`}
            </p>
          </div>
        </div>

        {/* Section 3: Training & Assistance Features */}
        <div className="relative z-10 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl space-y-2 text-xs">
          <label className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>4. Tính Năng Hỗ Trợ Luyện Cờ Cùng Bot</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={enableHints}
                onChange={(e) => setEnableHints(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500 focus:ring-offset-slate-950"
              />
              <div>
                <div className="font-medium text-slate-200">Gợi Ý Nước Đi</div>
                <div className="text-[10px] text-slate-400">Thiên Cơ Chỉ Điểm khi bí cờ</div>
              </div>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={enableUndo}
                onChange={(e) => setEnableUndo(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500 focus:ring-offset-slate-950"
              />
              <div>
                <div className="font-medium text-slate-200">Xin Đi Lại (Hối Cờ)</div>
                <div className="text-[10px] text-slate-400">Hoàn lại nước nếu đi nhầm</div>
              </div>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={enableAdvantageBar}
                onChange={(e) => setEnableAdvantageBar(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500 focus:ring-offset-slate-950"
              />
              <div>
                <div className="font-medium text-slate-200">Thanh Đánh Giá Thế Trận</div>
                <div className="text-[10px] text-slate-400">Đo tỷ lệ ưu thế thời gian thực</div>
              </div>
            </label>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-emerald-500/20">
          <div className="flex items-center gap-2 text-xs text-emerald-300/80">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span>Đối thủ: <strong className="text-teal-200">{selectedPreset.botRival.name}</strong> ({selectedPreset.subName})</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#031815] text-emerald-300 hover:bg-[#062923] font-medium text-xs transition-colors border border-emerald-500/30"
            >
              Quay Lại Sảnh
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl jade-button-primary text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>Bắt Đầu Luận Đạo Với Bot</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
