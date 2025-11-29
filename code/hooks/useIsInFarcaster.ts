import { useState, useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export function useIsInFarcaster(): boolean {
  const [isInFarcaster, setIsInFarcaster] = useState(false)

  useEffect(() => {
    // Check if we're in Farcaster by looking for the SDK
    if (typeof window !== 'undefined') {
      ;(async () => {
        try {
          const inMiniApp = await sdk.isInMiniApp()
          setIsInFarcaster(inMiniApp)
        } catch {
          setIsInFarcaster(false)
        }
      })()
    }
  }, [])

  return isInFarcaster
}

