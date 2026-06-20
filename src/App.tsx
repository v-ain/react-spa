import { useState, useEffect, useRef, useMemo } from 'react';
import initialModulesData from './data/modules-payload.json';
import { SubsystemModule, ActiveView, LogEntry } from './types/system';

import { SystemAPI } from './services/api'; // Импортируем наше API

import './assets/core-matrix.css'
import './assets/header.style.css'
import './assets/global.css'
import './assets/style.css'
import './assets/panel.style.css'
// Импорт изолированных компонентов
import LandingPage from './components/LandingGate';
import Sidebar from './components/Sidebar';
import ModuleInspector from './components/ModuleInspector';
import KernelConfig from './components/KernelConfig';

export default function App() {
  // --- СИСТЕМНЫЕ СОСТОЯНИЯ (STATE) ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ActiveView>('editor');
  const [modules, setModules] = useState<SubsystemModule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Стейт загрузки сети
  const [activeModuleId, setActiveModuleId] = useState<string>(initialModulesData[0]?.id || '');
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Глобальный буфер терминальных логов
  const [globalLogs, setGlobalLogs] = useState<LogEntry[]>([]);
  // const [globalLogs, setGlobalLogs] = useState<LogEntry[]>([
  //   { time: "19:00:00", type: "SUCCESS", msg: "CORE_KERNEL: Инициализация подсистем..." },
  //   { time: "19:00:02", type: "SUCCESS", msg: "NET_MESH: Все локальные узлы верифицированы." }
  // ]);

  // 1. Загрузка данных через API при инициализации приложения
  useEffect(() => {
    async function bootstrapSystem() {
      try {
        setIsLoading(true);
        const data = await SystemAPI.getSubsystems();
        const savedLogs = await SystemAPI.getLogs();

        setModules(data);
        if (savedLogs.length > 0) {
          setGlobalLogs(savedLogs);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Критический сбой API ядра:", error);
      }
    }
    bootstrapSystem();
  }, []);


  // 2. Пример функции изменения статуса через интерфейс API
  const handleToggleModule = async (id: string, newStatus: 'online' | 'offline') => {
    // Оптимистичное обновление интерфейса (сразу меняем в стейте для плавности)
    setModules(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));

    // Отправляем асинхронный запрос в наше "API"
    await SystemAPI.changeModuleStatus(id, newStatus);

    // Пишем лог о сетевой операции
    const timeStr = new Date().toTimeString().split(' ')[0];
    setGlobalLogs(prev => {
      const newLogs = [...prev, { time: timeStr, type: 'SUCCESS' as const, msg: `API_CALL: Модуль ${id} переведен в ${newStatus}` }];
      SystemAPI.saveLogs(newLogs); // Сохраняем логи в базу
      return newLogs;
    });
  };

  // Функция-посредник для обновления полей подсистемы через API и синхронизации стейта React
  const handleUpdateSubsystemFields = async (id: string, updatedFields: Partial<SubsystemModule>) => {
    try {
      // 1. Отправляем запрос в слой API (сохраняем в localStorage)
      await SystemAPI.updateSubsystem(id, updatedFields);

      // 2. Мгновенно обновляем стейт в React, чтобы интерфейс перерисовался
      setModules(prevModules =>
        prevModules.map(mod => mod.id === id ? { ...mod, ...updatedFields } : mod)
      );
    } catch (error) {
      console.error("Не удалось обновить подсистему через API:", error);
    }
  };

  // Вспомогательная функция для быстрой инжекции логов из дочерних компонентов
  const handleLogSystemAction = (msg: string, type: 'SUCCESS' | 'WARN') => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setGlobalLogs(prev => {
      const newLogs = [...prev, { time: timeStr, type, msg }];
      SystemAPI.saveLogs(newLogs); // Сохраняем историю логов в localStorage
      return newLogs;
    });
  };
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  // --- МЕМОИЗАЦИЯ И ФИЛЬТРАЦИЯ ДАННЫХ ---
  const activeModule = useMemo(() => {
    return modules.find(m => m.id === activeModuleId) || modules[0];
  }, [modules, activeModuleId]);

  const filteredModules = useMemo(() => {
    return modules.filter(mod =>
      mod.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [modules, searchQuery]);

  // --- ДВИЖОК ЭМУЛЯЦИИ РЕАЛТАЙМ ТЕЛЕМЕТРИИ (КЕШ/ЛОГИ) ---
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      // 1. Симуляция девиации оперативной памяти (±0.2MB)
      setModules(prevModules =>
        prevModules.map(mod => {
          if (mod.status === 'online' && mod.metrics.memory !== 'idle') {
            const currentMem = parseFloat(mod.metrics.memory);
            const deviation = (Math.random() * 0.4 - 0.2);
            const newMem = Math.max(0.5, currentMem + deviation).toFixed(1);
            return {
              ...mod,
              metrics: { ...mod.metrics, memory: `${newMem}MB` }
            };
          }
          return mod;
        })
      );

      // 2. Инжекция случайных событий в консоль ядра (шанс 35%)
      if (Math.random() < 0.35) {
        const eventPool: Omit<LogEntry, 'time'>[] = [
          { type: "SUCCESS", msg: "BUFFER_STREAM: Пакет данных успешно верифицирован." },
          { type: "SUCCESS", msg: "SYS_OPTIMIZER: Очистка кэша структуры завершена." },
          { type: "WARN", msg: "KERNEL_WATCHDOG: Зафиксирован всплеск сетевой активности." },
          { type: "SUCCESS", msg: "CRYPTO_CHECK: Контрольная сумма SHA-256: OK." }
        ];

        const randomEvent = eventPool[Math.floor(Math.random() * eventPool.length)];
        const timeStr = new Date().toTimeString().split(' ')[0];

        setGlobalLogs(prev => [...prev, { time: timeStr, ...randomEvent }]);
      }
    }, 2500); // Интервал такта процессора эмуляции

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Автоматический скролл терминала к последнему логу
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [globalLogs]);

  // --- ОТРИСОВКА ИНТЕРФЕЙСА (VIEW LAYER) ---
  if (!isAuthenticated) {
    return <LandingPage onInitializationComplete={() => setIsAuthenticated(true)} />;
  }
  if (isLoading) {
    return <div className="loading-screen">{">"} CONNECTING TO LOCAL_API_CORE...</div>;
  }
  return (
    <div className="app-grid-core">

      {/* ЛЕВАЯ КОЛОНКА СЕТКИ (Пропсы полностью синхронизированы с TypeScript) */}
      <Sidebar
        modules={filteredModules}
        activeModuleId={activeModuleId}
        onSelectModule={(id) => { setActiveModuleId(id); setActiveTabIdx(0); }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* ПРАВАЯ КОЛОНКА СЕТКИ (РЕЗИНОВАЯ: 1fr) */}
      <main className="main-content">

        {/* МОНОЛИТНАЯ ШАПКА СИСТЕМЫ */}
        <header className="content-header">
          <div className="active-module-info">
            <div className="module-path">
              {currentView === 'editor' ? (
                <>ROOT // CORE // <span>{activeModule.name}</span></>
              ) : (
                <>ROOT // SYSTEM // <span>KERNEL_CONFIG</span></>
              )}
            </div>
          </div>

          {/* ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМОВ ОТОБРАЖЕНИЯ */}
          <nav className="header-nav">
            <button
              className={`nav-btn ${currentView === 'editor' ? 'active' : ''}`}
              onClick={() => setCurrentView('editor')}
            >
              Module_Inspector
            </button>
            <button
              className={`nav-btn ${currentView === 'config' ? 'active' : ''}`}
              onClick={() => setCurrentView('config')}
            >
              Kernel_Settings
            </button>
          </nav>

          <div className="tech-badge" style={{ borderColor: 'rgba(34, 197, 94, 0.3)', color: 'var(--status-online)' }}>
            SECURE_CONNECTION: OK
          </div>
        </header>

        {/* ОСНОВНОЙ РАБОЧИЙ КОНТЕЙНЕР */}
        <div className="workspace-body">

          {/* ДИНАМИЧЕСКИЙ КОМПОНЕНТ (ИНСПЕКТОР ИЛИ НАСТРОЙКИ ЯДРА) */}
          {currentView === 'editor' ? (
            <ModuleInspector
              activeModule={activeModule}
              activeTabIdx={activeTabIdx}
              onTabChange={setActiveTabIdx}
              onUpdateSubsystem={handleUpdateSubsystemFields} // Тот же самый метод, что использует KernelConfig!
              onLogAction={handleLogSystemAction} // Тот же сквозной логгер
            />
          ) : (
            <KernelConfig
              subsystems={modules} // Передаем актуальный стейт подсистем
              onUpdateSubsystem={handleUpdateSubsystemFields} // Передаем триггер API-обновления
              onLogAction={handleLogSystemAction} // Передаем логгер
            />
          )}

          {/* КОНСОЛЬ ТЕРМИНАЛА (ЖИВЫЕ СИСТЕМНЫЕ ЛОГИ) */}
          <footer className="terminal-logs">
            {globalLogs.map((log, idx) => (
              <div className="log-row" key={idx}>
                <span className="log-time">[{log.time}]</span>
                <span className={`log-type ${log.type === 'SUCCESS' ? 'success' : ''}`}>
                  [{log.type}]
                </span>
                <span className="log-msg">{log.msg}</span>
              </div>
            ))}
            {/* Якорь для авто-скролла */}
            <div ref={logsEndRef} />
          </footer>

        </div>
      </main>
    </div>
  );
}
