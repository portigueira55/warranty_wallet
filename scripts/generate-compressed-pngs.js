/**
 * Generador de assets PNG con compresión óptima
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const zlib = require('zlib');

const assetsDir = path.join(__dirname, '..', 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

/**
 * Crea PNG con máxima compresión
 */
function createCompressedPNG(width, height) {
  const png = new PNG({
    width,
    height,
    colorType: 6, // RGBA
    bitDepth: 8,
    deflateLevel: 9, // Máxima compresión
    deflateStrategy: 3 // RLE strategy (mejor para color sólido)
  });

  // Color azul de la app
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

  return PNG.sync.write(png, {
    colorType: 6,
    deflateLevel: 9,
    deflateStrategy: 3,
    filterType: -1 // Auto-select best filter
  });
}

const assets = [
  { name: 'icon.png', width: 1024, height: 1024 },
  { name: 'adaptive-icon.png', width: 1024, height: 1024 },
  { name: 'splash.png', width: 1242, height: 2436 },
  { name: 'favicon.png', width: 48, height: 48 }
];

console.log('Generando assets PNG comprimidos...\n');

assets.forEach(asset => {
  const filePath = path.join(assetsDir, asset.name);
  const buffer = createCompressedPNG(asset.width, asset.height);
  fs.writeFileSync(filePath, buffer);
  console.log(`✓ ${asset.name} (${asset.width}x${asset.height}) - ${buffer.length} bytes`);
});

console.log('\n✅ Assets comprimidos generados!');
