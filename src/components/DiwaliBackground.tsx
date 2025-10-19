import { useEffect, useRef } from 'react'
import './diwali.css'
import Lottie from "lottie-react";
import diyaAnimation from '../assets/DiwaliDiya.json'

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

  interface Spark {
    x: number
    y: number
    vx: number
    vy: number
    life: number
    color: string
  }

  const sparks: Spark[] = []

    function spawnFirework() {
      const x = Math.random() * window.innerWidth
      const y = Math.random() * window.innerHeight * 0.6
      const hue = Math.random() * 360
      for (let i = 0; i < 40; i++) {
        const spark: Spark = {
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.9) * 6,
          life: 60 + Math.random() * 40,
          color: `hsl(${hue} ${80 + Math.random() * 20}% 50%)`,
        }
        sparks.push(spark)
      }
    }
    function loop() {
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

      // (removed canvas-drawn floating diyas; Lottie diya is used instead)
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
      <div className="diya-player">
        <Lottie animationData={diyaAnimation} loop={true} style={{width: 200, height: 200}} />
        <div style={{textAlign: 'center', padding: '12px 0', color: '#ffd7c2'}}>
          Made with ❤️ for developers, this Diwali.
        </div>
      </div>
    </div>
  )
}
