import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: "./dist",
  dts: true,
  clean: true,
  banner() {
    return {
      js: `#!/usr/bin/env node`
    };
  },
  skipNodeModulesBundle: true
});