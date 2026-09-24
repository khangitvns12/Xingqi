const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'out');
const nextDir = path.join(rootDir, '.next');
const publicDir = path.join(rootDir, 'public');

console.log('[Deploy Helper] Preparing "out" directory for static hosting (Cloudflare Pages, Vercel, etc.)...');

try {
  // Ensure out directory exists and is clean
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Copy public directory assets if present
  if (fs.existsSync(publicDir)) {
    fs.cpSync(publicDir, outDir, { recursive: true });
    console.log('[Deploy Helper] Copied public assets to out/');
  }

  // 2. Copy Next.js static assets (_next/static)
  const nextStaticDir = path.join(nextDir, 'static');
  const outNextStaticDir = path.join(outDir, '_next', 'static');
  if (fs.existsSync(nextStaticDir)) {
    fs.mkdirSync(path.dirname(outNextStaticDir), { recursive: true });
    fs.cpSync(nextStaticDir, outNextStaticDir, { recursive: true });
    console.log('[Deploy Helper] Copied .next/static to out/_next/static');
  }

  // 3. Copy pre-rendered HTML files from .next/server/app
  const appServerDir = path.join(nextDir, 'server', 'app');
  if (fs.existsSync(appServerDir)) {
    const indexPath = path.join(appServerDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      fs.copyFileSync(indexPath, path.join(outDir, 'index.html'));
      console.log('[Deploy Helper] Copied index.html to out/index.html');
    }

    const notFoundPath = path.join(appServerDir, '_not-found.html');
    if (fs.existsSync(notFoundPath)) {
      fs.copyFileSync(notFoundPath, path.join(outDir, '404.html'));
      fs.copyFileSync(notFoundPath, path.join(outDir, '_not-found.html'));
      console.log('[Deploy Helper] Copied _not-found.html to out/404.html');
    }

    const rscPath = path.join(appServerDir, 'index.rsc');
    if (fs.existsSync(rscPath)) {
      fs.copyFileSync(rscPath, path.join(outDir, 'index.rsc'));
    }
  }

  // 4. Also copy static assets and public to standalone directory if standalone exists
  const standaloneDir = path.join(nextDir, 'standalone');
  if (fs.existsSync(standaloneDir)) {
    const standaloneStatic = path.join(standaloneDir, '.next', 'static');
    if (fs.existsSync(nextStaticDir)) {
      fs.mkdirSync(path.dirname(standaloneStatic), { recursive: true });
      fs.cpSync(nextStaticDir, standaloneStatic, { recursive: true });
      console.log('[Deploy Helper] Copied .next/static to .next/standalone/.next/static');
    }
    const standalonePublic = path.join(standaloneDir, 'public');
    if (fs.existsSync(publicDir)) {
      fs.cpSync(publicDir, standalonePublic, { recursive: true });
      console.log('[Deploy Helper] Copied public to .next/standalone/public');
    }
  }

  console.log('[Deploy Helper] Successfully populated "out" and standalone directories!');
} catch (err) {
  console.error('[Deploy Helper] Error preparing "out" directory:', err);
  // Do not fail the build if this fails
}
