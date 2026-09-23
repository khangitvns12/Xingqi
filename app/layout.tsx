import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#031412',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: 'Tiên Kỳ Đạo - Cờ Tướng Tu Tiên v1.3.1',
  description: 'Website chơi cờ tướng online phong cách tiên hiệp tu chân: sảnh chờ ngọc bích, đồng bộ dữ liệu đa thiết bị máy chủ đám mây, ghép trận elo, hiệu ứng bắt quân tiên đạo, Tiên Các, khung viền avatar, Pháp Tướng hiển linh.',
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
    title: 'Tiên Kỳ Đạo - Cờ Tướng Tu Tiên v1.3.1',
    description: 'Website chơi cờ tướng online phong cách tiên hiệp tu chân: sảnh chờ ngọc bích, đồng bộ dữ liệu đa thiết bị máy chủ đám mây, ghép trận elo, hiệu ứng bắt quân tiên đạo, Tiên Các, khung viền avatar, Pháp Tướng hiển linh.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tiên Kỳ Đạo - Cờ Tướng Tu Tiên v1.3.1',
    description: 'Website chơi cờ tướng online phong cách tiên hiệp tu chân: sảnh chờ ngọc bích, đồng bộ dữ liệu đa thiết bị máy chủ đám mây, ghép trận elo, hiệu ứng bắt quân tiên đạo, Tiên Các, khung viền avatar, Pháp Tướng hiển linh.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="vi" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400&family=Philosopher:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#031412] text-[#f1fbf8] min-h-screen min-h-[100dvh] antialiased selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden touch-manipulation" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

