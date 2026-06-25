const { Jimp, loadFont, measureText, measureTextHeight, rgbaToInt } = require('jimp');
const path = require('path');
const fs = require('fs');

// Direct path to built-in font
const pluginPath = require.resolve('@jimp/plugin-print');
const pluginRoot = pluginPath.replace(/dist[\\/]commonjs[\\/]index\.(js|mjs|cjs)$/, '');
const FONT_PATH = path.join(pluginRoot, 'fonts', 'open-sans', 'open-sans-64-white', 'open-sans-64-white.fnt');

async function generateIcon(size, filename) {
  const img = new Jimp({ width: size, height: size, color: 0xff09090b });
  const font = await loadFont(FONT_PATH);

  const text = 'PP';
  const textW = measureText(font, text);
  const textH = measureTextHeight(font, text, size);
  const x = (size - textW) / 2;
  const y = (size - textH) / 2 - (size * 0.05);
  img.print({ font, x, y, text });

  // Orange circle accent top-right (pickleball motif)
  const cx = size * 0.78, cy = size * 0.22, r = size * 0.09;
  // Only draw on 192 size to keep it simple - skip for 512
  if (size <= 256) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const d = Math.hypot(j - cx, i - cy);
        if (d < r && d > r * 0.65) {
          img.setPixelColor(rgbaToInt(255, 165, 0, 255), j, i);
        }
      }
    }
  }

  const outDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  await img.write(path.join(outDir, filename));
  console.log('Created', filename, `(${size}x${size})`);
}

(async () => {
  await generateIcon(192, 'pwa-192x192.png');
  await generateIcon(512, 'pwa-512x512.png');
  console.log('Done!');
})().catch(e => { console.error(e); process.exit(1); });
