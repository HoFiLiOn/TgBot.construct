// ──────────────────────────────────────────────
// Telegram Bot API — HTTP-обёртка (браузерный fetch)
// ──────────────────────────────────────────────

const BASE = 'https://api.telegram.org/bot';

export interface TgUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TgChat {
  id: number;
  type: string;
  title?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface TgMessage {
  message_id: number;
  from?: TgUser;
  chat: TgChat;
  date: number;
  text?: string;
  reply_to_message?: TgMessage;
}

export interface TgCallbackQuery {
  id: string;
  from: TgUser;
  message?: TgMessage;
  data?: string;
}

export interface TgUpdate {
  update_id: number;
  message?: TgMessage;
  callback_query?: TgCallbackQuery;
}

export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export interface ReplyKeyboardButton {
  text: string;
}

export interface ReplyKeyboardMarkup {
  keyboard: ReplyKeyboardButton[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
}

export type ReplyMarkup = InlineKeyboardMarkup | ReplyKeyboardMarkup | { remove_keyboard: true };

export interface SendMessageParams {
  chat_id: number;
  text: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  reply_markup?: ReplyMarkup;
  reply_to_message_id?: number;
}

export interface EditMessageTextParams {
  chat_id: number;
  message_id: number;
  text: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  reply_markup?: InlineKeyboardMarkup;
}

export interface AnswerCallbackQueryParams {
  callback_query_id: string;
  text?: string;
  show_alert?: boolean;
}

export interface TgBotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
}

// ── API клиент ──

export class TelegramAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async call<T>(method: string, params?: Record<string, unknown>): Promise<T> {
    const url = `${BASE}${this.token}/${method}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: params ? JSON.stringify(params) : undefined,
    });
    const json = await res.json();
    if (!json.ok) {
      throw new Error(json.description || `Telegram API error: ${method}`);
    }
    return json.result as T;
  }

  async getMe(): Promise<TgBotInfo> {
    return this.call<TgBotInfo>('getMe');
  }

  async getUpdates(offset?: number, timeout = 30): Promise<TgUpdate[]> {
    return this.call<TgUpdate[]>('getUpdates', {
      offset,
      timeout,
      allowed_updates: ['message', 'callback_query'],
    });
  }

  async sendMessage(params: SendMessageParams): Promise<TgMessage> {
    return this.call<TgMessage>('sendMessage', params as unknown as Record<string, unknown>);
  }

  async editMessageText(params: EditMessageTextParams): Promise<TgMessage | true> {
    return this.call<TgMessage | true>('editMessageText', params as unknown as Record<string, unknown>);
  }

  async answerCallbackQuery(params: AnswerCallbackQueryParams): Promise<boolean> {
    return this.call<boolean>('answerCallbackQuery', params as unknown as Record<string, unknown>);
  }

  async deleteWebhook(): Promise<boolean> {
    return this.call<boolean>('deleteWebhook', { drop_pending_updates: true });
  }
}
