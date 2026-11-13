// Copies entry.png (located next to this script) into the output directory, then
// verifies the copy is a real PNG (8-byte signature, size in 1..1048576 bytes) and
// prints `entry.png <bytes> bytes -> <outputDir> (from <sourcePath>)`.
// Refuses to run when the output directory is the source directory. Exit code 1
// on any failure, with a message on stderr.
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

// Throws unless the file at `filePath` starts with the 8-byte PNG signature.
async function assertPng(filePath: string): Promise<void> {
  const handle = await open(filePath, 'r');
  try {
    const header = Buffer.alloc(8);
    const { bytesRead } = await handle.read(header, 0, 8, 0);
    if (bytesRead !== 8 || !header.equals(PNG_SIGNATURE)) {
      const seen = header.subarray(0, bytesRead).toString('hex') || 'none';
      throw new Error(`${filePath} is not a PNG (first bytes: ${seen})`);
    }
  } finally {
    await handle.close();
  }
}

const source = fileURLToPath(new URL('./entry.png', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const destination = path.join(outputDir, 'entry.png');

try {
  // Copying a file onto itself either no-ops or truncates it; refuse instead.
  // Windows paths are case-insensitive, so compare them that way there.
  const normalize = (p: string) => (process.platform === 'win32' ? p.toLowerCase() : p);
  if (normalize(path.resolve(path.dirname(destination))) === normalize(path.resolve(path.dirname(source)))) {
    throw new Error(`output directory is the source directory (${path.dirname(source)}); choose another MAKEFUN_OUTPUT_DIR`);
  }

  try {
    await mkdir(outputDir, { recursive: true });
  } catch (err) {
    throw new Error(`cannot create output directory ${outputDir}: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    await copyFile(source, destination);
  } catch (err) {
    throw new Error(`cannot copy ${source} to ${destination}: ${err instanceof Error ? err.message : String(err)}`);
  }

  await assertPng(destination);

  const { size } = await stat(destination);
  if (size === 0) throw new Error('copy is empty (0 bytes)');
  if (size > MAX_BYTES) throw new Error(`copy is ${size} bytes, over the ${MAX_BYTES}-byte limit`);

  console.log(`entry.png ${size} bytes -> ${outputDir} (from ${source})`);
} catch (err) {
  console.error(`error: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
}
