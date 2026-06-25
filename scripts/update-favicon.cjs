const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, '..', 'public');
const ICON_192 = path.join(PUBLIC, 'pwa-192x192.png');
const FAVICON_SVG = path.join(PUBLIC, 'favicon.svg');

async function main() {
  const img = await Jimp.read(ICON_192);
  const buf = await img.getBuffer('image/png');

  const base64 = buf.toString('base64');
  const dataUri = `data:image/png;base64,${base64}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <image href="${dataUri}" width="32" height="32"/>
</svg>
`;

  fs.writeFileSync(FAVICON_SVG, svg);
  console.log('✔ favicon.svg updated with embedded PNG (base64)');
  console.log(`   Base64 size: ${(base64.length / 1024).toFixed(0)} KB`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
