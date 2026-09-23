'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  X,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Image as ImageIcon,
  Move,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import AvatarWithFrame from './AvatarWithFrame';
import { CustomFrame } from '../lib/cultivation/shopAndFrames';

interface AvatarCropModalProps {
  currentAvatarUrl: string;
  daoName: string;
  realmLevel: number;
  currentFrameId?: string;
  availableFrames?: CustomFrame[];
  onSave: (croppedImageUrl: string) => void;
  onClose: () => void;
}

export function AvatarCropModal({
  currentAvatarUrl,
  daoName,
  realmLevel,
  currentFrameId,
  availableFrames = [],
  onSave,
  onClose,
}: AvatarCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string>(currentAvatarUrl || '');
  const [urlInput, setUrlInput] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  // Transform states
  const [scale, setScale] = useState<number>(1.2);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [previewFrameId, setPreviewFrameId] = useState<string | undefined>(currentFrameId);

  // Dragging state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const positionStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // DOM Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fit circular crop
  const autoFitCircle = useCallback(() => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const naturalWidth = img.naturalWidth || 300;
    const naturalHeight = img.naturalHeight || 300;
    const minDim = Math.min(naturalWidth, naturalHeight);

    // Calculate scale such that the circle of diameter 200 is fully covered by the smaller dimension
    const optimalScale = 200 / minDim;
    setScale(Math.max(1.0, optimalScale * (naturalWidth / 200)));
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WebP, GIF)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          setPosition({ x: 0, y: 0 });
          setScale(1.2);
          setRotation(0);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setImageSrc(urlInput.trim());
      setPosition({ x: 0, y: 0 });
      setScale(1.2);
      setRotation(0);
      setShowUrlInput(false);
    }
  };

  // Drag handlers (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    positionStartRef.current = { ...position };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPosition({
        x: positionStartRef.current.x + dx,
        y: positionStartRef.current.y + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      positionStartRef.current = { ...position };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setPosition({
      x: positionStartRef.current.x + dx,
      y: positionStartRef.current.y + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Export cropped circle to Canvas
  const handleConfirmCrop = () => {
    if (!imageSrc) return;

    const canvas = document.createElement('canvas');
    const size = 360; // crisp standard resolution
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 1. Create circular clip path
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // 2. Transform coordinate space to center
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Coordinate mapping from 200px preview viewport to 360px export canvas
      const factor = size / 200;
      const drawX = position.x * factor;
      const drawY = position.y * factor;

      // Draw image
      const naturalAspect = img.naturalWidth / img.naturalHeight;
      let baseWidth = size;
      let baseHeight = size;

      if (naturalAspect >= 1) {
        baseWidth = size * naturalAspect;
      } else {
        baseHeight = size / naturalAspect;
      }

      const scaledWidth = baseWidth * scale;
      const scaledHeight = baseHeight * scale;

      ctx.drawImage(
        img,
        -scaledWidth / 2 + drawX,
        -scaledHeight / 2 + drawY,
        scaledWidth,
        scaledHeight
      );

      // 3. Export to base64 Data URL
      try {
        const croppedDataUrl = canvas.toDataURL('image/png', 0.92);
        onSave(croppedDataUrl);
      } catch (err) {
        console.warn('Canvas export tainted or failed, using original src:', err);
        onSave(imageSrc);
      }
    };
    img.onerror = () => {
      onSave(imageSrc);
    };
    img.src = imageSrc;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/50 rounded-2xl shadow-[0_0_50px_rgba(4,28,24,0.95)] overflow-hidden flex flex-col text-emerald-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-500/30 flex items-center justify-between bg-[#041d1a]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-xianxia text-white text-glow-jade">
                Tùy Chỉnh & Cắt Tròn Avatar Tiên Giới
              </h3>
              <p className="text-xs text-emerald-400/80">
                Kéo thả, phóng to thu nhỏ hoặc tự động cắt tròn để vừa khít tuyệt đối với khung tiên hiệp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-800/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Action Row: Upload local or URL */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Tải Ảnh Từ Máy</span>
            </button>

            <button
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-teal-300 border border-emerald-500/30 font-semibold text-xs flex items-center gap-2 transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Dán Link URL</span>
            </button>

            <button
              onClick={autoFitCircle}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 shadow-sm"
              title="Tự động căn chỉnh giữa và phóng to vừa khít hình tròn"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Cắt Chuẩn Tròn</span>
            </button>
          </div>

          {showUrlInput && (
            <div className="flex gap-2 p-2 rounded-xl bg-slate-950/80 border border-emerald-500/30">
              <input
                type="text"
                placeholder="Nhập đường dẫn URL hình ảnh (https://...)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none"
              />
              <button
                onClick={handleApplyUrl}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0"
              >
                Áp Dụng
              </button>
            </div>
          )}

          {/* Interactive Crop Viewport Area */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative flex items-center justify-center p-3 rounded-2xl bg-black/60 border border-emerald-500/20 shadow-inner w-full">
              {/* The 200x200 Cropping Viewport */}
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative w-[210px] h-[210px] rounded-full overflow-hidden border-2 border-dashed border-emerald-400/80 cursor-grab active:cursor-grabbing select-none shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-slate-950 flex items-center justify-center"
              >
                {/* Visual Grid Guide */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20 border border-emerald-300/30">
                  <div className="border-r border-b border-emerald-300" />
                  <div className="border-r border-b border-emerald-300" />
                  <div className="border-b border-emerald-300" />
                  <div className="border-r border-b border-emerald-300" />
                  <div className="border-r border-b border-emerald-300" />
                  <div className="border-b border-emerald-300" />
                  <div className="border-r border-emerald-300" />
                  <div className="border-r border-emerald-300" />
                  <div />
                </div>

                {/* The Drag & Scaled Image */}
                {imageSrc ? (
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    draggable={false}
                    className="max-w-none transition-transform pointer-events-none"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                      transformOrigin: 'center center',
                    }}
                  />
                ) : (
                  <div className="text-center p-4 text-xs text-slate-400">
                    Chưa có ảnh. Vui lòng tải ảnh lên.
                  </div>
                )}

                {/* Circular Mask Vignette Edge */}
                <div className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0_0_15px_rgba(0,0,0,0.6)]" />
              </div>

              {/* Move helper badge */}
              <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-emerald-400/80 bg-black/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Move className="w-3 h-3" />
                <span>Kéo để di chuyển</span>
              </div>
            </div>

            {/* Scale and Rotate Controls */}
            <div className="w-full space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-emerald-500/20">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Kích thước (Thu Phóng):</span>
                </span>
                <span className="font-mono text-amber-300 font-bold">{Math.round(scale * 100)}%</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setScale((s) => Math.max(0.5, Number((s - 0.1).toFixed(2))))}
                  className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="flex-1 accent-emerald-400 h-1.5 bg-emerald-950 rounded-lg cursor-pointer"
                />

                <button
                  onClick={() => setScale((s) => Math.min(3.5, Number((s + 0.1).toFixed(2))))}
                  className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900"
                  title="Phóng to"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800"
                  title="Xoay 90 độ"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Frame Live Preview Comparison */}
            <div className="w-full bg-[#041d1a]/80 p-3.5 rounded-xl border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Real-time frame preview */}
                <AvatarWithFrame
                  avatarUrl={imageSrc}
                  daoName={daoName}
                  realmLevel={realmLevel}
                  frameId={previewFrameId}
                  size="md"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Xem Trước Khớp Khung:</span>
                  </div>
                  <p className="text-[11px] text-emerald-400/80">
                    Ảnh avatar sau khi cắt sẽ khớp chuẩn vào khung tu chân
                  </p>
                </div>
              </div>

              {/* Toggle preview frame if available */}
              {availableFrames.length > 0 && (
                <select
                  value={previewFrameId || ''}
                  onChange={(e) => setPreviewFrameId(e.target.value || undefined)}
                  className="text-xs bg-slate-900 border border-emerald-500/40 text-emerald-200 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                >
                  <option value="">Khung Mặc Định Cảnh Giới</option>
                  {availableFrames.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-emerald-500/30 bg-[#041d1a] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={handleConfirmCrop}
            disabled={!imageSrc}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Xác Nhận & Sử Dụng Avatar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
