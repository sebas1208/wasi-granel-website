import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Lazy initializer reads `window` on the client during render (no SSR crash
  // since `window` is checked) and avoids calling setState inside the effect.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(() =>
    typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT,
  )

  React.useEffect(() => {
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    window.addEventListener('resize', onChange)
    return () => window.removeEventListener('resize', onChange)
  }, [])

  return !!isMobile
}