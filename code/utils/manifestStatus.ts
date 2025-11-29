"use client"

import { sdk } from "@farcaster/miniapp-sdk"

export interface AccountAssociation {
  header: string
  payload: string
  signature: string
}

export async function isManifestSigned(): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false
    // Try to detect a previously stored association (fallback)
    const stored = window.localStorage.getItem("farcaster_account_association")
    if (stored) return true

    // If running inside Farcaster, rely on SDK; if not, assume not signed
    const inMiniApp = await sdk.isInMiniApp().catch(() => false)
    if (!inMiniApp) return false

    // No official SDK API for checking sign state in this codebase; default to false
    return false
  } catch {
    return false
  }
}

export async function getManifestStatus(): Promise<{
  isSigned: boolean
  accountAssociation?: AccountAssociation
  error?: string
}> {
  try {
    const signed = await isManifestSigned()
    let accountAssociation: AccountAssociation | undefined
    if (signed && typeof window !== "undefined") {
      const stored = window.localStorage.getItem("farcaster_account_association")
      if (stored) {
        accountAssociation = JSON.parse(stored) as AccountAssociation
      }
    }
    return { isSigned: signed, accountAssociation }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return { isSigned: false, error: message }
  }
}
