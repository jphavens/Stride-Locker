import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.resolve(process.cwd(), 'data')
const LOCKER_FILE = path.join(DATA_DIR, 'locker.json')
const PHOTOS_DIR = path.join(DATA_DIR, 'photos')

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'locker-api',
      configureServer(server) {
        // Locker items — GET to load, POST to save
        server.middlewares.use('/api/locker', (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          if (req.method === 'GET') {
            try {
              res.end(fs.existsSync(LOCKER_FILE) ? fs.readFileSync(LOCKER_FILE, 'utf-8') : 'null')
            } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })) }
          } else if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => body += chunk)
            req.on('end', () => {
              try {
                fs.mkdirSync(DATA_DIR, { recursive: true })
                fs.writeFileSync(LOCKER_FILE, body, 'utf-8')
                res.end(JSON.stringify({ ok: true }))
              } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })) }
            })
          } else { res.writeHead(405); res.end() }
        })

        // Photos — GET /api/photos/:lockerId, POST /api/photos/:lockerId
        server.middlewares.use('/api/photos', (req, res) => {
          const lockerId = req.url.slice(1) // strip leading '/'
          if (!lockerId) { res.writeHead(400); res.end(); return }
          const file = path.join(PHOTOS_DIR, `${lockerId}.jpg`)

          if (req.method === 'GET') {
            try {
              if (fs.existsSync(file)) {
                res.setHeader('Content-Type', 'image/jpeg')
                res.end(fs.readFileSync(file))
              } else { res.writeHead(404); res.end() }
            } catch (e) { res.writeHead(500); res.end(e.message) }
          } else if (req.method === 'POST') {
            const chunks = []
            req.on('data', chunk => chunks.push(chunk))
            req.on('end', () => {
              try {
                fs.mkdirSync(PHOTOS_DIR, { recursive: true })
                fs.writeFileSync(file, Buffer.concat(chunks))
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: true }))
              } catch (e) { res.writeHead(500); res.end(e.message) }
            })
          } else { res.writeHead(405); res.end() }
        })
      }
    }
  ],
  server: {
    host: true,
    strictPort: true,
    port: 5173,
    allowedHosts: ['stride.home']
  }
})
