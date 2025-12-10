/**
 * Script para generar assets placeholder
 * Ejecutar con: node scripts/generate-assets.js
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

// Crear directorio assets si no existe
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// PNG mínimo válido (1x1 pixel azul)
const createMinimalPNG = () => {
  return Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, // bit depth: 8, color type: 2 (RGB)
    0x00, 0x00, 0x00, // compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // IHDR CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9C, 0x63, 0x18, 0x73, 0xE8, 0x00, 0x00, // compressed data (blue pixel)
    0x00, 0x05, 0x00, 0x01, // CRC placeholder
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // IEND CRC
  ]);
};

const assets = ['icon.png', 'adaptive-icon.png', 'splash.png', 'favicon.png'];

assets.forEach(asset => {
  const filePath = path.join(assetsDir, asset);
  fs.writeFileSync(filePath, createMinimalPNG());
  console.log(`Created: ${filePath}`);
});

console.log('\nAssets generated successfully!');
console.log('Note: Replace these with proper images for production.');
