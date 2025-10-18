import React from 'react'
import './blessing.css'

type Props = {
  data: {
    user: any
    events: any[]
    blessing: string
  }
}

export default function BlessingCard({ data }: Props) {
  const { user, events, blessing } = data

  return (
    <div className="blessing-card">
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
      </div>
    </div>
  )
}
