import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

esbuild.build({
  bundle: true,
  entryPoints: ['./index.ts'],
  logLevel: 'info',
  outfile: './built/math.mjs',
  platform: 'neutral',
  plugins: [nodeExternalsPlugin()]
}).catch(() => process.exit(1))
