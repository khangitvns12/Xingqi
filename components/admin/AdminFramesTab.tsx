'use client';

import React, { useState, useRef } from 'react';
import { ImageIcon, Wand2, Plus, Trash2 } from 'lucide-react';
import { CustomFrame } from '../../lib/cultivation/shopAndFrames';
import { UserAccount } from '../../lib/storage/userStore';

interface AdminFramesTabProps {
  frames: CustomFrame[];
  currentUser: UserAccount;
  onCreateFrame: (frame: Omit<CustomFrame, 'id' | 'createdAt'>) => void;
  onToggleShop: (frameId: string) => void;
  onDeleteFrame: (frameId: string, frameName: string) => void;
  onOpenAiModal: () => void;
}

export default function AdminFramesTab({
  frames,
  currentUser,
  onCreateFrame,
  onToggleShop,
  onDeleteFrame,
  onOpenAiModal,
}: AdminFramesTabProps) {
  const [newFrameName, setNewFrameName] = useState('');
  const [newFramePrice, setNewFramePrice] = useState(300);
  const [newFrameRarity, setNewFrameRarity] = useState<'Thượng Phẩm' | 'Cực Phẩm' | 'Tiên Phẩm' | 'Thần Phẩm'>('Tiên Phẩm');
  const [newFrameGlow, setNewFrameGlow] = useState('#f59e0b');
  const [newFrameDesc, setNewFrameDesc] = useState('Khung viền thần bí bảo vệ đạo hồn kỳ thủ.');
  const [newFrameInShop, setNewFrameInShop] = useState(true);
  const [newFrameImage, setNewFrameImage] = useState('');
  const frameFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFrameName.trim() || !newFrameImage.trim()) return;

    onCreateFrame({
      name: newFrameName.trim(),
      imageUrl: newFrameImage.trim(),
      glowColor: newFrameGlow,
      price: Number(newFramePrice) || 0,
      inShop: newFrameInShop,
      rarity: newFrameRarity,
      description: newFrameDesc.trim(),
      scale: 1.15,
      offsetX: 0,
      offsetY: 0,
    });

    setNewFrameName('');
    setNewFrameImage('');
    if (frameFileInputRef.current) frameFileInputRef.current.value = '';
  };

  return (
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
          onClick={onOpenAiModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-900/50 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all"
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-300" />
          <span>✨ Mở Trợ Lý AI Canh Khung</span>
        </button>
      </div>

      {/* Creator Form */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-4">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
          <ImageIcon className="w-4 h-4" />
          <span>Tải Lên Khung Viền PNG Mới (Tự Động Xuất Hiện Trong Shop)</span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên Khung Viền</label>
                <input
                  type="text"
                  placeholder="ví dụ: Cửu Long Chí Tôn Khung"
                  value={newFrameName}
                  onChange={(e) => setNewFrameName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Giá Bán Trong Tiên Các (Linh Thạch)</label>
                <input
                  type="number"
                  placeholder="300"
                  value={newFramePrice}
                  onChange={(e) => setNewFramePrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Phẩm Cấp Khung</label>
                <select
                  value={newFrameRarity}
                  onChange={(e) => setNewFrameRarity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs"
                >
                  <option value="Thượng Phẩm">Thượng Phẩm (Lam Sắc)</option>
                  <option value="Cực Phẩm">Cực Phẩm (Tử Sắc)</option>
                  <option value="Tiên Phẩm">Tiên Phẩm (Kim Sắc)</option>
                  <option value="Thần Phẩm">Thần Phẩm (Hồng Quang)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Màu Hào Quang (Glow Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newFrameGlow}
                    onChange={(e) => setNewFrameGlow(e.target.value)}
                    className="w-10 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                  />
                  <input
                    type="text"
                    value={newFrameGlow}
                    onChange={(e) => setNewFrameGlow(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
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
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Tải Ảnh Khung (PNG trong suốt đã tách nền) hoặc Nhập URL
              </label>
              <input
                type="file"
                ref={frameFileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer text-xs"
              />
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
                className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="frameShopCheck" className="text-slate-300 font-medium cursor-pointer text-xs">
                Đưa ngay vào Cửa Hàng Shop Linh Thạch để đệ tử có thể mua
              </label>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Khung Viền Mới Vào Hệ Thống</span>
            </button>
          </div>

          {/* Right: Live Preview */}
          <div className="md:col-span-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[11px] font-semibold text-slate-400">Xem Trước Trực Quan Khung Avatar</span>

            <div className="relative w-28 h-28 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 p-2">
              <div className="absolute inset-0 m-auto w-[74%] h-[74%] rounded-full overflow-hidden border border-slate-600 z-0">
                <img
                  src={currentUser.avatarUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
              {newFrameImage && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center scale-[1.15] z-10">
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
                  type="button"
                  onClick={() => onToggleShop(frame.id)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    frame.inShop
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {frame.inShop ? '✓ Đang Bán Shop' : '✕ Chưa Bán'}
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteFrame(frame.id, frame.name)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
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
  );
}
