// The studio owns /. The original hash router continues to own /arcade/.
const legacyHashes = new Set(['#/', '#play', '#year', '#contact', '#top', '#e-play'])
export function legacyArcadeURL(pathname, hash, search = '') {
  if (pathname !== '/' && pathname !== '/index.html') return null
  if (legacyHashes.has(hash) || hash.startsWith('#/eighties')) return `/arcade/${search}${hash}`
  return null
}
export function isArcadePath(pathname) { return /^\/arcade\/?$/.test(pathname) }
