/// <reference types="node" />

import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: false,
    copyPublicDir: false,

    lib: {
      entry: resolve(
        import.meta.dirname,
        'src/background/service-worker.ts',
      ),
      formats: ['es'],
      fileName: () => 'service-worker.js',
    },
  },
})