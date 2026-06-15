import React from 'react';
import { SubsystemModule } from '../../types/system';

interface TopologyMapProps {
  subsystems: SubsystemModule[];
  overloadedModuleId: string | null;
  onNodeClick: (id: string) => void;
}

export default function TopologyMap({ subsystems, overloadedModuleId, onNodeClick }: TopologyMapProps) {
  // Размеры нашей координатной сетки SVG
  const width = 400;
  const height = 240;

  // Координаты центрального ядра (Шлюза)
  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <div className="topology-container" style={{ position: 'relative', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
        // LIVE_CLUSTER_TOPOLOGY_MESH
      </div>

      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>

          {/* НЕОНОВЫЕ СВЕЧЕНИЯ ДЛЯ РАЗНЫХ СОСТОЯНИЙ СЕТИ */}
          <defs>
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>

          {/* 1. ЛИНИИ СВЯЗИ (МАТРИЦА ШИНЫ ДАННЫХ) */}
          {subsystems.map((mod, index) => {
            // Распределяем ноды по кругу вокруг центра
            const angle = (index / subsystems.length) * 2 * Math.PI - Math.PI / 2;
            const radius = 85; // Радиус орбиты нод
            const nodeX = centerX + radius * Math.cos(angle);
            const nodeY = centerY + radius * Math.sin(angle);

            const isOnline = mod.status === 'online';
            const isOverloaded = overloadedModuleId === mod.id;

            // Определяем стиль линии связи в зависимости от состояния ноды
            let strokeColor = 'rgba(56, 189, 248, 0.2)'; // Обычная связь
            let strokeDash = undefined;

            if (!isOnline) {
              strokeColor = 'rgba(239, 68, 68, 0.15)'; // Связь разорвана
              strokeDash = '4,4';
            } else if (isOverloaded) {
              strokeColor = 'var(--status-offline)'; // Перегрузка линии
            }

            return (
              <line
                key={`link-${mod.id}`}
                x1={centerX}
                y1={centerY}
                x2={nodeX}
                y2={nodeY}
                stroke={strokeColor}
                strokeWidth={isOverloaded ? "1.5" : "1"}
                strokeDasharray={strokeDash}
                style={{ transition: 'all 0.3s' }}
              />
            );
          })}

          {/* 2. ЦЕНТРАЛЬНЫЙ УЗЕЛ ЯДРА (CORE KERNEL GATEWAY) */}
          <circle
            cx={centerX}
            cy={centerY}
            r="12"
            fill="var(--bg-card)"
            stroke="var(--tech-cyan)"
            strokeWidth="2"
            filter="url(#glow-green)"
          />
          <text x={centerX} y={centerY + 4} textAnchor="middle" style={{ fill: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', fontWeight: 'bold', pointerEvents: 'none' }}>
            GATE
          </text>

          {/* 3. ПЕРИФЕРИЙНЫЕ НОДЫ ПОДСИСТЕМ */}
          {subsystems.map((mod, index) => {
            const angle = (index / subsystems.length) * 2 * Math.PI - Math.PI / 2;
            const radius = 85;
            const nodeX = centerX + radius * Math.cos(angle);
            const nodeY = centerY + radius * Math.sin(angle);

            const isOnline = mod.status === 'online';
            const isOverloaded = overloadedModuleId === mod.id;

            let nodeColor = 'var(--tech-cyan)';
            let filterGlow = undefined;

            if (!isOnline) {
              nodeColor = 'var(--status-offline)';
            } else if (isOverloaded) {
              nodeColor = 'var(--status-offline)';
              filterGlow = 'url(#glow-red)';
            } else {
              filterGlow = 'url(#glow-green)';
            }

            return (
              <g
                key={`node-${mod.id}`}
                onClick={() => onNodeClick(mod.id)}
                style={{ cursor: 'pointer' }}
                className={isOverloaded ? 'node-alarm-blink' : ''}
              >
                {/* Фоновая подложка ноды */}
                <circle
                  cx={nodeX}
                  cy={nodeY}
                  r="8"
                  fill="var(--bg-workspace)"
                  stroke={nodeColor}
                  strokeWidth="1.5"
                  filter={filterGlow}
                  style={{ transition: 'all 0.3s' }}
                />

                {/* Текстовая метка подсистемы */}
                <text
                  x={nodeX}
                  y={nodeY > centerY ? nodeY + 16 : nodeY - 12}
                  textAnchor="middle"
                  style={{
                    fill: isOverloaded ? 'var(--status-offline)' : isOnline ? 'var(--text-primary)' : 'var(--text-metrics)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '9px',
                    transition: 'fill 0.3s',
                    userSelect: 'none'
                  }}
                >
                  {mod.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

