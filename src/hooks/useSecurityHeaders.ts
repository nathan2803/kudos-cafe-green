
import { useEffect } from 'react'

export const useSecurityHeaders = () => {
  useEffect(() => {
    // Content Security Policy
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https: blob:;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co;
      frame-src 'self' https://www.google.com;
    `.replace(/\s+/g, ' ').trim()
    
    document.head.appendChild(meta)

    // X-Frame-Options
    const frameOptions = document.createElement('meta')
    frameOptions.httpEquiv = 'X-Frame-Options'
    frameOptions.content = 'DENY'
    document.head.appendChild(frameOptions)

    // X-Content-Type-Options
    const contentType = document.createElement('meta')
    contentType.httpEquiv = 'X-Content-Type-Options'
    contentType.content = 'nosniff'
    document.head.appendChild(contentType)

    // Referrer Policy
    const referrer = document.createElement('meta')
    referrer.name = 'referrer'
    referrer.content = 'strict-origin-when-cross-origin'
    document.head.appendChild(referrer)

    return () => {
      document.head.removeChild(meta)
      document.head.removeChild(frameOptions)
      document.head.removeChild(contentType)
      document.head.removeChild(referrer)
    }
  }, [])
}
