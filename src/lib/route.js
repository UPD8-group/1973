import { useEffect, useState } from 'react'

// The 80s room lives at #/eighties. Everything else (empty, #/, or a 70s
// in-page anchor like #play) is the 70s arcade. Section jumps inside the
// 80s page use programmatic scrolling so they never disturb the route.

export function decadeFromHash(hash) {
  return hash.startsWith('#/eighties') ? 'eighties' : 'seventies'
}

export function useHashRoute() {
  const [hash, setHash] = useState(() =>
    typeof window === 'undefined' ? '' : window.location.hash,
  )
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
