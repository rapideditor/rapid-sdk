import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

// CommonJS
esbuild.build({
  bundle: true,
  entryPoints: ['./src/tiler.ts'],
  logLevel: 'info',
  outfile: './built/tiler.cjs',
  platform: 'node',
  plugins: [nodeExternalsPlugin()]
}).catch(() => process.exit(1))

// ESM
esbuild.build({
  bundle: true,
  entryPoints: ['./src/tiler.ts'],
  logLevel: 'info',
  outfile: './built/tiler.mjs',
  platform: 'neutral',
  plugins: [nodeExternalsPlugin()]
}).catch(() => process.exit(1))
