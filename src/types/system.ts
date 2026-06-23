export type SystemStatus = 'online' | 'idle' | 'offline'
export type LogSeverity = 'SUCCESS' | 'WARN' | 'ERROR'
export type ActiveView = 'inspector' | 'kernel_config' | 'editor'

export interface LogEntry {
  time: string
  type: LogSeverity
  msg: string
}

export interface DocumentTab {
  name: string
  type: 'code' | 'text'
  lines: string[]
}

export interface HardwareMetrics {
  time: string
  memory: string
  load: 'low' | 'medium' | 'high'
  filesCount: string
  extra: string
}

export interface SubsystemModule {
  id: string
  name: string
  prefix: string
  status: SystemStatus
  desc: string
  metrics: HardwareMetrics
  tags: string[]
  path: string
  tabs: DocumentTab[]
}
