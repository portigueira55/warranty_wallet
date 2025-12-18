/**
 * Generador de assets PNG RGB (sin alpha)
 * Formato más compatible con procesadores de imágenes
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const assetsDir = path.join(__dirname, '..', 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

/**
 * Crea PNG RGB sin canal alpha (más compatible)
 */
function createRGBPNG(width, height) {
  const png = new PNG({
    width,
    height,
    colorType: 2, // RGB (sin alpha)
    bitDepth: 8
  });

  // Color azul de la app: #1a73e8 = rgb(26, 115, 232)
  const r = 26;
  const g = 115;
  const b = 232;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) * 3; // RGB = 3 bytes por pixel
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
    }
  }

  return PNG.sync.write(png, {
    colorType: 2,
    bitDepth: 8,
    filterType: 0 // Sin filtro = más simple
  });
}

const assets = [
  { name: 'icon.png', width: 1024, height: 1024 },
  { name: 'adaptive-icon.png', width: 1024, height: 1024 },
  { name: 'splash.png', width: 1242, height: 2436 },
  { name: 'favicon.png', width: 48, height: 48 }
];

console.log('Generando assets PNG RGB (sin alpha)...\n');

assets.forEach(asset => {
  const filePath = path.join(assetsDir, asset.name);
  const buffer = createRGBPNG(asset.width, asset.height);
  fs.writeFileSync(filePath, buffer);
  console.log(`✓ ${asset.name} (${asset.width}x${asset.height}) - ${buffer.length} bytes`);
});

console.log('\n✅ Assets RGB generados correctamente!');
