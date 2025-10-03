import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  clearScreen: false,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/features/common/utils', import.meta.url)),
      '@common': fileURLToPath(new URL('./src/features/common', import.meta.url)),
      '@home': fileURLToPath(new URL('./src/features/home', import.meta.url)),
      '@events': fileURLToPath(new URL('./src/features/events', import.meta.url)),
      '@publications': fileURLToPath(new URL('./src/features/publications', import.meta.url)),
      '@megaprojects': fileURLToPath(new URL('./src/features/megaprojects', import.meta.url)),
      '@projects': fileURLToPath(new URL('./src/features/projects', import.meta.url)),
      '@groups': fileURLToPath(new URL('./src/features/groups', import.meta.url)),
      '@auth': fileURLToPath(new URL('./src/features/auth', import.meta.url)),
      '@about': fileURLToPath(new URL('./src/features/about', import.meta.url)),
      '@db': fileURLToPath(new URL('./src/services/db', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/features/hooks', import.meta.url)),
      '@profile': fileURLToPath(new URL('./src/features/profile', import.meta.url)),
    },
  },
    server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
});
