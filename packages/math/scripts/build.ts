
await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  target: 'node',
  format: 'esm',
  packages: 'external',
  sourcemap: 'linked',
  naming: 'index.m[ext]'  // .mjs
});

export {};
