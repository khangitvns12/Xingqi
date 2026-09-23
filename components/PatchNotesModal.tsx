'use client';

import { ScrollText, Sparkles, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { GAME_PATCH_NOTES } from '../lib/storage/userStore';

interface PatchNotesModalProps {
  onClose: () => void;
}

export default function PatchNotesModal({ onClose }: PatchNotesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#082a25] via-[#051c18] to-[#031311] border-2 border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(4,28,24,0.9)] overflow-hidden flex flex-col max-h-[90vh] text-emerald-100 font-xianxia">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#041d1a] border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-teal-300">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white text-glow-jade flex items-center gap-2">
                Ngọc Giản Cập Nhật • Lộ Trình Tu Tiên
              </h3>
              <p className="text-xs text-emerald-300/70">
                Các bản cập nhật định kỳ và tính năng mới duy trì sự mới mẻ
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-400/80 hover:text-white text-xl leading-none p-1 rounded-lg hover:bg-emerald-900/40 transition-colors">
            ✕
          </button>
        </div>

        {/* Patch List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {GAME_PATCH_NOTES.map((patch) => {
            const isCurrent = patch.status === 'released';

            return (
              <div
                key={patch.version}
                className={`p-4 rounded-xl border space-y-3 ${
                  isCurrent
                    ? 'border-emerald-500/50 bg-emerald-950/40 shadow-lg shadow-emerald-950/30'
                    : 'border-emerald-500/20 bg-[#041d19]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-teal-300">
                        {patch.version}
                      </span>
                      <h4 className="font-bold text-white text-sm">{patch.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-emerald-300/60 mt-0.5 font-sans">
                      <Calendar className="w-3 h-3" />
                      <span>{patch.releaseDate}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border font-sans ${
                      isCurrent
                        ? 'bg-teal-950 text-teal-300 border-teal-500/40'
                        : 'bg-emerald-950/60 text-emerald-400/60 border-emerald-800/40'
                    }`}
                  >
                    {isCurrent ? 'Phiên Bản Hiện Tại' : 'Sắp Ra Mắt'}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {patch.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-emerald-200/90">
                      {isCurrent ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="leading-relaxed">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-500/20 bg-[#031815] flex items-center justify-between text-xs text-emerald-300/70">
          <span>Hệ thống duy trì cân bằng và cập nhật bổ sung liên tục.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#062822] hover:bg-[#0a3830] text-emerald-100 border border-emerald-500/30 font-semibold transition-colors cursor-pointer"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
