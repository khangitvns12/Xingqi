'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Lỗi toàn cục (Global Error):', error);
  }, [error]);

  return (
    <html lang="vi" className="dark">
      <body className="bg-[#031412] text-[#f1fbf8] min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#041c19] border border-emerald-500/30 rounded-2xl p-6 text-center shadow-2xl">
          <h2 className="text-xl font-serif text-rose-300 font-bold mb-3">Tu Tiên Trở Ngại (500)</h2>
          <p className="text-xs text-emerald-200/80 mb-6">
            Đạo pháp xuất hiện dao động linh khí bất thường. Hãy thử vận công hồi phục lại.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium text-xs hover:brightness-110 shadow-lg cursor-pointer"
          >
            Vận Công Lại
          </button>
        </div>
      </body>
    </html>
  );
}
