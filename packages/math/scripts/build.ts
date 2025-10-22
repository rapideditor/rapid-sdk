
await Promise.all([
  Bun.build({
    entrypoints: ['./src/math.ts'],
    outdir: './dist',
    target: 'node',
    format: 'cjs',
    external: ['d3-polygon'],
    sourcemap: 'linked',
    naming: 'math.c[ext]'  // .cjs
  }),

  Bun.build({
    entrypoints: ['./src/math.ts'],
    outdir: './dist',
    target: 'node',
    format: 'esm',
    external: ['d3-polygon'],
    sourcemap: 'linked',
    naming: 'math.m[ext]'  // .mjs
  })
]);
