export default function Footer() {
  return (
    <footer className="site-footer">
      <p className="fine-print">1973.ai · hello@1973.ai</p>
      <a href="https://oo.studio" target="_blank" rel="noopener" className="oo-credit">
        <span>website by</span>
        <svg width="36" height="24" viewBox="0 0 36 24" aria-hidden="true">
          <path
            className="oo-loop"
            pathLength="100"
            d="M8 12 C8 7.5, 14.5 7.5, 18 12 C21.5 16.5, 28 16.5, 28 12 C28 7.5, 21.5 7.5, 18 12 C14.5 16.5, 8 16.5, 8 12 Z"
          />
          <path
            className="oo-light"
            pathLength="100"
            d="M8 12 C8 7.5, 14.5 7.5, 18 12 C21.5 16.5, 28 16.5, 28 12 C28 7.5, 21.5 7.5, 18 12 C14.5 16.5, 8 16.5, 8 12 Z"
          />
        </svg>
        <strong>oo.studio</strong>
      </a>
    </footer>
  )
}
