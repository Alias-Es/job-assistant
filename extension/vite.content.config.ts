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
        'src/content/content-script.ts',
      ),
      name: 'JobAssistantContentScript',
      formats: ['iife'],
      fileName: () => 'content-script.js',
    },
  },
})