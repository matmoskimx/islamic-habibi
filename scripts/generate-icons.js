import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, r, g, b, a = 255) {
  // A minimal valid PNG generator using node zlib
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // CRC32 implementation
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return crc ^ -1;
  }

  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }

  // Scanlines with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);
  
  // Center coordinates for drawing crescent/symbol
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter none
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Emerald background (#022c22) with gold inner accent
      let pr = 2;
      let pg = 44;
      let pb = 34;

      if (dist < radius) {
        // Islamic gold rosette & crescent (#f59e0b)
        const inCrescent = (dist > radius * 0.4 && dist < radius * 0.8 && (dx > -radius * 0.2));
        if (inCrescent) {
          pr = 245;
          pg = 158;
          pb = 11;
        } else if (dist < radius * 0.35) {
          // Inner core gold
          pr = 251;
          pg = 191;
          pb = 36;
        } else {
          // Deep emerald gradient
          pr = 6;
          pg = 78;
          pb = 59;
        }
      }

      rawData[pxOffset] = pr;
      rawData[pxOffset + 1] = pg;
      rawData[pxOffset + 2] = pb;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, 2, 44, 34));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, 2, 44, 34));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 2, 44, 34));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, 2, 44, 34));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(64, 64, 2, 44, 34));

console.log('Generated PWA PNG assets successfully in /public');
