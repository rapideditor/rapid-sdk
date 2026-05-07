
await Promise.all([
  Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    target: 'node',
    format: 'cjs',
    external: ['aes-js', 'diacritics'],
    sourcemap: 'linked',
    naming: 'index.c[ext]'  // .cjs
  }),

  Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    target: 'node',
    format: 'esm',
    external: ['aes-js', 'diacritics'],
    sourcemap: 'linked',
    naming: 'index.m[ext]'  // .mjs
  })
]);

export {};
