const { Jimp } = require('jimp');
const path = require('path');

const PUBLIC = path.join(__dirname, '..', 'public');
const SRC = path.join(PUBLIC, 'protpick4.png');

async function main() {
  const img = await Jimp.read(SRC);

  // Resize to 192x192
  const i192 = img.clone().resize({ w: 192, h: 192 });
  await i192.write(path.join(PUBLIC, 'pwa-192x192.png'));
  console.log('✔ pwa-192x192.png');

  // Resize to 512x512
  const i512 = img.clone().resize({ w: 512, h: 512 });
  await i512.write(path.join(PUBLIC, 'pwa-512x512.png'));
  console.log('✔ pwa-512x512.png');

  console.log('Done!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
