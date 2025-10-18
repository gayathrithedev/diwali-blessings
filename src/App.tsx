import React, { useState } from 'react'
import './App.css'
import DiwaliBackground from './components/DiwaliBackground'
import GithubForm from './components/GithubForm'
import BlessingCard from './components/BlessingCard'

function generateBlessing(user: any, events: any[]) {
  // simple heuristic-based blessing
  const repoScore = Math.min(1, user.public_repos / 20)
  const followerScore = Math.min(1, user.followers / 50)
  const activityScore = Math.min(1, events.length / 10)

  const total = repoScore * 0.4 + followerScore * 0.3 + activityScore * 0.3

  const templates = [
    'May your repo stars multiply like fireworks and your code bring light to many!',
    'Wishing you a Diwali full of bright commits, merged PRs, and joyful reviews!',
    'May this festival of lights bring you creative ideas and bug-free nights!',
    'May your branches be conflict-free and your celebrations sparkling with joy!'
  ]

  const idx = Math.floor(total * (templates.length - 1))
  const base = templates[idx] || templates[0]

  // add personalized bit
  const personal = `You have ${user.public_repos} public repos and ${user.followers} followers — keep shining!`
  return `${base} ${personal}`
}

export default function App() {
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="app-root">
      <DiwaliBackground />
      <div className="main-container">
        <div className="left-panel">
          <h1>Diwali Blessings</h1>
          <p>Enter your GitHub username to receive a unique Diwali blessing based on your activity.</p>
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

        <div className="right-panel">
          {result ? (
            <BlessingCard data={result} />
          ) : (
            <div className="placeholder" style={{opacity:0.7}}>
              A colorful blessing card will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
