import { defineConfig, loadEnv } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET

  return {
    plugins: [solid({ hot: !process.env['VITEST'] })],
    server: proxyTarget
      ? {
          host: '0.0.0.0',
          proxy: {
            '/proxy': {
              target: proxyTarget,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/proxy/, ''),
            },
          },
        }
      : undefined,
    test: {
      environment: 'happy-dom',
      globals: true,
      setupFiles: ['./src/__tests__/setup.ts'],
      transformMode: { web: [/\.[jt]sx$/] },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        include: ['src/services/**', 'src/pages/**'],
      },
    },
  }
})
