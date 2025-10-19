import { useEffect, useRef, useState } from 'react'
import './diwali.css'
// use the bundled asset from the project's assets folder
const FIREWORKS_SOUND = new URL('../assets/fireworks.mp3', import.meta.url).href
import Lottie from "lottie-react";
import diyaAnimation from '../assets/DiwaliDiya.json'

export default function DiwaliBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [muted, setMuted] = useState(false)

  // control single looped audio when muted changes
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(FIREWORKS_SOUND)
      audioRef.current.preload = 'auto'
      audioRef.current.loop = true
      audioRef.current.volume = 0.6
    }

    if (muted) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause()
  try { audioRef.current.currentTime = 0 } catch { /* ignore */ }
      }
    } else {
      void audioRef.current.play().catch(() => {})
    }
  }, [muted])

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

  interface Spark {
    x: number
    y: number
    vx: number
    vy: number
    life: number
    color: string
    size: number
    alpha: number
  }

  interface Rocket {
    x: number
    y: number
    vx: number
    vy: number
    hue: number
    exploded: boolean
    ttl: number
  }

  const sparks: Spark[] = []
  const rockets: Rocket[] = []

  function launchRocket() {
    const x = Math.random() * window.innerWidth
    const y = window.innerHeight + 10
    const vx = (Math.random() - 0.5) * 1.5
    const vy = -6 - Math.random() * 4
    // pick from a richer palette of base hues to ensure vivid fireworks
    const palette = [12, 28, 45, 200, 260, 300, 340] // warm gold, orange, yellow, teal, purple, pink, red
    const hue = palette[Math.floor(Math.random() * palette.length)] + Math.floor((Math.random() - 0.5) * 18)
    rockets.push({ x, y, vx, vy, hue, exploded: false, ttl: 120 + Math.random() * 40 })
  }

  function explode(rocket: Rocket) {
    // no per-explosion audio; a single looped track is controlled by the mute toggle
    // more sparks for a richer burst
    const count = 50 + Math.floor(Math.random() * 50)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1 + Math.random() * 4
      const s: Spark = {
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 50 + Math.random() * 70,
        // richer saturation/lightness variance
        color: `hsl(${rocket.hue + (Math.random() - 0.5) * 30} ${75 + Math.random() * 20}% ${45 + Math.random() * 20}%)`,
        size: 1.5 + Math.random() * 4,
        alpha: 1,
      }
      sparks.push(s)
    }
  }

  function loop() {
    // clear with a subtle fade to create trails (composite for additive glow later)
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1))

    // update and draw rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i]
      r.x += r.vx
      r.y += r.vy
      r.vy += 0.02 // gravity
      r.ttl -= 1
      // draw rocket as a bright point with a small tail
      ctx.beginPath()
      ctx.fillStyle = `hsl(${r.hue} 90% 65%)`
      ctx.globalAlpha = 1
      ctx.fillRect(r.x, r.y, 2, 2)
      ctx.closePath()

      // tail
      ctx.beginPath()
      ctx.strokeStyle = `hsla(${r.hue} 90% 60% / 0.5)`
      ctx.lineWidth = 1
      ctx.moveTo(r.x - r.vx * 2, r.y - r.vy * 2)
      ctx.lineTo(r.x, r.y)
      ctx.stroke()
      ctx.closePath()

      if ((r.vy > -0.5 && Math.random() < 0.02) || r.ttl <= 0) {
        explode(r)
        rockets.splice(i, 1)
      }
    }

    // update and draw sparks with additive blending for glow
    ctx.globalCompositeOperation = 'lighter'
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]
      s.x += s.vx
      s.y += s.vy
      s.vy += 0.04 // gravity
      s.vx *= 0.99 // air resistance
      s.vy *= 0.999
      s.life -= 1
      s.alpha = Math.max(0, s.life / 80)

  // tightened radial glow for a very compact explosion circle
  const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 1.0)
  grad.addColorStop(0, `rgba(255,255,255,${s.alpha})`)
  // colored fringe extremely close to core
  grad.addColorStop(0.08, s.color.replace('hsl', 'hsla').replace(')', ` / ${Math.max(0.18, s.alpha)})`))
  grad.addColorStop(0.35, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
  // draw a tiny core circle for a sharp, precise flash
  ctx.arc(s.x, s.y, s.size * 0.8, 0, Math.PI * 2)
      ctx.fill()
      ctx.closePath()

      if (s.life <= 0 || s.alpha <= 0) sparks.splice(i, 1)
    }

    ctx.globalCompositeOperation = 'source-over'

    // occasionally launch rockets
    if (Math.random() < 0.04) launchRocket()

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
      <button
        className="sound-toggle"
        onClick={() => setMuted(m => !m)}
        aria-label="Toggle firecracker sound"
      >
        {muted ? '🔇' : '🔊'}
      </button>
      <canvas ref={canvasRef} className="diwali-canvas" />
      <div className="diya-player">
        <Lottie animationData={diyaAnimation} loop={true} style={{width: 200, height: 200}} />
        <div style={{textAlign: 'center', padding: '12px 0', color: '#ffd7c2'}}>
          Made with ❤️ for developers, this Diwali.
        </div>
      </div>
    </div>
  )
}
