import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

esbuild.build({
  bundle: true,
  entryPoints: ['./src/tiler.ts'],
  logLevel: 'info',
  outfile: './built/tiler.mjs',
  platform: 'neutral',
  plugins: [nodeExternalsPlugin()]
}).catch(() => process.exit(1))
