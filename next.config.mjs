import bundleAnaylzer from '@next/bundle-analyzer'

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { env } from './src/env.mjs'

// Bundle Analyzer
const withBundleAnalyzer = bundleAnaylzer({
  enabled: env.ANALYZE === 'true',
  openAnalyzer: true,
})

/** @type {import("next").NextConfig} */
const config = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default withBundleAnalyzer(config)
