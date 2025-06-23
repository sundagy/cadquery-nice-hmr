// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';
import { spawn } from 'child_process';
import chokidar from 'chokidar';

function modelWatcherPlugin() {
  return {
    name: 'model-watcher',
    configureServer(server) {

      const root = path.resolve(__dirname, '..')

      const watcher = chokidar.watch(root, {
        ignored: (path, stats) => stats?.isFile() && !path.endsWith('.py'),
        ignoreInitial: true
      })

      watcher.on('change', (filePath) => {
        console.log(`[model-watcher] Python file changed: ${filePath}`);

        const proc = spawn('python', ['main.py'], {
          cwd: '..',
          stdio: 'inherit'
        });

        proc.on('exit', (code) => {
          if (code === 0) {
            console.log('[model-watcher] ✅ main.py выполнен успешно');
            server.ws.send({ type: 'custom', event: 'model-update' });
          } else {
            console.error(`[model-watcher] ❌ main.py завершился с кодом ${code}`);
          }
        });
      });

    }
  };
}

export default defineConfig({
  plugins: [modelWatcherPlugin()],
  server: {
    watch: {
      ignored: ['**/node_modules/**']
    }
  }
});
