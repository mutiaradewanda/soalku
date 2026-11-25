import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const iconsDir = path.join(publicDir, "icons");

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// 1. Vector SVG Icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="50%" stop-color="#1E3A8A"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background rounded rectangle -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  
  <!-- Subtle inner border ring -->
  <rect x="12" y="12" width="488" height="488" rx="100" fill="none" stroke="#38BDF8" stroke-width="4" stroke-opacity="0.3"/>

  <!-- Glowing background accent circle -->
  <circle cx="256" cy="256" r="160" fill="#2563EB" opacity="0.25" filter="url(#glow)"/>

  <!-- Open Book Base -->
  <g transform="translate(0, 40)">
    <!-- Left Page -->
    <path d="M256 340 C210 320 150 320 100 336 L100 210 C150 196 210 196 256 216 Z" 
          fill="#1E293B" stroke="#38BDF8" stroke-width="8" stroke-linejoin="round"/>
    <!-- Right Page -->
    <path d="M256 340 C302 320 362 320 412 336 L412 210 C362 196 302 196 256 216 Z" 
          fill="#0F172A" stroke="#38BDF8" stroke-width="8" stroke-linejoin="round"/>
    
    <!-- Spine Central Divider -->
    <line x1="256" y1="216" x2="256" y2="340" stroke="#06B6D4" stroke-width="8" stroke-linecap="round"/>

    <!-- Page Content Lines Left -->
    <line x1="130" y1="244" x2="226" y2="252" stroke="#94A3B8" stroke-width="6" stroke-linecap="round"/>
    <line x1="130" y1="274" x2="226" y2="282" stroke="#94A3B8" stroke-width="6" stroke-linecap="round"/>
    
    <!-- Page Content Lines Right -->
    <line x1="286" y1="252" x2="382" y2="244" stroke="#94A3B8" stroke-width="6" stroke-linecap="round"/>
    <line x1="286" y1="282" x2="382" y2="274" stroke="#94A3B8" stroke-width="6" stroke-linecap="round"/>
  </g>

  <!-- Graduation Cap (Mortarboard) -->
  <g transform="translate(0, -20)">
    <!-- Cap Diamond Top -->
    <polygon points="256,110 396,170 256,230 116,170" fill="url(#cyanGrad)" stroke="#FFFFFF" stroke-width="8" stroke-linejoin="round"/>
    
    <!-- Cap Skull Base -->
    <path d="M166 195 L166 245 C166 280 346 280 346 245 L346 195" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
    
    <!-- Cap Button & Tassel -->
    <circle cx="256" cy="170" r="10" fill="#FDE047"/>
    <path d="M256 170 Q370 190 376 245" fill="none" stroke="url(#goldGrad)" stroke-width="6" stroke-linecap="round"/>
    <polygon points="376,245 372,270 382,270" fill="#F59E0B"/>
  </g>

  <!-- AI Sparkle Star Top Right -->
  <g transform="translate(370, 90)">
    <path d="M30 0 Q30 30 60 30 Q30 30 30 60 Q30 30 0 30 Q30 30 30 0 Z" fill="url(#goldGrad)" filter="url(#glow)"/>
    <circle cx="30" cy="30" r="6" fill="#FFFFFF"/>
  </g>

  <!-- Small AI Sparkle Bottom Left -->
  <g transform="translate(80, 290) scale(0.6)">
    <path d="M30 0 Q30 30 60 30 Q30 30 30 60 Q30 30 0 30 Q30 30 30 0 Z" fill="#38BDF8"/>
  </g>
</svg>`;

// 2. Maskable SVG Icon (Safe zone compliant, padding for rounded / circular OS icons)
const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B132B"/>
      <stop offset="50%" stop-color="#1E3A8A"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <linearGradient id="cyanGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
    <linearGradient id="goldGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>

  <!-- Solid Full Background for Maskable Icon -->
  <rect width="512" height="512" fill="url(#bgGradM)"/>

  <!-- Scaled Artwork within 80% Safe Zone (center = 256, 256) -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <!-- Open Book Base -->
    <g transform="translate(0, 40)">
      <path d="M256 340 C210 320 150 320 100 336 L100 210 C150 196 210 196 256 216 Z" 
            fill="#1E293B" stroke="#38BDF8" stroke-width="10" stroke-linejoin="round"/>
      <path d="M256 340 C302 320 362 320 412 336 L412 210 C362 196 302 196 256 216 Z" 
            fill="#0F172A" stroke="#38BDF8" stroke-width="10" stroke-linejoin="round"/>
      <line x1="256" y1="216" x2="256" y2="340" stroke="#06B6D4" stroke-width="10" stroke-linecap="round"/>
    </g>

    <!-- Graduation Cap -->
    <g transform="translate(0, -20)">
      <polygon points="256,110 396,170 256,230 116,170" fill="url(#cyanGradM)" stroke="#FFFFFF" stroke-width="10" stroke-linejoin="round"/>
      <path d="M166 195 L166 245 C166 280 346 280 346 245 L346 195" fill="none" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round"/>
      <circle cx="256" cy="170" r="12" fill="#FDE047"/>
      <path d="M256 170 Q370 190 376 245" fill="none" stroke="url(#goldGradM)" stroke-width="8" stroke-linecap="round"/>
      <polygon points="376,245 372,270 382,270" fill="#F59E0B"/>
    </g>

    <!-- AI Sparkle Star -->
    <g transform="translate(370, 90)">
      <path d="M30 0 Q30 30 60 30 Q30 30 30 60 Q30 30 0 30 Q30 30 30 0 Z" fill="url(#goldGradM)"/>
    </g>
  </g>
</svg>`;

// Save Vector SVGs
fs.writeFileSync(path.join(publicDir, "favicon.svg"), svgIcon);
fs.writeFileSync(path.join(iconsDir, "icon-192x192.svg"), svgIcon);
fs.writeFileSync(path.join(iconsDir, "icon-512x512.svg"), svgIcon);
fs.writeFileSync(path.join(iconsDir, "icon-maskable.svg"), svgMaskable);

console.log("✓ SVG Icons created successfully.");

// 3. PNG Generation using Pure Node zlib (Rasterizer)
function createCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}
const crcTable = createCrcTable();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  const c = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(c, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generateRasterPng(size, isMaskable = false) {
  const raw = Buffer.alloc(size * (1 + size * 4));

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.46;
  const cornerR = size * 0.22;

  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0; // Filter None

    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 4;

      // Distance from center
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 15, g = 23, b = 42, a = 255; // Dark slate #0F172A

      if (!isMaskable) {
        // Rounded corner bounding box
        const qx = Math.max(0, Math.abs(x - cx) - (cx - cornerR));
        const qy = Math.max(0, Math.abs(y - cy) - (cy - cornerR));
        const qdist = Math.sqrt(qx * qx + qy * qy);
        if (qdist > cornerR) {
          raw[px] = 0; raw[px + 1] = 0; raw[px + 2] = 0; raw[px + 3] = 0;
          continue;
        }
      }

      // Smooth diagonal gradient
      const t = (x + y) / (size * 2);
      r = Math.round(15 * (1 - t) + 30 * t);
      g = Math.round(23 * (1 - t) + 80 * t);
      b = Math.round(42 * (1 - t) + 160 * t);

      // Central glowing orb
      if (dist < radius) {
        const glowFactor = Math.max(0, 1 - dist / radius);
        r = Math.min(255, Math.round(r + 20 * glowFactor));
        g = Math.min(255, Math.round(g + 90 * glowFactor));
        b = Math.min(255, Math.round(b + 190 * glowFactor));
      }

      // Graduation Cap Polygon Area
      // Diamond: (cx, cy - 0.28*size) to (cx + 0.3*size, cy - 0.12*size) ...
      const capTop = cy - size * 0.28;
      const capBottom = cy - size * 0.04;
      const capLeft = cx - size * 0.32;
      const capRight = cx + size * 0.32;

      // Diamond equation: |dx| / (0.32*size) + |dy - (capTop+capBottom)/2| / ((capBottom-capTop)/2) <= 1
      const capMidY = (capTop + capBottom) / 2;
      const capHalfH = (capBottom - capTop) / 2;
      const capHalfW = size * 0.32;
      const diamondDist = Math.abs(dx) / capHalfW + Math.abs(y - capMidY) / capHalfH;

      if (diamondDist <= 1.0) {
        // Cap Cyan Fill
        r = Math.round(56 + 10 * (x / size));
        g = Math.round(189 - 20 * (x / size));
        b = Math.round(248);
        // Border highlight
        if (diamondDist > 0.88) {
          r = 255; g = 255; b = 255;
        }
      }

      // Center button on cap
      if (Math.abs(dx) < size * 0.03 && Math.abs(y - capMidY) < size * 0.03) {
        r = 253; g = 224; b = 71; // Gold
      }

      // Open Book Page Area
      const bookTop = cy + size * 0.02;
      const bookBottom = cy + size * 0.28;
      const bookLeft = cx - size * 0.32;
      const bookRight = cx + size * 0.32;

      if (y >= bookTop && y <= bookBottom && x >= bookLeft && x <= bookRight) {
        const bookYProg = (y - bookTop) / (bookBottom - bookTop);
        // Curve of book
        const bookDistX = Math.abs(dx) / (size * 0.32);
        if (bookDistX <= 1.0) {
          // Page background
          r = dx < 0 ? 30 : 15;
          g = dx < 0 ? 41 : 23;
          b = dx < 0 ? 59 : 42;

          // Page borders
          if (bookDistX > 0.92 || y <= bookTop + 3 || y >= bookBottom - 3 || Math.abs(dx) < 3) {
            r = 56; g = 189; b = 248; // Cyan border
          } else {
            // Horizontal text lines
            const lineY1 = bookTop + (bookBottom - bookTop) * 0.35;
            const lineY2 = bookTop + (bookBottom - bookTop) * 0.65;
            if ((Math.abs(y - lineY1) <= 1.5 || Math.abs(y - lineY2) <= 1.5) && bookDistX > 0.2 && bookDistX < 0.8) {
              r = 148; g = 163; b = 184; // Slate text line
            }
          }
        }
      }

      // AI Star Sparkle (Top Right)
      const starCx = cx + size * 0.28;
      const starCy = cy - size * 0.28;
      const starR = size * 0.08;
      const sDx = Math.abs(x - starCx);
      const sDy = Math.abs(y - starCy);
      if (sDx < starR && sDy < starR) {
        // 4-point star curve: (sDx/starR)^0.5 + (sDy/starR)^0.5 <= 1
        if (Math.sqrt(sDx / starR) + Math.sqrt(sDy / starR) <= 1.0) {
          r = 254; g = 240; b = 138; // Bright Yellow
          if (sDx < 2 && sDy < 2) {
            r = 255; g = 255; b = 255; // White hot center
          }
        }
      }

      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
      raw[px + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Generate PNG Files
console.log("Generating PNG raster icons...");
const icon192 = generateRasterPng(192, false);
fs.writeFileSync(path.join(iconsDir, "icon-192x192.png"), icon192);

const icon512 = generateRasterPng(512, false);
fs.writeFileSync(path.join(iconsDir, "icon-512x512.png"), icon512);

const maskable192 = generateRasterPng(192, true);
fs.writeFileSync(path.join(iconsDir, "icon-maskable-192x192.png"), maskable192);

const maskable512 = generateRasterPng(512, true);
fs.writeFileSync(path.join(iconsDir, "icon-maskable-512x512.png"), maskable512);

const appleTouchIcon = generateRasterPng(180, false);
fs.writeFileSync(path.join(iconsDir, "apple-touch-icon.png"), appleTouchIcon);
fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), appleTouchIcon);

console.log("✓ All PNG & SVG icons successfully generated in /public/icons/!");
