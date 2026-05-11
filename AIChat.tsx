import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Loader2, Coins, AlertCircle, Copy, Check, Download } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  code?: string;
  pythonCode?: string;
}

interface AIChatProps {
  tickets: number;
  onUseTickets: (amount: number, reason: string) => boolean;
  onCreateBot: (name: string, code: string) => void;
  onNavigate: (page: string) => void;
}

const AI_COST = 50; // 50 тикетов за генерацию

// Системный промпт для будущей интеграции с реальным AI API
// const SYSTEM_PROMPT = `Ты — AI-ассистент для создания Telegram ботов...`;

// Демо-ответы AI (в реальности здесь был бы API запрос)
const generateAIResponse = (userMessage: string): { text: string; code: string; pythonCode: string } => {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes('привет') || msg.includes('начать') || msg.includes('помоги')) {
    return {
      text: '👋 Привет это бета тест чата с ИИ. Поэтому ИИ еще не может создать полноценный шаблон! Я помогу создать Telegram бота. Опиши, что должен делать бот. Например:\n• "Бот для опросов"\n• "Игра в числа"\n• "Бот-напоминалка"',
      code: '',
      pythonCode: '',
    };
  }
  
  if (msg.includes('опрос') || msg.includes('голосован')) {
    return {
      text: '📊 Отлично! Вот бот для опросов с голосованием:',
      code: `// 📊 Бот для опросов
const polls = {};

bot.command('/start', async (ctx) => {
  await ctx.reply('📊 Бот для опросов!\\n\\n/poll <вопрос> — создать опрос\\n/results — результаты', {
    markup: keyboard([[btn('📊 Мои опросы', 'my_polls')]])
  });
});

bot.command('/poll', async (ctx) => {
  const question = ctx.text.replace('/poll', '').trim();
  if (!question) {
    await ctx.reply('❌ Укажите вопрос: /poll Ваш вопрос?');
    return;
  }
  const pollId = Date.now().toString(36);
  ctx.globalStore[pollId] = { question, yes: 0, no: 0, voters: [] };
  await ctx.reply(\`📊 *\${question}*\`, {
    parse_mode: 'Markdown',
    markup: keyboard([
      [btn('👍 Да', \`vote_\${pollId}_yes\`), btn('👎 Нет', \`vote_\${pollId}_no\`)],
      [btn('📈 Результаты', \`results_\${pollId}\`)]
    ])
  });
});

bot.callbackPrefix('vote_', async (ctx) => {
  const [, pollId, vote] = ctx.data.split('_');
  const poll = ctx.globalStore[pollId];
  if (!poll) { await ctx.answer('Опрос не найден'); return; }
  if (poll.voters.includes(ctx.from.id)) {
    await ctx.answer('Вы уже голосовали!');
    return;
  }
  poll.voters.push(ctx.from.id);
  poll[vote]++;
  await ctx.answer(\`✅ Голос учтён: \${vote === 'yes' ? '👍' : '👎'}\`);
});

bot.callbackPrefix('results_', async (ctx) => {
  const pollId = ctx.data.replace('results_', '');
  const poll = ctx.globalStore[pollId];
  if (!poll) { await ctx.answer('Опрос не найден'); return; }
  const total = poll.yes + poll.no;
  const yesP = total ? Math.round(poll.yes / total * 100) : 0;
  const noP = total ? Math.round(poll.no / total * 100) : 0;
  await ctx.answer();
  await ctx.editText(\`📊 *\${poll.question}*\\n\\n👍 Да: \${poll.yes} (\${yesP}%)\\n👎 Нет: \${poll.no} (\${noP}%)\\n\\nВсего: \${total} голосов\`, {
    parse_mode: 'Markdown',
    markup: keyboard([
      [btn('👍 Да', \`vote_\${pollId}_yes\`), btn('👎 Нет', \`vote_\${pollId}_no\`)],
      [btn('🔄 Обновить', \`results_\${pollId}\`)]
    ])
  });
});`,
      pythonCode: `# 📊 Бот для опросов (Python)
import telebot
from telebot import types
import os

bot = telebot.TeleBot(os.environ.get("BOT_TOKEN"))
polls = {}

@bot.message_handler(commands=['start'])
def start(message):
    markup = types.InlineKeyboardMarkup()
    markup.add(types.InlineKeyboardButton("📊 Мои опросы", callback_data="my_polls"))
    bot.send_message(message.chat.id, "📊 Бот для опросов!\\n\\n/poll <вопрос> — создать", reply_markup=markup)

@bot.message_handler(commands=['poll'])
def create_poll(message):
    question = message.text.replace('/poll', '').strip()
    if not question:
        bot.reply_to(message, "❌ Укажите вопрос: /poll Ваш вопрос?")
        return
    poll_id = str(message.message_id)
    polls[poll_id] = {"question": question, "yes": 0, "no": 0, "voters": []}
    markup = types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        types.InlineKeyboardButton("👍 Да", callback_data=f"vote_{poll_id}_yes"),
        types.InlineKeyboardButton("👎 Нет", callback_data=f"vote_{poll_id}_no"),
    )
    markup.add(types.InlineKeyboardButton("📈 Результаты", callback_data=f"results_{poll_id}"))
    bot.send_message(message.chat.id, f"📊 *{question}*", parse_mode="Markdown", reply_markup=markup)

@bot.callback_query_handler(func=lambda c: c.data.startswith("vote_"))
def vote(call):
    _, poll_id, vote_type = call.data.split("_")
    poll = polls.get(poll_id)
    if not poll:
        bot.answer_callback_query(call.id, "Опрос не найден")
        return
    if call.from_user.id in poll["voters"]:
        bot.answer_callback_query(call.id, "Вы уже голосовали!")
        return
    poll["voters"].append(call.from_user.id)
    poll[vote_type] += 1
    bot.answer_callback_query(call.id, f"✅ Голос: {'👍' if vote_type == 'yes' else '👎'}")

bot.infinity_polling()`,
    };
  }
  
  if (msg.includes('числ') || msg.includes('угада') || msg.includes('игр')) {
    return {
      text: '🎯 Вот игра "Угадай число":',
      code: `// 🎯 Игра "Угадай число"
bot.command('/start', async (ctx) => {
  await ctx.reply('🎯 Игра "Угадай число"!\\n\\n/play — начать игру', {
    markup: keyboard([[btn('🎮 Играть', 'play')]])
  });
});

bot.command('/play', async (ctx) => { startGame(ctx); });
bot.callback('play', async (ctx) => { await ctx.answer(); startGame(ctx); });

async function startGame(ctx) {
  const num = Math.floor(Math.random() * 100) + 1;
  ctx.store.number = num;
  ctx.store.attempts = 0;
  await ctx.reply('🎯 Я загадал число от 1 до 100!\\nПопробуй угадать:');
}

bot.text(async (ctx) => {
  if (!ctx.store.number) {
    await ctx.reply('Начни игру: /play');
    return;
  }
  const guess = parseInt(ctx.text);
  if (isNaN(guess)) {
    await ctx.reply('❌ Введи число!');
    return;
  }
  ctx.store.attempts++;
  const num = ctx.store.number;
  if (guess === num) {
    await ctx.reply(\`🎉 Угадал за \${ctx.store.attempts} попыток!\\n\\nЧисло: \${num}\`, {
      markup: keyboard([[btn('🔄 Ещё раз', 'play')]])
    });
    ctx.store.number = null;
  } else if (guess < num) {
    await ctx.reply('⬆️ Больше!');
  } else {
    await ctx.reply('⬇️ Меньше!');
  }
});`,
      pythonCode: `# 🎯 Игра "Угадай число" (Python)
import telebot
from telebot import types
import random
import os

bot = telebot.TeleBot(os.environ.get("BOT_TOKEN"))
games = {}

@bot.message_handler(commands=['start', 'play'])
def start_game(message):
    num = random.randint(1, 100)
    games[message.chat.id] = {"number": num, "attempts": 0}
    bot.send_message(message.chat.id, "🎯 Я загадал число от 1 до 100!\\nПопробуй угадать:")

@bot.message_handler(func=lambda m: True)
def guess(message):
    game = games.get(message.chat.id)
    if not game:
        bot.reply_to(message, "Начни игру: /play")
        return
    try:
        guess = int(message.text)
    except:
        bot.reply_to(message, "❌ Введи число!")
        return
    game["attempts"] += 1
    if guess == game["number"]:
        bot.reply_to(message, f"🎉 Угадал за {game['attempts']} попыток!")
        del games[message.chat.id]
    elif guess < game["number"]:
        bot.reply_to(message, "⬆️ Больше!")
    else:
        bot.reply_to(message, "⬇️ Меньше!")

bot.infinity_polling()`,
    };
  }
  
  if (msg.includes('напомин') || msg.includes('таймер') || msg.includes('будильник')) {
    return {
      text: '⏰ Бот-напоминалка (упрощённая версия):',
      code: `// ⏰ Бот-напоминалка
bot.command('/start', async (ctx) => {
  await ctx.reply('⏰ Напоминалка!\\n\\n/remind <минуты> <текст>\\nПример: /remind 5 Позвонить маме');
});

bot.command('/remind', async (ctx) => {
  const parts = ctx.text.replace('/remind', '').trim().split(' ');
  const minutes = parseInt(parts[0]);
  const text = parts.slice(1).join(' ');
  
  if (isNaN(minutes) || !text) {
    await ctx.reply('❌ Формат: /remind <минуты> <текст>');
    return;
  }
  
  await ctx.reply(\`⏰ Напомню через \${minutes} мин:\\n"\${text}"\`);
  
  // Примечание: setTimeout работает пока открыт сайт
  setTimeout(async () => {
    await ctx.send(ctx.chatId, \`🔔 НАПОМИНАНИЕ:\\n\${text}\`);
  }, minutes * 60 * 1000);
});

bot.text(async (ctx) => {
  await ctx.reply('Используй /remind <минуты> <текст>');
});`,
      pythonCode: `# ⏰ Бот-напоминалка (Python)
import telebot
import threading
import time
import os

bot = telebot.TeleBot(os.environ.get("BOT_TOKEN"))

@bot.message_handler(commands=['start'])
def start(message):
    bot.send_message(message.chat.id, "⏰ Напоминалка!\\n\\n/remind <минуты> <текст>")

@bot.message_handler(commands=['remind'])
def remind(message):
    parts = message.text.replace('/remind', '').strip().split(' ', 1)
    if len(parts) < 2:
        bot.reply_to(message, "❌ Формат: /remind <минуты> <текст>")
        return
    try:
        minutes = int(parts[0])
        text = parts[1]
    except:
        bot.reply_to(message, "❌ Укажите число минут")
        return
    
    bot.reply_to(message, f"⏰ Напомню через {minutes} мин")
    
    def remind_later():
        time.sleep(minutes * 60)
        bot.send_message(message.chat.id, f"🔔 НАПОМИНАНИЕ:\\n{text}")
    
    threading.Thread(target=remind_later).start()

bot.infinity_polling()`,
    };
  }
  
  if (msg.includes('магазин') || msg.includes('товар') || msg.includes('каталог')) {
    return {
      text: '🛒 Вот шаблон бота-магазина:',
      code: `// 🛒 Бот-магазин
const products = [
  { id: 1, name: '🍕 Пицца', price: 500 },
  { id: 2, name: '🍔 Бургер', price: 300 },
  { id: 3, name: '🍟 Картошка', price: 150 },
  { id: 4, name: '🥤 Кола', price: 100 },
];

bot.command('/start', async (ctx) => {
  ctx.store.cart = [];
  await ctx.reply('🛒 Добро пожаловать в магазин!', {
    markup: keyboard([
      [btn('📋 Каталог', 'catalog')],
      [btn('🛒 Корзина', 'cart'), btn('📦 Заказы', 'orders')]
    ])
  });
});

bot.callback('catalog', async (ctx) => {
  await ctx.answer();
  const buttons = products.map(p => [btn(\`\${p.name} — \${p.price}₽\`, \`add_\${p.id}\`)]);
  buttons.push([btn('◀️ Назад', 'back')]);
  await ctx.editText('📋 *Каталог:*', { parse_mode: 'Markdown', markup: keyboard(buttons) });
});

bot.callbackPrefix('add_', async (ctx) => {
  const id = parseInt(ctx.data.replace('add_', ''));
  const product = products.find(p => p.id === id);
  if (!ctx.store.cart) ctx.store.cart = [];
  ctx.store.cart.push(product);
  await ctx.answer(\`✅ \${product.name} добавлен в корзину!\`);
});

bot.callback('cart', async (ctx) => {
  await ctx.answer();
  const cart = ctx.store.cart || [];
  if (cart.length === 0) {
    await ctx.editText('🛒 Корзина пуста', { markup: keyboard([[btn('📋 Каталог', 'catalog')]]) });
    return;
  }
  const total = cart.reduce((s, p) => s + p.price, 0);
  const items = cart.map(p => p.name).join('\\n');
  await ctx.editText(\`🛒 *Корзина:*\\n\\n\${items}\\n\\n💰 Итого: *\${total}₽*\`, {
    parse_mode: 'Markdown',
    markup: keyboard([[btn('✅ Оформить', 'checkout')], [btn('🗑 Очистить', 'clear'), btn('◀️ Назад', 'back')]])
  });
});

bot.callback('checkout', async (ctx) => {
  const cart = ctx.store.cart || [];
  const total = cart.reduce((s, p) => s + p.price, 0);
  ctx.store.cart = [];
  await ctx.answer('✅ Заказ оформлен!');
  await ctx.editText(\`✅ *Заказ оформлен!*\\n\\n💰 К оплате: \${total}₽\\n\\nМы свяжемся с вами!\`, { parse_mode: 'Markdown' });
});

bot.callback('clear', async (ctx) => {
  ctx.store.cart = [];
  await ctx.answer('🗑 Корзина очищена');
  await ctx.editText('🛒 Корзина пуста', { markup: keyboard([[btn('📋 Каталог', 'catalog')]]) });
});

bot.callback('back', async (ctx) => {
  await ctx.answer();
  await ctx.editText('🛒 Магазин', {
    markup: keyboard([[btn('📋 Каталог', 'catalog')], [btn('🛒 Корзина', 'cart')]])
  });
});`,
      pythonCode: `# 🛒 Бот-магазин (Python)
import telebot
from telebot import types
import os

bot = telebot.TeleBot(os.environ.get("BOT_TOKEN"))

products = [
    {"id": 1, "name": "🍕 Пицца", "price": 500},
    {"id": 2, "name": "🍔 Бургер", "price": 300},
    {"id": 3, "name": "🍟 Картошка", "price": 150},
]
carts = {}

@bot.message_handler(commands=['start'])
def start(message):
    carts[message.chat.id] = []
    markup = types.InlineKeyboardMarkup()
    markup.add(types.InlineKeyboardButton("📋 Каталог", callback_data="catalog"))
    markup.add(types.InlineKeyboardButton("🛒 Корзина", callback_data="cart"))
    bot.send_message(message.chat.id, "🛒 Магазин!", reply_markup=markup)

@bot.callback_query_handler(func=lambda c: c.data == "catalog")
def catalog(call):
    markup = types.InlineKeyboardMarkup()
    for p in products:
        markup.add(types.InlineKeyboardButton(f"{p['name']} — {p['price']}₽", callback_data=f"add_{p['id']}"))
    bot.edit_message_text("📋 Каталог:", call.message.chat.id, call.message.message_id, reply_markup=markup)

@bot.callback_query_handler(func=lambda c: c.data.startswith("add_"))
def add_to_cart(call):
    pid = int(call.data.replace("add_", ""))
    product = next(p for p in products if p["id"] == pid)
    if call.message.chat.id not in carts:
        carts[call.message.chat.id] = []
    carts[call.message.chat.id].append(product)
    bot.answer_callback_query(call.id, f"✅ {product['name']} добавлен!")

bot.infinity_polling()`,
    };
  }
  
  // Default
  return {
    text: '🤔 Понял! Опиши подробнее, что должен делать бот:\n• Какие команды?\n• Какие кнопки?\n• Что отвечать пользователям?\n\nИли выбери готовое: опросы, игры, магазин, напоминалки',
    code: '',
    pythonCode: '',
  };
};

export default function AIChat({ tickets, onUseTickets, onCreateBot, onNavigate }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Привет! Я AI-помощник для создания Telegram ботов.\n\nОпиши, какого бота хочешь создать, и я сгенерирую код!\n\n💡 Примеры:\n• "Сделай бота для опросов"\n• "Игра угадай число"\n• "Бот-магазин с корзиной"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Симуляция задержки AI
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1000));

    const response = generateAIResponse(userMessage);
    
    // Если есть код — списываем тикеты
    if (response.code) {
      if (tickets < AI_COST) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ Недостаточно тикетов для генерации!\n\nНужно: ${AI_COST} тикетов\nУ вас: ${tickets}\n\nПополните баланс в разделе "Тикеты"`,
        }]);
        setLoading(false);
        return;
      }
      onUseTickets(AI_COST, '🤖 AI генерация бота');
    }

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: response.text,
      code: response.code,
      pythonCode: response.pythonCode,
    }]);
    setLoading(false);
  };

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUseCode = (code: string) => {
    onCreateBot('AI Бот', code);
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Конструктор</h3>
            <p className="text-xs text-gray-500">Опиши бота — я создам код</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-400">
            <Coins className="h-3 w-3" />
            {AI_COST} тикетов/генерация
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
              msg.role === 'user' ? 'bg-blue-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'
            }`}>
              {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
            </div>
            <div className={`max-w-[80%] space-y-3 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block rounded-2xl px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </div>
              
              {/* Code blocks */}
              {msg.code && (
                <div className="space-y-2">
                  {/* JS Code */}
                  <div className="rounded-xl border border-gray-700 bg-gray-950 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
                      <span className="text-xs text-yellow-400">📦 JavaScript (для браузера)</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleCopy(msg.code!, 'js')}
                          className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-white"
                        >
                          {copied === 'js' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleUseCode(msg.code!)}
                          className="rounded bg-purple-500/20 px-2 py-1 text-xs text-purple-400 hover:bg-purple-500/30"
                        >
                          Использовать
                        </button>
                      </div>
                    </div>
                    <pre className="max-h-48 overflow-auto p-3 font-mono text-xs text-green-400">
                      {msg.code}
                    </pre>
                  </div>

                  {/* Python Code */}
                  {msg.pythonCode && (
                    <div className="rounded-xl border border-gray-700 bg-gray-950 overflow-hidden">
                      <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
                        <span className="text-xs text-blue-400">🐍 Python (для сервера)</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleCopy(msg.pythonCode!, 'py')}
                            className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-white"
                          >
                            {copied === 'py' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDownload(msg.pythonCode!, 'bot.py')}
                            className="rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/30"
                          >
                            <Download className="mr-1 inline h-3 w-3" />
                            .py
                          </button>
                        </div>
                      </div>
                      <pre className="max-h-48 overflow-auto p-3 font-mono text-xs text-cyan-400">
                        {msg.pythonCode}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-gray-800 px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              <span className="text-sm text-gray-400">Генерирую код...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        {tickets < AI_COST && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-xs text-red-400">
              Мало тикетов! <button onClick={() => onNavigate('tickets')} className="underline">Пополнить</button>
            </span>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Опиши бота, который хочешь создать..."
            className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex items-center justify-center rounded-xl bg-purple-500 px-4 py-3 text-white transition-colors hover:bg-purple-600 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
