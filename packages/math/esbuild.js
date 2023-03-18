import esbuild from 'esbuild';

esbuild.build({
  bundle: true,
  entryPoints: ['./src/index.ts'],
  format: 'esm',
  logLevel: 'info',
  mainFields: ['module', 'main'],
  outfile: './built/math.mjs',
  packages: 'external',  // don't actually bundle dependencies
  platform: 'node',
  sourcemap: true,
  target: 'es2020'
}).catch(() => process.exit(1))
