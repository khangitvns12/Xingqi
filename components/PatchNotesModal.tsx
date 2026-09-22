'use client';

import { ScrollText, Sparkles, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { GAME_PATCH_NOTES } from '../lib/storage/userStore';

interface PatchNotesModalProps {
  onClose: () => void;
}

export default function PatchNotesModal({ onClose }: PatchNotesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-[#0d1424] border-2 border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-950/40 via-slate-900 to-purple-950/40 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-100 flex items-center gap-2">
                Ngọc Giản Cập Nhật • Lộ Trình Tu Tiên
              </h3>
              <p className="text-xs text-slate-400">
                Các bản cập nhật định kỳ và tính năng mới duy trì sự mới mẻ
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none p-1">
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
                    ? 'border-purple-500/50 bg-purple-950/20 shadow-lg shadow-purple-950/30'
                    : 'border-slate-800 bg-slate-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-purple-300">
                        {patch.version}
                      </span>
                      <h4 className="font-bold text-slate-100 text-sm">{patch.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{patch.releaseDate}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      isCurrent
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isCurrent ? 'Phiên Bản Hiện Tại' : 'Sắp Ra Mắt'}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {patch.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-300">
                      {isCurrent ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
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
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Hệ thống duy trì cân bằng và cập nhật bổ sung liên tục.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
