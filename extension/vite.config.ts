/// <reference types="node" />

import { resolve } from 'node:path'

import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: resolve(import.meta.dirname, 'index.html'),
        contentScript: resolve(
          import.meta.dirname,
          'src/content/content-script.ts',
        ),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'contentScript') {
            return 'content-script.js'
          }

          return 'assets/[name]-[hash].js'
        },
      },
    },
  },
})