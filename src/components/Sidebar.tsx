import React from 'react'
import { SubsystemModule } from '../types/system'

// Строгий контракт входящих пропсов для Сайдбара
interface SidebarProps {
  modules: SubsystemModule[]
  activeModuleId: string
  onSelectModule: (id: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({
  modules,
  activeModuleId,
  onSelectModule,
  searchQuery,
  onSearchChange,
  isOpen,
  onClose,
}: SidebarProps) {
  // Безопасный обработчик изменения текста в инпуте
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onSearchChange(e.target.value)
  }

  return (
    <aside className={`tech-sidebar ${isOpen ? 'is-open' : ''}`}>
      {/* ШАПКА САЙДБАРА */}
      <div className="sidebar-header">
        <span className="sidebar-title">SYSTEM_MODULES</span>
        <span className="tech-badge">SYS_INIT</span>
        <button className="sidebar-close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* ТЕРМИНАЛЬНАЯ СТРОКА ПОИСКАС ПРИГЛАШЕНИЕМ ">" */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="filter modules..."
          value={searchQuery}
          onChange={handleInputChange}
          autoComplete="off"
        />
      </div>

      {/* ИНТЕРАКТИВНЫЙ СПИСОК ПОДСИСТЕМ */}
      <ul className="tools-list">
        {modules.length > 0 ? (
          modules.map((mod) => {
            const isSelected = activeModuleId === mod.id
            const isOnline = mod.status === 'online'
            const isIdle = mod.status === 'idle'

            return (
              <li
                key={mod.id}
                className={`tool-item ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectModule(mod.id)}
              >
                {/* Цветной префикс модуля из конфига */}
                <span className="tool-prefix">{mod.prefix}</span>

                <div className="tool-body">
                  <div className="tool-header-row">
                    <div className="tool-name-wrapper">
                      {/* Свечение точки статуса, завязанное на тип SystemStatus */}
                      <span className={`status-dot ${mod.status}`}></span>
                      <span className="tool-name">{mod.name}</span>
                    </div>

                    {/* Метрики производительности, которые колеблются в реальном времени */}
                    <span className="tool-metrics">
                      {mod.metrics.time} / {mod.metrics.memory}
                    </span>
                  </div>

                  {/* Описание подсистемы */}
                  <span className="tool-desc" style={{ opacity: isOnline || isIdle ? 1 : 0.4 }}>
                    {mod.desc}
                  </span>
                </div>
              </li>
            )
          })
        ) : (
          /* Эстетичный лог в случае, если по поиску ничего не найдено */
          <div
            style={{
              padding: '20px 12px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              color: 'var(--text-metrics)',
              textAlign: 'center',
            }}
          >
            &gt;&gt; NO_MODULES_MATCH
          </div>
        )}
      </ul>
    </aside>
  )
}
