import { useState, useEffect } from 'react'

interface SparklineProps {
  value: number
  isOnline?: boolean
  isOverloaded?: boolean // Новый флаг экстремальной нагрузки
  color?: string
}

export default function Sparkline({
  value,
  isOnline = true,
  isOverloaded = false,
  color = 'var(--tech-cyan)',
}: SparklineProps) {
  const maxHistory = 20
  const width = 120
  const height = 30

  const [history, setHistory] = useState<number[]>(() =>
    Array.from({ length: maxHistory }, () => value + (Math.random() * 0.4 - 0.2))
  )

  useEffect(() => {
    setHistory(Array.from({ length: maxHistory }, () => (isOnline ? value : 0)))
  }, [value, isOnline])

  useEffect(() => {
    if (!isOnline) {
      const interval = setInterval(() => {
        setHistory((prev) => [...prev.slice(1), 0])
      }, 300)
      return () => clearInterval(interval)
    }

    const interval = setInterval(
      () => {
        setHistory((prev) => {
          const lastVal = prev[prev.length - 1] || value

          // Если запущен стресс-тест — генерируем огромную хаотичную амплитуду
          const noise = isOverloaded
            ? Math.random() * 8.0 - 4.0 // Бешеный скачок для стресс-теста
            : Math.random() * 0.6 - 0.3 // Обычный мягкий шум

          let nextVal = lastVal + noise

          if (isOverloaded) {
            // Удерживаем значения на пике в районе 90-100%
            if (nextVal > 100) nextVal = 98
            if (nextVal < 75) nextVal = 85
          } else {
            if (nextVal > value + 3) nextVal = value + 1
            if (nextVal < value - 3) nextVal = value - 1
            if (nextVal < 0) nextVal = 0
          }

          return [...prev.slice(1), nextVal]
        })
      },
      isOverloaded ? 150 : 400
    ) // Стресс-график бежит в 2.5 раза быстрее!

    return () => clearInterval(interval)
  }, [value, isOnline, isOverloaded])

  const min = Math.min(...history)
  const max = Math.max(...history)
  const range = max - min === 0 ? 1 : max - min

  const points = history.map((val, index) => {
    const x = (index / (maxHistory - 1)) * width
    const padding = 3
    const y = padding + (height - padding * 2) * (1 - (val - min) / range)
    return { x, y }
  })

  let dAttr = ''
  if (points.length > 0) {
    dAttr = `M ${points[0]!.x} ${points[0]!.y}`
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1]!
      const p1 = points[i]!
      const cpX1 = p0.x + (p1.x - p0.x) / 2
      const cpY1 = p0.y
      const cpX2 = p0.x + (p1.x - p0.x) / 2
      const cpY2 = p1.y
      dAttr += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`
    }
  }

  // Если перегрузка — принудительно аварийный красный, иначе стандартный цвет
  const strokeColor = isOverloaded ? 'var(--status-offline)' : isOnline ? color : 'var(--text-metrics)'

  return (
    <svg
      width={width}
      height={height}
      style={{ overflow: 'visible', opacity: isOnline ? 1 : 0.2, transition: 'opacity 0.3s' }}
    >
      <defs>
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d={dAttr}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isOverloaded ? '1.8' : '1.2'}
        filter={isOnline ? 'url(#neon-glow)' : undefined}
        style={{ transition: 'd 0.05s linear' }}
      />
    </svg>
  )
}
