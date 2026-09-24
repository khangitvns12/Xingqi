import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#031412] text-[#f1fbf8] px-4 text-center">
      <h1 className="text-6xl font-bold font-serif text-emerald-400 mb-4 tracking-wider">404</h1>
      <h2 className="text-2xl font-serif text-emerald-200 mb-4">Lạc Bước Hư Không</h2>
      <p className="text-emerald-400/70 max-w-md mb-8 text-sm">
        Đạo hữu đã đi lạc vào hư không tiên cảnh. Con đường phía trước chưa từng được khai mở.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-serif font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:brightness-110 transition-all"
      >
        Trở Về Tiên Các
      </Link>
    </div>
  );
}
