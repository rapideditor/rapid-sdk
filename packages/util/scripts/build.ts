
await Promise.all([
  Bun.build({
    entrypoints: ['./src/util.ts'],
    outdir: './dist',
    target: 'node',
    format: 'cjs',
    external: ['aes-js', 'diacritics'],
    sourcemap: 'linked',
    naming: 'util.c[ext]'  // .cjs
  }),

  Bun.build({
    entrypoints: ['./src/util.ts'],
    outdir: './dist',
    target: 'node',
    format: 'esm',
    external: ['aes-js', 'diacritics'],
    sourcemap: 'linked',
    naming: 'util.m[ext]'  // .mjs
  })
]);
