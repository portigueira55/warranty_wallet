/**
 * Generador de assets PNG ultra-simples
 * Sin bordes ni círculos - solo color sólido
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const assetsDir = path.join(__dirname, '..', 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

/**
 * Crea PNG de color sólido simple
 */
function createSolidColorPNG(width, height) {
  const png = new PNG({ width, height });

  // Color azul de la app: #1a73e8 = rgb(26, 115, 232)
  const r = 26;
  const g = 115;
  const b = 232;
  const a = 255;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  return PNG.sync.write(png, { colorType: 6 }); // RGBA
}

const assets = [
  { name: 'icon.png', width: 1024, height: 1024 },
  { name: 'adaptive-icon.png', width: 1024, height: 1024 },
  { name: 'splash.png', width: 1242, height: 2436 },
  { name: 'favicon.png', width: 48, height: 48 }
];

console.log('Generando assets PNG de color sólido...\n');

assets.forEach(asset => {
  const filePath = path.join(assetsDir, asset.name);
  const buffer = createSolidColorPNG(asset.width, asset.height);
  fs.writeFileSync(filePath, buffer);
  console.log(`✓ ${asset.name} (${asset.width}x${asset.height}) - ${buffer.length} bytes`);
});

console.log('\n✅ Assets generados correctamente!');
