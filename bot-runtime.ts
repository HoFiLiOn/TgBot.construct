// ──────────────────────────────────────────────
//  Bot Runtime — Long Polling + Роутер + Обработчики
//
//  Telegram API ←→ Long Polling (браузер)
//                        ↓
//                Роутер сообщений
//                        ↓
//           Обработчики (код пользователя)
//                        ↓
//                sendMessage → Telegram API
// ──────────────────────────────────────────────

import {
  TelegramAPI,
  TgUpdate,
  TgMessage,
  TgCallbackQuery,
  TgBotInfo,
  SendMessageParams,
  EditMessageTextParams,
  InlineKeyboardButton,
  InlineKeyboardMarkup,
  ReplyMarkup,
} from './telegram-api';

// ── Типы для пользовательского кода ──

export type LogFn = (msg: string, type?: 'info' | 'error' | 'success') => void;

/** Контекст, передаваемый в каждый обработчик */
export interface HandlerContext {
  /** Оригинальное сообщение */
  message: TgMessage;
  /** Текст сообщения */
  text: string;
  /** chat.id */
  chatId: number;
  /** from user */
  from: TgMessage['from'];
  /** Отправить сообщение */
  reply: (text: string, opts?: { markup?: ReplyMarkup; parse_mode?: string }) => Promise<TgMessage>;
  /** Отправить в любой чат */
  send: (chatId: number, text: string, opts?: { markup?: ReplyMarkup; parse_mode?: string }) => Promise<TgMessage>;
  /** Хранилище (per-user) */
  store: Record<string, unknown>;
  /** Глобальное хранилище */
  globalStore: Record<string, unknown>;
}

/** Контекст для callback_query */
export interface CallbackContext {
  query: TgCallbackQuery;
  data: string;
  chatId: number;
  messageId: number;
  from: TgCallbackQuery['from'];
  /** Ответить alert'ом */
  answer: (text?: string, showAlert?: boolean) => Promise<boolean>;
  /** Отредактировать сообщение */
  editText: (text: string, opts?: { markup?: InlineKeyboardMarkup; parse_mode?: string }) => Promise<unknown>;
  /** Отправить новое сообщение */
  reply: (text: string, opts?: { markup?: ReplyMarkup; parse_mode?: string }) => Promise<TgMessage>;
  /** Хранилище (per-user) */
  store: Record<string, unknown>;
  /** Глобальное хранилище */
  globalStore: Record<string, unknown>;
}

/** Один обработчик команды / текста */
export interface CommandHandler {
  command?: string | string[];
  /** Regex для текста (если не command) */
  match?: RegExp | string;
  /** Ловить весь текст (fallback) */
  fallback?: boolean;
  handler: (ctx: HandlerContext) => void | Promise<void>;
}

/** Обработчик callback_query */
export interface CallbackHandler {
  /** Точное совпадение data */
  data?: string | string[];
  /** Префикс data */
  prefix?: string;
  /** Regex */
  match?: RegExp;
  handler: (ctx: CallbackContext) => void | Promise<void>;
}

/** Описание бота от пользователя */
export interface BotScript {
  handlers: CommandHandler[];
  callbackHandlers: CallbackHandler[];
  onStart?: () => void;
}

// ── Утилиты для создания кнопок ──

export function inlineKeyboard(rows: InlineKeyboardButton[][]): InlineKeyboardMarkup {
  return { inline_keyboard: rows };
}

export function btn(text: string, callbackData: string): InlineKeyboardButton {
  return { text, callback_data: callbackData };
}

export function btnUrl(text: string, url: string): InlineKeyboardButton {
  return { text, url };
}

// ── Runtime ──

export class BotRuntime {
  private api: TelegramAPI;
  private log: LogFn;
  private script: BotScript;
  private running = false;
  private offset = 0;
  private abortController: AbortController | null = null;
  private userStores: Map<number, Record<string, unknown>> = new Map();
  private globalStore: Record<string, unknown> = {};
  public botInfo: TgBotInfo | null = null;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private msgCount = 0;
  private cbCount = 0;
  private startTime = 0;

  constructor(token: string, script: BotScript, log: LogFn) {
    this.api = new TelegramAPI(token);
    this.script = script;
    this.log = log;
  }

  // ── Lifecycle ──

  async start(): Promise<void> {
    if (this.running) return;

    this.log('🔌 Подключение к Telegram API...', 'info');

    try {
      // 1) getMe — проверяем токен
      this.botInfo = await this.api.getMe();
      this.log(`✅ Токен валиден → @${this.botInfo.username} (${this.botInfo.first_name})`, 'success');

      // 2) deleteWebhook — освобождаем long polling
      await this.api.deleteWebhook();
      this.log('🔄 Webhook удалён, переключаемся на Long Polling', 'info');

      // 3) Сбросить pending
      const pending = await this.api.getUpdates(undefined, 0);
      if (pending.length > 0) {
        this.offset = pending[pending.length - 1].update_id + 1;
        this.log(`📨 Пропущено ${pending.length} старых обновлений`, 'info');
      }

      this.running = true;
      this.startTime = Date.now();
      this.msgCount = 0;
      this.cbCount = 0;

      this.log('🚀 Long Polling запущен — бот слушает обновления...', 'success');

      if (this.script.onStart) {
        this.script.onStart();
      }

      // 4) Polling loop
      this.poll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log(`❌ Ошибка запуска: ${msg}`, 'error');
      throw err;
    }
  }

  stop(): void {
    this.running = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    const uptime = this.formatUptime(Date.now() - this.startTime);
    this.log(`⏹ Бот остановлен | Аптайм: ${uptime} | Обработано: ${this.msgCount} сообщ., ${this.cbCount} callback`, 'info');
  }

  isRunning(): boolean {
    return this.running;
  }

  getStats() {
    return {
      messages: this.msgCount,
      callbacks: this.cbCount,
      uptime: this.running ? Date.now() - this.startTime : 0,
      botUsername: this.botInfo?.username || null,
    };
  }

  getDatabase() {
    return {
      users: this.userStores,
      global: this.globalStore,
    };
  }

  // ── Polling ──

  private async poll(): Promise<void> {
    if (!this.running) return;

    try {
      this.abortController = new AbortController();
      const updates = await this.api.getUpdates(this.offset, 25);

      for (const update of updates) {
        this.offset = update.update_id + 1;
        await this.routeUpdate(update);
      }
    } catch (err: unknown) {
      if (!this.running) return;
      const msg = err instanceof Error ? err.message : String(err);
      // Не спамим при обычном abort
      if (!msg.includes('abort')) {
        this.log(`⚠️ Ошибка polling: ${msg}`, 'error');
      }
    }

    if (this.running) {
      // Небольшая пауза перед следующим циклом
      this.pollTimer = setTimeout(() => this.poll(), 300);
    }
  }

  // ── Роутер сообщений ──

  private async routeUpdate(update: TgUpdate): Promise<void> {
    try {
      if (update.message) {
        await this.handleMessage(update.message);
      }
      if (update.callback_query) {
        await this.handleCallback(update.callback_query);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log(`❌ Ошибка обработки update #${update.update_id}: ${msg}`, 'error');
    }
  }

  // ── Message Router ──

  private async handleMessage(message: TgMessage): Promise<void> {
    const text = message.text || '';

    this.msgCount++;

    const userName = message.from?.first_name || 'Unknown';
    const preview = text.length > 40 ? text.slice(0, 40) + '...' : text;
    this.log(`📩 [${userName}] ${preview}`, 'info');

    const ctx = this.buildMessageContext(message);

    // 1) Ищем совпадение по команде
    for (const h of this.script.handlers) {
      if (h.command) {
        const cmds = Array.isArray(h.command) ? h.command : [h.command];
        for (const cmd of cmds) {
          const pattern = cmd.startsWith('/') ? cmd : `/${cmd}`;
          if (text === pattern || text.startsWith(pattern + ' ') || text.startsWith(pattern + '@')) {
            await h.handler(ctx);
            return;
          }
        }
      }
    }

    // 2) Ищем совпадение по match (regex / string)
    for (const h of this.script.handlers) {
      if (h.match && !h.command && !h.fallback) {
        if (typeof h.match === 'string') {
          if (text.toLowerCase().includes(h.match.toLowerCase())) {
            await h.handler(ctx);
            return;
          }
        } else {
          if (h.match.test(text)) {
            await h.handler(ctx);
            return;
          }
        }
      }
    }

    // 3) Fallback
    for (const h of this.script.handlers) {
      if (h.fallback) {
        await h.handler(ctx);
        return;
      }
    }
  }

  // ── Callback Query Router ──

  private async handleCallback(query: TgCallbackQuery): Promise<void> {
    const data = query.data || '';
    this.cbCount++;

    const userName = query.from?.first_name || 'Unknown';
    this.log(`🔘 [${userName}] callback: ${data}`, 'info');

    const ctx = this.buildCallbackContext(query);

    // 1) Точное совпадение
    for (const h of this.script.callbackHandlers) {
      if (h.data) {
        const vals = Array.isArray(h.data) ? h.data : [h.data];
        if (vals.includes(data)) {
          await h.handler(ctx);
          return;
        }
      }
    }

    // 2) Префикс
    for (const h of this.script.callbackHandlers) {
      if (h.prefix && data.startsWith(h.prefix)) {
        await h.handler(ctx);
        return;
      }
    }

    // 3) Regex
    for (const h of this.script.callbackHandlers) {
      if (h.match && h.match.test(data)) {
        await h.handler(ctx);
        return;
      }
    }

    // Если ничего не совпало — просто answer
    try {
      await this.api.answerCallbackQuery({ callback_query_id: query.id });
    } catch { /* ignore */ }
  }

  // ── Контекст-билдеры ──

  private getUserStore(userId: number): Record<string, unknown> {
    if (!this.userStores.has(userId)) {
      this.userStores.set(userId, {});
    }
    return this.userStores.get(userId)!;
  }

  private buildMessageContext(message: TgMessage): HandlerContext {
    const chatId = message.chat.id;
    const userId = message.from?.id || 0;
    const api = this.api;
    const store = this.getUserStore(userId);

    return {
      message,
      text: message.text || '',
      chatId,
      from: message.from,
      store,
      globalStore: this.globalStore,
      reply: (text, opts) => api.sendMessage({
        chat_id: chatId,
        text,
        parse_mode: opts?.parse_mode as SendMessageParams['parse_mode'],
        reply_markup: opts?.markup,
      }),
      send: (targetChatId, text, opts) => api.sendMessage({
        chat_id: targetChatId,
        text,
        parse_mode: opts?.parse_mode as SendMessageParams['parse_mode'],
        reply_markup: opts?.markup,
      }),
    };
  }

  private buildCallbackContext(query: TgCallbackQuery): CallbackContext {
    const chatId = query.message?.chat.id || 0;
    const messageId = query.message?.message_id || 0;
    const userId = query.from.id;
    const api = this.api;
    const store = this.getUserStore(userId);

    return {
      query,
      data: query.data || '',
      chatId,
      messageId,
      from: query.from,
      store,
      globalStore: this.globalStore,
      answer: (text, showAlert) => api.answerCallbackQuery({
        callback_query_id: query.id,
        text,
        show_alert: showAlert,
      }),
      editText: (text, opts) => api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: opts?.parse_mode as EditMessageTextParams['parse_mode'],
        reply_markup: opts?.markup,
      }),
      reply: (text, opts) => api.sendMessage({
        chat_id: chatId,
        text,
        parse_mode: opts?.parse_mode as SendMessageParams['parse_mode'],
        reply_markup: opts?.markup,
      }),
    };
  }

  // ── Helpers ──

  private formatUptime(ms: number): string {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}ч ${m % 60}м`;
    if (m > 0) return `${m}м ${s % 60}с`;
    return `${s}с`;
  }
}
