export interface Bot {
  id: string;
  name: string;
  token: string;
  templateId: string | null;
  customCode: string; // Пользовательский JS код
  status: 'stopped' | 'running' | 'error';
  createdAt: number;
  logs: LogEntry[];
  /** Потраченные тикеты (секунды работы) */
  ticketsUsed: number;
}

export interface LogEntry {
  time: number;
  message: string;
  type: 'info' | 'error' | 'success';
}

export interface UserData {
  oderId: number;
  data: Record<string, unknown>;
}

export interface AppState {
  /** Баланс тикетов (в секундах) */
  tickets: number;
  /** История начислений */
  ticketHistory: TicketTransaction[];
}

export interface TicketTransaction {
  time: number;
  amount: number;
  reason: string;
}
