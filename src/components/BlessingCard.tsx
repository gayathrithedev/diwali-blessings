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
  const [hideElements, setHideElements] = useState(false)

  // ---- Helper: Capture card as image ----
  async function captureCardBlob(): Promise<Blob | null> {
    const node = cardRef.current
    const win = window as unknown as WindowWithExtras
    if (!node || !win.html2canvas) return null
    try {
      const scale = Math.min(2, window.devicePixelRatio || 1)
      const canvas = await win.html2canvas(node, { backgroundColor: null, scale })
      return await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b)))
    } catch (err) {
      console.error('capture error', err)
      return null
    }
  }

  // ---- Platform-specific messages ----
  function twitterShareMessage(): string {
    return `🎆 Just got my Diwali blessing from the GitHub Diwali Blessing Generator! 🪔✨\n\n"${blessing}"\n\nTry it yourself and spread some festive vibes 🔥👇\nhttps://gayathrithedev.github.io/diwali-blessings/ #HappyDiwali #GitHub #AI`
  }

  function linkedInShareMessage(): string {
    return `✨ This Diwali, I tried something fun — the GitHub Diwali Blessing Generator 🪔\n\n"${blessing}"\n\nLoved how it blends creativity and code! 💻🎇\nGenerate your own blessing here 👇\nhttps://gayathrithedev.github.io/diwali-blessings/\n\n#HappyDiwali #CodingCommunity #AI #FunProjects`
  }

  function facebookShareMessage(): string {
    return `🪔✨ Feeling the festive spirit! I just generated my personalized Diwali blessing 💫\n\n"${blessing}"\n\nIt’s a fun little app that shares light and positivity 🕯️\nTry it with your friends 👉 https://gayathrithedev.github.io/diwali-blessings/\n\n#HappyDiwali #FestivalOfLights #SpreadJoy`
  }

  function buildShareMessage(): string {
    const site = 'https://gayathrithedev.github.io/diwali-blessings/'
    return `Check out my Diwali blessing from GitHub 🎆🪔\nTry it yourself here: ${site}`
  }

  // ---- Share Links ----
  function twitterShareLink() {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterShareMessage())}`
  }

  function linkedInShareLink() {
    const url = 'https://gayathrithedev.github.io/diwali-blessings/'
    const text = linkedInShareMessage()
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`
  }

  function facebookShareLink() {
    const url = 'https://gayathrithedev.github.io/diwali-blessings/'
    const text = facebookShareMessage()
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
  }

  // ---- Core Share Logic ----
  async function shareImageWithFallback(platform: 'twitter' | 'linkedin' | 'facebook' | 'generic') {
    setSharing(true)

    // For image-based share, hide UI
    if (platform === 'generic') setHideElements(true)
    await new Promise((r) => setTimeout(r, 200)) // wait for UI update

    try {
      if (platform === 'twitter') {
        window.open(twitterShareLink(), '_blank', 'noopener')
        return
      }

      if (platform === 'linkedin') {
        window.open(linkedInShareLink(), '_blank', 'noopener')
        return
      }

      if (platform === 'facebook') {
        window.open(facebookShareLink(), '_blank', 'noopener')
        return
      }

      // Generic share → capture image and use Web Share API
      const blob = await captureCardBlob()
      setHideElements(false)

      if (!blob) return
      const file = new File([blob], 'diwali-blessing.png', { type: blob.type })
      const nav = navigator as unknown as NavigatorWithShare
      const message = buildShareMessage()

      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], text: message })
      } else {
        // fallback: open the image
        const url = URL.createObjectURL(file)
        window.open(url, '_blank')
      }
    } catch (err) {
      console.error('share error', err)
    } finally {
      setHideElements(false)
      setSharing(false)
    }
  }

  // ---- JSX ----
  return (
    <div className="blessing-card" ref={cardRef}>
      {/* Header */}
      <div className="card-header">
        <h2>🪔 Happy Diwali 🪔</h2>
      </div>

      {/* Body */}
      <div className="card-body">
        <a
          href={`https://github.com/${user.login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="profile-link"
        >
          <div className="profile-section">
            <img src={user.avatar_url} alt={user.login} className="avatar" />
          </div>
        </a>
        <div className="blessing-content">
          <p className="blessing-message">{blessing}</p>
        </div>
      </div>

      {/* Footer */}
      {!hideElements && (
        <div className="card-footer">
          <div className="social-icons">
            <a
              onClick={() => shareImageWithFallback('twitter')}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Twitter"
            >
              <i className="fa-brands fa-x-twitter"></i>
            </a>
            <a
              onClick={() => shareImageWithFallback('linkedin')}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
            >
              <i className="fa-brands fa-linkedin"></i>
            </a>
            <a
              onClick={() => shareImageWithFallback('facebook')}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Facebook"
            >
              <i className="fa-brands fa-facebook"></i>
            </a>
            <a
              onClick={() => shareImageWithFallback('generic')}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share link"
            >
              <i className="fa-solid fa-share-nodes"></i>
            </a>
          </div>

          {onBack && (
            <button className="back-btn" onClick={onBack}>
              {sharing ? 'Please wait...' : 'Generate Again'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
