/// <reference types="node" />

import { resolve } from 'node:path'

import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        popup: resolve(import.meta.dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})