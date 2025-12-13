/**
 * Script para generar assets válidos
 * Ejecutar con: node scripts/generate-assets.js
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const assetsDir = path.join(__dirname, '..', 'assets');

// Crear directorio assets si no existe
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

/**
 * Crea una imagen PNG sólida con texto
 */
function createPNG(width, height, text, outputPath) {
  const png = new PNG({ width, height });

  // Color de fondo: #1a73e8 (azul)
  const bgColor = { r: 26, g: 115, b: 232 };

  // Llenar con color de fondo
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      png.data[idx] = bgColor.r;
      png.data[idx + 1] = bgColor.g;
      png.data[idx + 2] = bgColor.b;
      png.data[idx + 3] = 255; // alpha
    }
  }

  // Dibujar una "W" simple en el centro (para icono)
  if (text === 'W') {
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const size = Math.floor(Math.min(width, height) * 0.4);

    // Dibujar un rectángulo blanco en el centro
    const white = { r: 255, g: 255, b: 255 };
    for (let y = centerY - size; y < centerY + size; y++) {
      for (let x = centerX - size; x < centerX + size; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const idx = (width * y + x) << 2;
          png.data[idx] = white.r;
          png.data[idx + 1] = white.g;
          png.data[idx + 2] = white.b;
          png.data[idx + 3] = 255;
        }
      }
    }
  }

  // Guardar PNG
  png.pack().pipe(fs.createWriteStream(outputPath));
  console.log(`Created: ${outputPath} (${width}x${height})`);
}

// Generar assets
createPNG(1024, 1024, 'W', path.join(assetsDir, 'icon.png'));
createPNG(1024, 1024, 'W', path.join(assetsDir, 'adaptive-icon.png'));
createPNG(1284, 2778, '', path.join(assetsDir, 'splash.png'));
createPNG(48, 48, 'W', path.join(assetsDir, 'favicon.png'));

setTimeout(() => {
  console.log('\n✅ Assets generated successfully!');
  console.log('Note: For production, replace these with professionally designed images.');
}, 1000);
