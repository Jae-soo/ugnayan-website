"use client";

import { useEffect, useState } from "react";
import { createClient } from "@farcaster/quick-auth";

export function useQuickAuth(domain: string) {
  const [client] = useState<ReturnType<typeof createClient>>(() => createClient());
  const [nonce, setNonce] = useState<string | Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Request a nonce on mount
  useEffect(() => {
    try {
      const n = client.generateNonce();
      setNonce(n as unknown as string | Uint8Array);
    } catch (e: any) {
      setError(e?.message || "Failed to generate nonce");
    }
  }, [client]);

  // Verify a signed message (SIWF = Sign In With Farcaster)
  async function verifySiwf(message: string, signature: string) {
    try {
      const res = await client.verifySiwf({ message, signature, domain });
      return res;
    } catch (e: any) {
      setError(e?.message || "Failed to verify SIWF");
      return null;
    }
  }

  // Verify JWT token
  async function verifyJwt(token: string) {
    try {
      const res = await client.verifyJwt({ token, domain });
      return res;
    } catch (e: any) {
      setError(e?.message || "Failed to verify JWT");
      return null;
    }
  }

  return {
    nonce,
    error,
    verifySiwf,
    verifyJwt,
  };
}
