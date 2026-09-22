import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#070b14',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: 'Tiên Kỳ Đạo - Cờ Tướng Tu Tiên v1.3.0',
  description: 'Website chơi cờ tướng online phong cách tiên hiệp tu chân: sảnh chờ, ghép trận elo, hiệu ứng kỹ năng bắt quân, cửa hàng Tiên Các, khung viền avatar tuỳ chỉnh, Pháp Tướng hiển linh và hệ thống Quản Trị Viên quản lý tài khoản.',
  applicationName: 'Tiên Kỳ Đạo',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tiên Kỳ Đạo',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Tiên Kỳ Đạo - Cờ Tướng Tu Tiên v1.3.0',
    description: 'Website chơi cờ tướng online phong cách tiên hiệp tu chân: sảnh chờ, ghép trận elo, hiệu ứng kỹ năng bắt quân, cửa hàng Tiên Các, khung viền avatar tuỳ chỉnh, Pháp Tướng hiển linh và hệ thống Quản Trị Viên quản lý tài khoản.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tiên Kỳ Đạo - Cờ Tướng Tu Tiên v1.3.0',
    description: 'Website chơi cờ tướng online phong cách tiên hiệp tu chân: sảnh chờ, ghép trận elo, hiệu ứng kỹ năng bắt quân, cửa hàng Tiên Các, khung viền avatar tuỳ chỉnh, Pháp Tướng hiển linh và hệ thống Quản Trị Viên quản lý tài khoản.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="vi" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#070b14] text-[#e2e8f0] min-h-screen min-h-[100dvh] antialiased selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden touch-manipulation" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

