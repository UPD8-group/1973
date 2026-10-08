import { useEffect } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import Seventies from './Seventies.jsx'
import Eighties from './Eighties.jsx'
import { useHashRoute, decadeFromHash } from '../lib/route.js'

export default function Arcade() {
  const hash = useHashRoute()
  const decade = decadeFromHash(hash)
  useEffect(() => {
    document.title = `The 1973 Arcade — ${decade === 'eighties' ? 'The neon floor' : 'A little nostalgia. A lot of play.'}`
    document.querySelector('meta[name="description"]').content = 'Nine free browser games. Explore the warm glow of 1973 and the neon arcade of 1983. A game collection by 1973.ai.'
    document.querySelector('link[rel="canonical"]').href = 'https://1973.ai/arcade/'
  }, [decade])

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
      <a className="arcade-skip" href="#arcade-main" onClick={(e) => { e.preventDefault(); document.getElementById('arcade-main')?.focus() }}>Skip to games</a>
      <Header decade={decade} />
      <main id="arcade-main" tabIndex={-1}>{decade === 'eighties' ? <Eighties /> : <Seventies />}</main>
      <Footer />
    </div>
  )
}

