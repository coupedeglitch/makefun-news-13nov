// Copies entry.png (located next to this script) into the output directory, then
// verifies the copy is a real PNG (8-byte signature, size in 1..1048576 bytes) and
// prints `entry.png <bytes> bytes -> <outputDir>`. Exit code 1 on any failure.
//
// Output directory: $MAKEFUN_OUTPUT_DIR, default /output.
// Run locally:  $env:MAKEFUN_OUTPUT_DIR = 'out'; node main.ts   (PowerShell)
//               MAKEFUN_OUTPUT_DIR=out node main.ts             (bash)
// Node 22+ only, no dependencies.

import { copyFile, mkdir, open, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1048576;

const source = fileURLToPath(new URL('./entry.png', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const destination = path.join(outputDir, 'entry.png');

try {
  await mkdir(outputDir, { recursive: true });
  await copyFile(source, destination);

  const handle = await open(destination, 'r');
  try {
    const header = Buffer.alloc(8);
    const { bytesRead } = await handle.read(header, 0, 8, 0);
    if (bytesRead !== 8 || !header.equals(PNG_SIGNATURE)) {
      throw new Error(`copy is not a PNG (first bytes: ${header.subarray(0, bytesRead).toString('hex') || 'none'})`);
    }
  } finally {
    await handle.close();
  }

  const { size } = await stat(destination);
  if (size === 0) throw new Error('copy is empty (0 bytes)');
  if (size > MAX_BYTES) throw new Error(`copy is ${size} bytes, over the ${MAX_BYTES}-byte limit`);

  console.log(`entry.png ${size} bytes -> ${outputDir}`);
} catch (err) {
  console.error(`error: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
}
