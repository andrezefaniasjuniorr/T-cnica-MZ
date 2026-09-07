import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

// Minimal standalone PNG generator using standard Node zlib
function createPngBuffer(width, height, drawFn) {
  // RGBA buffer (4 bytes per pixel)
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression method: Deflate
  ihdr[11] = 0; // Filter method: Standard
  ihdr[12] = 0; // Interlace: None

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const buffer = Buffer.alloc(12 + length);
  buffer.writeUInt32BE(length, 0);
  buffer.write(type, 4, 4, 'ascii');
  data.copy(buffer, 8);

  const crcData = buffer.subarray(4, 8 + length);
  const crc = calculateCrc32(crcData);
  buffer.writeUInt32BE(crc, 8 + length);

  return buffer;
}

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function calculateCrc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Brand color rendering: Deep navy #020617, Electric Blue #2563eb, Amber Lightning #f59e0b
function drawBrandIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background (#020617)
  let r = 2;
  let g = 6;
  let b = 23;
  let a = 255;

  // Outer gradient lighting
  const gradFactor = 1 - Math.min(1, dist / (w * 0.7));
  r = Math.min(255, r + Math.floor(gradFactor * 15));
  g = Math.min(255, g + Math.floor(gradFactor * 25));
  b = Math.min(255, b + Math.floor(gradFactor * 60));

  const safeScale = isMaskable ? 0.7 : 0.85;
  const rad = (w / 2) * safeScale;

  // Blue circular glow & border
  if (dist < rad && dist > rad - (w * 0.04)) {
    return [37, 99, 235, 255]; // Electric Blue ring
  }

  // Cyan inner border
  if (dist < rad - (w * 0.04) && dist > rad - (w * 0.055)) {
    return [6, 182, 212, 255]; // Cyan accent ring
  }

  // Lightning Bolt & Wrench geometry in center
  // Lightning bolt polygon: top(cx+10, cy-rad*0.55), mid(cx-rad*0.3, cy), mid-right(cx+10, cy), bot(cx-15, cy+rad*0.55), mid-up(cx+rad*0.35, cy-rad*0.05), mid-left(cx+10, cy-rad*0.05)
  // Simplified mathematical lightning bolt check:
  const boltY = (y - cy) / (rad * 0.6); // -1 to 1
  const boltX = (x - cx) / (rad * 0.4); // -1 to 1

  let inBolt = false;
  if (boltY >= -0.8 && boltY <= 0.8) {
    if (boltY < 0.0) {
      // Top segment
      const targetX = -boltY * 0.5;
      if (Math.abs(boltX - targetX) < 0.28) {
        inBolt = true;
      }
    } else {
      // Bottom segment
      const targetX = -(boltY - 0.2) * 0.6;
      if (Math.abs(boltX - targetX) < 0.26) {
        inBolt = true;
      }
    }
  }

  if (inBolt) {
    // Amber/Gold lightning (#f59e0b to #fbbf24)
    return [245, 158, 11, 255];
  }

  // Subtle Wrench silhouette on left side
  const wrenchDist = Math.sqrt(Math.pow(x - (cx - rad * 0.35), 2) + Math.pow(y - (cy + rad * 0.25), 2));
  if (wrenchDist < rad * 0.22 && wrenchDist > rad * 0.12) {
    return [59, 130, 246, 220]; // Blue accent
  }

  return [r, g, b, a];
}

const publicDir = path.resolve('public');

// Generate icons
const sizes = [
  { name: 'pwa-192x192.png', size: 192, maskable: false },
  { name: 'pwa-512x512.png', size: 512, maskable: false },
  { name: 'pwa-maskable-512x512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
  { name: 'favicon.ico', size: 64, maskable: false }
];

for (const icon of sizes) {
  const buffer = createPngBuffer(icon.size, icon.size, (x, y, w, h) =>
    drawBrandIcon(x, y, w, h, icon.maskable)
  );
  const targetPath = path.join(publicDir, icon.name);
  fs.writeFileSync(targetPath, buffer);
  console.log(`Generated: ${icon.name} (${buffer.length} bytes)`);
}
