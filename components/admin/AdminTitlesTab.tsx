'use client';

import React, { useState, useRef } from 'react';
import { Award, Plus, Trash2 } from 'lucide-react';
import { CustomTitle } from '../../lib/cultivation/shopAndFrames';
import { CULTIVATION_REALMS } from '../../lib/cultivation/realms';

interface AdminTitlesTabProps {
  titleList: CustomTitle[];
  onCreateTitle: (title: Omit<CustomTitle, 'id' | 'createdAt'>) => void;
  onToggleShop: (id: string) => void;
  onDeleteTitle: (id: string, name: string) => void;
}

export default function AdminTitlesTab({
  titleList,
  onCreateTitle,
  onToggleShop,
  onDeleteTitle,
}: AdminTitlesTabProps) {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleName.trim()) return;

    onCreateTitle({
      name: newTitleName.trim(),
      description: newTitleDesc.trim(),
      unlockedAtRealm: Number(newTitleRealm) || 1,
      price: Number(newTitlePrice) || 0,
      inShop: newTitleInShop,
      textColor: newTitleTextColor,
      bgGradient: newTitleBgGradient,
      badgeImageUrl: newTitleBadgeImage.trim() || undefined,
      icon: newTitleIcon.trim() || '👑',
    });

    setNewTitleName('');
    setNewTitleBadgeImage('');
    if (titleFileInputRef.current) titleFileInputRef.current.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Title Creator Form */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-4">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
          <Award className="w-4 h-4" />
          <span>Thêm Danh Hiệu Tiên Hiệp Mới (Hỗ Trợ Tải Huy Hiệu Ảnh PNG Hoành Tráng)</span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên Danh Hiệu</label>
                <input
                  type="text"
                  placeholder="ví dụ: Vạn Cổ Bất Bại, Tiên Giới Chí Tôn"
                  value={newTitleName}
                  onChange={(e) => setNewTitleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Icon / Biểu Tượng Emojis</label>
                <input
                  type="text"
                  placeholder="ví dụ: 👑, ⚔️, 🔥, 🐉"
                  value={newTitleIcon}
                  onChange={(e) => setNewTitleIcon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Giá Bán (Linh Thạch)</label>
                <input
                  type="number"
                  placeholder="500"
                  value={newTitlePrice}
                  onChange={(e) => setNewTitlePrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Yêu Cầu Cảnh Giới Tối Thiểu</label>
                <select
                  value={newTitleRealm}
                  onChange={(e) => setNewTitleRealm(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs"
                >
                  {CULTIVATION_REALMS.map((r) => (
                    <option key={r.level} value={r.level}>
                      Cấp {r.level}: {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Màu Chữ Danh Hiệu (Tailwind class)</label>
                <select
                  value={newTitleTextColor}
                  onChange={(e) => setNewTitleTextColor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs"
                >
                  <option value="text-amber-300">Kim Sắc Hoàng Kim (Amber 300)</option>
                  <option value="text-yellow-400">Hoàng Kim Rực Rỡ (Yellow 400)</option>
                  <option value="text-purple-300">Tử Sắc Thần Bí (Purple 300)</option>
                  <option value="text-cyan-300">Lam Sắc Băng Tinh (Cyan 300)</option>
                  <option value="text-rose-400">Xích Hỏa Ma Quân (Rose 400)</option>
                  <option value="text-emerald-400">Bích Ngọc Tiên Khí (Emerald 400)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Màu Nền / Viền Badge (Tailwind)</label>
                <select
                  value={newTitleBgGradient}
                  onChange={(e) => setNewTitleBgGradient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs"
                >
                  <option value="from-amber-900/60 to-purple-900/60 border-amber-400">Hoàng Kim Tím Hoàng Gia</option>
                  <option value="from-purple-950/70 to-indigo-950/70 border-purple-500">Tử Khí Đông Lai</option>
                  <option value="from-emerald-950/70 to-teal-950/70 border-emerald-400">Bích Ngọc Tiên Viện</option>
                  <option value="from-rose-950/70 to-orange-950/70 border-rose-500">Xích Hỏa Liệt Diễm</option>
                  <option value="from-cyan-950/70 to-blue-950/70 border-cyan-400">Cửu Tiêu Băng Hàn</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Mô Tả Nguồn Gốc Danh Hiệu</label>
              <input
                type="text"
                placeholder="Mô tả chiến tích hoặc điển tích để có danh hiệu này..."
                value={newTitleDesc}
                onChange={(e) => setNewTitleDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Tải Lên Huy Hiệu Ảnh / Logo PNG Đính Kèm (Tùy Chọn)
              </label>
              <input
                type="file"
                ref={titleFileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer text-xs"
              />
              <input
                type="text"
                placeholder="Hoặc dán link ảnh logo/badge PNG trực tiếp..."
                value={newTitleBadgeImage}
                onChange={(e) => setNewTitleBadgeImage(e.target.value)}
                className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="titleShopCheck"
                checked={newTitleInShop}
                onChange={(e) => setNewTitleInShop(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="titleShopCheck" className="text-slate-300 font-medium cursor-pointer text-xs">
                Đưa vào Cửa Hàng Shop Linh Thạch
              </label>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Danh Hiệu Vào Hệ Thống</span>
            </button>
          </div>

          {/* Right: Live Preview */}
          <div className="md:col-span-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[11px] font-semibold text-slate-400">Xem Trước Danh Hiệu</span>

            <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${newTitleBgGradient} border flex items-center gap-2 shadow-lg`}>
              {newTitleBadgeImage ? (
                <img
                  src={newTitleBadgeImage}
                  alt="badge"
                  className="w-5 h-5 object-contain"
                />
              ) : (
                <span className="text-base">{newTitleIcon}</span>
              )}
              <span className={`font-bold text-xs ${newTitleTextColor}`}>
                {newTitleName || 'Tên Danh Hiệu'}
              </span>
            </div>

            <div>
              <p className="text-[11px] text-slate-400">{newTitleDesc}</p>
              <p className="text-[10px] text-cyan-300 font-mono font-bold mt-1">
                💎 {newTitlePrice} Linh Thạch • Cảnh Giới Cấp {newTitleRealm}
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Titles List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-200">Danh Sách Danh Hiệu Hiện Có ({titleList.length})</h4>
          <span className="text-slate-400 text-[11px]">Bấm nút Shop để bật/tắt bán trong Cửa Hàng</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {titleList.map((title) => (
            <div
              key={title.id}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${title.bgGradient} border flex items-center gap-1.5`}>
                  {title.badgeImageUrl ? (
                    <img
                      src={title.badgeImageUrl}
                      alt={title.name}
                      className="w-4 h-4 object-contain"
                    />
                  ) : (
                    <span>{title.icon}</span>
                  )}
                  <span className={`text-xs font-bold ${title.textColor}`}>
                    {title.name}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-[10px] text-cyan-300 font-mono font-bold">
                    💎 {(title.price ?? 0).toLocaleString()} Linh Thạch
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2">{title.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onToggleShop(title.id)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    title.inShop
                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/80'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {title.inShop ? '✓ Đang Bán Shop' : '✕ Chưa Bán'}
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteTitle(title.id, title.name)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
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
  );
}
