#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './lib/static-server.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 8080);
const instance = await startServer(root, port);
console.log(`Wanderlust 3D → ${instance.url}`);
console.log('Press Ctrl+C to stop.');

const shutdown = async () => {
  await instance.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
