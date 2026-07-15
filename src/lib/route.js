import { useEffect, useState } from 'react'

// Routes: #/eighties → the neon floor, #/why → the 1973 story, everything
// else (empty, #/, or a 70s anchor like #play) → the 70s arcade. Section
// jumps inside a page use programmatic scrolling so they don't disturb the
// route.

export function routeFromHash(hash) {
  if (hash.startsWith('#/eighties')) return 'eighties'
  if (hash.startsWith('#/why')) return 'why'
  return 'seventies'
}

// The theme follows the room: the 1973 story wears the umber '73 theme.
export function themeFromRoute(route) {
  return route === 'eighties' ? 'eighties' : 'seventies'
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
