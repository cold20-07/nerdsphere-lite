// Simple script to generate placeholder PWA icons
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

function generateSVGIcon(size) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">N</text>
</svg>`;
}

// Generate icons
const publicDir = path.join(__dirname, '..', 'public');

fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), generateSVGIcon(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), generateSVGIcon(512));

console.log('✓ Generated icon-192.svg');
console.log('✓ Generated icon-512.svg');
console.log('\nNote: For production, convert these to PNG files using an image editor or online tool.');
console.log('You can use: https://cloudconvert.com/svg-to-png');
