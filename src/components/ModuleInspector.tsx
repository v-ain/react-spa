import React, { useState, useEffect, useRef } from 'react';
import { SubsystemModule } from '../types/system';
import Sparkline from './ui/Sparkline';

interface ModuleInspectorProps {
  activeModule: SubsystemModule;
  activeTabIdx: number;
  onTabChange: (idx: number) => void;
  onUpdateSubsystem: (id: string, updatedFields: Partial<SubsystemModule>) => Promise<void>;
  onUpdateSubsystemCode: (id: string, tabIdx: number, newLines: string[]) => Promise<void>;
  onLogAction: (msg: string, type: 'SUCCESS' | 'WARN' | 'ERROR') => void;
}

export default function ModuleInspector({
  activeModule,
  activeTabIdx,
  onTabChange,
  onUpdateSubsystem,
  onUpdateSubsystemCode,
  onLogAction
}: ModuleInspectorProps) {

  const isOnline = activeModule.status === 'online';
  const ramNumeric = parseFloat(activeModule.metrics.memory) || 0;
  const loadNumeric = activeModule.metrics.load === 'high' ? 14.5 : activeModule.metrics.load === 'medium' ? 4.1 : 0.8;

  // --- ЛОКАЛЬНЫЙ СТЕЙТ ДЛЯ ИНЖЕКТОРА КОДА ---
  const [editableLines, setEditableLines] = useState<string[]>([]);
  const [isModified, setIsModified] = useState<boolean>(false);
  const codeContainerRef = useRef<HTMLDivElement | null>(null);

  // Синхронизируем локальный буфер кода при переключении модулей или вкладок
  useEffect(() => {
    const currentLines = activeModule.tabs[activeTabIdx]?.lines || [];
    setEditableLines(currentLines);
    setIsModified(false);
  }, [activeModule.id, activeTabIdx, activeModule.tabs]);

  // Слушатель изменения текста в строке
  const handleLineChange = (index: number, text: string) => {
    setEditableLines(prev => {
      const next = [...prev];
      next[index] = text;
      return next;
    });
    setIsModified(true);
  };

  // Перехват горячих клавиш Ctrl + S для быстрого патча
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (isModified && isOnline) {
        handleApplyPatch();
      }
    }
  };

  // Отправка патча в API и компиляция
  const handleApplyPatch = async () => {
    if (!isOnline) return;

    try {
      onLogAction(`COMPILER: Сборка абстрактного синтаксического дерева (AST) для [${activeModule.id}]...`, 'SUCCESS');

      await onUpdateSubsystemCode(activeModule.id, activeTabIdx, editableLines);

      setIsModified(false);
      onLogAction(`SYS_PATCH: Хот-фикс успешно инжектирован в рантайм подсистемы [${activeModule.name}]. HMR завершен.`, 'SUCCESS');
    } catch {
      onLogAction(`COMPILER_ERROR: Ошибка компиляции патча кода. Инжекция отменена.`, 'ERROR');
    }
  };

  const handleTogglePower = async () => {
    const nextStatus = activeModule.status === 'online' ? 'offline' : 'online';
    try {
      await onUpdateSubsystem(activeModule.id, {
        status: nextStatus,
        metrics: { ...activeModule.metrics, memory: nextStatus === 'online' ? '4.2MB' : '0.0MB' }
      });
      onLogAction(`API_CALL: Подсистема [${activeModule.name}] переведена в режим [${nextStatus.toUpperCase()}]`, nextStatus === 'online' ? 'SUCCESS' : 'WARN');
    } catch {
      onLogAction(`API_ERROR: Ошибка питания.`, 'ERROR');
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      {/* СЕТКА СИСТЕМНЫХ МЕТРИК */}
      <section className="stats-grid">
        <div className="stat-card">
          <div style={{ flexGrow: 1 }}>
            <span className="stat-label">Total Index Files</span>
            <span className="stat-value cyan">{isOnline ? activeModule.metrics.filesCount : '0'}</span>
          </div>
          <Sparkline value={isOnline ? parseInt(activeModule.metrics.filesCount) : 0} isOnline={isOnline} color="var(--tech-cyan)" />
        </div>

        <div className="stat-card">
          <div style={{ flexGrow: 1 }}>
            <span className="stat-label">Heap Allocation</span>
            <span className="stat-value">{activeModule.metrics.memory}</span>
          </div>
          <Sparkline value={ramNumeric} isOnline={isOnline} color="#38bdf8" />
        </div>

        <div className="stat-card" style={{ borderColor: isOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '10px' }}>
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
          <Sparkline value={isOnline ? loadNumeric : 0} isOnline={isOnline} color={isOnline ? 'var(--status-online)' : 'var(--status-offline)'} />
        </div>
      </section>

      {/* ОСНОВНАЯ ПАНЕЛЬ С ИНЖЕКТОРОМ КОДА */}
      <section className="main-work-panel" style={{ opacity: isOnline ? 1 : 0.4, transition: 'opacity 0.2s', marginTop: '16px' }}>
        <div className="panel-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex' }}>
            {activeModule.tabs.map((tab, idx) => (
              <button
                key={tab.name}
                type="button"
                className={`tab ${activeTabIdx === idx ? 'active' : ''}`}
                disabled={!isOnline}
                onClick={() => onTabChange(idx)}
                style={{ background: 'none', borderTop: 'none', borderLeft: 'none' }}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* ПУЛЬСИРУЮЩАЯ КНОПКА ПРИМЕНЕНИЯ ПАТЧА */}
          {isModified && isOnline && (
            <button
              type="button"
              className="tech-badge"
              onClick={handleApplyPatch}
              style={{
                marginRight: '12px',
                cursor: 'pointer',
                background: 'rgba(56, 189, 248, 0.05)',
                borderColor: 'var(--tech-cyan)',
                color: 'var(--tech-cyan)',
                animation: 'pulse 1.5s infinite',
                fontSize: '10px'
              }}
            >
              [APPLY_PATCH (Ctrl+S)]
            </button>
          )}
        </div>

        <div className="panel-content-view" ref={codeContainerRef}>
          {isOnline ? (
            editableLines.map((line, lineIdx) => (
              <div className="code-line" key={lineIdx}>
                <span className="line-number">{String(lineIdx + 1).padStart(2, '0')}</span>

                {/* ИНТЕРАКТИВНОЕ РЕДАКТИРУЕМОЕ ПОЛЕ СТРОКИ */}
                <div
                  className="code-text"
                  contentEditable={isOnline}
                  suppressContentEditableWarning
                  onBlur={(e) => handleLineChange(lineIdx, e.currentTarget.innerText)}
                  style={{
                    outline: 'none',
                    width: '100%',
                    caretColor: 'var(--tech-cyan)' // Цвет мигающего курсора
                  }}
                >
                  {line}
                </div>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-metrics)', fontFamily: 'JetBrains Mono, monospace', padding: '40px 0' }}>
              <div>&gt;&gt; [CRITICAL]: NO_SIGNAL_DETECTED</div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>SUBSYSTEM_OFFLINE: Изменения заблокированы до инициализации потоков.</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
