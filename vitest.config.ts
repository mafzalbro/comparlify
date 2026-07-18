import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      'server-only': 'identity-obj-proxy',
      'next/server': path.resolve(__dirname, './__tests__/mocks/next-server.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.tsx'],
    globals: true,
    server: {
      deps: {
        inline: ['next-auth'],
      },
    },
  },
})
