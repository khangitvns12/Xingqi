'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, Upload, Wand2, Check, RefreshCw, X, Shield, Eye, Sliders } from 'lucide-react';
import { CustomFrame } from '../lib/cultivation/shopAndFrames';
import { UserAccount } from '../lib/storage/userStore';
import AvatarWithFrame from './AvatarWithFrame';

interface AiFrameAlignModalProps {
  user: UserAccount;
  onClose: () => void;
  onSaveFrame: (frame: CustomFrame, equipImmediately: boolean) => void;
}

export default function AiFrameAlignModal({ user, onClose, onSaveFrame }: AiFrameAlignModalProps) {
  const [frameImage, setFrameImage] = useState<string>('');
  const [frameName, setFrameName] = useState<string>('');
  const [frameRarity, setFrameRarity] = useState<CustomFrame['rarity']>('Cực Phẩm');
  const [glowColor, setGlowColor] = useState<string>('#f59e0b');
  const [description, setDescription] = useState<string>('');
  
  // Alignment metrics
  const [scale, setScale] = useState<number>(1.40);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  // AI states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('xl');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Call Gemini AI Alignment API
  const handleAiAlign = async (imgData?: string) => {
    const targetImage = imgData || frameImage;
    if (!targetImage) {
      alert('Vui lòng tải lên ảnh khung viền (PNG đã xóa nền) trước khi canh chỉnh!');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/align-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: targetImage }),
      });

      if (!res.ok) {
        throw new Error('Lỗi từ hệ thống AI');
      }

      const data = await res.json();
      if (typeof data.scale === 'number') setScale(data.scale);
      if (typeof data.offsetX === 'number') setOffsetX(data.offsetX);
      if (typeof data.offsetY === 'number') setOffsetY(data.offsetY);
      if (data.glowColor) setGlowColor(data.glowColor);
      if (data.suggestedName && !frameName) setFrameName(data.suggestedName);
      if (data.rarity) setFrameRarity(data.rarity);
      if (data.description && !description) setDescription(data.description);
      if (data.explanation) setAiExplanation(data.explanation);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kết nối AI';
      setAiExplanation(`Tự động canh chỉnh dự phòng: Đã căn giữa tâm khung viền (${msg}).`);
      setScale(1.40);
      setOffsetX(0);
      setOffsetY(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const base64 = event.target.result;
        setFrameImage(base64);
        if (!frameName) {
          const defaultName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
          setFrameName(defaultName.charAt(0).toUpperCase() + defaultName.slice(1));
        }
        // Auto-run AI alignment immediately upon upload
        handleAiAlign(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (equipNow: boolean) => {
    if (!frameImage) {
      alert('Vui lòng tải ảnh khung viền!');
      return;
    }

    const newFrame: CustomFrame = {
      id: 'frame_custom_' + Date.now(),
      name: frameName.trim() || 'Khung Viền Tiên Hiệp',
      imageUrl: frameImage,
      price: 0,
      inShop: false,
      rarity: frameRarity,
      glowColor: glowColor,
      description: description.trim() || 'Khung viền được AI tự động canh chỉnh khớp hoàn hảo với avatar.',
      scale: scale,
      offsetX: offsetX,
      offsetY: offsetY,
      createdBy: user.daoName,
      createdAt: Date.now(),
    };

    onSaveFrame(newFrame, equipNow);
    onClose();
  };

  // Construct temporary frame object for real-time live preview
  const previewFrame: CustomFrame = {
    id: 'preview_temp',
    name: frameName || 'Khung Đang Xem Trước',
    imageUrl: frameImage,
    price: 0,
    inShop: false,
    rarity: frameRarity,
    glowColor: glowColor,
    description: description,
    scale: scale,
    offsetX: offsetX,
    offsetY: offsetY,
    createdAt: 0,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0f172a] border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-950/40 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-500/30 text-amber-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-slate-100 flex items-center gap-2">
                <span>AI Tự Động Canh Chỉnh Khung Avatar</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/40 font-mono font-medium">
                  Gemini Vision
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tải ảnh PNG đã tách nền, AI sẽ tự động phân tích tâm lỗ khuyết và điều chỉnh tỉ lệ ôm khít avatar.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Main Grid: Left Controls (7 cols), Right Live Preview (5 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Controls */}
            <div className="md:col-span-7 space-y-4">
              {/* Upload Box */}
              <div>
                <label className="block text-slate-200 font-semibold mb-1.5 flex items-center justify-between">
                  <span>1. Chọn Ảnh Khung (PNG Trong Suốt)</span>
                  <span className="text-[11px] text-amber-400 font-normal">Hỗ trợ PNG tách nền</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    frameImage
                      ? 'border-amber-500/50 bg-amber-950/10'
                      : 'border-slate-700 hover:border-amber-500/40 bg-slate-950/50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/webp,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload className="w-6 h-6 text-amber-400" />
                    <span className="text-slate-200 font-medium">
                      {frameImage ? 'Đã tải ảnh lên (Bấm để đổi ảnh khác)' : 'Bấm để chọn file ảnh PNG đã xóa nền'}
                    </span>
                    <span className="text-[10px] text-slate-500">Kéo thả hoặc dán file PNG trong suốt</span>
                  </div>
                </div>

                {/* Or image URL input */}
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Hoặc dán URL ảnh PNG trực tiếp vào đây..."
                    value={frameImage.startsWith('data:') ? '' : frameImage}
                    onChange={(e) => {
                      setFrameImage(e.target.value);
                      if (e.target.value) handleAiAlign(e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* AI Auto Align Trigger Button */}
              {frameImage && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                      <span>AI Tự Động Canh Chỉnh Tâm & Kích Cỡ</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Phân tích hình học, tìm lỗ khuyết và căn tỉ lệ khớp với hình tròn avatar.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAiAlign()}
                    disabled={isAnalyzing}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang Phân Tích...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Chạy Lại AI Canh Chỉnh</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* AI Explanation Banner */}
              {aiExplanation && (
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-[11px] text-cyan-300 flex items-start gap-2 animate-in fade-in">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold">Kết quả AI: </span>
                    {aiExplanation}
                  </div>
                </div>
              )}

              {/* Alignment Tuning Sliders */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-slate-200 font-semibold border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>2. Tinh Chỉnh Thủ Công (Tùy Chọn)</span>
                  </span>
                  <button
                    onClick={() => {
                      setScale(1.40);
                      setOffsetX(0);
                      setOffsetY(0);
                    }}
                    className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Mặc định</span>
                  </button>
                </div>

                {/* Scale Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-300">Tỉ Lệ Phóng Đại (Scale):</span>
                    <span className="font-mono text-amber-400 font-bold">{scale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.10"
                    max="1.85"
                    step="0.01"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                {/* Offset X Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-300">Dịch Chuyển Ngang (X):</span>
                    <span className="font-mono text-cyan-400 font-bold">{offsetX > 0 ? `+${offsetX}` : offsetX} px</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Offset Y Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-300">Dịch Chuyển Dọc (Y):</span>
                    <span className="font-mono text-purple-400 font-bold">{offsetY > 0 ? `+${offsetY}` : offsetY} px</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                </div>
              </div>

              {/* Frame Info Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tên Khung Viền</label>
                  <input
                    type="text"
                    placeholder="VD: Cửu Tiêu Long Khung..."
                    value={frameName}
                    onChange={(e) => setFrameName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Màu Hào Quang Phát Sáng</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={glowColor}
                      onChange={(e) => setGlowColor(e.target.value)}
                      className="w-8 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                    />
                    <input
                      type="text"
                      value={glowColor}
                      onChange={(e) => setGlowColor(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Live Preview Box */}
            <div className="md:col-span-5 flex flex-col items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="w-full text-center">
                <span className="text-[11px] font-semibold text-amber-300 flex items-center justify-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem Trước Trực Quan Avatar Của Bạn</span>
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Đang thử trên tài khoản: <span className="font-bold text-slate-200">{user.daoName}</span>
                </p>
              </div>

              {/* Main Avatar Showcase */}
              <div className="relative py-4 flex flex-col items-center justify-center">
                <div className="relative p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-inner flex items-center justify-center">
                  {/* Grid background reference lines */}
                  <div className="absolute inset-2 border border-slate-800/40 rounded-xl pointer-events-none" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-500/15 pointer-events-none" />
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-500/15 pointer-events-none" />

                  {/* Render AvatarWithFrame */}
                  <div className="relative">
                    {frameImage ? (
                      <div className="relative flex items-center justify-center">
                        <div
                          className={`relative rounded-full overflow-hidden transition-all ${
                            previewSize === 'sm'
                              ? 'w-8 h-8'
                              : previewSize === 'md'
                              ? 'w-11 h-11'
                              : previewSize === 'lg'
                              ? 'w-16 h-16'
                              : previewSize === '2xl'
                              ? 'w-24 h-24'
                              : 'w-20 h-20'
                          }`}
                          style={{
                            boxShadow: `0 0 16px ${glowColor}66`,
                            borderColor: glowColor,
                          }}
                        >
                          <img
                            src={user.avatarUrl}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Overlaid frame with exact alignment */}
                        <div
                          className="absolute inset-0 pointer-events-none flex items-center justify-center transition-transform duration-100"
                          style={{
                            transform: `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`,
                          }}
                        >
                          <img
                            src={frameImage}
                            alt="preview-frame"
                            className="w-full h-full object-contain"
                            style={{ filter: `drop-shadow(0 0 10px ${glowColor})` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-center p-2">
                        <Shield className="w-6 h-6 mb-1 opacity-50" />
                        <span className="text-[10px]">Chưa có khung</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Size toggle bar */}
                <div className="flex items-center gap-1 mt-3">
                  {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPreviewSize(s)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        previewSize === s
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status summary */}
              <div className="w-full p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Hệ số Scale:</span>
                  <span className="font-mono text-amber-300 font-bold">{scale.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Tâm dịch chuyển:</span>
                  <span className="font-mono text-cyan-300">X: {offsetX}px • Y: {offsetY}px</span>
                </div>
                <div className="flex justify-between">
                  <span>Phẩm cấp:</span>
                  <span className="font-bold text-purple-300">{frameRarity}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
          >
            Đóng Lại
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={!frameImage}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-colors disabled:opacity-40"
            >
              Lưu Vào Kho Khung
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={!frameImage}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
            >
              <Check className="w-4 h-4" />
              <span>Lưu & Trang Bị Ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
