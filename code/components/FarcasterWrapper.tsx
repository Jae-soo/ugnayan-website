'use client'

import dynamic from 'next/dynamic'

const FarcasterToastManager = dynamic(() => import('./FarcasterToastManager'), {
  ssr: false,
  loading: () => null
})

const FarcasterManifestSigner = dynamic(() => import('./FarcasterManifestSigner'), {
  ssr: false,
  loading: () => null
})

interface FarcasterWrapperProps {
  children: React.ReactNode
}

export default function FarcasterWrapper({ children }: FarcasterWrapperProps): React.JSX.Element {
  return (
    <FarcasterToastManager>
      {({ onManifestSuccess, onManifestError }) => (
        <>
          <FarcasterManifestSigner 
            onSuccess={onManifestSuccess}
            onError={onManifestError}
          />
          {children}
        </>
      )}
    </FarcasterToastManager>
  )
}
