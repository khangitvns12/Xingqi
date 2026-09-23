'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, Plus, Trash2 } from 'lucide-react';
import { DharmaIdol } from '../../lib/cultivation/shopAndFrames';
import { CULTIVATION_REALMS } from '../../lib/cultivation/realms';

interface AdminDharmaTabProps {
  dharmaList: DharmaIdol[];
  onCreateDharma: (dharma: Omit<DharmaIdol, 'id' | 'createdAt'>) => void;
  onToggleShop: (id: string) => void;
  onDeleteDharma: (id: string, name: string) => void;
}

export default function AdminDharmaTab({
  dharmaList,
  onCreateDharma,
  onToggleShop,
  onDeleteDharma,
}: AdminDharmaTabProps) {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.includes('gif') || file.type.includes('webp')) {
      setNewDharmaAnimated(true);
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setNewDharmaImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDharmaName.trim() || !newDharmaImage.trim()) return;

    onCreateDharma({
      name: newDharmaName.trim(),
      title: newDharmaTitle.trim(),
      imageUrl: newDharmaImage.trim(),
      auraColor: newDharmaAura,
      price: Number(newDharmaPrice) || 0,
      inShop: newDharmaInShop,
      description: newDharmaDesc.trim(),
      minRealmLevel: Number(newDharmaMinRealm) || 1,
      isAnimated:
        newDharmaAnimated ||
        newDharmaImage.includes('.gif') ||
        newDharmaImage.includes('.webp') ||
        newDharmaImage.startsWith('data:image/gif'),
    });

    setNewDharmaName('');
    setNewDharmaImage('');
    setNewDharmaAnimated(false);
    if (dharmaFileInputRef.current) dharmaFileInputRef.current.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Dharma Creator Form */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-4">
        <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Thêm Pháp Tướng Vào Shop (Hiển Thị Hoành Tráng Tại Hồ Sơ Profile)</span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên Pháp Tướng</label>
                <input
                  type="text"
                  placeholder="ví dụ: Hỗn Độn Ma Thần Pháp Tướng"
                  value={newDharmaName}
                  onChange={(e) => setNewDharmaName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-400 text-xs"
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-400 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Giá Bán (Linh Thạch)</label>
                <input
                  type="number"
                  placeholder="800"
                  value={newDharmaPrice}
                  onChange={(e) => setNewDharmaPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Yêu Cầu Cảnh Giới</label>
                <select
                  value={newDharmaMinRealm}
                  onChange={(e) => setNewDharmaMinRealm(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs"
                >
                  {CULTIVATION_REALMS.map((r) => (
                    <option key={r.level} value={r.level}>
                      Cấp {r.level}: {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Màu Khí Tức (Aura)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newDharmaAura}
                    onChange={(e) => setNewDharmaAura(e.target.value)}
                    className="w-10 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                  />
                  <input
                    type="text"
                    value={newDharmaAura}
                    onChange={(e) => setNewDharmaAura(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Mô Tả Pháp Tướng</label>
              <input
                type="text"
                placeholder="Mô tả thiên uy, xuất xứ thần thông..."
                value={newDharmaDesc}
                onChange={(e) => setNewDharmaDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Tải Ảnh / GIF Pháp Tướng (Hỗ trợ PNG trong suốt, GIF, WebP)
              </label>
              <input
                type="file"
                ref={dharmaFileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer text-xs"
              />
              <input
                type="text"
                placeholder="Hoặc dán link ảnh/GIF/WebP trực tiếp..."
                value={newDharmaImage}
                onChange={(e) => setNewDharmaImage(e.target.value)}
                className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={newDharmaInShop}
                  onChange={(e) => setNewDharmaInShop(e.target.checked)}
                  className="rounded border-slate-700 text-purple-500 focus:ring-0"
                />
                <span className="text-slate-300 font-medium">Bán trong Shop Tiên Các</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={newDharmaAnimated}
                  onChange={(e) => setNewDharmaAnimated(e.target.checked)}
                  className="rounded border-slate-700 text-purple-500 focus:ring-0"
                />
                <span className="text-purple-300 font-medium">Là ảnh động (GIF/Animation)</span>
              </label>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Pháp Tướng Vào Hệ Thống</span>
            </button>
          </div>

          {/* Right: Live Preview */}
          <div className="md:col-span-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[11px] font-semibold text-slate-400">Xem Trước Pháp Tướng</span>

            <div
              className="relative w-32 h-40 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden p-2"
              style={{ boxShadow: `0 0 20px ${newDharmaAura}44` }}
            >
              {newDharmaImage ? (
                <img
                  src={newDharmaImage}
                  alt="dharma-preview"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]"
                />
              ) : (
                <span className="text-slate-600 text-xs">Chưa có ảnh</span>
              )}
            </div>

            <div>
              <h4 className="font-bold text-purple-300">{newDharmaName || 'Tên Pháp Tướng'}</h4>
              <p className="text-[10px] text-amber-300">{newDharmaTitle}</p>
              <p className="text-[10px] text-cyan-300 font-mono font-bold mt-1">
                💎 {newDharmaPrice} Linh Thạch
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Dharma List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-200">Danh Sách Pháp Tướng ({dharmaList.length})</h4>
          <span className="text-slate-400 text-[11px]">Bấm nút Shop để bật/tắt bán trong Cửa Hàng</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dharmaList.map((dharma) => (
            <div
              key={dharma.id}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-20 shrink-0 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <img
                    src={dharma.imageUrl}
                    alt={dharma.name}
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-slate-100 truncate">{dharma.name}</h5>
                  <p className="text-[10px] text-amber-300 truncate">{dharma.title}</p>
                  <p className="text-[10px] text-cyan-300 font-mono font-bold mt-1">
                    💎 {dharma.price.toLocaleString()} Linh Thạch
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2">{dharma.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onToggleShop(dharma.id)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    dharma.inShop
                      ? 'bg-purple-950/60 border-purple-500/50 text-purple-300 hover:bg-purple-900/80'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {dharma.inShop ? '✓ Đang Bán Shop' : '✕ Chưa Bán'}
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteDharma(dharma.id, dharma.name)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                  title="Xóa Pháp Tướng"
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
