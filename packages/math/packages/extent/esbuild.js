import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

esbuild.build({
  bundle: true,
  entryPoints: ['./src/extent.ts'],
  logLevel: 'info',
  outfile: './built/extent.mjs',
  platform: 'neutral',
  plugins: [nodeExternalsPlugin()]
}).catch(() => process.exit(1))
