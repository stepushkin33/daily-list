import { afterEach, describe, expect, it, vi } from 'vitest'

import { registerServiceWorker } from './register-service-worker'

afterEach(() => {
  delete (navigator as unknown as { serviceWorker?: ServiceWorkerContainer }).serviceWorker
  vi.restoreAllMocks()
})

describe('registerServiceWorker', () => {
  it('registers the worker in production', () => {
    const register = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register },
    })

    registerServiceWorker(true)

    expect(register).toHaveBeenCalledWith('/sw.js')
  })

  it('does not register the worker outside production', () => {
    const register = vi.fn()

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register },
    })

    registerServiceWorker(false)

    expect(register).not.toHaveBeenCalled()
  })
})
