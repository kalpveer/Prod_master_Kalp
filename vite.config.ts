import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only: serve api/**/*.ts through Vite so `npm run dev` behaves like the Vercel functions.
// Helpers in api/_lib are never routable (same as on Vercel). Unknown paths fall through to Vite.
function apiDev(): Plugin {
  return {
    name: 'api-dev',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root
      const env = loadEnv('development', root, '')
      for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v

      server.middlewares.use('/api', async (req, res, next) => {
        const name = (req.url || '').split('?')[0].replace(/^\/+|\/+$/g, '')
        if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/i.test(name) || name.split('/').some(p => p.startsWith('_'))) return next()
        const file = path.join(root, 'api', `${name}.ts`)
        if (!fs.existsSync(file)) return next()

        const send = (status: number, payload?: unknown) => {
          res.statusCode = status
          if (payload === undefined) return res.end()
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(payload))
        }
        try {
          const chunks: Buffer[] = []
          for await (const c of req) chunks.push(c as Buffer)
          const raw = Buffer.concat(chunks).toString('utf8')
          let body: unknown = {}
          if (raw) {
            try { body = JSON.parse(raw) } catch { return send(400, { error: 'Invalid JSON' }) }
          }
          const mod = await server.ssrLoadModule(`/api/${name}.ts`)
          await mod.default(
            { method: req.method, headers: req.headers, body },
            {
              status: (s: number) => ({ json: (p: unknown) => send(s, p), end: () => send(s) }),
              setHeader: (k: string, v: string) => res.setHeader(k, v),
            },
          )
        } catch (e) {
          console.error('[api-dev]', e)
          if (!res.headersSent) send(500, { error: 'Dev API error' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDev()],
  server: {
    proxy: {
      '/api/stackai': {
        target: 'https://api.stackai.com',
        changeOrigin: true,
        rewrite: () => '/inference/v0/run/82daafa8-4b94-431b-989d-d482e0c29e95/69d556e109f5613fdf74a15b',
      },
    },
  },
})
