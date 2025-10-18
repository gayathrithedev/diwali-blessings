import React, { useState } from 'react'

type Props = {
  onResult: (data: any) => void
  onError?: (err: string) => void
}

export default function GithubForm({ onResult, onError }: Props) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username) return onError?.('Enter a username')
    setLoading(true)
    try {
      const userRes = await fetch(`https://api.github.com/users/${username}`)
      if (!userRes.ok) throw new Error('User not found')
      const user = await userRes.json()

      // fetch events (may be empty or rate limited)
      const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public`)
      const events = eventsRes.ok ? await eventsRes.json() : []

      const payload = { user, events }
      onResult(payload)
    } catch (err: any) {
      onError?.(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="github-form" onSubmit={handleSubmit}>
      <div className="username-card">
        <label className="username-label">GitHub username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. gaearon"
          aria-label="GitHub username"
        />
      </div>
      <div className="actions">
        <button type="submit" className="primary full" disabled={loading}>
          {loading ? 'Fetching Your Aura' : 'Generate Blessing'}
        </button>
      </div>
    </form>
  )
}
