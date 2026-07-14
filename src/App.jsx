import { useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Seventies from './pages/Seventies.jsx'
import Eighties from './pages/Eighties.jsx'
import { useHashRoute, decadeFromHash } from './lib/route.js'

export default function App() {
  const hash = useHashRoute()
  const decade = decadeFromHash(hash)

  // On route/anchor change, honour cross-page anchors (e.g. the 80s room
  // linking to #contact on the 70s page); otherwise start at the top.
  useEffect(() => {
    const id = hash.replace(/^#\/?/, '')
    if (id && id !== 'eighties') {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [hash, decade])

  return (
    <div className="app" data-decade={decade}>
      <Header decade={decade} />
      <main>{decade === 'eighties' ? <Eighties /> : <Seventies />}</main>
      <Footer />
    </div>
  )
}
