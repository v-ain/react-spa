import React from 'react';
import { SubsystemModule } from '../types/system';

interface SideConsoleProps {
  modules: SubsystemModule[];
  activeId: string;
  onModuleSelect: (id: string) => void;
  filter: string;
  onFilterChange: (text: string) => void;
}

export default function SideConsole({ modules, activeId, onModuleSelect, filter, onFilterChange }: SideConsoleProps) {
  return (
    <aside style={{ backgroundColor: 'var(--bg-panel)', display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box' }}>
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>SYSTEM_MODULES</span>
        <span style={{ fontSize: '9px', color: 'var(--text-neon)', border: '1px solid rgba(56,189,248,0.2)', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(56,189,248,0.04)' }}>SYS_INIT</span>
      </div>

      <div style={{ padding: '0 16px 14px 16px', borderBottom: '1px solid var(--matrix-border)', position: 'relative' }}>
        <input
          type="text"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="filter modules..."
          style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'var(--bg-terminal)', border: '1px solid var(--matrix-border)', borderRadius: '6px', padding: '8px 12px 8px 12px', color: 'var(--text-bright)', fontSize: '12px', outline: 'none' }}
        />
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: '8px', overflowY: 'auto', flexGrow: 1 }}>
        {modules.map((mod) => (
          <li
            key={mod.id}
            onClick={() => onModuleSelect(mod.id)}
            style={{ display: 'flex', alignItems: 'flex-start', padding: '12px', marginBottom: '6px', borderRadius: '6px', cursor: 'pointer', borderLeft: activeId === mod.id ? '3px solid var(--text-neon)' : '3px solid transparent', backgroundColor: activeId === mod.id ? 'var(--bg-active)' : 'transparent', transition: 'all 0.15s ease' }}
          >
            <span style={{ color: 'var(--text-neon)', fontSize: '11px', marginRight: '10px', marginTop: '2px' }}>{mod.prefix}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flexGrow: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`pulse-node`} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: mod.status === 'online' ? 'var(--cyber-green)' : 'var(--cyber-amber)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{mod.name}</span>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-dimmed)' }}>{mod.metrics.memory}</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mod.desc}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

