import { useState, useEffect } from 'react';

interface SparklineProps {
  value: number; // Базовое число (например, 4.2)
  isOnline?: boolean; // Статус подсистемы
  color?: string;
}

export default function Sparkline({ value, isOnline = true, color = 'var(--tech-cyan)' }: SparklineProps) {
  const maxHistory = 20; // Длина линии
  const width = 120;
  const height = 30;

  // Инициализируем историю естественной линией с небольшим шумом, чтобы график не был пустым
  const [history, setHistory] = useState<number[]>(() =>
    Array.from({ length: maxHistory }, () => value + (Math.random() * 0.4 - 0.2))
  );

  // Сбрасываем и обновляем историю при переключении на другой модуль
  useEffect(() => {
    setHistory(Array.from({ length: maxHistory }, () => isOnline ? value : 0));
  }, [value, isOnline]);

  // Внутренний пульс: заставляет график двигаться плавно и непрерывно
  useEffect(() => {
    if (!isOnline) {
      // Если офлайн — плавно уводим все точки в ноль
      const interval = setInterval(() => {
        setHistory(prev => {
          const next = [...prev.slice(1), 0];
          return next;
        });
      }, 300);
      return () => clearInterval(interval);
    }

    const interval = setInterval(() => {
      setHistory(prev => {
        // Берем последнее значение из стейта и добавляем к нему легкую естественную синусоиду (микро-шум)
        const lastVal = prev[prev.length - 1] || value;
        const noise = (Math.random() * 0.6 - 0.3); // Мягкие колебания

        // Удерживаем значение в разумных пределах вокруг базового value
        let nextVal = lastVal + noise;
        if (nextVal > value + 3) nextVal = value + 1;
        if (nextVal < value - 3) nextVal = value - 1;
        if (nextVal < 0) nextVal = 0;

        return [...prev.slice(1), nextVal];
      });
    }, 400); // Скорость бега линии (каждые 400мс)

    return () => clearInterval(interval);
  }, [value, isOnline]);

  // БЕЗОПАСНЫЙ РАСЧЕТ ДЛЯ SVG КОРДИНАТ
  const min = Math.min(...history);
  const max = Math.max(...history);
  // Защита от деления на ноль: если max === min, ставим диапазон в единицу
  const range = max - min === 0 ? 1 : max - min;

  const points = history.map((val, index) => {
    const x = (index / (maxHistory - 1)) * width;
    // Масштабируем Y: вычитаем небольшой отступ сверху/снизу, чтобы линия не билась о края SVG
    const padding = 3;
    const y = padding + (height - padding * 2) * (1 - (val - min) / range);
    return { x, y };
  });

  // Генерация строки пути (Гладкая кривая)
  let dAttr = '';
  if (points.length > 0 && points[0]) {
    dAttr = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1]!;
      const p1 = points[i]!;
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      dAttr += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
  }

  return (
    <svg width={width} height={height} style={{ overflow: 'visible', opacity: isOnline ? 1 : 0.2, transition: 'opacity 0.3s' }}>
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
        stroke={isOnline ? color : 'var(--text-metrics)'}
        strokeWidth="1.2"
        filter={isOnline ? "url(#neon-glow)" : undefined}
        style={{ transition: 'd 0.1s linear' }}
      />
    </svg>
  );
}
