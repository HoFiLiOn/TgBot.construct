// ──────────────────────────────────────────────
// Парсер пользовательского кода → BotScript
// ──────────────────────────────────────────────

import { BotScript, CommandHandler, CallbackHandler, HandlerContext, CallbackContext, btn, inlineKeyboard } from './bot-runtime';

/**
 * DSL для написания ботов:
 * 
 * // Команда
 * bot.command('/start', async (ctx) => {
 *   await ctx.reply('Привет!', {
 *     markup: keyboard([[btn('Кнопка', 'click')]])
 *   });
 * });
 * 
 * // Callback
 * bot.callback('click', async (ctx) => {
 *   await ctx.answer('Нажато!');
 * });
 * 
 * // Callback по префиксу
 * bot.callbackPrefix('item_', async (ctx) => {
 *   const id = ctx.data.replace('item_', '');
 *   await ctx.editText(`Выбрано: ${id}`);
 * });
 * 
 * // Текст (fallback)
 * bot.text(async (ctx) => {
 *   await ctx.reply(`Вы сказали: ${ctx.text}`);
 * });
 * 
 * // Regex
 * bot.match(/привет/i, async (ctx) => {
 *   await ctx.reply('Привет-привет!');
 * });
 */

export interface BotBuilder {
  command: (cmd: string | string[], handler: (ctx: HandlerContext) => void | Promise<void>) => void;
  text: (handler: (ctx: HandlerContext) => void | Promise<void>) => void;
  match: (pattern: RegExp | string, handler: (ctx: HandlerContext) => void | Promise<void>) => void;
  callback: (data: string | string[], handler: (ctx: CallbackContext) => void | Promise<void>) => void;
  callbackPrefix: (prefix: string, handler: (ctx: CallbackContext) => void | Promise<void>) => void;
  callbackMatch: (pattern: RegExp, handler: (ctx: CallbackContext) => void | Promise<void>) => void;
}

export function parseUserCode(code: string): BotScript {
  const handlers: CommandHandler[] = [];
  const callbackHandlers: CallbackHandler[] = [];

  const bot: BotBuilder = {
    command: (cmd, handler) => {
      handlers.push({ command: cmd, handler });
    },
    text: (handler) => {
      handlers.push({ fallback: true, handler });
    },
    match: (pattern, handler) => {
      handlers.push({ match: pattern, handler });
    },
    callback: (data, handler) => {
      callbackHandlers.push({ data, handler });
    },
    callbackPrefix: (prefix, handler) => {
      callbackHandlers.push({ prefix, handler });
    },
    callbackMatch: (pattern, handler) => {
      callbackHandlers.push({ match: pattern, handler });
    },
  };

  // Создаём функцию с доступом к bot, btn, keyboard
  const fn = new Function('bot', 'btn', 'keyboard', code);
  
  try {
    fn(bot, btn, inlineKeyboard);
  } catch (err) {
    console.error('Code parse error:', err);
    throw err;
  }

  return { handlers, callbackHandlers };
}

// Пример кода для шаблона
export const DEFAULT_CODE = `// 🤖 TG Bot Construct — Ваш код бота
// Доступные функции: bot.command, bot.callback, bot.callbackPrefix, bot.text, bot.match
// Утилиты: btn(text, data), keyboard([[btn1, btn2], [btn3]])

// Команда /start
bot.command('/start', async (ctx) => {
  await ctx.reply('👋 Привет! Я ваш бот.\\n\\nНапишите что-нибудь!', {
    markup: keyboard([
      [btn('📊 Статус', 'status'), btn('ℹ️ Инфо', 'info')],
      [btn('🎲 Рандом', 'random')]
    ])
  });
});

// Команда /help
bot.command('/help', async (ctx) => {
  await ctx.reply('📚 Команды:\\n/start — начало\\n/help — помощь');
});

// Callback: status
bot.callback('status', async (ctx) => {
  await ctx.answer('✅ Бот работает!');
  await ctx.editText('✅ Статус: Online\\n⏱ Аптайм: работает');
});

// Callback: info
bot.callback('info', async (ctx) => {
  await ctx.answer();
  await ctx.editText(\`👤 Ваш ID: \${ctx.from.id}\\n📝 Имя: \${ctx.from.first_name}\`);
});

// Callback: random
bot.callback('random', async (ctx) => {
  const num = Math.floor(Math.random() * 100) + 1;
  await ctx.answer(\`🎲 Выпало: \${num}\`);
});

// Любой текст (fallback)
bot.text(async (ctx) => {
  await ctx.reply(\`🔊 Вы написали: \${ctx.text}\`);
});
`;

export const EXAMPLE_CODES: Record<string, string> = {
  echo: `// Простой эхо-бот
bot.command('/start', async (ctx) => {
  await ctx.reply('👋 Привет! Я повторяю всё, что вы пишете.');
});

bot.text(async (ctx) => {
  await ctx.reply('🔊 ' + ctx.text);
});
`,

  coinflip: `// Орёл и Решка
bot.command('/start', async (ctx) => {
  await ctx.reply('🪙 Орёл и Решка!\\n\\nВыберите:', {
    markup: keyboard([
      [btn('🦅 Орёл', 'heads'), btn('🪙 Решка', 'tails')]
    ])
  });
});

bot.callback(['heads', 'tails'], async (ctx) => {
  const choice = ctx.data === 'heads' ? 'Орёл' : 'Решка';
  const result = Math.random() < 0.5 ? 'Орёл' : 'Решка';
  const won = choice === result;
  
  await ctx.answer(won ? '✅ Угадали!' : '❌ Не угадали');
  await ctx.editText(
    \`🪙 Результат: *\${result}*\\n\${won ? '🎉 Победа!' : '😔 Повезёт в следующий раз'}\`,
    {
      parse_mode: 'Markdown',
      markup: keyboard([[btn('🦅 Орёл', 'heads'), btn('🪙 Решка', 'tails')]])
    }
  );
});
`,

  counter: `// Счётчик с кнопками
bot.command('/start', async (ctx) => {
  ctx.store.count = 0;
  await ctx.reply('🔢 Счётчик: 0', {
    markup: keyboard([
      [btn('➖', 'dec'), btn('➕', 'inc')],
      [btn('🔄 Сброс', 'reset')]
    ])
  });
});

bot.callback('inc', async (ctx) => {
  ctx.store.count = (ctx.store.count || 0) + 1;
  await ctx.answer('+1');
  await ctx.editText(\`🔢 Счётчик: \${ctx.store.count}\`, {
    markup: keyboard([
      [btn('➖', 'dec'), btn('➕', 'inc')],
      [btn('🔄 Сброс', 'reset')]
    ])
  });
});

bot.callback('dec', async (ctx) => {
  ctx.store.count = (ctx.store.count || 0) - 1;
  await ctx.answer('-1');
  await ctx.editText(\`🔢 Счётчик: \${ctx.store.count}\`, {
    markup: keyboard([
      [btn('➖', 'dec'), btn('➕', 'inc')],
      [btn('🔄 Сброс', 'reset')]
    ])
  });
});

bot.callback('reset', async (ctx) => {
  ctx.store.count = 0;
  await ctx.answer('Сброшено!');
  await ctx.editText('🔢 Счётчик: 0', {
    markup: keyboard([
      [btn('➖', 'dec'), btn('➕', 'inc')],
      [btn('🔄 Сброс', 'reset')]
    ])
  });
});
`,

  quiz: `// Мини-викторина
const questions = [
  { q: '🌍 Столица Франции?', a: ['Лондон', 'Париж', 'Берлин'], correct: 1 },
  { q: '🔢 2 + 2 * 2 = ?', a: ['6', '8', '4'], correct: 0 },
  { q: '🎨 Какой цвет получится: красный + жёлтый?', a: ['Зелёный', 'Оранжевый', 'Фиолетовый'], correct: 1 },
];

bot.command('/start', async (ctx) => {
  ctx.store.score = 0;
  ctx.store.current = 0;
  await showQuestion(ctx);
});

async function showQuestion(ctx) {
  const i = ctx.store.current || 0;
  if (i >= questions.length) {
    await ctx.reply(\`🎉 Игра окончена!\\n🏆 Счёт: \${ctx.store.score}/\${questions.length}\`, {
      markup: keyboard([[btn('🔄 Заново', 'restart')]])
    });
    return;
  }
  const q = questions[i];
  await ctx.reply(\`❓ Вопрос \${i+1}/\${questions.length}\\n\\n\${q.q}\`, {
    markup: keyboard(q.a.map((a, j) => [btn(a, \`ans_\${i}_\${j}\`)]))
  });
}

bot.callbackPrefix('ans_', async (ctx) => {
  const [, qi, ai] = ctx.data.split('_').map(Number);
  const q = questions[qi];
  if (ai === q.correct) {
    ctx.store.score = (ctx.store.score || 0) + 1;
    await ctx.answer('✅ Верно!');
  } else {
    await ctx.answer('❌ Неверно! Ответ: ' + q.a[q.correct]);
  }
  ctx.store.current = qi + 1;
  await showQuestion(ctx);
});

bot.callback('restart', async (ctx) => {
  ctx.store.score = 0;
  ctx.store.current = 0;
  await ctx.answer('Начинаем заново!');
  await showQuestion(ctx);
});
`,
};
