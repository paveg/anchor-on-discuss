/**
 * Simple icon generator script
 * Creates placeholder PNG icons for the Chrome extension
 *
 * For production, replace these with proper icons:
 * - Use a tool like Figma, Sketch, or Canva
 * - Or use an online icon generator
 * - Recommended: https://www.favicon-generator.org/
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [16, 48, 128];
const iconsDir = resolve(__dirname, '../public/icons');

// Create icons directory
mkdirSync(iconsDir, { recursive: true });

// Create SVG template
const createSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0969da"/>
  <text
    x="50%"
    y="50%"
    font-family="Arial, sans-serif"
    font-size="${size * 0.6}"
    fill="white"
    text-anchor="middle"
    dominant-baseline="central"
  >#</text>
</svg>
`.trim();

// Generate SVG files as placeholders
sizes.forEach((size) => {
  const svg = createSVG(size);
  const filename = resolve(iconsDir, `icon${size}.svg`);
  writeFileSync(filename, svg);
  console.log(`✓ Generated ${filename}`);
});

console.log('\n⚠️  Note: SVG icons created as placeholders.');
console.log('   For production, convert these to PNG using:');
console.log('   - Online tool: https://cloudconvert.com/svg-to-png');
console.log('   - Or use a design tool to create proper icons\n');
