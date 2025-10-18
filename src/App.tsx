import React, { useState } from 'react'
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

function generateBlessing(user: User, events: unknown[]) {
  // simple heuristic-based blessing
  const repoScore = Math.min(1, user.public_repos / 20)
  const followerScore = Math.min(1, user.followers / 50)
  const activityScore = Math.min(1, (events || []).length / 10)

  const total = repoScore * 0.4 + followerScore * 0.3 + activityScore * 0.3

  const templates = [
    'May your repo stars multiply like fireworks and your code bring light to many!',
    'Wishing you a Diwali full of bright commits, merged PRs, and joyful reviews!',
    'May this festival of lights bring you creative ideas and bug-free nights!',
    'May your branches be conflict-free and your celebrations sparkling with joy!',
    'May your CI always pass and your evenings be filled with laughter!',
    'May your issues be few and your inspirations many this Diwali!',
    'May your open source contributions light up someone’s project tonight!',
    'May you find elegant solutions and delightful bugs to squash!',
    'May your pull requests bring smiles and helpful comments!',
    'May your terminal glow like diyas and your coffee never run out!',
    'May each commit be meaningful and each release a celebration!',
    'May your forks find new homes and your code bring people together!',
    'May your contributions be recognized and your growth be steady!',
    'May you discover new tools and mentors to guide your path!',
    'May your README be clear and your docs shine bright!',
    'May your test coverage rise like the festival lights!',
    'May your pair programming sessions be full of joy and learning!',
    'May your ideas branch out and merge into incredible features!',
    'May your keyboard sing and your deploys be smooth!',
    'May your algorithms be fast and your evenings peaceful!',
    'May your Git history be clean and your memories richer this season!',
    'May new opportunities find you and your code open doors!',
    'May your stars count increase and your heart be content!',
    'May every bug teach you wisdom and every feature bring pride!',
    'May your collaboration be warm and your repos evergreen!',
    'May you build things that brighten someone’s day this Diwali!',
    'May your local branch always match the remote and your tea be warm!',
    'May your explorer be curious and your projects flourish!',
    'May your contributions spark joy and ignite new friendships!',
    'May fortune and uptime favor your services tonight!'
  ]

  // compute a base index influenced by activity but include randomness
  const noise = Math.random() * 0.3 - 0.15 // small jitter
  const score = Math.max(0, Math.min(1, total + noise))
  const idx = Math.floor(score * (templates.length - 1))
  const base = templates[idx] || templates[0]

  // personalized suffixes
  const suffixes = [
    `You have ${user.public_repos} public repos and ${user.followers} followers — keep shining!`,
    `Your recent ${events.length} public events tell a story of curiosity — celebrate it!`,
    `Keep exploring — your contributions matter to many.`,
    `May your next PR bring delightful surprises.`,
    `Here’s to more learnings, merges, and bright ideas.`
  ]

  const personal = suffixes[Math.floor(Math.random() * suffixes.length)]
  return `${base} ${personal}`
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
                <h1 className="title">Diwali Dev Blessings</h1>
                <p className="subtitle">✨ Generate your diwali blessing card ✨</p>

                <GithubForm
                  onResult={(data) => {
                    const blessing = generateBlessing(data.user, data.events)
                    setResult({ ...data, blessing })
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
