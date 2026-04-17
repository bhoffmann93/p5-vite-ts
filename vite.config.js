import { defineConfig } from 'vite';
import { execSync } from 'child_process';

const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

export default defineConfig({
  define: {
    __GIT_BRANCH__: JSON.stringify(branch),
  },
  server: {
    port: 8080,
    open: 'index.html',
  },
  publicDir: 'static',
  optimizeDeps: {
    include: ['p5'],
  },
});
