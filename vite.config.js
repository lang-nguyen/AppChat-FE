import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Extract base URL from env, remove /api suffix for proxy target
  const apiBaseUrl = env.VITE_API_BASE_URL
  if (!apiBaseUrl) {
    console.warn('VITE_API_BASE_URL is not set in environment variables')
  }
  
  // Remove trailing /api if present, ensure no trailing slash
  const proxyTarget = apiBaseUrl ? apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '') : null
  
  return {
    plugins: [react()],
    server: {
      ...(proxyTarget && {
        proxy: {
          '/api': {
            target: proxyTarget,
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/api/, '/api')
          }
        }
      })
    }
  }
})