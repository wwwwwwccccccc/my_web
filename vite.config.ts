import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 部署到子路径（例如 GitHub Pages 的 /repo/）时，用 BASE_URL 环境变量覆盖。
const base = process.env.BASE_URL || '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5174,
    watch: {
      ignored: [
        '**/*.tmpdir/**',
        '**/.~*',
        '**/public/fonts/**',
        '**/public/images/**',
        '**/docs/**',
        '**/data/**',
        '**/*_files/**',
        '**/*React Bits*',
        '**/*.pptx',
      ],
    },
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 2048,
  },
})
