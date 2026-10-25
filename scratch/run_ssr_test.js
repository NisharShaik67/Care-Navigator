import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  await build({
    configFile: false,
    plugins: [
      (await import('@vitejs/plugin-react')).default()
    ],
    build: {
      ssr: true,
      lib: {
        entry: path.resolve(__dirname, 'test_all_renders.jsx'),
        formats: ['es'],
        fileName: () => 'bundle.mjs'
      },
      outDir: path.resolve(__dirname, 'out'),
      emptyOutDir: true
    }
  });

  // Run the bundle
  await import('./out/bundle.mjs');
}

run().catch(console.error);
