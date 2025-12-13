/**
 * Script para generar assets PNG válidos con tamaños apropiados
 * Ejecutar con: node scripts/generate-proper-assets.js
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
 * Crea una imagen PNG de color sólido
 */
function createPNG(width, height, r, g, b, a = 255) {
  const png = new PNG({ width, height });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;

      // Color de fondo
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;

      // Añadir un borde blanco para que sea visible
      const borderSize = Math.min(width, height) * 0.05;
      if (x < borderSize || x >= width - borderSize ||
          y < borderSize || y >= height - borderSize) {
        png.data[idx] = 255;
        png.data[idx + 1] = 255;
        png.data[idx + 2] = 255;
        png.data[idx + 3] = 255;
      }

      // Añadir un símbolo simple en el centro (para icon y adaptive-icon)
      const centerX = width / 2;
      const centerY = height / 2;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const radius = Math.min(width, height) * 0.3;

      if (distance < radius && distance > radius * 0.7) {
        png.data[idx] = 255;
        png.data[idx + 1] = 255;
        png.data[idx + 2] = 255;
        png.data[idx + 3] = 255;
      }
    }
  }

  return png;
}

const assets = [
  {
    name: 'icon.png',
    width: 1024,
    height: 1024,
    color: [26, 115, 232] // Azul de la app
  },
  {
    name: 'adaptive-icon.png',
    width: 1024,
    height: 1024,
    color: [26, 115, 232]
  },
  {
    name: 'splash.png',
    width: 1242,
    height: 2436,
    color: [26, 115, 232]
  },
  {
    name: 'favicon.png',
    width: 48,
    height: 48,
    color: [26, 115, 232]
  }
];

console.log('Generando assets PNG...\n');

assets.forEach(asset => {
  const filePath = path.join(assetsDir, asset.name);
  const png = createPNG(asset.width, asset.height, ...asset.color);

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(filePath, buffer);

  console.log(`✓ Creado: ${asset.name} (${asset.width}x${asset.height})`);
});

console.log('\n✅ Assets generados correctamente!');
console.log('Nota: Reemplaza estas imágenes con diseños apropiados para producción.\n');
