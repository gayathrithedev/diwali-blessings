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
  const { user, events, blessing } = data
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [sharing, setSharing] = useState(false)

  async function captureCardBlob(): Promise<Blob | null> {
    const node = cardRef.current
    const win = window as unknown as WindowWithExtras
    if (!node || !win.html2canvas) return null
    try {
      const canvas = await win.html2canvas(node, { backgroundColor: null })
      return await new Promise<Blob | null>((resolve) => canvas.toBlob((b: Blob | null) => resolve(b)))
    } catch (err) {
      console.error('capture error', err)
      return null
    }
  }

  function buildShareMessage(): string {
    const site = location.origin
    return `I have tried Diwali Blessing Generator, it is super fun\nGo ahead and try it here: ${site}\n\nBelow is my blessing from the Github diwali blessings:\n${blessing}`
  }

  async function handleShare() {
    setSharing(true)
    try {
      const blob = await captureCardBlob()
      const message = buildShareMessage()

      // Try Web Share API with files (mobile/modern browsers)
      if (blob) {
        const file = new File([blob], 'diwali-blessing.png', { type: blob.type })
        const nav = navigator as unknown as NavigatorWithShare
        if (typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
          try {
            if (typeof nav.share === 'function') {
              await nav.share({ files: [file], text: message })
              return
            }
          } catch (err) {
            console.warn('web share failed', err)
          }
        }
      }

      // Copy message text to clipboard (helpful for Discord/manual paste)
      const nav2 = navigator as unknown as NavigatorWithShare
      if (nav2.clipboard && typeof nav2.clipboard.writeText === 'function') {
        try {
          await nav2.clipboard.writeText(message)
        } catch {
          // ignore
        }
      }

      // Try copying image to clipboard if available
      if (blob) {
        const nav3 = navigator as unknown as NavigatorWithShare
        const winEx = window as unknown as WindowWithExtras
        if (nav3.clipboard && typeof nav3.clipboard.write === 'function' && winEx.ClipboardItem) {
          try {
            const ClipboardItemCtor = winEx.ClipboardItem as ClipboardItemCtorType
            await nav3.clipboard.write([new ClipboardItemCtor({ [blob.type]: blob })])
          } catch {
            // ignore
          }
        }
      }

      // Fallback: open Twitter compose with prefilled message
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
      window.open(twitterUrl, '_blank', 'noopener')
    } finally {
      setSharing(false)
    }
  }

  function twitterShareLink() {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareMessage())}`
  }

  function linkedInShareLink() {
    const url = location.href
    const text = `I have tried Diwali Blessing Generator, it is super fun - Go ahead and try it here: ${location.origin} \n\nMy blessing:\n${blessing}`
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`
  }

  function discordShareLink() {
    // We copy the message to clipboard in handleShare so user can paste into Discord
    return `https://discord.com/channels/@me`
  }

  return (
    <div className="blessing-card" ref={cardRef}>
      <div className="card-left">
        <img src={user.avatar_url} alt={user.login} className="avatar" />
      </div>
      <div className="card-right">
        <h2>Happy Diwali, {user.name || user.login}!</h2>
        <p className="blessing">{blessing}</p>
        <div className="meta">
          <div>Public repos: {user.public_repos}</div>
          <div>Followers: {user.followers}</div>
          <div>Recent activity: {events.length} events</div>
        </div>
        <div className="share-row">
          <button className="share-btn" onClick={handleShare} disabled={sharing}>{sharing ? 'Sharing...' : 'Share'}</button>
          <a className="share-link" href={twitterShareLink()} target="_blank" rel="noopener noreferrer">Twitter</a>
          <a className="share-link" href={linkedInShareLink()} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a className="share-link" href={discordShareLink()} target="_blank" rel="noopener noreferrer">Discord</a>
        </div>
        {onBack && (
          <div style={{ marginTop: 14 }}>
            <button className="back-btn" onClick={onBack}>Generate another</button>
          </div>
        )}
      </div>
    </div>
  )
}

