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

// Minimal typings around globals we use to avoid `any`
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
  const { totalStars } = data
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [sharing, setSharing] = useState(false)

  async function captureCardBlob(): Promise<Blob | null> {
    const node = cardRef.current
    const win = window as unknown as WindowWithExtras
    if (!node || !win.html2canvas) return null
    try {
      // request higher resolution by using devicePixelRatio as scale
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
    return `I have tried Diwali Blessing Generator, it is super fun\nGo ahead and try it here: ${site}\n\nBelow is my blessing from the Github diwali blessings:\n${blessing}`
  }


  async function shareImageWithFallback(platform: 'twitter' | 'linkedin' | 'discord' | 'generic') {
    setSharing(true)
    try {
      const blob = await captureCardBlob()
      const message = buildShareMessage()

      // Try Web Share API with files (best experience on mobile / desktop supporting it)
      if (blob) {
        try {
          const file = new File([blob], 'diwali-blessing.png', { type: blob.type })
          const nav = navigator as unknown as NavigatorWithShare
          if (typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
            if (typeof nav.share === 'function') {
              // include text where supported
              await nav.share({ files: [file], text: message })
              return
            }
          }
        } catch (err) {
          console.warn('web share failed', err)
        }
      }

      // Copy message text to clipboard (helpful for manual paste)
      try {
        const nav2 = navigator as unknown as NavigatorWithShare
        if (nav2.clipboard && typeof nav2.clipboard.writeText === 'function') {
          await nav2.clipboard.writeText(message)
        }
      } catch {
        // ignore
      }

      // Try copying image to clipboard if available (so user can paste into Twitter/Discord/LinkedIn)
      if (blob) {
        try {
          const nav3 = navigator as unknown as NavigatorWithShare
          const winEx = window as unknown as WindowWithExtras
          if (nav3.clipboard && typeof nav3.clipboard.write === 'function' && winEx.ClipboardItem) {
            const ClipboardItemCtor = winEx.ClipboardItem as ClipboardItemCtorType
            await nav3.clipboard.write([new ClipboardItemCtor({ [blob.type]: blob })])
          }
        } catch (err) {
          // ignore
          console.warn('clipboard image write failed', err)
        }
      }

      // Final fallback: open platform composer with prefilled text/URL. Users can paste image from clipboard.
      if (platform === 'twitter') {
        window.open(twitterShareLink(), '_blank', 'noopener')
      } else if (platform === 'linkedin') {
        window.open(linkedInShareLink(), '_blank', 'noopener')
      } else if (platform === 'discord') {
        window.open(discordShareLink(), '_blank', 'noopener')
      } else {
        // generic: open twitter as a friendly default
        window.open(twitterShareLink(), '_blank', 'noopener')
      }
    } finally {
      setSharing(false)
    }
  }

  function handleTwitterShare(e?: React.MouseEvent) {
    e?.preventDefault()
    void shareImageWithFallback('twitter')
  }

  function handleLinkedInShare(e?: React.MouseEvent) {
    e?.preventDefault()
    void shareImageWithFallback('linkedin')
  }

  function handleDiscordShare(e?: React.MouseEvent) {
    e?.preventDefault()
    void shareImageWithFallback('discord')
  }

  function twitterShareLink() {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareMessage())}`
  }

  function linkedInShareLink() {
    const url = 'https://gayathrithedev.github.io/diwali-blessings/'
    const text = `I have tried Diwali Blessing Generator, it is super fun - Go ahead and try it here: ${url} \n\nMy blessing:\n${blessing}`
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`
  }

  function discordShareLink() {
    // We copy the message to clipboard in handleShare so user can paste into Discord
    return `https://discord.com/channels/@me`
  }

  return (
    <div className="blessing-card" ref={cardRef}>
      <div className="card-left">
        <a href={`https://github.com/${user.login}`} target="_blank" rel="noopener noreferrer" aria-label={`Open ${user.login}'s GitHub profile`}>
          <img src={user.avatar_url} alt={user.login} className="avatar" />
        </a>
      </div>
      <div className="card-right">
        <h2>Happy Diwali 🪔, {user.name || user.login}!</h2>
        <p className="blessing">{blessing}</p>
        <div className="meta">
          <div>Public repos: {user.public_repos}</div>
          <div>Followers: {user.followers}</div>
          <div>Stars: {totalStars ?? 0}</div>
        </div>
        <div className="share-row">
          <button className="share-btn" onClick={() => void shareImageWithFallback('generic')} disabled={sharing}>{sharing ? 'Sharing...' : 'Share'}</button>
          <a className="share-link" href={twitterShareLink()} onClick={(e) => handleTwitterShare(e)} target="_blank" rel="noopener noreferrer">Twitter</a>
          <a className="share-link" href={linkedInShareLink()} onClick={(e) => handleLinkedInShare(e)} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a className="share-link" href={discordShareLink()} onClick={(e) => handleDiscordShare(e)} target="_blank" rel="noopener noreferrer">Discord</a>
        </div>
        {onBack && (
          <div className="back-row">
            <button className="back-btn" onClick={onBack}>Generate another</button>
          </div>
        )}
      </div>
    </div>
  )
}

