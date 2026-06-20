import React from 'react';
import { SubsystemModule } from '../types/system';

interface ModuleInspectorProps {
  activeModule: SubsystemModule;
  activeTabIdx: number;
  onTabChange: (idx: number) => void;
  onUpdateSubsystem: (id: string, updatedFields: Partial<SubsystemModule>) => Promise<void>;
  onLogAction: (msg: string, type: 'SUCCESS' | 'WARN' | 'ERROR') => void;
}

export default function ModuleInspector({
  activeModule,
  activeTabIdx,
  onTabChange,
  onUpdateSubsystem,
  onLogAction
}: ModuleInspectorProps) {

  // Переключатель питания модуля (Вкл/Выкл подсистему через API)
  const handleTogglePower = async () => {
    const isOnline = activeModule.status === 'online';
    const nextStatus = isOnline ? 'offline' : 'online';

    try {
      await onUpdateSubsystem(activeModule.id, {
        status: nextStatus,
        // Если тушим, сбрасываем метрики нагрузки
        metrics: {
          ...activeModule.metrics,
          memory: nextStatus === 'online' ? '4.2MB' : '0.0MB'
        }
      });

      onLogAction(
        `API_CALL: Подсистема [${activeModule.name}] переведена в режим [${nextStatus.toUpperCase()}]`,
        nextStatus === 'online' ? 'SUCCESS' : 'WARN'
      );
    } catch {
      onLogAction(`API_ERROR: Не удалось изменить состояние питания для ${activeModule.name}`, 'ERROR');
    }
  };

  const isModuleOnline = activeModule.status === 'online';

  return (
    <>
      {/* СЕТКА СИСТЕМНЫХ МЕТРИК (С ИНТЕРАКТИВНЫМ УПРАВЛЕНИЕМ) */}
      <section className="stats-grid">

        {/* Карточка 1: Индексные файлы */}
        <div className="stat-card">
          <span className="stat-label">Total Index Files</span>
          <span className="stat-value cyan">
            {isModuleOnline ? activeModule.metrics.filesCount : '0'}
          </span>
          <span className="stat-subtext">Реестр локального кэша</span>
        </div>

        {/* Карточка 2: Выделение памяти (Шевелится на лету!) */}
        <div className="stat-card">
          <span className="stat-label">Heap Allocation</span>
          <span className="stat-value">
            {activeModule.metrics.memory}
          </span>
          <span className="stat-subtext">Динамический пул RAM</span>
        </div>

        {/* Карточка 3: Интерактивный рубильник питания питания */}
        <div className="stat-card" style={{ borderColor: isModuleOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Subsystem Power</span>
            <button
              type="button"
              className="tech-badge"
              style={{
                cursor: 'pointer',
                background: 'none',
                borderColor: isModuleOnline ? 'var(--status-online)' : 'var(--status-offline)',
                color: isModuleOnline ? 'var(--status-online)' : 'var(--status-offline)',
                fontSize: '9px'
              }}
              onClick={handleTogglePower}
            >
              {isModuleOnline ? '[SHUTDOWN]' : '[INITIALIZE]'}
            </button>
          </div>
          <span className={`stat-value ${isModuleOnline ? 'green' : ''}`} style={{ color: !isModuleOnline ? 'var(--status-offline)' : '' }}>
            {activeModule.status.toUpperCase()}
          </span>
          <span className="stat-subtext">{isModuleOnline ? activeModule.metrics.extra : 'Пул потоков остановлен'}</span>
        </div>

      </section>

      {/* ОСНОВНАЯ ПАНЕЛЬ ПРОСМОТРА ДОКУМЕНТОВ КИНЕТИКИ КЕША */}
      <section className="main-work-panel" style={{ opacity: isModuleOnline ? 1 : 0.4, transition: 'opacity 0.2s' }}>

        {/* Табы документов */}
        <div className="panel-tabs">
          {activeModule.tabs.map((tab, idx) => (
            <button
              key={tab.name}
              type="button"
              className={`tab ${activeTabIdx === idx ? 'active' : ''}`}
              disabled={!isModuleOnline}
              onClick={() => onTabChange(idx)}
              style={{ background: 'none', borderTop: 'none', borderLeft: 'none', textAlign: 'left' }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Окно вывода кода или заглушка отсутствия сигнала */}
        <div className="panel-content-view" style={{ position: 'relative', minHeight: '180px' }}>
          {isModuleOnline ? (
            activeModule.tabs[activeTabIdx]?.lines.map((line, lineIdx) => (
              <div className="code-line" key={lineIdx}>
                <span className="line-number">
                  {String(lineIdx + 1).padStart(2, '0')}
                </span>
                <div className="code-text">
                  {/* Базовый интерактивный парсер ключевых слов для кибер-подсветки */}
                  {line.includes('const') || line.includes('return') || line.includes('module') ? (
                    <span className="code-text-highlighted">
                      {line.split(' ').map((word, wIdx) => {
                        if (word === 'const' || word === 'return' || word === 'module.exports') {
                          return <span key={wIdx} className="keyword">{word} </span>;
                        }
                        if (word.includes('log') || word.includes('fetchIndex')) {
                          return <span key={wIdx} className="function">{word} </span>;
                        }
                        return word + ' ';
                      })}
                    </span>
                  ) : (
                    line
                  )}
                </div>
              </div>
            ))
          ) : (
            /* Эстетичный киберпанк-экран отсутствия сигнала */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-metrics)',
              fontFamily: 'JetBrains Mono, monospace',
              padding: '40px 0'
            }}>
              <div>&gt;&gt; [CRITICAL]: NO_SIGNAL_DETECTED</div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>SUBSYSTEM_OFFLINE: Переведите рубильник питания в статус INITIALIZE.</div>
            </div>
          )}
        </div>

      </section>
    </>
  );
}
