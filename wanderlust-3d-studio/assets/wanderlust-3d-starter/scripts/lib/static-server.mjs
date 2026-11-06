import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

/**
 * Serve a directory over HTTP for local development and headless checks.
 * @param {string} root absolute directory to serve
 * @param {number} port 0 picks a free port
 */
export function startServer(root, port = 0) {
  const base = resolve(root);
  const server = createServer((request, response) => {
    try {
      const requestUrl = new URL(request.url || '/', 'http://localhost');
      let pathname = decodeURIComponent(requestUrl.pathname);
      if (pathname.endsWith('/')) pathname += 'index.html';
      const target = resolve(base, `.${pathname}`);
      if (target !== base && !target.startsWith(base + sep)) {
        response.writeHead(403, { 'content-type': 'text/plain' });
        response.end('Forbidden');
        return;
      }
      if (!existsSync(target) || !statSync(target).isFile()) {
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
      }
      response.writeHead(200, {
        'content-type': MIME[extname(target).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      });
      createReadStream(target).pipe(response);
    } catch (error) {
      response.writeHead(500, { 'content-type': 'text/plain' });
      response.end('Server error');
    }
  });

  return new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      const address = server.address();
      const actualPort = typeof address === 'object' && address ? address.port : port;
      resolveListen({
        server,
        port: actualPort,
        url: `http://127.0.0.1:${actualPort}`,
        close: () => new Promise((resolveClose) => server.close(resolveClose))
      });
    });
  });
}
