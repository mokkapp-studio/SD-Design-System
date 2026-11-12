import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // tokens.css vive fuera de playground/ (en ../tokens): Vite debe poder servirlo.
  server: { fs: { allow: ['..'] } },
});
