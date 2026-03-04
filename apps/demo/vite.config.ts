import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type PreviewServer } from 'vite';

const MIME: Record<string, string> = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
};

/** Serve pagefind assets from build/ during preview */
function pagefindPreview() {
  return {
    name: 'pagefind-preview',
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url?.split('?')[0];
        if (url?.startsWith('/pagefind/')) {
          const filePath = join('build', url);
          if (existsSync(filePath)) {
            const ext = extname(filePath);
            res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream');
            res.end(readFileSync(filePath));
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), pagefindPreview()],
});
