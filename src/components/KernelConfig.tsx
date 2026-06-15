import React, { useState } from 'react';
import { SubsystemModule } from '../types/system';
import TopologyMap from './ui/TopologyMap';

// Контракт входящих параметров (Props)
interface KernelConfigProps {
  subsystems: SubsystemModule[];
  onUpdateSubsystem: (id: string, updatedFields: Partial<SubsystemModule>) => Promise<void>;
  onLogAction: (msg: string, type: 'SUCCESS' | 'WARN') => void;
  overloadedModuleId: string | null; // Добавили проп перегрузки
}

export default function KernelConfig({ subsystems, onUpdateSubsystem, onLogAction, overloadedModuleId }: KernelConfigProps) {
  // Глобальные настройки ядра (Лимиты), которые мы тоже можем крутить
  const [maxRam, setMaxRam] = useState<number>(512);
  const [tickRate, setTickRate] = useState<number>(2500);

  // Состояния для тумблеров-переключателей
  const [isIsolated, setIsIsolated] = useState<boolean>(true);
  const [isVerbose, setIsVerbose] = useState<boolean>(false);

  // Обработчик изменения ползунка системного тика
  const handleTickRateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseInt(e.target.value);
    setTickRate(newRate);
    onLogAction(`CORE_KERNEL: Частота такта процессора эмуляции изменена на ${newRate}ms`, 'SUCCESS');
    // В реальной системе здесь также шел бы вызов к API: await SystemAPI.updateGlobalConfig(...)
  };

  // Обработчик ручного изменения лимита RAM для конкретной подсистемы через таблицу/интерфейс
  const handleSubsystemRamChange = async (id: string, currentMem: string, event: React.MouseEvent) => {
    event.preventDefault();
    // Имитируем "выделение дополнительной памяти" модулю на +2.0 MB по клику
    const currentNum = parseFloat(currentMem);
    const newMem = `${(currentNum + 2.0).toFixed(1)}MB`;

    try {
      await onUpdateSubsystem(id, {
        metrics: {
          ...subsystems.find(s => s.id === id)!.metrics,
          memory: newMem
        }
      });
      onLogAction(`API_CALL: Для подсистемы [${id}] успешно выделен дополнительный пул памяти: ${newMem}`, 'SUCCESS');
    } catch (error) {
      onLogAction(`API_ERROR: Ошибка выделения памяти для подсистемы [${id}]`, 'WARN');
    }
  };

  return (
    <div className="config-workspace">

      {/* ЛЕВАЯ ЧАСТЬ: УПРАВЛЕНИЕ ПАРАМЕТРАМИ ЯДРА */}
      <div className="config-panel">
        <h2 className="panel-section-title">Core Resource Allocator</h2>

        {/* Ползунок 1: Глобальный лимит RAM */}
        <div className="control-group">
          <div className="control-label-row">
            <span>MAX_MEMORY_POOL_LIMIT</span>
            <span className="control-value">{maxRam} MB</span>
          </div>
          <input
            type="range"
            className="tech-slider"
            min="128"
            max="1024"
            value={maxRam}
            onChange={(e) => setMaxRam(parseInt(e.target.value))}
            onMouseUp={() => onLogAction(`CORE_KERNEL: Глобальный лимит RAM переведен на отметку ${maxRam}MB`, 'SUCCESS')}
          />
        </div>

        {/* Ползунок 2: Частота тика системы */}
        <div className="control-group">
          <div className="control-label-row">
            <span>SYSTEM_TICK_RATE (POLLING)</span>
            <span className="control-value">{tickRate} ms</span>
          </div>
          <input
            type="range"
            className="tech-slider"
            min="500"
            max="5000"
            step="500"
            value={tickRate}
            onChange={handleTickRateChange}
          />
        </div>

        <h2 className="panel-section-title" style={{ marginTop: '10px' }}>Security Protocols & Toggles</h2>

        {/* Тумблер 1: Изоляция потоков */}
        <div className="toggle-row">
          <div className="toggle-info">
            <span className="toggle-title">Thread Isolation Mode</span>
            <span className="toggle-desc">Запуск каждого модуля в изолированной песочнице</span>
          </div>
          <button
            type="button"
            className="tech-badge"
            style={{
              cursor: 'pointer',
              background: 'none',
              borderColor: isIsolated ? 'var(--status-online)' : 'var(--text-metrics)',
              color: isIsolated ? 'var(--status-online)' : 'var(--text-muted)'
            }}
            onClick={() => {
              setIsIsolated(!isIsolated);
              onLogAction(`SECURITY: Протокол Thread Isolation Mode переведен в статус [${!isIsolated ? 'ENABLED' : 'DISABLED'}]`, !isIsolated ? 'SUCCESS' : 'WARN');
            }}
          >
            {isIsolated ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* Тумблер 2: Расширенные логи */}
        <div className="toggle-row">
          <div className="toggle-info">
            <span className="toggle-title">Verbose Log Injection</span>
            <span className="toggle-desc">Детальный вывод отладочной информации в консоль логов</span>
          </div>
          <button
            type="button"
            className="tech-badge"
            style={{
              cursor: 'pointer',
              background: 'none',
              borderColor: isVerbose ? 'var(--status-online)' : 'var(--text-metrics)',
              color: isVerbose ? 'var(--status-online)' : 'var(--text-muted)'
            }}
            onClick={() => {
              setIsVerbose(!isVerbose);
              onLogAction(`CORE_KERNEL: Протокол Verbose Log Injection переведен в статус [${!isVerbose ? 'ENABLED' : 'DISABLED'}]`, !isVerbose ? 'SUCCESS' : 'WARN');
            }}
          >
            {isVerbose ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: ДИНАМИЧЕСКИЙ МОНИТОРИНГ ИЗ LOCALSTORAGE */}
      <div className="config-panel">
        <h2 className="panel-section-title">Cluster Dependency Mapping</h2>

        {/* Системная таблица подсистем */}
        <table className="tech-table">
          <thead>
            <tr>
              <th>SUBSYSTEM_ID</th>
              <th>ALLOC_RAM</th>
              <th>CPU_LOAD</th>
              <th>INTEGRITY</th>
            </tr>
          </thead>
          <tbody>
            {subsystems.map((mod) => (
              <tr key={mod.id}>
                <td style={{ color: 'var(--tech-cyan)' }}>{mod.id}</td>
                <td
                  onClick={(e) => handleSubsystemRamChange(mod.id, mod.metrics.memory, e)}
                  style={{ cursor: 'pointer', textDecoration: 'underline rgba(56, 189, 248, 0.2)' }}
                  title="Кликните, чтобы выделить +2MB"
                >
                  {mod.metrics.memory}
                </td>
                <td style={{ color: mod.metrics.load === 'high' ? 'var(--status-idle)' : 'var(--text-primary)' }}>
                  {mod.metrics.load === 'high' ? '14.5%' : mod.metrics.load === 'medium' ? '4.1%' : '0.8%'}
                </td>
                <td>
                  <span className="badge-status-ok" style={{
                    color: mod.status === 'online' ? 'var(--status-online)' : 'var(--status-idle)',
                    borderColor: mod.status === 'online' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)'
                  }}>
                    {mod.status === 'online' ? '99.8%' : '0.0% (IDLE)'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* ВСТАВЛЯЕМ ЖИВУЮ КАРТУ СЕТИ СЮДА */}
        <div style={{ marginTop: '20px', flexGrow: 1 }}>
          <TopologyMap
            subsystems={subsystems}
            overloadedModuleId={overloadedModuleId}
            onNodeClick={(id) => onLogAction(`MESH_QUERY: Запрос сетевых пакетов узла [${id}] -> Статус шины: STABLE. Пинг: 12ms.`, 'SUCCESS')}
          />
        </div>
        {/* Блок системного статуса ядра */}
        <div style={{ marginTop: 'auto', padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            KERNEL_INTEGRITY_LOG:
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--status-online)' }}>
            &gt;&gt; Инициализировано подсистем: {subsystems.filter(s => s.status === 'online').length} / {subsystems.length}
            <br />&gt;&gt; База данных LocalStorage активна. Hot Dynamic Linked: OK.
          </div>
        </div>
      </div>

    </div>
  );
}
