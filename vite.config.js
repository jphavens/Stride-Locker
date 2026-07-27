import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createApiHandlers } from './server/api.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const SHARED_KEY = env.VITE_STRIDE_SHARED_KEY
  const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY
  // Deploy-specific extra host (e.g. a Tailscale MagicDNS name) — set via
  // ALLOWED_HOST_EXTRA in .env.local so it never needs to be hardcoded here.
  // Dev-server-only: guards Vite's dev/HMR surface against DNS rebinding.
  // Production (server/index.js) has no such surface and drops this entirely.
  const allowedHosts = env.ALLOWED_HOST_EXTRA ? ['stride.home', env.ALLOWED_HOST_EXTRA] : ['stride.home']

  const { handleLocker, handlePhotos, handleSuggest, handleShade } = createApiHandlers({
    sharedKey: SHARED_KEY,
    anthropicApiKey: ANTHROPIC_API_KEY,
  })

  return {
    plugins: [
      react(),
      {
        name: 'locker-api',
        configureServer(server) {
          server.middlewares.use('/api/locker', handleLocker)
          server.middlewares.use('/api/photos', handlePhotos)
          server.middlewares.use('/api/suggest', handleSuggest)
          server.middlewares.use('/api/shade', handleShade)
        }
      }
    ],
    server: {
      host: true,
      strictPort: true,
      port: 5173,
      allowedHosts
    }
  }
})
