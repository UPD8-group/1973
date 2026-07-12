import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import FactsStrip from './components/FactsStrip.jsx'
import MemoryHandset from './components/MemoryHandset.jsx'
import TvTennis from './components/TvTennis.jsx'
import Brickfield from './components/Brickfield.jsx'
import Trail from './components/Trail.jsx'
import CaveHunt from './components/CaveHunt.jsx'
import TvContact from './components/TvContact.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FactsStrip />
        <MemoryHandset />
        <TvTennis />
        <Brickfield />
        <Trail />
        <CaveHunt />
        <TvContact />
      </main>
      <Footer />
    </>
  )
}
