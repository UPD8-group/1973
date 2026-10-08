import { lazy, Suspense, useEffect } from 'react'
import Studio from './pages/Studio.jsx'
import { isArcadePath, legacyArcadeURL } from './lib/studio-route.mjs'
const Arcade = lazy(() => import('./pages/Arcade.jsx'))

export default function App() {
  const { pathname, hash, search } = window.location
  const legacyURL = legacyArcadeURL(pathname, hash, search)
  useEffect(() => { if (legacyURL) window.location.replace(legacyURL) }, [legacyURL])
  if (legacyURL) return <p className="studio-loading">Opening the arcade…</p>
  return isArcadePath(pathname)
    ? <Suspense fallback={<p className="studio-loading">Warming up the arcade…</p>}><Arcade /></Suspense>
    : <Studio />
}
