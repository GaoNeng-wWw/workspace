import {defineConfig} from 'tsup';
export default defineConfig({
  name: 'dev',
  entry: ['./src/index.ts'],
  noExternal: [/.*/],
  banner() {
    return {
      js: `#!/usr/bin/env node`
    };
  },
});