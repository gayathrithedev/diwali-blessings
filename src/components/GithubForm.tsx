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
      // fetch repos to compute total stars and last pushed date
      let totalStars = 0
      let lastCommit: string | null = null
      try {
        // try to fetch up to 100 repos (enough for most users)
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`)
        if (reposRes.ok) {
          const repos = await reposRes.json()
          for (const r of repos) {
            totalStars += r.stargazers_count || 0
            // pushed_at may be null for empty repos
            if (r.pushed_at) {
              if (!lastCommit || new Date(r.pushed_at) > new Date(lastCommit)) lastCommit = r.pushed_at
            }
          }
        }
      } catch (err) {
        // ignore repo fetch failures (rate limits) and continue
        // console.warn('repo fetch failed', err)
      }

      const payload = { user, events, totalStars, lastCommit }
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
          {loading ? 'Fetching Your Aura...' : 'Generate Blessing'}
        </button>
      </div>
    </form>
  )
}
