'use client';

import React, { useState, useRef } from 'react';
import { Gem, Plus, Trash2 } from 'lucide-react';
import { CustomArtifact } from '../../lib/cultivation/shopAndFrames';
import { CULTIVATION_REALMS } from '../../lib/cultivation/realms';

interface AdminArtifactsTabProps {
  artifactList: CustomArtifact[];
  onCreateArtifact: (artifact: Omit<CustomArtifact, 'id' | 'createdAt'>) => void;
  onToggleShop: (id: string) => void;
  onDeleteArtifact: (id: string, name: string) => void;
}

export default function AdminArtifactsTab({
  artifactList,
  onCreateArtifact,
  onToggleShop,
  onDeleteArtifact,
}: AdminArtifactsTabProps) {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtifactName.trim() || !newArtifactImage.trim()) return;

    onCreateArtifact({
      name: newArtifactName.trim(),
      imageUrl: newArtifactImage.trim(),
      auraColor: newArtifactAura,
      price: Number(newArtifactPrice) || 0,
      inShop: newArtifactInShop,
      rarity: newArtifactRarity,
      description: newArtifactDesc.trim(),
      effect: newArtifactEffect.trim(),
      minRealmLevel: Number(newArtifactMinRealm) || 1,
      isAnimated:
        newArtifactAnimated ||
        newArtifactImage.includes('.gif') ||
        newArtifactImage.includes('.webp') ||
        newArtifactImage.startsWith('data:image/gif'),
    });

    setNewArtifactName('');
    setNewArtifactImage('');
    setNewArtifactAnimated(false);
    if (artifactFileInputRef.current) artifactFileInputRef.current.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Artifact Creator Form */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-4">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
          <Gem className="w-4 h-4" />
          <span>Thêm Pháp Bảo Chí Tôn Vào Shop & Hệ Thống</span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên Bản Mệnh Pháp Bảo</label>
                <input
                  type="text"
                  placeholder="ví dụ: Hư Không Kính, Trảm Tiên Kiếm"
                  value={newArtifactName}
                  onChange={(e) => setNewArtifactName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Phẩm Giai Bảo Vật</label>
                <select
                  value={newArtifactRarity}
                  onChange={(e) => setNewArtifactRarity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs"
                >
                  <option value="Hạ Phẩm">Hạ Phẩm</option>
                  <option value="Trung Phẩm">Trung Phẩm</option>
                  <option value="Thượng Phẩm">Thượng Phẩm</option>
                  <option value="Cực Phẩm">Cực Phẩm</option>
                  <option value="Tiên Phẩm">Tiên Phẩm (Kim Quang)</option>
                  <option value="Thần Phẩm">Thần Phẩm (Hồng Hoang)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Giá Bán (Linh Thạch)</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={newArtifactPrice}
                  onChange={(e) => setNewArtifactPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Cảnh Giới Khống Chế</label>
                <select
                  value={newArtifactMinRealm}
                  onChange={(e) => setNewArtifactMinRealm(Number(e.target.value))}
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
                <label className="block text-slate-300 font-medium mb-1">Màu Khí Quang</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newArtifactAura}
                    onChange={(e) => setNewArtifactAura(e.target.value)}
                    className="w-10 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                  />
                  <input
                    type="text"
                    value={newArtifactAura}
                    onChange={(e) => setNewArtifactAura(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Hiệu Ứng Uy Lực Kỳ Đạo</label>
              <input
                type="text"
                placeholder="ví dụ: Trấn định tâm ma, ngưng tụ đạo văn khi đi cờ..."
                value={newArtifactEffect}
                onChange={(e) => setNewArtifactEffect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Mô Tả Nguồn Gốc Bảo Vật</label>
              <input
                type="text"
                placeholder="Mô tả truyền thuyết đúc thành pháp bảo..."
                value={newArtifactDesc}
                onChange={(e) => setNewArtifactDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Tải Ảnh Pháp Bảo (PNG trong suốt, GIF, WebP)
              </label>
              <input
                type="file"
                ref={artifactFileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer text-xs"
              />
              <input
                type="text"
                placeholder="Hoặc dán URL ảnh/GIF..."
                value={newArtifactImage}
                onChange={(e) => setNewArtifactImage(e.target.value)}
                className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={newArtifactInShop}
                  onChange={(e) => setNewArtifactInShop(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300 font-medium">Bán trong Shop Tiên Các</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={newArtifactAnimated}
                  onChange={(e) => setNewArtifactAnimated(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span className="text-amber-300 font-medium">Là ảnh động (GIF)</span>
              </label>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Pháp Bảo Vào Hệ Thống</span>
            </button>
          </div>

          {/* Right: Live Preview */}
          <div className="md:col-span-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[11px] font-semibold text-slate-400">Xem Trước Pháp Bảo</span>

            <div
              className="relative w-28 h-28 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden p-2"
              style={{ boxShadow: `0 0 20px ${newArtifactAura}44` }}
            >
              {newArtifactImage ? (
                <img
                  src={newArtifactImage}
                  alt="artifact-preview"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                />
              ) : (
                <span className="text-slate-600 text-xs">Chưa có ảnh</span>
              )}
            </div>

            <div>
              <h4 className="font-bold text-amber-300">{newArtifactName || 'Tên Pháp Bảo'}</h4>
              <p className="text-[10px] text-slate-400">{newArtifactRarity}</p>
              <p className="text-[10px] text-cyan-300 font-mono font-bold mt-1">
                💎 {newArtifactPrice} Linh Thạch
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Artifacts List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-200">Danh Sách Pháp Bảo Hiện Có ({artifactList.length})</h4>
          <span className="text-slate-400 text-[11px]">Bấm nút Shop để bật/tắt bán trong Cửa Hàng</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {artifactList.map((art) => (
            <div
              key={art.id}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <img
                    src={art.imageUrl}
                    alt={art.name}
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-slate-100 truncate">{art.name}</h5>
                  <span
                    className="text-[10px] px-1.5 py-0.2 rounded font-semibold inline-block my-0.5"
                    style={{ backgroundColor: `${art.auraColor}22`, color: art.auraColor }}
                  >
                    {art.rarity}
                  </span>
                  <p className="text-[10px] text-cyan-300 font-mono font-bold">
                    💎 {art.price.toLocaleString()} Linh Thạch
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2">{art.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onToggleShop(art.id)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    art.inShop
                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/80'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {art.inShop ? '✓ Đang Bán Shop' : '✕ Chưa Bán'}
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteArtifact(art.id, art.name)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                  title="Xóa Pháp Bảo"
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
