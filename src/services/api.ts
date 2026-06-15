import { SubsystemModule, LogEntry, SystemStatus } from '../types/system';
import initialModulesData from '../data/modules-payload.json';

const STORAGE_KEY = 'cyber_kernel_subsystems';
const LOGS_KEY = 'cyber_kernel_logs';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const SystemAPI = {
  // Инициализация локальной "БД"
  init(): void {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialModulesData));
    }
  },

  // Получить все подсистемы (Типизировано вашим SubsystemModule[])
  async getSubsystems(): Promise<SubsystemModule[]> {
    await delay(250);
    this.init();
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Обновить конкретную подсистему (например, ползунком или тумблером)
  async updateSubsystem(id: string, fields: Partial<SubsystemModule>): Promise<SubsystemModule> {
    await delay(150);
    const list = await this.getSubsystems();

    const updatedList = list.map(item => item.id === id ? { ...item, ...fields } : item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    const target = updatedList.find(item => item.id === id);
    if (!target) throw new Error(`Subsystem [${id}] не найдена в реестре ядра.`);
    return target;
  },

  // Быстрое изменение статуса подсистемы с помощью вашего типа SystemStatus
  async setStatus(id: string, status: SystemStatus): Promise<SubsystemModule> {
    return this.updateSubsystem(id, { status });
  },

  // Сохранить логи сессии
  async saveLogs(logs: LogEntry[]): Promise<void> {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  },

  // Загрузить логи сессии
  async getLogs(): Promise<LogEntry[]> {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async clearCasheSystem(): Promise<void> {
    await delay(400); // Имитируем очистку секторов диска
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LOGS_KEY);
  }
};
