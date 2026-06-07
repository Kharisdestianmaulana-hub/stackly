import { LogEntry } from '../../src/types/service';

let logs: LogEntry[] = [];
let logCounter = 1;

export function addLog(source: string, level: 'info' | 'warn' | 'error', message: string) {
  const entry: LogEntry = {
    id: String(logCounter++),
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    source,
    level,
    message
  };
  logs.push(entry);
  
  // Keep only last 500 logs in memory for MVP
  if (logs.length > 500) {
    logs.shift();
  }
  
  return entry;
}

export function getLogs(): LogEntry[] {
  return [...logs];
}

export function clearLogs() {
  logs = [];
}
