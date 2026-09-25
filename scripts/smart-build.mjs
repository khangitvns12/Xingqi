import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isCloudflarePages = process.env.CF_PAGES === '1' || process.env.BUILD_TARGET === 'cloudflare' || process.env.EXPORT_STATIC === '1';

if (isCloudflarePages) {
  console.log('🌐 [Smart-Build] Phát hiện môi trường Cloudflare Pages (CF_PAGES=1). Tự động chuyển sang chế độ Static HTML Export (tạo thư mục "out")...');
  import('./build-static.mjs');
} else {
  console.log('⚡ [Smart-Build] Môi trường tiêu chuẩn (Node.js Server / Vercel / Render / AI Studio). Khởi chạy: next build...');
  try {
    execSync('npx next build', {
      cwd: rootDir,
      stdio: 'inherit',
      env: process.env,
    });

    // Sau khi build production xong, đảm bảo các unhashed chunk files cần thiết cho dev server không bị 404
    const appChunksDir = path.join(rootDir, '.next', 'static', 'chunks', 'app');
    if (fs.existsSync(appChunksDir)) {
      const files = fs.readdirSync(appChunksDir);
      
      const ensureAlias = (prefix, targetName) => {
        const targetPath = path.join(appChunksDir, targetName);
        if (!fs.existsSync(targetPath)) {
          const match = files.find(f => f.startsWith(`${prefix}-`) && f.endsWith('.js') && !f.includes('.map'));
          if (match) {
            fs.copyFileSync(path.join(appChunksDir, match), targetPath);
            console.log(`🔗 [Smart-Build] Đã bảo toàn dev chunk: ${match} -> ${targetName}`);
          }
        }
      };

      ensureAlias('error', 'error.js');
      ensureAlias('global-error', 'global-error.js');
      ensureAlias('page', 'page.js');
      ensureAlias('layout', 'layout.js');
      ensureAlias('not-found', 'not-found.js');
    }
  } catch (err) {
    process.exit(1);
  }
}
