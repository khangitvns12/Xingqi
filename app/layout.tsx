import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tiên Kỳ Đạo - Cờ Tướng Tu Tiên',
  description: 'Website chơi cờ tướng online phong cách tiên hiệp tu chân: sảnh chờ, ghép trận elo, hiệu ứng kỹ năng bắt quân, cửa hàng Tiên Các, khung viền avatar tuỳ chỉnh, Pháp Tướng hiển linh và hệ thống Quản Trị Viên quản lý tài khoản.',
  openGraph: {
    title: 'Tiên Kỳ Đạo - Cờ Tướng Tu Tiên',
    description: 'Website chơi cờ tướng online phong cách tiên hiệp tu chân: sảnh chờ, ghép trận elo, hiệu ứng kỹ năng bắt quân, cửa hàng Tiên Các, khung viền avatar tuỳ chỉnh, Pháp Tướng hiển linh và hệ thống Quản Trị Viên quản lý tài khoản.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tiên Kỳ Đạo - Cờ Tướng Tu Tiên',
    description: 'Website chơi cờ tướng online phong cách tiên hiệp tu chân: sảnh chờ, ghép trận elo, hiệu ứng kỹ năng bắt quân, cửa hàng Tiên Các, khung viền avatar tuỳ chỉnh, Pháp Tướng hiển linh và hệ thống Quản Trị Viên quản lý tài khoản.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0b0f19] text-[#e2e8f0] min-h-screen antialiased selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

