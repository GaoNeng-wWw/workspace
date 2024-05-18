import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: "./dist",
  clean: true,
  banner() {
    return {
      js: `#!/usr/bin/env node`
    };
  },
  // noExternal: [/.*/],
  sourcemap: true,
  format: 'esm',
  // minify: "terser",
});