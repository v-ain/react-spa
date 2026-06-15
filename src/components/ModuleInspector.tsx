import React from 'react';
import { SubsystemModule } from '../types/system';
import Sparkline from './ui/Sparkline';


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

  const isOnline = activeModule.status === 'online';

  // Парсим числовое значение RAM для скармливания графику (например, "4.2MB" -> 4.2)
  const ramNumeric = parseFloat(activeModule.metrics.memory) || 0;

  // Генерируем псевдо-число для графика нагрузки на основе текстового типа нагрузки
  const loadNumeric = activeModule.metrics.load === 'high' ? 14.5 : activeModule.metrics.load === 'medium' ? 4.1 : 0.8;


  return (
    <>
      {/* СЕТКА СИСТЕМНЫХ МЕТРИК (С ИНТЕРАКТИВНЫМ УПРАВЛЕНИЕМ) */}
      <section className="stats-grid">

        {/* Карточка 1: Файлы */}
        <div className="stat-card">
          <div style={{ flexGrow: 1 }}>
            <span className="stat-label">Total Index Files</span>
            <span className="stat-value cyan">{isOnline ? activeModule.metrics.filesCount : '0'}</span>
          </div>
          {/* Статичный график для файлов */}
          <Sparkline value={isOnline ? parseInt(activeModule.metrics.filesCount) : 0} isOnline={isOnline} color="var(--tech-cyan)" />
        </div>

        {/* Карточка 2: Живая RAM (График дышит вместе с интервалом в App.tsx!) */}
        <div className="stat-card">
          <div style={{ flexGrow: 1 }}>
            <span className="stat-label">Heap Allocation</span>
            <span className="stat-value">{activeModule.metrics.memory}</span>
          </div>
          <Sparkline value={ramNumeric} isOnline={isOnline} color="#38bdf8" />
        </div>

        {/* Карточка 3: Нагрузка CPU / Статус */}
        <div className="stat-card" style={{ borderColor: isOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'right', paddingRight: '10px' }}>
              <span className="stat-label">CPU Pulse</span>
              <button
                type="button"
                className="tech-badge"
                style={{ cursor: 'pointer', background: 'none', fontSize: '9px', borderColor: isOnline ? 'var(--status-online)' : 'var(--status-offline)', color: isOnline ? 'var(--status-online)' : 'var(--status-offline)' }}
                onClick={handleTogglePower}
              >
                {isOnline ? '[SHUTDOWN]' : '[INITIALIZE]'}
              </button>
            </div>
            <span className={`stat-value ${isOnline ? 'green' : ''}`} style={{ color: !isOnline ? 'var(--status-offline)' : '' }}>
              {isOnline ? `${loadNumeric}%` : 'OFFLINE'}
            </span>
          </div>
          {/* Зеленый или красный график пульса процессора */}
          <Sparkline value={isOnline ? loadNumeric : 0} isOnline={isOnline} color={isOnline ? 'var(--status-online)' : 'var(--status-offline)'} />
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
