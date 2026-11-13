# makefun-food

Entry for the make.fun `news-image-01` competition. `main.ts` copies `entry.png` into the output directory and verifies the copy.

## Run

```bash
MAKEFUN_OUTPUT_DIR=out node main.ts   # bash
```

```powershell
$env:MAKEFUN_OUTPUT_DIR = 'out'; node main.ts   # PowerShell
```

The output directory defaults to `/output` when `MAKEFUN_OUTPUT_DIR` is unset. Node 22+, no dependencies.

## What the checks are

- **PNG signature** — the 8-byte header `89 50 4E 47 0D 0A 1A 0A` is read back from the copy and must match; anything else aborts with exit 1.
- **Source is not the destination** — if the output directory resolves to the directory containing `entry.png`, the run refuses to start rather than copying a file onto itself.
- **Size <= 1048576 bytes** — the copy must be larger than 0 and at most 1 MiB.
- **Deterministic copy** — no timestamps, randomness, or network; two runs produce byte-identical output.
- Success prints `entry.png <bytes> bytes -> <outputDir> (from <sourcePath>)`; any failure goes to stderr and exits 1.
