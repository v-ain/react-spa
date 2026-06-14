import React from 'react';
import { SubsystemModule } from '../types/system';

interface ModuleInspectorProps {
  activeModule: SubsystemModule;
  activeTabIdx: number;
  onTabSelect: (index: number) => void;
}

export default function ModuleInspector({ activeModule, activeTabIdx, onTabSelect }: ModuleInspectorProps) {
  const activeTab = activeModule.tabs[activeTabIdx];

  return (
    <>
      {/* Сетка аналитики (Верхние карточки) */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--matrix-border)', borderRadius: '8px', padding: '16px', position: 'relative' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Index Files</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-neon)', marginTop: '4px' }}>{activeModule.metrics.filesCount}</div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--matrix-border)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Heap Allocation</div>
          <div style={{ fontSize: '24px', fontWeight: 600, marginTop: '4px' }}>{activeModule.metrics.memory}</div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--matrix-border)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sync State</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--cyber-green)', marginTop: '4px' }}>{activeModule.status.toUpperCase()}</div>
        </div>
      </section>

      {/* Центральный пульт (Проводник файлов) */}
      <section style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--matrix-border)', borderRadius: '8px', flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '250px' }}>
        <div style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--matrix-border)' }}>
          {activeModule.tabs.map((tab, idx) => (
            <div
              key={tab.name}
              onClick={() => onTabSelect(idx)}
              style={{ padding: '12px 20px', fontSize: '12px', color: activeTabIdx === idx ? 'var(--text-neon)' : 'var(--text-muted)', backgroundColor: activeTabIdx === idx ? 'var(--bg-card)' : 'transparent', borderRight: '1px solid var(--matrix-border)', cursor: 'pointer' }}
            >
              {tab.name}
            </div>
          ))}
        </div>

        <div style={{ padding: '20px', flexGrow: 1, backgroundColor: 'var(--bg-terminal)', margin: '8px', borderRadius: '6px', overflowY: 'auto' }}>
          {activeTab?.lines.map((line, lIdx) => (
            <div key={lIdx} style={{ display: 'flex', gap: '16px', fontSize: '13px', lineHeight: '1.6' }}>
              <span style={{ color: 'var(--text-dimmed)', width: '20px', textAlign: 'right' }}>{String(lIdx + 1).padStart(2, '0')}</span>
              <span style={{ color: '#cbd5e1' }}>{line}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

