import React, { useState } from 'react';

export default function KernelConfig() {
  const [ramLimit, setRamLimit] = useState<number>(512);
  const [tickRate, setTickRate] = useState<number>(3000);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexGrow: 1 }}>

      {/* Левый блок: Ручки управления */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--matrix-border)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '12px', color: 'var(--text-neon)', textTransform: 'uppercase', margin: 0, paddingBottom: '8px', borderBottom: '1px solid var(--matrix-border)' }}>Resource Allocator</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>MAX_MEMORY_POOL_LIMIT</span>
            <span style={{ color: 'var(--text-bright)' }}>{ramLimit} MB</span>
          </div>
          <input type="range" min="128" max="1024" value={ramLimit} onChange={(e) => setRamLimit(Number(e.target.value))} style={{ width: '100%', height: '4px', background: 'var(--bg-terminal)', outline: 'none', cursor: 'pointer' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>SYSTEM_TICK_RATE (POLLING)</span>
            <span style={{ color: 'var(--text-bright)' }}>{tickRate} ms</span>
          </div>
          <input type="range" min="500" max="10000" step="500" value={tickRate} onChange={(e) => setTickRate(Number(e.target.value))} style={{ width: '100%', height: '4px', background: 'var(--bg-terminal)', outline: 'none', cursor: 'pointer' }} />
        </div>
      </div>

      {/* Правый блок: Таблица карт зависимостей */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--matrix-border)', borderRadius: '8px', padding: '20px' }}>
        <h3 style={{ fontSize: '12px', color: 'var(--text-neon)', textTransform: 'uppercase', margin: 0, paddingBottom: '8px', borderBottom: '1px solid var(--matrix-border)' }}>Dependency Architecture</h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '12px', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)' }}>
              <th style={{ padding: '8px' }}>NODE_ID</th>
              <th>ALLOC_RAM</th>
              <th>INTEGRITY</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}><td style={{ padding: '10px 8px' }}>git-visualizer</td><td>4.2 MB</td><td style={{ color: 'var(--cyber-green)' }}>99.8%</td></tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}><td style={{ padding: '10px 8px' }}>linter-core</td><td>18.2 MB</td><td style={{ color: 'var(--cyber-green)' }}>100%</td></tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}

