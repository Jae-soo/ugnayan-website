import { useCallback } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export function useAddMiniApp() {
  const addMiniApp = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return
      const inMiniApp = await sdk.isInMiniApp()
      if (!inMiniApp) return
      if (!sdk?.actions?.addMiniApp) return
      await sdk.actions.ready()
      await sdk.actions.addMiniApp()
    } catch (error) {
      console.error('Failed to add mini app:', error)
    }
  }, [])

  return { addMiniApp }
}

