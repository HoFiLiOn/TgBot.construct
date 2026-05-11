import { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, LogEntry } from '../types';
import { BotRuntime, BotScript } from '../engine/bot-runtime';
import { templates } from '../data/templates';
import { parseUserCode, DEFAULT_CODE } from '../engine/code-parser';

const STORAGE_KEY = 'tgbot_bots_v3';
const MAX_BOTS = 5;

function loadBots(): Bot[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Bot[];
    // Reset statuses on page reload
    return parsed.map(b => ({ ...b, status: 'stopped' as const, logs: [] }));
  } catch {
    return [];
  }
}

function saveBots(bots: Bot[]) {
  const toSave = bots.map(b => ({ ...b, logs: [] }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

export interface BotRuntimeData {
  runtime: BotRuntime;
  tickInterval: ReturnType<typeof setInterval> | null;
}

export function useBots(onTickConsume?: () => boolean) {
  const [bots, setBots] = useState<Bot[]>(loadBots);
  const runtimesRef = useRef<Map<string, BotRuntimeData>>(new Map());

  useEffect(() => {
    saveBots(bots);
  }, [bots]);

  useEffect(() => {
    return () => {
      runtimesRef.current.forEach(({ runtime, tickInterval }) => {
        runtime.stop();
        if (tickInterval) clearInterval(tickInterval);
      });
      runtimesRef.current.clear();
    };
  }, []);

  const addLog = useCallback((id: string, message: string, type: LogEntry['type'] = 'info') => {
    setBots(prev => prev.map(b => {
      if (b.id !== id) return b;
      const newLog: LogEntry = { time: Date.now(), message, type };
      return { ...b, logs: [...b.logs.slice(-99), newLog] };
    }));
  }, []);

  const addBot = useCallback((name: string, token: string, templateId: string | null, customCode?: string): Bot | null => {
    if (bots.length >= MAX_BOTS) return null;

    const code = customCode || (templateId ? '' : DEFAULT_CODE);

    const newBot: Bot = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name,
      token,
      templateId,
      customCode: code,
      status: 'stopped',
      createdAt: Date.now(),
      logs: [],
      ticketsUsed: 0,
    };

    setBots(prev => [...prev, newBot]);
    return newBot;
  }, [bots.length]);

  const updateBot = useCallback((id: string, updates: Partial<Bot>) => {
    setBots(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const deleteBot = useCallback((id: string) => {
    const data = runtimesRef.current.get(id);
    if (data) {
      data.runtime.stop();
      if (data.tickInterval) clearInterval(data.tickInterval);
      runtimesRef.current.delete(id);
    }
    setBots(prev => prev.filter(b => b.id !== id));
  }, []);

  const startBot = useCallback(async (id: string) => {
    const bot = bots.find(b => b.id === id);
    if (!bot) return;

    if (runtimesRef.current.has(id)) {
      addLog(id, '⚠️ Бот уже запущен', 'info');
      return;
    }

    if (!bot.token || bot.token.trim().length < 10) {
      addLog(id, '❌ Некорректный токен бота', 'error');
      updateBot(id, { status: 'error' });
      return;
    }

    // Build script
    let script: BotScript;
    
    if (bot.templateId && !bot.customCode) {
      // Используем встроенный шаблон
      const tmpl = templates.find(t => t.id === bot.templateId);
      if (!tmpl) {
        addLog(id, '❌ Шаблон не найден', 'error');
        updateBot(id, { status: 'error' });
        return;
      }
      script = tmpl.buildScript();
    } else if (bot.customCode) {
      // Парсим пользовательский код
      try {
        script = parseUserCode(bot.customCode);
        addLog(id, '✅ Код скомпилирован успешно', 'success');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        addLog(id, `❌ Ошибка в коде: ${msg}`, 'error');
        updateBot(id, { status: 'error' });
        return;
      }
    } else {
      // Пустой бот — echo
      script = {
        handlers: [
          { command: '/start', handler: async (ctx) => { await ctx.reply('👋 Бот запущен!'); } },
          { fallback: true, handler: async (ctx) => { await ctx.reply(`🔊 ${ctx.text}`); } },
        ],
        callbackHandlers: [],
      };
    }

    const logFn = (msg: string, type: LogEntry['type'] = 'info') => {
      addLog(id, msg, type);
    };

    const runtime = new BotRuntime(bot.token, script, logFn);
    
    // Интервал потребления тикетов (каждую секунду)
    const tickInterval = setInterval(() => {
      if (onTickConsume && !onTickConsume()) {
        // Тикеты кончились — останавливаем бота
        addLog(id, '⏱ Тикеты закончились! Бот остановлен.', 'error');
        stopBot(id);
      } else {
        // Увеличиваем счётчик использованных тикетов
        setBots(prev => prev.map(b => 
          b.id === id ? { ...b, ticketsUsed: b.ticketsUsed + 1 } : b
        ));
      }
    }, 1000);

    runtimesRef.current.set(id, { runtime, tickInterval });
    updateBot(id, { status: 'running' });

    try {
      await runtime.start();
    } catch {
      const data = runtimesRef.current.get(id);
      if (data?.tickInterval) clearInterval(data.tickInterval);
      runtimesRef.current.delete(id);
      updateBot(id, { status: 'error' });
    }
  }, [bots, addLog, updateBot, onTickConsume]);

  const stopBot = useCallback((id: string) => {
    const data = runtimesRef.current.get(id);
    if (data) {
      data.runtime.stop();
      if (data.tickInterval) clearInterval(data.tickInterval);
      runtimesRef.current.delete(id);
    }
    updateBot(id, { status: 'stopped' });
  }, [updateBot]);

  const restartBot = useCallback(async (id: string) => {
    stopBot(id);
    await new Promise(r => setTimeout(r, 600));
    await startBot(id);
  }, [stopBot, startBot]);

  const getRuntimeStats = useCallback((id: string) => {
    const data = runtimesRef.current.get(id);
    return data?.runtime.getStats() || null;
  }, []);

  const getRuntimeDatabase = useCallback((id: string): { users: Map<number, Record<string, unknown>>; global: Record<string, unknown> } | null => {
    const data = runtimesRef.current.get(id);
    if (!data) return null;
    return data.runtime.getDatabase();
  }, []);

  const canAddMore = bots.length < MAX_BOTS;

  return {
    bots,
    addBot,
    updateBot,
    deleteBot,
    startBot,
    stopBot,
    restartBot,
    addLog,
    canAddMore,
    maxBots: MAX_BOTS,
    getRuntimeStats,
    getRuntimeDatabase,
  };
}
