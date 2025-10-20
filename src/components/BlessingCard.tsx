import { useRef, useState } from 'react'
import './blessing.css'

type Props = {
  data: {
    user: {
      login: string
      name?: string
      avatar_url: string
      public_repos?: number
      followers?: number
    }
    events: unknown[]
    blessing: string
    totalStars?: number
    starredCount?: number
    lastCommit?: string | null
  }
  onBack?: () => void
}

type Html2CanvasFn = (el: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>
type ClipboardItemCtorType = new (items: Record<string, Blob>) => unknown
type WindowWithExtras = Window & {
  html2canvas?: Html2CanvasFn
  ClipboardItem?: ClipboardItemCtorType
}
type NavigatorWithShare = Navigator & {
  canShare?: (data: { files?: File[] }) => boolean
  share?: (data: { files?: File[]; text?: string }) => Promise<void>
  clipboard?: { write?: (items: unknown[]) => Promise<void>; writeText?: (text: string) => Promise<void> }
}

export default function BlessingCard({ data, onBack }: Props) {
  const { user, blessing } = data
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [sharing, setSharing] = useState(false)

  async function captureCardBlob(): Promise<Blob | null> {
    const node = cardRef.current
    const win = window as unknown as WindowWithExtras
    if (!node || !win.html2canvas) return null
    try {
      const scale = Math.min(2, window.devicePixelRatio || 1)
      const canvas = await win.html2canvas(node, { backgroundColor: null, scale })
      return await new Promise<Blob | null>((resolve) => canvas.toBlob((b: Blob | null) => resolve(b)))
    } catch (err) {
      console.error('capture error', err)
      return null
    }
  }

  function buildShareMessage(): string {
    const site = 'https://gayathrithedev.github.io/diwali-blessings/'
    return `I have tried Diwali Blessing Generator, it is super fun!\nTry it here: ${site}}`
  }

  async function shareImageWithFallback(platform: 'twitter' | 'linkedin' | 'generic') {
    setSharing(true)
    try {
      const blob = await captureCardBlob()
      const message = buildShareMessage()

      if (blob) {
        const file = new File([blob], 'diwali-blessing.png', { type: blob.type })
        const nav = navigator as unknown as NavigatorWithShare
        if (nav.canShare?.({ files: [file] }) && nav.share) {
          await nav.share({ files: [file], text: message })
          return
        }
      }

      if (platform === 'twitter')
        window.open(twitterShareLink(), '_blank', 'noopener')
      else if (platform === 'linkedin')
        window.open(linkedInShareLink(), '_blank', 'noopener')
    } finally {
      setSharing(false)
    }
  }

  function twitterShareLink() {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareMessage())}`
  }

  function linkedInShareLink() {
    const url = 'https://gayathrithedev.github.io/diwali-blessings/'
    const text = `I tried Diwali Blessing Generator 🎇\n${url}\n\n${blessing}`
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`
  }

  return (
    <div className="blessing-card" ref={cardRef}>
      {/* Row 1 */}
      <div className="card-header">
        <h2>✨ Happy Diwali 🪔 ✨</h2>
      </div>

      {/* Row 2 */}
      <div className="card-body">
        <a href={`https://github.com/${user.login}`} target="_blank" rel="noopener noreferrer" className="profile-link">
        <div className="profile-section">
          <img src={user.avatar_url} alt={user.login} className="avatar" />
        </div>
        </a>
        <div className="blessing-content">
          <p className="blessing-message">{blessing}</p>
        </div>
      </div>

      {/* Row 3 */}
      <div className="card-footer">
        <div className="social-icons">
          <a onClick={() => shareImageWithFallback('twitter')} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
            <i className="fa-brands fa-x-twitter"></i>
          </a>
          <a onClick={() => shareImageWithFallback('linkedin')} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
            <i className="fa-brands fa-linkedin"></i>
          </a>
          <a href="https://facebook.com/sharer/sharer.php?u=https://gayathrithedev.github.io/diwali-blessings/" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-facebook"></i>
          </a>
          <a onClick={() => shareImageWithFallback('generic')} target="_blank" rel="noopener noreferrer" aria-label="Share link">
            <i className="fa-solid fa-share-nodes"></i>
          </a>
        </div>

        {onBack && (
          <button className="back-btn" onClick={onBack}>
            {sharing ? 'Please wait...' : 'Generate Again'}
          </button>
        )}
      </div>
    </div>
  )
}
