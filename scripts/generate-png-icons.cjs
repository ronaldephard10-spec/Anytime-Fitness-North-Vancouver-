const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createPNG(width, height, drawFn) {
  // Scanlines: height lines, each 1 byte filter type (0) + width * 4 bytes RGBA
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const buf = Buffer.alloc(8 + length + 4);
  buf.writeUInt32BE(length, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + length);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + length);
  return buf;
}

// Icon drawer: Anytime Fitness purple theme (#4B286D) + Teal/Green Checkmark
function drawAppIcon(isMaskable) {
  return function(x, y, w, h) {
    const cx = w / 2;
    const cy = h / 2;
    const radius = w * 0.46;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // If not maskable, round corners with smooth antialiasing
    if (!isMaskable) {
      const cr = w * 0.22;
      const qx = Math.max(Math.abs(dx) - (cx - cr), 0);
      const qy = Math.max(Math.abs(dy) - (cy - cr), 0);
      const cornerDist = Math.sqrt(qx * qx + qy * qy);
      if (cornerDist > cr) {
        return [0, 0, 0, 0]; // Transparent outside rounded rect
      }
    }

    // Base background gradient: Deep purple to Royal Violet
    const t = (x + y) / (w + h);
    let r = Math.round(75 * (1 - t) + 40 * t);
    let g = Math.round(40 * (1 - t) + 15 * t);
    let b = Math.round(110 * (1 - t) + 70 * t);
    let a = 255;

    // Outer subtle gold/purple ring
    if (dist > radius * 0.78 && dist < radius * 0.84) {
      return [140, 90, 200, 255];
    }

    // Shield area
    const sx = (x - cx) / (w * 0.32);
    const sy = (y - cy) / (h * 0.32);
    // Shield formula roughly: y between -1.0 and 1.0 - abs(x)*0.5
    if (sy >= -0.9 && sy <= 0.9 && Math.abs(sx) <= 0.85 && sy - (1 - Math.abs(sx)) <= 0.4) {
      r = 95;
      g = 50;
      b = 145;
    }

    // Checkmark: line from (-0.35, 0.05) to (-0.05, 0.35) to (0.45, -0.3)
    const px = (x - cx) / (w * 0.5);
    const py = (y - cy) / (h * 0.5);

    // Distance to first segment: (-0.32, 0.05) -> (-0.08, 0.32)
    const d1 = distToSegment(px, py, -0.32, 0.05, -0.08, 0.32);
    // Distance to second segment: (-0.08, 0.32) -> (0.36, -0.28)
    const d2 = distToSegment(px, py, -0.08, 0.32, 0.36, -0.28);
    const checkDist = Math.min(d1, d2);

    const checkThickness = 0.085;
    if (checkDist < checkThickness) {
      const alpha = Math.min(1, (checkThickness - checkDist) / 0.02);
      // Bright vibrant green #00E676
      const cr = 0;
      const cg = 230;
      const cb = 118;
      r = Math.round(cr * alpha + r * (1 - alpha));
      g = Math.round(cg * alpha + g * (1 - alpha));
      b = Math.round(cb * alpha + b * (1 - alpha));
    }

    return [r, g, b, a];
  };
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. pwa-192x192.png
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, drawAppIcon(false)));
console.log('Generated pwa-192x192.png');

// 2. pwa-512x512.png
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, drawAppIcon(false)));
console.log('Generated pwa-512x512.png');

// 3. pwa-maskable-512x512.png
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, drawAppIcon(true)));
console.log('Generated pwa-maskable-512x512.png');

// 4. apple-touch-icon.png (180x180)
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, drawAppIcon(false)));
console.log('Generated apple-touch-icon.png');

// 5. favicon.ico (can be a 32x32 PNG renamed or standard)
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(32, 32, drawAppIcon(false)));
console.log('Generated favicon.ico');
