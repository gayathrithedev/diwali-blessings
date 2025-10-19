import { useState } from 'react'
import './App.css'
import DiwaliBackground from './components/DiwaliBackground'
import GithubForm from './components/GithubForm'
import BlessingCard from './components/BlessingCard'

type User = {
  login: string
  name?: string
  avatar_url: string
  public_repos: number
  followers: number
}
type GeneratorInput = {
  public_repos: number
  followers: number
  totalStars?: number
  lastCommit?: string | null
  name?: string
  login: string
  events: unknown[]
}

function generateBlessingFromActivity(input: GeneratorInput) {
  // follow user's sample scoring logic
  const { public_repos, totalStars = 0, lastCommit, name, login } = input
  const repoCount = public_repos || 0
  const daysSinceCommit = lastCommit ? (Date.now() - new Date(lastCommit).getTime()) / (1000 * 60 * 60 * 24) : Infinity

  // score
  let score = repoCount + totalStars / 10
  if (daysSinceCommit < 7) score += 30
  else if (daysSinceCommit < 30) score += 15

  // Ten meaningful & fun templates
  const templates = [
    `🪔 ${name || login}, even a single diya starts the light. Keep coding! Shubh Diwali ✨`,
    `💫 ${name || login}, your ${repoCount} repos glow like diyas. May your pull requests merge smoothly this Diwali! 🔥`,
    `🔥 ${name || login}, your ${totalStars} stars shine like fireworks! May your code light up the world this Diwali 🪔✨`,
    `🌟 ${name || login}, may your commits be bright and your issues be few — celebrate every small win!`,
    `🎉 ${name || login}, whether you pushed today or last week, may inspiration find you and ideas flow freely!`,
    `🧩 ${name || login}, may your toughest bugs unravel like string lights and reveal beautiful solutions.`,
    `🍵 ${name || login}, take a break between commits — tea, snacks, and a smooth deploy await you!`,
    `🚀 ${name || login}, may your next release feel like fireworks — fast, joyful, and shared with friends.`,
    `🤝 ${name || login}, may collaboration warm your repo like diyas and bring bright new contributions.`,
    `✨ ${name || login}, code with heart: may your work bring light to someone’s project this season.`
  ]

  // select template by score ranges to keep deterministic, add small randomness
  const baseIdx = Math.min(Math.floor(score / 20), templates.length - 1)
  const jitter = Math.random() < 0.25 ? 1 : 0 // slight chance to pick next one
  const idx = Math.min(templates.length - 1, baseIdx + jitter)
  return templates[idx]
}

export default function App() {
  type Result = { user: User; events: unknown[]; blessing: string }
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="app-root">
      <DiwaliBackground />
      <div className="main-container">
        <div className={`flip-card ${result ? 'flipped' : ''}`}>
          <div className="flipper">
            <div className="front">
              <div className="card-inner">
                <h1 className="title">GitHub Diwali Blessings</h1>
                <p className="tagline">“This Diwali, let the code gods bless your commits with divine light 💫”</p>
                <p className="subtitle">✨ Generate your diwali blessing card ✨</p>

                <GithubForm
                  onResult={(data: { user: User; events?: unknown[]; totalStars?: number; lastCommit?: string | null }) => {
                    // data: { user, events, totalStars, lastCommit }
                    const user = data.user || ({} as User)
                    const blessing = generateBlessingFromActivity({
                      public_repos: user.public_repos || 0,
                      followers: user.followers || 0,
                      totalStars: data.totalStars || 0,
                      lastCommit: data.lastCommit || null,
                      name: user.name,
                      login: user.login,
                      events: data.events || []
                    })
                    setResult({ user, events: data.events || [], blessing })
                    setError(null)
                  }}
                  onError={(msg) => { setError(msg); setResult(null) }}
                />

                {error && <div style={{color:'#ffb3a1', marginTop:12}}>{error}</div>}
              </div>
            </div>

            <div className="back">
              <div className="card-inner">
                {result ? (
                  <BlessingCard data={result} onBack={() => setResult(null)} />
                ) : (
                  <div className="placeholder" style={{opacity:0.8}}>
                    Your blessing will appear here after generation.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
