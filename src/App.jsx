import { useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Seventies from './pages/Seventies.jsx'
import Eighties from './pages/Eighties.jsx'
import Why from './pages/Why.jsx'
import { useHashRoute, routeFromHash, themeFromRoute } from './lib/route.js'

export default function App() {
  const hash = useHashRoute()
  const route = routeFromHash(hash)
  const decade = themeFromRoute(route)

  // On route/anchor change, honour cross-page anchors (e.g. the 80s room
  // linking to #contact on the 70s page); otherwise start at the top.
  useEffect(() => {
    const id = hash.replace(/^#\/?/, '')
    if (id && id !== 'eighties' && id !== 'why') {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [hash, route])

  return (
    <div className="app" data-decade={decade}>
      <Header decade={decade} />
      <main>
        {route === 'eighties' ? <Eighties /> : route === 'why' ? <Why /> : <Seventies />}
      </main>
      <Footer />
    </div>
  )
}
