import React, { useEffect, useRef } from 'react'
import './diwali.css'

export default function DiwaliBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let animationId: number

    const DPR = window.devicePixelRatio || 1

    function resize() {
      canvas.width = window.innerWidth * DPR
      canvas.height = window.innerHeight * DPR
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(DPR, DPR)
    }

    const sparks: any[] = []

    function spawnFirework() {
      const x = Math.random() * window.innerWidth
      const y = Math.random() * window.innerHeight * 0.6
      const hue = Math.random() * 360
      for (let i = 0; i < 40; i++) {
        sparks.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.9) * 6,
          life: 60 + Math.random() * 40,
          color: `hsl(${hue} ${80 + Math.random() * 20}% 50%)`,
        })
      }
    }

    let last = 0
    function loop(ts: number) {
      const dt = ts - last
      last = ts
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // subtle radial glow
      const g = ctx.createLinearGradient(0, 0, 0, canvas.height)
      g.addColorStop(0, 'rgba(10,10,20,0.05)')
      g.addColorStop(1, 'rgba(0,0,0,0.15)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // draw sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.08
        s.life -= 1
        ctx.beginPath()
        ctx.fillStyle = s.color
        ctx.globalAlpha = Math.max(0, s.life / 80)
        ctx.fillRect(s.x, s.y, 3, 3)
        ctx.closePath()
        if (s.life <= 0) sparks.splice(i, 1)
      }

      // draw floating diyas (simple glowing orbs)
      const t = ts / 1000
      for (let i = 0; i < 8; i++) {
        const ix = (i / 8) * window.innerWidth + (Math.sin(t + i) * 30)
        const iy = window.innerHeight - 80 + Math.cos(t * 1.2 + i) * 6
        const gradient = ctx.createRadialGradient(ix, iy, 0, ix, iy, 30)
        gradient.addColorStop(0, 'rgba(255,220,120,0.95)')
        gradient.addColorStop(1, 'rgba(255,120,20,0.08)')
        ctx.fillStyle = gradient
        ctx.globalAlpha = 0.9
        ctx.beginPath()
        ctx.ellipse(ix, iy, 22, 12, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
      }

      ctx.globalAlpha = 1

      // occasionally spawn fireworks
      if (Math.random() < 0.02) spawnFirework()

      animationId = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    animationId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="diwali-bg">
      <canvas ref={canvasRef} className="diwali-canvas" />
      <div className="strings">
        {/* decorative hanging lights */}
        <div className="string" />
        <div className="string" />
      </div>
    </div>
  )
}
