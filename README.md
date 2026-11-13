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

## Checks

- Source is resolved next to the script (`import.meta.url`), not the cwd.
- The copy starts with the PNG signature `89 50 4E 47 0D 0A 1A 0A`.
- The copy is larger than 0 bytes and at most 1048576 bytes.
- Success prints `entry.png <bytes> bytes -> <outputDir>`; any failure goes to stderr and exits 1.
- Deterministic: repeated runs produce identical bytes.
