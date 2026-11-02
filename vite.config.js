import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_BASE: GitHub Pages 하위 경로(예: /maero-team-board/). 기본은 상대 경로 './'. 화면 이동은 해시 라우팅.
export default defineConfig({
  base: process.env.VITE_BASE || './',
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false },
});
