/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",
  outputFileTracing: true,
  experimental: {
    // Include node_modules in the standalone output
    outputFileTracingExcludes: {
      '*': [
        // Exclude unnecessary files
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
    // Make sure sharp is included
    outputFileTracingIncludes: {
      '*': ['node_modules/sharp/**/*'],
    },
  },
};

export default config;
