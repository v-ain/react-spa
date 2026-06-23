import { useState, useEffect, useRef, useMemo } from 'react'
import initialModulesData from './data/modules-payload.json'
import { SubsystemModule, ActiveView, LogEntry } from './types/system'

import { SystemAPI } from './services/api' // Импортируем наше API

import './assets/global.css'
import './assets/style.css'
import './assets/core-matrix.css'
import './assets/header.style.css'
import './assets/panel.style.css'
import './assets/terminal.style.css'
import './assets/stat-card.style.css'
// Импорт изолированных компонентов
import LandingPage from './components/LandingGate'
import Sidebar from './components/Sidebar'
import ModuleInspector from './components/ModuleInspector'
import KernelConfig from './components/KernelConfig'

export default function App() {
  // --- СИСТЕМНЫЕ СОСТОЯНИЯ (STATE) ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [currentView, setCurrentView] = useState<ActiveView>('editor')
  const [modules, setModules] = useState<SubsystemModule[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true) // Стейт загрузки сети
  const [activeModuleId, setActiveModuleId] = useState<string>(initialModulesData[0]?.id || '')
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [cliInput, setCliInput] = useState<string>('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  const [overloadedModuleId, setOverloadedModuleId] = useState<string | null>(null)

  const handleCliSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const command = cliInput.trim().toLowerCase()
    if (!command) return

    const timeStr = new Date().toTimeString().split(' ')

    // Сначала пишем в консоль саму команду, которую ввел пользователь
    let updatedLogs: LogEntry[] = [
      ...globalLogs,
      { time: timeStr[0], type: 'WARN' as const, msg: `USER_EXEC: > ${cliInput}` },
    ]

    setCliInput('') // Очищаем строку ввода

    // Разбираем логику киберпанк-команд
    switch (command) {
      case 'clear':
        // Команда очистки: пишем предупреждение, чистим базу и перезагружаем страницу
        updatedLogs.push({
          time: timeStr[0],
          type: 'SUCCESS' as const,
          msg: 'SYS_PURGE: Запущено уничтожение локального кэша...',
        })
        setGlobalLogs(updatedLogs)
        await SystemAPI.clearCasheSystem()

        setTimeout(() => {
          window.location.reload() // Перезагрузка для чистой инициализации
        }, 800)
        break

      case 'help':
        updatedLogs.push(
          { time: timeStr[0], type: 'SUCCESS' as const, msg: 'HELP_MENU: Доступные директивы ядра:' },
          {
            time: timeStr[0],
            type: 'SUCCESS' as const,
            msg: '  clear               - Полный сброс LocalStorage и перезапуск',
          },
          {
            time: timeStr[0],
            type: 'SUCCESS' as const,
            msg: '  sys_info            - Выгрузить статус аппаратных прерываний',
          },
          {
            time: timeStr[0],
            type: 'SUCCESS' as const,
            msg: '  stress_test <id>    - Симуляция пиковой нагрузки на подсистему',
          },
          {
            time: timeStr[0],
            type: 'SUCCESS' as const,
            msg: '  power_off <id>      - Аварийное отключение подсистемы (offline)',
          }
        )
        setGlobalLogs(updatedLogs)
        await SystemAPI.saveLogs(updatedLogs)
        break

      case 'sys_info':
        const onlineCount = modules.filter((m) => m.status === 'online').length
        updatedLogs.push(
          {
            time: timeStr[0],
            type: 'SUCCESS' as const,
            msg: `SYS_STATUS: Подсистем в сети: [${onlineCount}/${modules.length}]`,
          },
          { time: timeStr[0], type: 'SUCCESS' as const, msg: `SYS_STATUS: Ядро стабильно. Ошибок компиляции TS: 0.` }
        )
        setGlobalLogs(updatedLogs)
        await SystemAPI.saveLogs(updatedLogs)
        break

      default:
        // Обработка параметрических команд
        if (command.startsWith('stress_test ')) {
          const targetId = command.replace('stress_test ', '').trim()
          const targetMod = modules.find((m) => m.id === targetId)

          if (!targetMod) {
            // Исправлено: передаем строку timeStr[0], а не весь массив
            updatedLogs.push({
              time: timeStr[0]!,
              type: 'ERROR' as const,
              msg: `CLI_ERROR: Подсистема [${targetId}] не найдена.`,
            })
          } else if (targetMod.status !== 'online') {
            updatedLogs.push({
              time: timeStr[0]!,
              type: 'WARN' as const,
              msg: `CLI_WARN: Невозможно запустить тест. Подсистема [${targetId}] отключена.`,
            })
          } else {
            // Инициализируем перегрузку
            setOverloadedModuleId(targetId)
            updatedLogs.push(
              {
                time: timeStr[0]!,
                type: 'WARN' as const,
                msg: `ATTENTION: Запущен высокочастотный стресс-тест для [${targetId}]...`,
              },
              {
                time: timeStr[0]!,
                type: 'WARN' as const,
                msg: `WARN_ALERT: Выделение аварийных потоков памяти: +900MB Heap Allocation.`,
              }
            )

            // Таймер автоматического восстановления системы через 5 секунд
            setTimeout(() => {
              setOverloadedModuleId(null) // Снимаем аварийный флаг
              const finishTime = new Date().toTimeString().split(' ')

              setGlobalLogs((prev) => {
                const finalLogs = [
                  ...prev,
                  {
                    time: finishTime[0]!,
                    type: 'SUCCESS' as const,
                    msg: `WATCHDOG: Сработал автоматический предохранитель ядра.`,
                  },
                  {
                    time: finishTime[0]!,
                    type: 'SUCCESS' as const,
                    msg: `SYS_STABLE: Потоки подсистемы [${targetId}] успешно стабилизированы.`,
                  },
                ]
                SystemAPI.saveLogs(finalLogs) // Сохраняем в localStorage стабильное состояние
                return finalLogs
              })
            }, 5000)
          }
          setGlobalLogs(updatedLogs)
          await SystemAPI.saveLogs(updatedLogs)
        }
        // ... ваш прошлый код проверки power_off ...
        else if (command.startsWith('power_off ')) {
          const targetId = command.replace('power_off ', '').trim()
          const exists = modules.some((m) => m.id === targetId)

          if (exists) {
            await handleUpdateSubsystemFields(targetId, {
              status: 'offline',
              metrics: { ...modules.find((m) => m.id === targetId)!.metrics, memory: '0.0MB' },
            })
            updatedLogs.push({
              time: timeStr[0],
              type: 'SUCCESS' as const,
              msg: `CLI_EXEC: Поток [${targetId}] успешно остановлен.`,
            })
          } else {
            updatedLogs.push({
              time: timeStr[0],
              type: 'ERROR' as const,
              msg: `CLI_ERROR: Подсистема [${targetId}] не найдена.`,
            })
          }
        } else {
          updatedLogs.push({
            time: timeStr[0],
            type: 'ERROR' as const,
            msg: `COMMAND_NOT_FOUND: Директива "${command}" не зарегистрирована в ядре. Введите "help".`,
          })
        }
        setGlobalLogs(updatedLogs)
        await SystemAPI.saveLogs(updatedLogs)
        break
    }
  }
  // Глобальный буфер терминальных логов
  const [globalLogs, setGlobalLogs] = useState<LogEntry[]>([])
  // const [globalLogs, setGlobalLogs] = useState<LogEntry[]>([
  //   { time: "19:00:00", type: "SUCCESS", msg: "CORE_KERNEL: Инициализация подсистем..." },
  //   { time: "19:00:02", type: "SUCCESS", msg: "NET_MESH: Все локальные узлы верифицированы." }
  // ]);

  // 1. Загрузка данных через API при инициализации приложения
  useEffect(() => {
    async function bootstrapSystem() {
      try {
        setIsLoading(true)
        const data = await SystemAPI.getSubsystems()
        const savedLogs = await SystemAPI.getLogs()

        setModules(data)
        if (savedLogs.length > 0) {
          setGlobalLogs(savedLogs)
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Критический сбой API ядра:', error)
      }
    }
    bootstrapSystem()
  }, [])

  // 2. Пример функции изменения статуса через интерфейс API
  const handleToggleModule = async (id: string, newStatus: 'online' | 'offline') => {
    // Оптимистичное обновление интерфейса (сразу меняем в стейте для плавности)
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)))

    // Отправляем асинхронный запрос в наше "API"
    await SystemAPI.changeModuleStatus(id, newStatus)

    // Пишем лог о сетевой операции
    const timeStr = new Date().toTimeString().split(' ')[0]
    setGlobalLogs((prev) => {
      const newLogs = [
        ...prev,
        { time: timeStr, type: 'SUCCESS' as const, msg: `API_CALL: Модуль ${id} переведен в ${newStatus}` },
      ]
      SystemAPI.saveLogs(newLogs) // Сохраняем логи в базу
      return newLogs
    })
  }

  // Функция-посредник для обновления полей подсистемы через API и синхронизации стейта React
  const handleUpdateSubsystemFields = async (id: string, updatedFields: Partial<SubsystemModule>) => {
    try {
      // 1. Отправляем запрос в слой API (сохраняем в localStorage)
      await SystemAPI.updateSubsystem(id, updatedFields)

      // 2. Мгновенно обновляем стейт в React, чтобы интерфейс перерисовался
      setModules((prevModules) => prevModules.map((mod) => (mod.id === id ? { ...mod, ...updatedFields } : mod)))
    } catch (error) {
      console.error('Не удалось обновить подсистему через API:', error)
    }
  }

  const handleUpdateSubsystemCode = async (id: string, tabIdx: number, newLines: string[]) => {
    try {
      // 1. Отправляем в наше асинхронное API (запись в localStorage)
      await SystemAPI.updateSubsystemCode(id, tabIdx, newLines)

      // 2. Синхронизируем состояние React
      setModules((prevModules) =>
        prevModules.map((mod) => {
          if (mod.id === id) {
            const updatedTabs = [...mod.tabs]
            if (updatedTabs[tabIdx]) {
              updatedTabs[tabIdx] = { ...updatedTabs[tabIdx]!, lines: newLines }
            }
            return { ...mod, tabs: updatedTabs }
          }
          return mod
        })
      )
    } catch (error) {
      console.error('Не удалось скомпилировать патч кода:', error)
    }
  }

  // Вспомогательная функция для быстрой инжекции логов из дочерних компонентов
  const handleLogSystemAction = (msg: string, type: 'SUCCESS' | 'WARN') => {
    const timeStr = new Date().toTimeString().split(' ')[0]
    setGlobalLogs((prev) => {
      const newLogs = [...prev, { time: timeStr, type, msg }]
      SystemAPI.saveLogs(newLogs) // Сохраняем историю логов в localStorage
      return newLogs
    })
  }
  const logsEndRef = useRef<HTMLDivElement | null>(null)

  // --- МЕМОИЗАЦИЯ И ФИЛЬТРАЦИЯ ДАННЫХ ---
  const activeModule = useMemo(() => {
    return modules.find((m) => m.id === activeModuleId) || modules[0]
  }, [modules, activeModuleId])

  const filteredModules = useMemo(() => {
    return modules.filter((mod) => mod.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [modules, searchQuery])

  // --- ДВИЖОК ЭМУЛЯЦИИ РЕАЛТАЙМ ТЕЛЕМЕТРИИ (КЕШ/ЛОГИ) ---
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      // 1. Симуляция девиации оперативной памяти (±0.2MB)
      setModules((prevModules) =>
        prevModules.map((mod) => {
          if (mod.status === 'online' && mod.metrics.memory !== 'idle') {
            const currentMem = parseFloat(mod.metrics.memory)
            const deviation = Math.random() * 0.4 - 0.2
            const newMem = Math.max(0.5, currentMem + deviation).toFixed(1)
            return {
              ...mod,
              metrics: { ...mod.metrics, memory: `${newMem}MB` },
            }
          }
          return mod
        })
      )

      // 2. Инжекция случайных событий в консоль ядра (шанс 35%)
      if (Math.random() < 0.35) {
        const eventPool: Omit<LogEntry, 'time'>[] = [
          { type: 'SUCCESS', msg: 'BUFFER_STREAM: Пакет данных успешно верифицирован.' },
          { type: 'SUCCESS', msg: 'SYS_OPTIMIZER: Очистка кэша структуры завершена.' },
          { type: 'WARN', msg: 'KERNEL_WATCHDOG: Зафиксирован всплеск сетевой активности.' },
          { type: 'SUCCESS', msg: 'CRYPTO_CHECK: Контрольная сумма SHA-256: OK.' },
        ]

        const randomEvent = eventPool[Math.floor(Math.random() * eventPool.length)]
        const timeStr = new Date().toTimeString().split(' ')[0]

        setGlobalLogs((prev) => [...prev, { time: timeStr, ...randomEvent }])
      }
    }, 2500) // Интервал такта процессора эмуляции

    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Автоматический скролл терминала к последнему логу
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [globalLogs])

  // --- ОТРИСОВКА ИНТЕРФЕЙСА (VIEW LAYER) ---
  if (!isAuthenticated) {
    return <LandingPage onInitializationComplete={() => setIsAuthenticated(true)} />
  }
  if (isLoading) {
    return <div className="loading-screen">{'>'} CONNECTING TO LOCAL_API_CORE...</div>
  }
  return (
    <div className="app-grid-core">
      {/* ЛЕВАЯ КОЛОНКА СЕТКИ (Пропсы полностью синхронизированы с TypeScript) */}
      <Sidebar
        modules={filteredModules}
        activeModuleId={activeModuleId}
        onSelectModule={(id) => {
          setActiveModuleId(id)
          setActiveTabIdx(0)
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      {/* 2. Оверлей (затемнение) появляется, когда сайдбар открыт. Клик по нему закрывает панель */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'is-visible' : ''}`} onClick={closeSidebar} />
      {/* ПРАВАЯ КОЛОНКА СЕТКИ (РЕЗИНОВАЯ: 1fr) */}
      <main className="main-content">
        {/* МОНОЛИТНАЯ ШАПКА СИСТЕМЫ */}
        <header className="content-header">
          <div className="active-module-info">
            <div className="module-path">
              {currentView === 'editor' ? (
                <>
                  ROOT // CORE // <span>{activeModule.name}</span>
                </>
              ) : (
                <>
                  ROOT // SYSTEM // <span>KERNEL_CONFIG</span>
                </>
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

          {/* Кнопка-бургер. На десктопе мы скроем её через CSS */}
          <button className="burger-btn" onClick={toggleSidebar} aria-label="Открыть меню">
            <span className="burger-line"></span>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
          </button>
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
              onUpdateSubsystem={handleUpdateSubsystemFields}
              onUpdateSubsystemCode={handleUpdateSubsystemCode} // Наш новый проп!
              onLogAction={handleLogSystemAction}
              overloadedModuleId={overloadedModuleId}
            />
          ) : (
            <KernelConfig
              subsystems={modules} // Передаем актуальный стейт подсистем
              onUpdateSubsystem={handleUpdateSubsystemFields} // Передаем триггер API-обновления
              onLogAction={handleLogSystemAction} // Передаем логгер
              overloadedModuleId={overloadedModuleId}
            />
          )}

          {/* КОНСОЛЬ ТЕРМИНАЛА (ЖИВЫЕ СИСТЕМНЫЕ ЛОГИ) */}
          <footer className="terminal-logs">
            {/* Область вывода строк логов */}
            <div className="logs-scroller" style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '8px' }}>
              {globalLogs.map((log, idx) => (
                <div className="log-row" key={idx}>
                  <span className="log-time">[{log.time}]</span>
                  <span
                    className={`log-type ${log.type === 'SUCCESS' ? 'success' : log.type === 'ERROR' ? 'error' : ''}`}
                  >
                    [{log.type}]
                  </span>
                  <span className="log-msg">{log.msg}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>

            {/* ИНТЕРАКТИВНАЯ СТРОКА ВВОДА CLI */}
            <form
              onSubmit={handleCliSubmit}
              className="cli-form"
              style={{
                display: 'flex',
                alignItems: 'center',
                borderTop: '1px dashed var(--border-color)',
                paddingTop: '6px',
              }}
            >
              <span
                className="cli-prompt"
                style={{
                  color: 'var(--tech-cyan)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  marginRight: '8px',
                  userSelect: 'none',
                }}
              >
                core_kernel@root:&gt;
              </span>
              <input
                type="text"
                className="cli-input"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                placeholder="Type 'help' for available directives..."
                autoComplete="off"
                style={{
                  flexGrow: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                }}
              />
            </form>
          </footer>
        </div>
      </main>
    </div>
  )
}
