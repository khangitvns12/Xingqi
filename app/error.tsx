'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error caught by error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#031412] text-[#f1fbf8] p-4 text-center">
      <div className="max-w-md w-full bg-[#041c19] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-serif text-rose-300 font-bold mb-3">Tâm Ma Quấy Nhiễu</h2>
        <p className="text-xs text-emerald-200/80 mb-6">
          Trận pháp tạm thời gián đoạn. Đạo hữu vui lòng thử tái lập kết nối.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium text-xs hover:brightness-110 shadow-lg cursor-pointer"
        >
          Tái Lập Trận Pháp
        </button>
      </div>
    </div>
  );
}
