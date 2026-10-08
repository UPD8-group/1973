import { useEffect, useRef, useState } from 'react'
import '../studio.css'

const Arrow = () => <span aria-hidden="true">↗</span>
function Brand() { return <span className="studio-brand">1973<span>.ai</span><i aria-hidden="true">✳</i></span> }

export default function Studio() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef(null)
  useEffect(() => {
    document.title = '1973.ai — Made for one more go.'
    function escape(e) { if (e.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus() } }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [menuOpen])

  return (
    <div className="studio-site" id="studio-top">
      <a className="studio-skip" href="#main">Skip to content</a>
      <header className="studio-header">
        <a href="/" aria-label="1973.ai home"><Brand /></a>
        <span className="studio-location">Independent games.<br />Made in Canberra.</span>
        <button ref={menuButton} className="studio-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="studio-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close −' : 'Menu +'}</button>
        <nav id="studio-nav" className={menuOpen ? 'is-open' : ''} aria-label="Main navigation" onClick={() => setMenuOpen(false)}>
          <a href="#games">Our games</a><a href="#studio">The studio</a><a className="studio-button small" href="/arcade/">Enter the arcade <Arrow /></a>
        </nav>
      </header>
      <main id="main">
        <figure className="studio-hero-image">
          <img src="/studio/play-room.webp" srcSet="/studio/play-room-small.webp 768w, /studio/play-room.webp 1536w" sizes="100vw" width="1536" height="1024" fetchPriority="high" alt="A vintage television and two game controllers in a sunlit room, ready for another round." />
          <figcaption><span><i aria-hidden="true" /> A little nostalgia. A lot of play.</span><a href="/arcade/">Come on in <Arrow /></a></figcaption>
        </figure>
        <section className="studio-intro studio-wrap" aria-labelledby="studio-title">
          <div><p className="studio-kicker">1973.ai / An independent game studio</p><h1 id="studio-title">Made for<br /><em>one more go.</em></h1></div>
          <div className="studio-intro-copy"><p>For the curious. The competitive.<br />The “just five more minutes” crowd.</p><p>We make games that bring a little more play to your day. New worlds to explore, old favourites reimagined, and good reasons to lose track of time.</p><a className="studio-text-link" href="#games">Find your next game <Arrow /></a></div>
        </section>
        <section className="studio-games studio-wrap" id="games" aria-labelledby="games-title">
          <div className="studio-section-top"><p className="studio-kicker">01 / From the studio</p><span>Small screens. Big imaginations.</span></div>
          <h2 id="games-title">A world of <em>play.</em></h2>
          <article className="studio-game">
            <a className="studio-game-image fliptide-image" href="https://fliptide.app/" aria-label="Play Fliptide"><img src="/studio/fliptide.webp" alt="Fliptide's colourful match-three board with bright gems and a woodland setting." width="1363" height="936" loading="lazy" /><span className="studio-image-tag">Puzzle / Adventure</span><span className="studio-image-arrow" aria-hidden="true">↗</span></a>
            <div className="studio-game-copy"><p className="studio-kicker">A game by 1973.ai</p><h3>Fliptide</h3><p>A satisfying little escape. Match, swap and find your flow through colourful worlds, one clever move at a time.</p><a className="studio-text-link" href="https://fliptide.app/">Play Fliptide <Arrow /></a></div>
          </article>
          <article className="studio-game reversed">
            <a className="studio-game-image time-image" href="https://gamesintime.com/" aria-label="Explore Games in Time"><img src="/studio/games-in-time.webp" alt="Games in Time, with its invitation to play the games kids played from candlelight to touchscreens." width="1348" height="926" loading="lazy" /><span className="studio-image-tag">Play / Discover / Learn</span><span className="studio-image-arrow" aria-hidden="true">↗</span></a>
            <div className="studio-game-copy"><p className="studio-kicker">A game by 1973.ai</p><h3>Games<br /> in Time</h3><p>What did kids play before your time? A question from our kids became a journey through playable games, their stories and the people who played them.</p><a className="studio-text-link" href="https://gamesintime.com/">Take a trip through time <Arrow /></a></div>
          </article>
        </section>
        <section className="studio-arcade" aria-labelledby="arcade-title">
          <div className="studio-wrap studio-arcade-grid">
            <div><p className="studio-kicker">02 / The browser arcade</p><h2 id="arcade-title">No coins.<br /><em>Just one more.</em></h2><p>Nine games. Two decades. All yours to play.<br />Step into the warm glow of ’73 or the neon of ’83. The whole original collection is right here.</p><a className="studio-button" href="/arcade/">Enter the 1973 Arcade <Arrow /></a><p className="studio-arcade-note">Free to play · In your browser · No download</p></div>
            <div className="studio-cabinet" aria-label="Choose your arcade floor"><div className="studio-cabinet-label"><span>THE 1973 ARCADE</span><span aria-hidden="true">● ● ●</span></div><div className="studio-cabinet-screen"><span className="studio-screen-star" aria-hidden="true">✳</span><p>HELLO,<br />PLAYER.</p><span>CHOOSE YOUR DECADE</span><div className="studio-floor-buttons"><a href="/arcade/" aria-label="Play the 1973 arcade floor">’73 <span>Warm &amp; analogue ↗</span></a><a href="/arcade/#/eighties" aria-label="Play the 1983 arcade floor">’83 <span>Bright &amp; electric ↗</span></a></div></div><div className="studio-cabinet-controls" aria-hidden="true"><span className="studio-joystick" /><span className="studio-control-dot" /><span className="studio-control-dot second" /><span className="studio-control-caption">ALWAYS ROOM FOR ANOTHER GO.</span></div></div>
          </div>
        </section>
        <section className="studio-about studio-wrap" id="studio" aria-labelledby="about-title">
          <p className="studio-kicker">03 / The spirit of 1973</p><div className="studio-about-grid"><h2 id="about-title">Technology moves on.<br /><em>Play stays with us.</em></h2><div><p>1973.ai is an independent game studio from Canberra, Australia. A home for the games we make, and the ideas we can’t leave alone.</p><p>We love the simplicity of early games and the possibilities of what comes next. Whether it’s a quick puzzle, a new world or a little piece of the past, we build for the same thing: that feeling when you just want another go.</p><a className="studio-text-link" href="mailto:hello@1973.ai">Say hello <Arrow /></a></div></div>
          <div className="studio-note"><span className="studio-note-star" aria-hidden="true">✳</span><p>Still curious.<br /><em>Always playing.</em></p><span>More worlds are taking shape.<br />This is just the beginning.</span></div>
        </section>
      </main>
      <footer className="studio-footer"><div className="studio-wrap"><div className="studio-footer-top"><a href="/" aria-label="1973.ai home"><Brand /></a><a className="studio-text-link" href="/arcade/">Go on. One more game. <Arrow /></a></div><div className="studio-footer-bottom"><span>© {new Date().getFullYear()} 1973.ai</span><a href="mailto:hello@1973.ai">hello@1973.ai</a><a href="https://oo.studio/">From the makers at oo.studio ↗</a><a href="#studio-top">Back to top ↑</a></div></div></footer>
    </div>
  )
}
