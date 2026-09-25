import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const apiDir = path.join(rootDir, 'app', 'api');
const tempApiDir = path.join(rootDir, 'app', '_api_temp');

let apiMoved = false;

console.log('🚀 [Build-Export] Bắt đầu quá trình xuất tĩnh (Static HTML Export) cho Cloudflare Pages...');

try {
  // 1. Tạm thời ẩn thư mục app/api để Next.js không kiểm tra dynamic route handlers
  if (fs.existsSync(apiDir)) {
    console.log('📦 [Build-Export] Tạm thời di dời app/api để tránh xung đột với output: "export"...');
    fs.renameSync(apiDir, tempApiDir);
    apiMoved = true;
  }

  // 2. Chạy next build với cờ NEXT_OUTPUT_MODE=export
  console.log('⚡ [Build-Export] Thực thi: next build (với output: "export")...');
  execSync('npx next build', {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_OUTPUT_MODE: 'export',
    },
  });

  const outDir = path.join(rootDir, 'out');
  if (fs.existsSync(outDir)) {
    console.log('✅ [Build-Export] Xuất bản thành công! Thư mục "out" đã sẵn sàng cho Cloudflare Pages.');
  } else {
    console.warn('⚠️ [Build-Export] Cảnh báo: Thư mục "out" chưa được phát hiện.');
  }
} catch (err) {
  console.error('❌ [Build-Export] Lỗi trong quá trình build:', err);
  process.exitCode = 1;
} finally {
  // 3. Khôi phục lại thư mục app/api nguyên vẹn
  if (apiMoved && fs.existsSync(tempApiDir)) {
    console.log('🔄 [Build-Export] Khôi phục app/api về vị trí cũ...');
    fs.renameSync(tempApiDir, apiDir);
    console.log('✅ [Build-Export] app/api đã được phục hồi hoàn tất.');
  }
}
