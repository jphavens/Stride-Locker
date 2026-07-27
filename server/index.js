import http from 'http'
import sirv from 'sirv'
import { createApiHandlers } from './api.js'

const PORT = process.env.PORT || 5173
const sharedKey = process.env.VITE_STRIDE_SHARED_KEY
const anthropicApiKey = process.env.ANTHROPIC_API_KEY

const { handleLocker, handlePhotos, handleSuggest, handleShade } = createApiHandlers({ sharedKey, anthropicApiKey })

const serveStatic = sirv('dist', { single: true })

const server = http.createServer((req, res) => {
  const url = req.url || ''
  if (url === '/api/locker' || url.startsWith('/api/locker?')) return handleLocker(req, res)
  if (url.startsWith('/api/photos/')) { req.url = url.slice('/api/photos'.length); return handlePhotos(req, res) }
  if (url === '/api/suggest') return handleSuggest(req, res)
  if (url === '/api/shade') return handleShade(req, res)
  return serveStatic(req, res)
})

server.listen(PORT, () => {
  console.log(`[server] listening on :${PORT}`)
})
