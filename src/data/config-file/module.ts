// Тип для статуса модуля
export type ModuleStatus = 'online' | 'idle' | 'offline';

// Тип для строк лога
export interface LogEntry {
  time: string;
  type: 'SUCCESS' | 'WARN' | 'ERROR';
  msg: string;
}

// Структура вкладки (файла) внутри модуля
export interface ModuleTab {
  name: string;
  type: 'code' | 'text';
  lines: string[];
}

// Метрики производительности
export interface ModuleMetrics {
  time: string;
  memory: string;
  load: 'low' | 'medium' | 'high';
  filesCount: string;
  extra: string;
}

// Главный интерфейс Системного Модуля
export interface SystemModule {
  id: string;
  name: string;
  prefix: string;
  status: ModuleStatus;
  desc: string;
  metrics: ModuleMetrics;
  tags: string[];
  path: string;
  tabs: ModuleTab[];
  logs: LogEntry[];
}

// Режимы отображения основного экрана
export type ActiveView = 'editor' | 'config';

