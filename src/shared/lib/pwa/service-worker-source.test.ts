import { describe, expect, it } from 'vitest'

import { createServiceWorkerSource } from './service-worker-source'

describe('service worker source', () => {
  it('deduplicates precache resources and keeps offline fallbacks', () => {
    const source = createServiceWorkerSource(['/index.html', '/assets/app.js', '/assets/app.js'])

    expect(source.match(/\/assets\/app\.js/g)).toHaveLength(1)
    expect(source).toContain("caches.match('/index.html')")
    expect(source).toContain("requestUrl.pathname === '/sw.js'")
  })
})
