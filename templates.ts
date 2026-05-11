import { BotScript, btn, inlineKeyboard } from '../engine/bot-runtime';

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  codePreview: string;
  buildScript: () => BotScript;
}

// ═══════════════════════════════════════════════════════════════
//  КАТЕГОРИИ ШАБЛОНОВ
// ═══════════════════════════════════════════════════════════════

export const categories = [
  { id: 'games', name: '🎮 Игры', color: 'purple' },
  { id: 'tools', name: '🛠 Утилиты', color: 'blue' },
  { id: 'business', name: '💼 Бизнес', color: 'green' },
  { id: 'social', name: '👥 Социальные', color: 'pink' },
  { id: 'fun', name: '🎉 Развлечения', color: 'yellow' },
  { id: 'education', name: '📚 Образование', color: 'cyan' },
  { id: 'crypto', name: '💰 Крипто/Финансы', color: 'orange' },
  { id: 'admin', name: '⚙️ Админские', color: 'red' },
];

// ═══════════════════════════════════════════════════════════════
//  ХЕЛПЕРЫ
// ═══════════════════════════════════════════════════════════════

const rnd = (max: number) => Math.floor(Math.random() * max);
const pick = <T>(arr: T[]): T => arr[rnd(arr.length)];

// ═══════════════════════════════════════════════════════════════
//  🎮 ИГРЫ (1-12)
// ═══════════════════════════════════════════════════════════════

const gameTemplates: TemplateInfo[] = [
  {
    id: 'coin-flip',
    name: 'Орёл и Решка',
    description: 'Подбрасывание монетки со статистикой побед',
    icon: '🪙',
    category: 'games',
    tags: ['игра', 'рандом', 'статистика'],
    codePreview: `bot.callback(['heads','tails'], async (ctx) => {
  const result = Math.random() < 0.5 ? 'Орёл' : 'Решка';
  await ctx.editText(\`Выпал: \${result}\`);
});`,
    buildScript: () => ({
      handlers: [{ command: '/start', handler: async (ctx) => {
        await ctx.reply('🪙 Орёл и Решка!\n\nВыберите:', { markup: inlineKeyboard([[btn('🦅 Орёл', 'heads'), btn('🪙 Решка', 'tails')]]) });
      }}],
      callbackHandlers: [{ data: ['heads', 'tails'], handler: async (ctx) => {
        const choice = ctx.data === 'heads' ? 'Орёл' : 'Решка';
        const result = Math.random() < 0.5 ? 'Орёл' : 'Решка';
        const won = choice === result;
        ctx.store.wins = ((ctx.store.wins as number) || 0) + (won ? 1 : 0);
        ctx.store.total = ((ctx.store.total as number) || 0) + 1;
        await ctx.answer(won ? '✅ Победа!' : '❌');
        await ctx.editText(`🪙 ${result}\n${won ? '🎉 Угадали!' : '😔 Не повезло'}\n\n📊 ${ctx.store.wins}/${ctx.store.total}`, { markup: inlineKeyboard([[btn('🦅 Орёл', 'heads'), btn('🪙 Решка', 'tails')]]) });
      }}],
    }),
  },
  {
    id: 'guess-number',
    name: 'Угадай число',
    description: 'Загадывает число от 1 до 100',
    icon: '🎯',
    category: 'games',
    tags: ['игра', 'логика'],
    codePreview: `ctx.store.number = Math.floor(Math.random() * 100) + 1;
// Пользователь вводит число
if (guess < num) await ctx.reply('⬆️ Больше!');`,
    buildScript: () => ({
      handlers: [
        { command: '/start', handler: async (ctx) => { await ctx.reply('🎯 Угадай число!\n\n/play — начать', { markup: inlineKeyboard([[btn('🎮 Играть', 'play')]]) }); }},
        { command: '/play', handler: async (ctx) => { ctx.store.num = rnd(100) + 1; ctx.store.tries = 0; await ctx.reply('Загадал 1-100. Пиши число:'); }},
        { fallback: true, handler: async (ctx) => {
          if (!ctx.store.num) { await ctx.reply('/play'); return; }
          const g = parseInt(ctx.text); if (isNaN(g)) { await ctx.reply('Число!'); return; }
          ctx.store.tries = ((ctx.store.tries as number) || 0) + 1;
          const n = ctx.store.num as number;
          if (g === n) { await ctx.reply(`🎉 Угадал за ${ctx.store.tries}!`, { markup: inlineKeyboard([[btn('🔄 Ещё', 'play')]]) }); ctx.store.num = null; }
          else await ctx.reply(g < n ? '⬆️ Больше!' : '⬇️ Меньше!');
        }},
      ],
      callbackHandlers: [{ data: 'play', handler: async (ctx) => { ctx.store.num = rnd(100) + 1; ctx.store.tries = 0; await ctx.answer(); await ctx.editText('Загадал 1-100!'); }}],
    }),
  },
  {
    id: 'rock-paper-scissors',
    name: 'Камень-Ножницы-Бумага',
    description: 'Классическая игра против бота',
    icon: '✊',
    category: 'games',
    tags: ['игра', 'pvp'],
    codePreview: `const moves = ['🪨', '✂️', '📄'];
const bot = pick(moves);`,
    buildScript: () => ({
      handlers: [{ command: '/start', handler: async (ctx) => { await ctx.reply('✊ Камень-Ножницы-Бумага!', { markup: inlineKeyboard([[btn('🪨', 'rock'), btn('✂️', 'scissors'), btn('📄', 'paper')]]) }); }}],
      callbackHandlers: [{ data: ['rock', 'scissors', 'paper'], handler: async (ctx) => {
        const m: Record<string, string> = { rock: '🪨', scissors: '✂️', paper: '📄' };
        const user = m[ctx.data]; const bot = pick(Object.values(m));
        const win: Record<string, string> = { '🪨': '✂️', '✂️': '📄', '📄': '🪨' };
        const result = user === bot ? '🤝 Ничья!' : win[user] === bot ? '🎉 Победа!' : '😔 Проиграл';
        await ctx.answer(); await ctx.editText(`Вы: ${user}\nБот: ${bot}\n\n${result}`, { markup: inlineKeyboard([[btn('🪨', 'rock'), btn('✂️', 'scissors'), btn('📄', 'paper')]]) });
      }}],
    }),
  },
  {
    id: 'dice-game',
    name: 'Кости',
    description: 'Бросай кубики, набирай очки',
    icon: '🎲',
    category: 'games',
    tags: ['игра', 'рандом'],
    codePreview: `const dice1 = Math.floor(Math.random() * 6) + 1;
const dice2 = Math.floor(Math.random() * 6) + 1;`,
    buildScript: () => ({
      handlers: [{ command: '/start', handler: async (ctx) => { await ctx.reply('🎲 Кости!\n\nБросай и набирай больше бота!', { markup: inlineKeyboard([[btn('🎲 Бросить', 'roll')]]) }); }}],
      callbackHandlers: [{ data: 'roll', handler: async (ctx) => {
        const u1 = rnd(6)+1, u2 = rnd(6)+1, b1 = rnd(6)+1, b2 = rnd(6)+1;
        const us = u1+u2, bs = b1+b2;
        const r = us > bs ? '🎉 Победа!' : us < bs ? '😔 Проигрыш' : '🤝 Ничья';
        await ctx.answer(); await ctx.editText(`🎲 Вы: ${u1}+${u2}=${us}\n🤖 Бот: ${b1}+${b2}=${bs}\n\n${r}`, { markup: inlineKeyboard([[btn('🎲 Ещё', 'roll')]]) });
      }}],
    }),
  },
  {
    id: 'slot-machine',
    name: 'Слоты',
    description: 'Казино слот-машина',
    icon: '🎰',
    category: 'games',
    tags: ['казино', 'рандом'],
    codePreview: `const symbols = ['🍒','🍋','🍊','💎','7️⃣'];
const s1 = pick(symbols);`,
    buildScript: () => ({
      handlers: [{ command: '/start', handler: async (ctx) => { ctx.store.coins = 100; await ctx.reply('🎰 Слоты!\n💰 100 монет\n\nСтавка: 10', { markup: inlineKeyboard([[btn('🎰 Крутить', 'spin')]]) }); }}],
      callbackHandlers: [{ data: 'spin', handler: async (ctx) => {
        let coins = (ctx.store.coins as number) || 100;
        if (coins < 10) { await ctx.answer('Нет монет!'); return; }
        coins -= 10;
        const sym = ['🍒','🍋','🍊','💎','7️⃣'];
        const s = [pick(sym), pick(sym), pick(sym)];
        let win = 0;
        if (s[0]===s[1]&&s[1]===s[2]) win = s[0]==='7️⃣' ? 100 : s[0]==='💎' ? 50 : 30;
        else if (s[0]===s[1]||s[1]===s[2]) win = 5;
        coins += win;
        ctx.store.coins = coins;
        await ctx.answer(win > 0 ? `+${win}!` : '');
        await ctx.editText(`🎰 ${s.join(' ')}\n\n${win > 0 ? `🎉 +${win}!` : '😔'}\n💰 ${coins}`, { markup: inlineKeyboard([[btn('🎰 Крутить (10)', 'spin')]]) });
      }}],
    }),
  },
  {
    id: 'blackjack',
    name: 'Блэкджек',
    description: '21 очко против дилера',
    icon: '🃏',
    category: 'games',
    tags: ['казино', 'карты'],
    codePreview: `const card = () => Math.min(Math.floor(Math.random()*13)+1, 10);
// Набери 21!`,
    buildScript: () => ({
      handlers: [{ command: '/start', handler: async (ctx) => { ctx.store.money = 1000; await ctx.reply('🃏 Блэкджек!\n💰 1000\n\n/play — играть'); }}],
      callbackHandlers: [
        { data: 'deal', handler: async (ctx) => {
          const card = () => Math.min(rnd(13)+1, 10);
          ctx.store.player = [card(), card()];
          ctx.store.dealer = [card()];
          const p = ctx.store.player as number[];
          const d = ctx.store.dealer as number[];
          await ctx.answer(); await ctx.editText(`🃏 Вы: ${p.join('+')}=${p.reduce((a,b)=>a+b)}\n🤖 Дилер: ${d[0]}+?\n\n`, { markup: inlineKeyboard([[btn('➕ Ещё', 'hit'), btn('✋ Хватит', 'stand')]]) });
        }},
        { data: 'hit', handler: async (ctx) => {
          const card = () => Math.min(rnd(13)+1, 10);
          const p = ctx.store.player as number[]; p.push(card());
          const sum = p.reduce((a,b)=>a+b);
          if (sum > 21) { await ctx.answer('💥 Перебор!'); await ctx.editText(`🃏 ${p.join('+')}=${sum}\n💥 Перебор!`, { markup: inlineKeyboard([[btn('🔄 Заново', 'deal')]]) }); }
          else { await ctx.answer(); await ctx.editText(`🃏 Вы: ${p.join('+')}=${sum}`, { markup: inlineKeyboard([[btn('➕ Ещё', 'hit'), btn('✋ Хватит', 'stand')]]) }); }
        }},
        { data: 'stand', handler: async (ctx) => {
          const card = () => Math.min(rnd(13)+1, 10);
          const p = (ctx.store.player as number[]).reduce((a,b)=>a+b);
          const d = ctx.store.dealer as number[];
          while (d.reduce((a,b)=>a+b) < 17) d.push(card());
          const ds = d.reduce((a,b)=>a+b);
          const r = ds > 21 || p > ds ? '🎉 Победа!' : p < ds ? '😔 Проигрыш' : '🤝 Ничья';
          await ctx.answer(); await ctx.editText(`Вы: ${p}\nДилер: ${d.join('+')}=${ds}\n\n${r}`, { markup: inlineKeyboard([[btn('🔄 Заново', 'deal')]]) });
        }},
      ],
    }),
  },
  {
    id: 'quiz',
    name: 'Викторина',
    description: 'Вопросы с вариантами ответов',
    icon: '🧠',
    category: 'games',
    tags: ['викторина', 'знания'],
    codePreview: `const questions = [
  {q: 'Столица Франции?', a: ['Париж','Лондон'], correct: 0}
];`,
    buildScript: () => {
      const qs = [
        {q:'🌍 Столица Франции?',a:['Париж','Лондон','Берлин'],c:0},
        {q:'🔢 2+2*2=?',a:['6','8','4'],c:0},
        {q:'🎨 Красный+жёлтый=?',a:['Оранжевый','Зелёный','Фиолетовый'],c:0},
        {q:'🌊 Самый большой океан?',a:['Тихий','Атлантический','Индийский'],c:0},
        {q:'💻 Создатель Facebook?',a:['Цукерберг','Гейтс','Маск'],c:0},
      ];
      return {
        handlers: [{ command: '/start', handler: async (ctx) => { ctx.store.score = 0; await ctx.reply('🧠 Викторина!', { markup: inlineKeyboard([[btn('▶️ Старт', 'start_quiz')]]) }); }}],
        callbackHandlers: [
          { data: 'start_quiz', handler: async (ctx) => { ctx.store.qi = 0; ctx.store.score = 0; await ctx.answer(); const q = qs[0]; await ctx.editText(`❓ 1/${qs.length}\n\n${q.q}`, { markup: inlineKeyboard(q.a.map((a,i)=>[btn(a, `ans_0_${i}`)])) }); }},
          { prefix: 'ans_', handler: async (ctx) => {
            const [,qi,ai] = ctx.data.split('_').map(Number);
            const q = qs[qi];
            if (ai === q.c) { ctx.store.score = ((ctx.store.score as number)||0) + 1; await ctx.answer('✅ Верно!'); }
            else await ctx.answer('❌ ' + q.a[q.c]);
            const next = qi + 1;
            if (next >= qs.length) { await ctx.editText(`🏁 Конец!\n🏆 ${ctx.store.score}/${qs.length}`, { markup: inlineKeyboard([[btn('🔄 Заново', 'start_quiz')]]) }); }
            else { const nq = qs[next]; await ctx.editText(`❓ ${next+1}/${qs.length}\n\n${nq.q}`, { markup: inlineKeyboard(nq.a.map((a,i)=>[btn(a, `ans_${next}_${i}`)])) }); }
          }},
        ],
      };
    },
  },
  {
    id: 'word-game',
    name: 'Слова',
    description: 'Игра в слова (города)',
    icon: '📝',
    category: 'games',
    tags: ['слова', 'логика'],
    codePreview: `// Последняя буква = первая нового слова
const lastChar = word.slice(-1).toUpperCase();`,
    buildScript: () => ({
      handlers: [
        { command: '/start', handler: async (ctx) => { ctx.store.last = ''; ctx.store.used = []; await ctx.reply('📝 Игра в слова!\n\nПравила: последняя буква = первая нового\n\nНачинай с любого слова!'); }},
        { fallback: true, handler: async (ctx) => {
          const w = ctx.text.toLowerCase().trim();
          const last = ctx.store.last as string;
          const used = (ctx.store.used as string[]) || [];
          if (used.includes(w)) { await ctx.reply('❌ Уже было!'); return; }
          if (last && !w.startsWith(last)) { await ctx.reply(`❌ Должно начинаться на "${last.toUpperCase()}"`); return; }
          used.push(w); ctx.store.used = used;
          const newLast = w.replace(/[ьъы]/g, '').slice(-1);
          ctx.store.last = newLast;
          // Бот отвечает
          const botWords: Record<string,string> = {а:'арбуз',б:'банан',в:'вода',г:'гора',д:'дом',е:'ель',ж:'жара',з:'заяц',и:'игра',к:'кот',л:'лес',м:'море',н:'нос',о:'озеро',п:'парк',р:'река',с:'сон',т:'торт',у:'утро',ф:'флаг',х:'хлеб',ц:'цветок',ч:'час',ш:'шар',э:'эхо',ю:'юг',я:'яблоко'};
          const bw = botWords[newLast] || 'абрикос';
          used.push(bw); ctx.store.used = used;
          const bl = bw.replace(/[ьъы]/g, '').slice(-1);
          ctx.store.last = bl;
          await ctx.reply(`✅ ${w}\n🤖 ${bw}\n\nТвой ход на "${bl.toUpperCase()}"`);
        }},
      ],
      callbackHandlers: [],
    }),
  },
  {
    id: 'memory-game',
    name: 'Память',
    description: 'Запомни последовательность',
    icon: '🧩',
    category: 'games',
    tags: ['память', 'логика'],
    codePreview: `const sequence = ['🔴','🟢','🔵'];
// Повтори последовательность!`,
    buildScript: () => ({
      handlers: [{ command: '/start', handler: async (ctx) => { await ctx.reply('🧩 Память!\n\nЗапомни и повтори!', { markup: inlineKeyboard([[btn('▶️ Старт', 'mem_start')]]) }); }}],
      callbackHandlers: [
        { data: 'mem_start', handler: async (ctx) => {
          const colors = ['🔴','🟢','🔵','🟡'];
          const seq = [pick(colors), pick(colors), pick(colors)];
          ctx.store.seq = seq; ctx.store.pos = 0; ctx.store.level = 3;
          await ctx.answer(); await ctx.editText(`🧩 Запомни:\n\n${seq.join(' ')}\n\n3...`);
          // Показываем 3 сек (симуляция)
          await ctx.editText(`🧩 Повтори!`, { markup: inlineKeyboard([[btn('🔴','m_🔴'),btn('🟢','m_🟢')],[btn('🔵','m_🔵'),btn('🟡','m_🟡')]]) });
        }},
        { prefix: 'm_', handler: async (ctx) => {
          const c = ctx.data.slice(2);
          const seq = ctx.store.seq as string[];
          const pos = ctx.store.pos as number;
          if (seq[pos] === c) {
            ctx.store.pos = pos + 1;
            if (pos + 1 >= seq.length) {
              const level = ((ctx.store.level as number) || 3) + 1;
              ctx.store.level = level;
              const newSeq = Array.from({length: level}, () => pick(['🔴','🟢','🔵','🟡']));
              ctx.store.seq = newSeq; ctx.store.pos = 0;
              await ctx.answer('✅ Уровень ' + level);
              await ctx.editText(`🎉 Уровень ${level}!\n\n${newSeq.join(' ')}`);
              await ctx.editText('🧩 Повтори!', { markup: inlineKeyboard([[btn('🔴','m_🔴'),btn('🟢','m_🟢')],[btn('🔵','m_🔵'),btn('🟡','m_🟡')]]) });
            } else await ctx.answer('✅');
          } else {
            await ctx.answer('❌ Ошибка!');
            await ctx.editText(`❌ Ошибка!\nБыло: ${seq.join(' ')}\n\nУровень: ${ctx.store.level}`, { markup: inlineKeyboard([[btn('🔄 Заново', 'mem_start')]]) });
          }
        }},
      ],
    }),
  },
  {
    id: 'tic-tac-toe',
    name: 'Крестики-Нолики',
    description: 'Классическая игра 3x3',
    icon: '⭕',
    category: 'games',
    tags: ['игра', 'логика', 'pvp'],
    codePreview: `const board = Array(9).fill(null);
// X и O по очереди`,
    buildScript: () => ({
      handlers: [{ command: '/start', handler: async (ctx) => { await ctx.reply('⭕❌ Крестики-Нолики!', { markup: inlineKeyboard([[btn('🎮 Играть', 'ttt_new')]]) }); }}],
      callbackHandlers: [
        { data: 'ttt_new', handler: async (ctx) => {
          ctx.store.board = Array(9).fill(' ');
          const b = ctx.store.board as string[];
          await ctx.answer(); await ctx.editText('Твой ход (❌):', { markup: inlineKeyboard([[btn(b[0],'t_0'),btn(b[1],'t_1'),btn(b[2],'t_2')],[btn(b[3],'t_3'),btn(b[4],'t_4'),btn(b[5],'t_5')],[btn(b[6],'t_6'),btn(b[7],'t_7'),btn(b[8],'t_8')]]) });
        }},
        { prefix: 't_', handler: async (ctx) => {
          const i = parseInt(ctx.data.slice(2));
          const b = ctx.store.board as string[];
          if (b[i] !== ' ') { await ctx.answer('Занято!'); return; }
          b[i] = '❌';
          const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
          const check = (s:string) => wins.some(w => w.every(j => b[j]===s));
          if (check('❌')) { await ctx.answer('🎉 Победа!'); await ctx.editText('🎉 Ты выиграл!', { markup: inlineKeyboard([[btn('🔄','ttt_new')]]) }); return; }
          if (!b.includes(' ')) { await ctx.answer('🤝'); await ctx.editText('🤝 Ничья!', { markup: inlineKeyboard([[btn('🔄','ttt_new')]]) }); return; }
          // Бот
          const empty = b.map((v,j)=>v===' '?j:-1).filter(j=>j>=0);
          b[pick(empty)] = '⭕';
          if (check('⭕')) { await ctx.answer('😔'); await ctx.editText('😔 Бот выиграл!', { markup: inlineKeyboard([[btn('🔄','ttt_new')]]) }); return; }
          await ctx.answer();
          await ctx.editText('Твой ход:', { markup: inlineKeyboard([[btn(b[0],'t_0'),btn(b[1],'t_1'),btn(b[2],'t_2')],[btn(b[3],'t_3'),btn(b[4],'t_4'),btn(b[5],'t_5')],[btn(b[6],'t_6'),btn(b[7],'t_7'),btn(b[8],'t_8')]]) });
        }},
      ],
    }),
  },
  {
    id: 'russian-roulette',
    name: 'Русская Рулетка',
    description: 'Испытай удачу! 1 из 6',
    icon: '🔫',
    category: 'games',
    tags: ['рандом', 'риск'],
    codePreview: `const bullet = Math.floor(Math.random() * 6);
const shot = Math.floor(Math.random() * 6);`,
    buildScript: () => ({
      handlers: [{ command: '/start', handler: async (ctx) => { ctx.store.alive = 0; await ctx.reply('🔫 Русская Рулетка!\n\n1 пуля, 6 камер', { markup: inlineKeyboard([[btn('🔫 Выстрел', 'shoot')]]) }); }}],
      callbackHandlers: [{ data: 'shoot', handler: async (ctx) => {
        const dead = rnd(6) === 0;
        if (dead) { await ctx.answer('💀'); await ctx.editText(`💀 БАХ!\n\nВыжил: ${ctx.store.alive} раз`, { markup: inlineKeyboard([[btn('🔄 Заново', 'reset')]]) }); ctx.store.alive = 0; }
        else { ctx.store.alive = ((ctx.store.alive as number)||0)+1; await ctx.answer('😅 Пусто!'); await ctx.editText(`😅 Щёлк!\n\nВыжил: ${ctx.store.alive}`, { markup: inlineKeyboard([[btn('🔫 Ещё', 'shoot')]]) }); }
      }},{ data: 'reset', handler: async (ctx) => { ctx.store.alive = 0; await ctx.answer(); await ctx.editText('🔫 Заново!', { markup: inlineKeyboard([[btn('🔫 Выстрел', 'shoot')]]) }); }}],
    }),
  },
  {
    id: 'typing-speed',
    name: 'Скорость печати',
    description: 'Проверь скорость набора',
    icon: '⌨️',
    category: 'games',
    tags: ['тест', 'скорость'],
    codePreview: `const words = ['привет','мир','код','бот'];
// Засекаем время`,
    buildScript: () => ({
      handlers: [
        { command: '/start', handler: async (ctx) => { await ctx.reply('⌨️ Тест скорости!\n\nНапиши слово как можно быстрее!', { markup: inlineKeyboard([[btn('▶️ Старт', 'type_start')]]) }); }},
        { fallback: true, handler: async (ctx) => {
          if (!ctx.store.word) return;
          const w = ctx.store.word as string;
          const start = ctx.store.time as number;
          if (ctx.text.toLowerCase() === w.toLowerCase()) {
            const ms = Date.now() - start;
            const best = Math.min((ctx.store.best as number) || 99999, ms);
            ctx.store.best = best;
            await ctx.reply(`✅ ${ms}мс!\n🏆 Рекорд: ${best}мс`, { markup: inlineKeyboard([[btn('▶️ Ещё', 'type_start')]]) });
            ctx.store.word = null;
          } else await ctx.reply('❌ Неверно!');
        }},
      ],
      callbackHandlers: [{ data: 'type_start', handler: async (ctx) => {
        const words = ['привет','программа','телеграм','клавиатура','компьютер','интернет'];
        const w = pick(words);
        ctx.store.word = w; ctx.store.time = Date.now();
        await ctx.answer(); await ctx.editText(`⌨️ Напиши:\n\n**${w}**`, { parse_mode: 'Markdown' });
      }}],
    }),
  },
];

// ═══════════════════════════════════════════════════════════════
//  🛠 УТИЛИТЫ (13-20)
// ═══════════════════════════════════════════════════════════════

const toolTemplates: TemplateInfo[] = [
  {
    id: 'echo-bot', name: 'Эхо бот', description: 'Повторяет всё что пишешь', icon: '🔊',
    category: 'tools', tags: ['базовый'], codePreview: `bot.text(ctx => ctx.reply(ctx.text));`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('🔊 Эхо! Пиши что угодно'); }},{ fallback: true, handler: async ctx => { await ctx.reply('🔊 ' + ctx.text); }}], callbackHandlers: [] }),
  },
  {
    id: 'calculator', name: 'Калькулятор', description: 'Считает выражения', icon: '🧮',
    category: 'tools', tags: ['математика'], codePreview: `const result = eval(expression);`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('🧮 Калькулятор!\n\nПиши: 2+2, 10*5, 100/4'); }},{ fallback: true, handler: async ctx => { try { const r = Function('"use strict";return ('+ctx.text+')')(); await ctx.reply(`🧮 ${ctx.text} = ${r}`); } catch { await ctx.reply('❌ Ошибка'); }}}], callbackHandlers: [] }),
  },
  {
    id: 'todo-list', name: 'Список дел', description: 'Управление задачами', icon: '📝',
    category: 'tools', tags: ['продуктивность'], codePreview: `ctx.store.todos.push({text, done: false});`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { ctx.store.todos = ctx.store.todos || []; const t = ctx.store.todos as any[]; await ctx.reply(`📝 Задачи (${t.length})\n\nПиши задачу или /list`, { markup: inlineKeyboard([[btn('📋 Список', 'list')]]) }); }},{ command: '/list', handler: async ctx => { const t = (ctx.store.todos as any[]) || []; await ctx.reply(t.length ? t.map((x,i)=>`${x.done?'✅':'⬜'} ${i+1}. ${x.text}`).join('\n') : '📭 Пусто'); }},{ fallback: true, handler: async ctx => { const t = (ctx.store.todos as any[]) || []; t.push({text:ctx.text,done:false}); ctx.store.todos = t; await ctx.reply(`✅ Добавлено: ${ctx.text}`); }}], callbackHandlers: [{ data: 'list', handler: async ctx => { const t = (ctx.store.todos as any[]) || []; const rows = t.map((x,i)=>[btn(`${x.done?'✅':'⬜'} ${x.text.slice(0,20)}`, `tog_${i}`)]); rows.push([btn('🗑 Очистить', 'clear')]); await ctx.answer(); await ctx.editText('📝 Задачи:', { markup: inlineKeyboard(rows) }); }},{ prefix: 'tog_', handler: async ctx => { const i = parseInt(ctx.data.slice(4)); const t = ctx.store.todos as any[]; if(t[i]) t[i].done = !t[i].done; await ctx.answer(t[i]?.done ? '✅' : '⬜'); }},{ data: 'clear', handler: async ctx => { ctx.store.todos = []; await ctx.answer('🗑'); await ctx.editText('📭 Очищено'); }}] }),
  },
  {
    id: 'reminder', name: 'Напоминалка', description: 'Таймеры и напоминания', icon: '⏰',
    category: 'tools', tags: ['время'], codePreview: `setTimeout(() => ctx.send(chatId, text), minutes * 60000);`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('⏰ Напоминалка!\n\n/remind 5 Текст\n(напомнить через 5 мин)'); }},{ command: '/remind', handler: async ctx => { const p = ctx.text.replace('/remind','').trim().split(' '); const m = parseInt(p[0]); const t = p.slice(1).join(' '); if(isNaN(m)||!t) { await ctx.reply('❌ /remind 5 Текст'); return; } await ctx.reply(`⏰ Напомню через ${m} мин`); setTimeout(async()=>{ await ctx.send(ctx.chatId, `🔔 ${t}`); }, m*60000); }}], callbackHandlers: [] }),
  },
  {
    id: 'notes', name: 'Заметки', description: 'Сохраняй текст', icon: '📒',
    category: 'tools', tags: ['текст'], codePreview: `ctx.store.notes[name] = content;`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('📒 Заметки!\n\n/save имя текст\n/get имя\n/list'); }},{ command: '/save', handler: async ctx => { const p = ctx.text.replace('/save','').trim().split(' '); const n = p[0], t = p.slice(1).join(' '); if(!n||!t) { await ctx.reply('❌ /save имя текст'); return; } const notes = (ctx.store.notes as any) || {}; notes[n] = t; ctx.store.notes = notes; await ctx.reply(`✅ Сохранено: ${n}`); }},{ command: '/get', handler: async ctx => { const n = ctx.text.replace('/get','').trim(); const notes = (ctx.store.notes as any) || {}; await ctx.reply(notes[n] || '❌ Не найдено'); }},{ command: '/list', handler: async ctx => { const notes = (ctx.store.notes as any) || {}; const keys = Object.keys(notes); await ctx.reply(keys.length ? '📒 ' + keys.join(', ') : '📭 Пусто'); }}], callbackHandlers: [] }),
  },
  {
    id: 'password-gen', name: 'Генератор паролей', description: 'Создаёт надёжные пароли', icon: '🔐',
    category: 'tools', tags: ['безопасность'], codePreview: `const chars = 'ABCabc123!@#';`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('🔐 Генератор паролей!', { markup: inlineKeyboard([[btn('8 символов', 'p_8'),btn('12', 'p_12'),btn('16', 'p_16')]]) }); }}], callbackHandlers: [{ prefix: 'p_', handler: async ctx => { const len = parseInt(ctx.data.slice(2)); const c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'; let p = ''; for(let i=0;i<len;i++) p += c[rnd(c.length)]; await ctx.answer(); await ctx.editText(`🔐 Пароль:\n\n\`${p}\``, { parse_mode: 'Markdown', markup: inlineKeyboard([[btn('🔄 Новый', `p_${len}`)],[btn('8', 'p_8'),btn('12', 'p_12'),btn('16', 'p_16')]]) }); }}] }),
  },
  {
    id: 'translator', name: 'Переводчик', description: 'Переводит RU↔EN', icon: '🌐',
    category: 'tools', tags: ['язык'], codePreview: `// Демо-переводчик`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('🌐 Переводчик!\n\nПиши на RU или EN'); }},{ fallback: true, handler: async ctx => { const dict: Record<string,string> = {привет:'hello',мир:'world',да:'yes',нет:'no',hello:'привет',world:'мир',yes:'да',no:'нет'}; const words = ctx.text.toLowerCase().split(' ').map(w => dict[w] || w); await ctx.reply('🌐 ' + words.join(' ')); }}], callbackHandlers: [] }),
  },
  {
    id: 'qr-gen', name: 'QR генератор', description: 'Создаёт QR коды', icon: '📱',
    category: 'tools', tags: ['qr'], codePreview: `// API для QR`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('📱 QR Генератор!\n\nПиши текст для QR'); }},{ fallback: true, handler: async ctx => { await ctx.reply(`📱 QR для: "${ctx.text}"\n\n(В реальном боте здесь картинка)`); }}], callbackHandlers: [] }),
  },
];

// ═══════════════════════════════════════════════════════════════
//  💼 БИЗНЕС (21-28)
// ═══════════════════════════════════════════════════════════════

const businessTemplates: TemplateInfo[] = [
  {
    id: 'shop', name: 'Магазин', description: 'Каталог, корзина, заказы', icon: '🛒',
    category: 'business', tags: ['продажи'], codePreview: `const products = [{id:1, name:'Товар', price:100}];`,
    buildScript: () => {
      const prods = [{id:1,name:'🍕 Пицца',price:500},{id:2,name:'🍔 Бургер',price:300},{id:3,name:'🍟 Картошка',price:150}];
      return { handlers: [{ command: '/start', handler: async ctx => { ctx.store.cart = []; await ctx.reply('🛒 Магазин!', { markup: inlineKeyboard([[btn('📋 Каталог', 'catalog')],[btn('🛒 Корзина', 'cart')]]) }); }}], callbackHandlers: [{ data: 'catalog', handler: async ctx => { await ctx.answer(); await ctx.editText('📋 Каталог:', { markup: inlineKeyboard([...prods.map(p=>[btn(`${p.name} ${p.price}₽`, `add_${p.id}`)]), [btn('◀️ Назад', 'back')]]) }); }},{ prefix: 'add_', handler: async ctx => { const id = parseInt(ctx.data.slice(4)); const p = prods.find(x=>x.id===id); const c = (ctx.store.cart as any[]) || []; c.push(p); ctx.store.cart = c; await ctx.answer(`✅ ${p?.name}`); }},{ data: 'cart', handler: async ctx => { const c = (ctx.store.cart as any[]) || []; const total = c.reduce((s,p)=>s+(p?.price||0),0); await ctx.answer(); await ctx.editText(c.length ? `🛒 Корзина:\n${c.map(p=>p?.name).join('\n')}\n\n💰 ${total}₽` : '📭 Пусто', { markup: inlineKeyboard([[btn('✅ Оформить', 'checkout')],[btn('🗑 Очистить', 'clear_cart')]]) }); }},{ data: 'checkout', handler: async ctx => { ctx.store.cart = []; await ctx.answer('✅'); await ctx.editText('✅ Заказ оформлен!'); }},{ data: 'clear_cart', handler: async ctx => { ctx.store.cart = []; await ctx.answer('🗑'); await ctx.editText('🛒 Очищено'); }},{ data: 'back', handler: async ctx => { await ctx.answer(); await ctx.editText('🛒 Магазин', { markup: inlineKeyboard([[btn('📋 Каталог', 'catalog')],[btn('🛒 Корзина', 'cart')]]) }); }}] };
    },
  },
  {
    id: 'booking', name: 'Бронирование', description: 'Запись на услуги', icon: '📅',
    category: 'business', tags: ['услуги'], codePreview: `const slots = ['10:00', '12:00', '14:00'];`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('📅 Бронирование!', { markup: inlineKeyboard([[btn('10:00', 'book_10'),btn('12:00', 'book_12')],[btn('14:00', 'book_14'),btn('16:00', 'book_16')]]) }); }}], callbackHandlers: [{ prefix: 'book_', handler: async ctx => { const t = ctx.data.slice(5); await ctx.answer(); await ctx.editText(`✅ Забронировано на ${t}:00!\n\nМы свяжемся с вами.`); }}] }),
  },
  {
    id: 'support', name: 'Техподдержка', description: 'FAQ и тикеты', icon: '💬',
    category: 'business', tags: ['поддержка'], codePreview: `const faq = [{q:'Вопрос?', a:'Ответ'}];`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('💬 Поддержка!', { markup: inlineKeyboard([[btn('❓ FAQ', 'faq')],[btn('📝 Написать', 'ticket')]]) }); }}], callbackHandlers: [{ data: 'faq', handler: async ctx => { await ctx.answer(); await ctx.editText('❓ FAQ:\n\n1. Как заказать? - Нажмите Каталог\n2. Доставка? - 1-3 дня\n3. Оплата? - Картой/наличными', { markup: inlineKeyboard([[btn('◀️', 'back')]]) }); }},{ data: 'ticket', handler: async ctx => { await ctx.answer(); await ctx.editText('📝 Напишите ваш вопрос в следующем сообщении'); ctx.store.waitTicket = true; }},{ data: 'back', handler: async ctx => { await ctx.answer(); await ctx.editText('💬 Поддержка', { markup: inlineKeyboard([[btn('❓ FAQ', 'faq')],[btn('📝 Написать', 'ticket')]]) }); }}] }),
  },
  {
    id: 'poll', name: 'Опросы', description: 'Создание голосований', icon: '📊',
    category: 'business', tags: ['опрос'], codePreview: `ctx.globalStore[pollId] = {yes: 0, no: 0};`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('📊 Опросы!\n\n/poll Ваш вопрос?'); }},{ command: '/poll', handler: async ctx => { const q = ctx.text.replace('/poll','').trim(); if(!q) return; const id = Date.now().toString(36); ctx.globalStore[id] = {q,y:0,n:0,v:[]}; await ctx.reply(`📊 ${q}`, { markup: inlineKeyboard([[btn('👍', `v_${id}_y`),btn('👎', `v_${id}_n`)],[btn('📈 Результаты', `r_${id}`)]]) }); }}], callbackHandlers: [{ prefix: 'v_', handler: async ctx => { const [,id,v] = ctx.data.split('_'); const p = ctx.globalStore[id] as any; if(!p) return; if(p.v.includes(ctx.from.id)) { await ctx.answer('Уже голосовали!'); return; } p.v.push(ctx.from.id); p[v]++; await ctx.answer('✅'); }},{ prefix: 'r_', handler: async ctx => { const id = ctx.data.slice(2); const p = ctx.globalStore[id] as any; if(!p) return; await ctx.answer(); await ctx.editText(`📊 ${p.q}\n\n👍 ${p.y}\n👎 ${p.n}`, { markup: inlineKeyboard([[btn('🔄', `r_${id}`)]]) }); }}] }),
  },
  {
    id: 'delivery', name: 'Доставка еды', description: 'Заказ с адресом', icon: '🍕',
    category: 'business', tags: ['еда'], codePreview: `ctx.store.order = {items: [], address: null};`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { ctx.store.order = {items:[],addr:''}; await ctx.reply('🍕 Доставка еды!\n\nМеню:', { markup: inlineKeyboard([[btn('🍕 Пицца 500₽', 'o_pizza')],[btn('🍔 Бургер 300₽', 'o_burger')],[btn('🛒 Корзина', 'order_cart')]]) }); }}], callbackHandlers: [{ prefix: 'o_', handler: async ctx => { const item = ctx.data.slice(2); const o = ctx.store.order as any; o.items.push(item); await ctx.answer('✅ Добавлено'); }},{ data: 'order_cart', handler: async ctx => { const o = ctx.store.order as any; if(!o.items.length) { await ctx.answer('Пусто!'); return; } await ctx.answer(); await ctx.editText(`🛒 Заказ:\n${o.items.join(', ')}\n\nНапишите адрес доставки:`); ctx.store.waitAddr = true; }}] }),
  },
  {
    id: 'feedback', name: 'Отзывы', description: 'Сбор отзывов и оценок', icon: '⭐',
    category: 'business', tags: ['отзывы'], codePreview: `ctx.globalStore.reviews.push({text, rating});`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('⭐ Оставьте отзыв!', { markup: inlineKeyboard([[btn('⭐','rate_1'),btn('⭐⭐','rate_2'),btn('⭐⭐⭐','rate_3')],[btn('⭐⭐⭐⭐','rate_4'),btn('⭐⭐⭐⭐⭐','rate_5')]]) }); }}], callbackHandlers: [{ prefix: 'rate_', handler: async ctx => { const r = parseInt(ctx.data.slice(5)); ctx.store.rating = r; await ctx.answer(); await ctx.editText(`${'⭐'.repeat(r)}\n\nТеперь напишите отзыв:`); ctx.store.waitReview = true; }}] }),
  },
  {
    id: 'newsletter', name: 'Рассылка', description: 'Подписка на новости', icon: '📰',
    category: 'business', tags: ['маркетинг'], codePreview: `ctx.globalStore.subscribers.push(userId);`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { const subs = (ctx.globalStore.subs as number[]) || []; const isSub = subs.includes(ctx.from?.id || 0); await ctx.reply(`📰 Рассылка\n\nСтатус: ${isSub ? '✅ Подписан' : '❌ Не подписан'}`, { markup: inlineKeyboard([[btn(isSub ? '🔕 Отписаться' : '🔔 Подписаться', 'toggle_sub')]]) }); }}], callbackHandlers: [{ data: 'toggle_sub', handler: async ctx => { const subs = (ctx.globalStore.subs as number[]) || []; const uid = ctx.from?.id || 0; const idx = subs.indexOf(uid); if(idx >= 0) subs.splice(idx, 1); else subs.push(uid); ctx.globalStore.subs = subs; await ctx.answer(idx >= 0 ? '🔕 Отписан' : '🔔 Подписан'); await ctx.editText(`📰 ${idx >= 0 ? '❌ Отписан' : '✅ Подписан'}`, { markup: inlineKeyboard([[btn(idx >= 0 ? '🔔 Подписаться' : '🔕 Отписаться', 'toggle_sub')]]) }); }}] }),
  },
  {
    id: 'price-list', name: 'Прайс-лист', description: 'Услуги и цены', icon: '💰',
    category: 'business', tags: ['цены'], codePreview: `const services = [{name, price, desc}];`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('💰 Прайс-лист', { markup: inlineKeyboard([[btn('💇 Стрижка', 's_1')],[btn('💅 Маникюр', 's_2')],[btn('💆 Массаж', 's_3')]]) }); }}], callbackHandlers: [{ prefix: 's_', handler: async ctx => { const services: Record<string,{n:string,p:number,d:string}> = {'1':{n:'💇 Стрижка',p:1000,d:'30 мин'},'2':{n:'💅 Маникюр',p:1500,d:'45 мин'},'3':{n:'💆 Массаж',p:2000,d:'60 мин'}}; const s = services[ctx.data.slice(2)]; await ctx.answer(); await ctx.editText(`${s.n}\n\n💰 ${s.p}₽\n⏱ ${s.d}`, { markup: inlineKeyboard([[btn('📅 Записаться', 'book')],[btn('◀️ Назад', 'back')]]) }); }},{ data: 'back', handler: async ctx => { await ctx.answer(); await ctx.editText('💰 Прайс-лист', { markup: inlineKeyboard([[btn('💇 Стрижка', 's_1')],[btn('💅 Маникюр', 's_2')],[btn('💆 Массаж', 's_3')]]) }); }},{ data: 'book', handler: async ctx => { await ctx.answer('📅'); await ctx.editText('📅 Выберите время:', { markup: inlineKeyboard([[btn('10:00','b_10'),btn('12:00','b_12')],[btn('14:00','b_14'),btn('16:00','b_16')]]) }); }},{ prefix: 'b_', handler: async ctx => { await ctx.answer('✅'); await ctx.editText(`✅ Записаны на ${ctx.data.slice(2)}:00`); }}] }),
  },
];

// ═══════════════════════════════════════════════════════════════
//  👥 СОЦИАЛЬНЫЕ (29-34)
// ═══════════════════════════════════════════════════════════════

const socialTemplates: TemplateInfo[] = [
  {
    id: 'anonymous-chat', name: 'Анонимный чат', description: 'Случайный собеседник', icon: '🎭',
    category: 'social', tags: ['чат', 'анонимно'], codePreview: `// Поиск пары`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('🎭 Анонимный чат!\n\n/search — найти собеседника\n/stop — закончить'); }},{ command: '/search', handler: async ctx => { await ctx.reply('🔍 Ищем собеседника...\n\n(Демо-режим)'); }},{ command: '/stop', handler: async ctx => { await ctx.reply('👋 Чат завершён'); }}], callbackHandlers: [] }),
  },
  {
    id: 'confession', name: 'Признания', description: 'Анонимные признания', icon: '💌',
    category: 'social', tags: ['анонимно'], codePreview: `// Анонимное сообщение`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('💌 Анонимные признания!\n\nНапиши признание — оно будет анонимным'); }},{ fallback: true, handler: async ctx => { const c = (ctx.globalStore.confessions as string[]) || []; c.push(ctx.text); ctx.globalStore.confessions = c; await ctx.reply(`💌 Признание #${c.length} сохранено!`, { markup: inlineKeyboard([[btn('📖 Читать', 'read')]]) }); }}], callbackHandlers: [{ data: 'read', handler: async ctx => { const c = (ctx.globalStore.confessions as string[]) || []; await ctx.answer(); await ctx.editText(c.length ? `💌 #${c.length}:\n\n"${c[c.length-1]}"` : '📭 Пусто'); }}] }),
  },
  {
    id: 'dating', name: 'Знакомства', description: 'Анкеты и поиск пары', icon: '💕',
    category: 'social', tags: ['знакомства'], codePreview: `ctx.store.profile = {name, age, about};`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('💕 Знакомства!\n\nСоздай анкету:', { markup: inlineKeyboard([[btn('📝 Создать анкету', 'create_profile')],[btn('👀 Смотреть анкеты', 'browse')]]) }); }}], callbackHandlers: [{ data: 'create_profile', handler: async ctx => { await ctx.answer(); await ctx.editText('📝 Напиши о себе (имя, возраст, интересы):'); ctx.store.creating = true; }},{ data: 'browse', handler: async ctx => { await ctx.answer(); await ctx.editText('👀 Анкеты:\n\nАнна, 25, любит музыку 🎵\n\n(Демо)', { markup: inlineKeyboard([[btn('❤️', 'like'),btn('👎', 'skip')]]) }); }},{ data: 'like', handler: async ctx => { await ctx.answer('💕 Взаимно!'); }},{ data: 'skip', handler: async ctx => { await ctx.answer('➡️'); }}] }),
  },
  {
    id: 'birthday-reminder', name: 'Дни рождения', description: 'Напоминания о ДР', icon: '🎂',
    category: 'social', tags: ['напоминания'], codePreview: `ctx.store.birthdays = [{name, date}];`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('🎂 Дни рождения!\n\n/add Имя ДД.ММ\n/list — список'); }},{ command: '/add', handler: async ctx => { const p = ctx.text.replace('/add','').trim().split(' '); const bds = (ctx.store.bds as any[]) || []; bds.push({name:p[0],date:p[1]}); ctx.store.bds = bds; await ctx.reply(`✅ ${p[0]} — ${p[1]}`); }},{ command: '/list', handler: async ctx => { const bds = (ctx.store.bds as any[]) || []; await ctx.reply(bds.length ? '🎂 ' + bds.map(b=>`${b.name}: ${b.date}`).join('\n') : '📭 Пусто'); }}], callbackHandlers: [] }),
  },
  {
    id: 'voting', name: 'Голосование', description: 'Создание голосований', icon: '🗳',
    category: 'social', tags: ['голосование'], codePreview: `// Варианты и подсчёт`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('🗳 Голосование!\n\nКуда идём?', { markup: inlineKeyboard([[btn('🎬 Кино', 'v_1'),btn('🍕 Пицца', 'v_2')],[btn('🏠 Домой', 'v_3')]]) }); }}], callbackHandlers: [{ prefix: 'v_', handler: async ctx => { const id = ctx.data; const votes = (ctx.globalStore.votes as any) || {}; votes[id] = (votes[id] || 0) + 1; ctx.globalStore.votes = votes; await ctx.answer(`✅ Голосов: ${votes[id]}`); }}] }),
  },
  {
    id: 'group-manager', name: 'Модерация группы', description: 'Правила, предупреждения', icon: '👮',
    category: 'social', tags: ['модерация'], codePreview: `// Предупреждения`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('👮 Модератор!\n\n/rules — правила\n/warn @user'); }},{ command: '/rules', handler: async ctx => { await ctx.reply('📜 Правила:\n1. Уважение\n2. Без спама\n3. По теме'); }},{ command: '/warn', handler: async ctx => { const user = ctx.text.replace('/warn','').trim(); await ctx.reply(`⚠️ ${user} получил предупреждение!`); }}], callbackHandlers: [] }),
  },
];

// ═══════════════════════════════════════════════════════════════
//  🎉 РАЗВЛЕЧЕНИЯ (35-40)
// ═══════════════════════════════════════════════════════════════

const funTemplates: TemplateInfo[] = [
  {
    id: 'meme-gen', name: 'Генератор мемов', description: 'Случайные мемы и шутки', icon: '😂',
    category: 'fun', tags: ['мемы'], codePreview: `const memes = ['мем1', 'мем2'];`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('😂 Мемы!', { markup: inlineKeyboard([[btn('🎲 Рандом', 'meme')]]) }); }}], callbackHandlers: [{ data: 'meme', handler: async ctx => { const memes = ['Когда код заработал с первого раза 🎉','Понедельник... опять 😫','CSS центрирование div 🤯','git push --force 💀','It works on my machine 🤷']; await ctx.answer(); await ctx.editText(`😂 ${pick(memes)}`, { markup: inlineKeyboard([[btn('🎲 Ещё', 'meme')]]) }); }}] }),
  },
  {
    id: 'fortune', name: 'Гадание', description: 'Предсказания и гороскоп', icon: '🔮',
    category: 'fun', tags: ['гадание'], codePreview: `const fortunes = ['Удача!', 'Жди...'];`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('🔮 Гадание!', { markup: inlineKeyboard([[btn('🎱 Шар судьбы', 'ball')],[btn('🌟 Гороскоп', 'horo')]]) }); }}], callbackHandlers: [{ data: 'ball', handler: async ctx => { const ans = ['Да','Нет','Возможно','Определённо','Спроси позже','Не рассчитывай','Сомневаюсь']; await ctx.answer(); await ctx.editText(`🎱 ${pick(ans)}`, { markup: inlineKeyboard([[btn('🔄', 'ball')]]) }); }},{ data: 'horo', handler: async ctx => { const signs = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']; const preds = ['Удача ждёт!','Любовь близко','Деньги придут','Будь осторожен','Отдохни']; await ctx.answer(); await ctx.editText(`${pick(signs)} ${pick(preds)}`, { markup: inlineKeyboard([[btn('🔄', 'horo')]]) }); }}] }),
  },
  {
    id: 'truth-dare', name: 'Правда или действие', description: 'Игра для компании', icon: '🎯',
    category: 'fun', tags: ['игра', 'компания'], codePreview: `const truths = ['Правда?'];`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('🎯 Правда или Действие!', { markup: inlineKeyboard([[btn('❓ Правда', 'truth'),btn('⚡ Действие', 'dare')]]) }); }}], callbackHandlers: [{ data: 'truth', handler: async ctx => { const qs = ['Самый стыдный момент?','Кого бы поцеловал?','Врал сегодня?','Боишься чего?']; await ctx.answer(); await ctx.editText(`❓ ${pick(qs)}`, { markup: inlineKeyboard([[btn('❓', 'truth'),btn('⚡', 'dare')]]) }); }},{ data: 'dare', handler: async ctx => { const ds = ['Станцуй!','Позвони последнему в чате','Сделай селфи','Скажи комплимент']; await ctx.answer(); await ctx.editText(`⚡ ${pick(ds)}`, { markup: inlineKeyboard([[btn('❓', 'truth'),btn('⚡', 'dare')]]) }); }}] }),
  },
  {
    id: 'compliment', name: 'Комплименты', description: 'Генератор комплиментов', icon: '💖',
    category: 'fun', tags: ['позитив'], codePreview: `const compliments = ['Ты супер!'];`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('💖 Комплименты!', { markup: inlineKeyboard([[btn('💖 Получить', 'comp')]]) }); }}], callbackHandlers: [{ data: 'comp', handler: async ctx => { const cs = ['Ты потрясающий! ✨','У тебя красивая улыбка 😊','Ты умница! 🧠','С тобой классно 🎉','Ты вдохновляешь! 💪']; await ctx.answer(); await ctx.editText(`💖 ${pick(cs)}`, { markup: inlineKeyboard([[btn('💖 Ещё', 'comp')]]) }); }}] }),
  },
  {
    id: 'nickname-gen', name: 'Генератор ников', description: 'Случайные никнеймы', icon: '🏷',
    category: 'fun', tags: ['генератор'], codePreview: `const adj = ['Cool','Dark']; const noun = ['Wolf','Cat'];`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('🏷 Ники!', { markup: inlineKeyboard([[btn('🎲 Сгенерировать', 'nick')]]) }); }}], callbackHandlers: [{ data: 'nick', handler: async ctx => { const adj = ['Dark','Cool','Fast','Epic','Mega','Super','Pro','Ultra']; const noun = ['Wolf','Cat','Dragon','Phoenix','Ninja','Coder','Gamer','King']; const num = rnd(999); await ctx.answer(); await ctx.editText(`🏷 ${pick(adj)}${pick(noun)}${num}`, { markup: inlineKeyboard([[btn('🔄', 'nick')]]) }); }}] }),
  },
  {
    id: 'quote-gen', name: 'Цитаты', description: 'Мудрые цитаты', icon: '📜',
    category: 'fun', tags: ['цитаты'], codePreview: `const quotes = ['Цитата — Автор'];`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('📜 Цитаты!', { markup: inlineKeyboard([[btn('📜 Получить', 'quote')]]) }); }}], callbackHandlers: [{ data: 'quote', handler: async ctx => { const qs = ['"Будь собой" — Оскар Уайльд','"Знание — сила" — Фрэнсис Бэкон','"Время — деньги" — Франклин','"Живи сейчас" — Будда']; await ctx.answer(); await ctx.editText(`📜 ${pick(qs)}`, { markup: inlineKeyboard([[btn('📜 Ещё', 'quote')]]) }); }}] }),
  },
];

// ═══════════════════════════════════════════════════════════════
//  📚 ОБРАЗОВАНИЕ (41-44)
// ═══════════════════════════════════════════════════════════════

const educationTemplates: TemplateInfo[] = [
  {
    id: 'flashcards', name: 'Карточки', description: 'Учи слова', icon: '🗃',
    category: 'education', tags: ['обучение'], codePreview: `const cards = [{q:'Hello', a:'Привет'}];`,
    buildScript: () => {
      const cards = [{q:'Hello',a:'Привет'},{q:'World',a:'Мир'},{q:'Code',a:'Код'},{q:'Bot',a:'Бот'}];
      return { handlers: [{ command: '/start', handler: async ctx => { ctx.store.idx = 0; await ctx.reply('🗃 Карточки!', { markup: inlineKeyboard([[btn('▶️ Начать', 'card')]]) }); }}], callbackHandlers: [{ data: 'card', handler: async ctx => { const i = (ctx.store.idx as number) % cards.length; await ctx.answer(); await ctx.editText(`🗃 ${cards[i].q}\n\n???`, { markup: inlineKeyboard([[btn('👀 Показать', `show_${i}`)]]) }); }},{ prefix: 'show_', handler: async ctx => { const i = parseInt(ctx.data.slice(5)); ctx.store.idx = i + 1; await ctx.answer(); await ctx.editText(`🗃 ${cards[i].q}\n\n✅ ${cards[i].a}`, { markup: inlineKeyboard([[btn('▶️ Далее', 'card')]]) }); }}] };
    },
  },
  {
    id: 'dictionary', name: 'Словарь', description: 'Переводчик слов', icon: '📖',
    category: 'education', tags: ['язык'], codePreview: `const dict = {word: 'перевод'};`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('📖 Словарь!\n\nПиши слово на EN'); }},{ fallback: true, handler: async ctx => { const dict: Record<string,string> = {hello:'привет',world:'мир',love:'любовь',code:'код',bot:'бот',cat:'кот',dog:'собака'}; const w = ctx.text.toLowerCase(); await ctx.reply(dict[w] ? `📖 ${w} = ${dict[w]}` : '❓ Не найдено'); }}], callbackHandlers: [] }),
  },
  {
    id: 'math-trainer', name: 'Математика', description: 'Тренажёр примеров', icon: '➕',
    category: 'education', tags: ['математика'], codePreview: `const a = rnd(10), b = rnd(10);`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('➕ Математика!', { markup: inlineKeyboard([[btn('▶️ Пример', 'math')]]) }); }}], callbackHandlers: [{ data: 'math', handler: async ctx => { const a = rnd(10)+1, b = rnd(10)+1; const ops = ['+','-','×']; const op = pick(ops); let ans = op==='+' ? a+b : op==='-' ? a-b : a*b; ctx.store.ans = ans; await ctx.answer(); await ctx.editText(`➕ ${a} ${op} ${b} = ?`, { markup: inlineKeyboard([[btn(String(ans), 'c'),btn(String(ans+rnd(5)+1), 'w'),btn(String(ans-rnd(3)-1), 'w')]]) }); }},{ data: 'c', handler: async ctx => { await ctx.answer('✅ Верно!'); await ctx.editText('✅', { markup: inlineKeyboard([[btn('▶️ Ещё', 'math')]]) }); }},{ data: 'w', handler: async ctx => { await ctx.answer(`❌ Ответ: ${ctx.store.ans}`); }}] }),
  },
  {
    id: 'typing-tutor', name: 'Печать', description: 'Учись печатать', icon: '⌨️',
    category: 'education', tags: ['навыки'], codePreview: `// Измеряем скорость`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('⌨️ Печать!', { markup: inlineKeyboard([[btn('▶️ Тест', 'type_test')]]) }); }}], callbackHandlers: [{ data: 'type_test', handler: async ctx => { const words = ['программа','клавиатура','компьютер','телеграм','разработка']; const w = pick(words); ctx.store.word = w; ctx.store.time = Date.now(); await ctx.answer(); await ctx.editText(`⌨️ Напиши:\n\n**${w}**`, { parse_mode: 'Markdown' }); }}] }),
  },
];

// ═══════════════════════════════════════════════════════════════
//  💰 КРИПТО/ФИНАНСЫ (45-48)
// ═══════════════════════════════════════════════════════════════

const cryptoTemplates: TemplateInfo[] = [
  {
    id: 'crypto-exchange', name: 'Крипто биржа', description: 'Торговля криптой', icon: '📈',
    category: 'crypto', tags: ['биржа', 'трейдинг'], codePreview: `const prices = {BTC: 65000, ETH: 3500};`,
    buildScript: () => {
      const coins = {BTC:65000,ETH:3500,SOL:150};
      return { handlers: [{ command: '/start', handler: async ctx => { ctx.store.balance = 10000; ctx.store.portfolio = {}; await ctx.reply('📈 Крипто Биржа!\n💰 $10,000', { markup: inlineKeyboard([[btn('📊 Курсы', 'prices')],[btn('🛒 Купить', 'buy_menu'),btn('💼 Портфель', 'portfolio')]]) }); }}], callbackHandlers: [{ data: 'prices', handler: async ctx => { let t = '📊 Курсы:\n'; for(const [s,p] of Object.entries(coins)) t += `${s}: $${p}\n`; await ctx.answer(); await ctx.editText(t, { markup: inlineKeyboard([[btn('🔄', 'prices')],[btn('◀️', 'back')]]) }); }},{ data: 'buy_menu', handler: async ctx => { await ctx.answer(); await ctx.editText('🛒 Купить (на $100):', { markup: inlineKeyboard(Object.keys(coins).map(s=>[btn(s, `buy_${s}`)]).concat([[btn('◀️', 'back')]])) }); }},{ prefix: 'buy_', handler: async ctx => { const s = ctx.data.slice(4); const p = coins[s as keyof typeof coins]; let bal = ctx.store.balance as number; if(bal < 100) { await ctx.answer('❌ Мало денег'); return; } bal -= 100; ctx.store.balance = bal; const pf = (ctx.store.portfolio as any) || {}; pf[s] = (pf[s]||0) + 100/p; ctx.store.portfolio = pf; await ctx.answer(`✅ +${(100/p).toFixed(6)} ${s}`); }},{ data: 'portfolio', handler: async ctx => { const pf = (ctx.store.portfolio as any) || {}; let t = `💼 Портфель:\n💵 $${ctx.store.balance}\n\n`; for(const [s,a] of Object.entries(pf)) { const v = (a as number) * coins[s as keyof typeof coins]; t += `${s}: ${(a as number).toFixed(4)} ($${v.toFixed(2)})\n`; } await ctx.answer(); await ctx.editText(t, { markup: inlineKeyboard([[btn('◀️', 'back')]]) }); }},{ data: 'back', handler: async ctx => { await ctx.answer(); await ctx.editText(`📈 Биржа\n💰 $${ctx.store.balance}`, { markup: inlineKeyboard([[btn('📊 Курсы', 'prices')],[btn('🛒 Купить', 'buy_menu'),btn('💼 Портфель', 'portfolio')]]) }); }}] };
    },
  },
  {
    id: 'wallet', name: 'Кошелёк', description: 'Учёт расходов', icon: '💳',
    category: 'crypto', tags: ['финансы'], codePreview: `ctx.store.transactions.push({amount, desc});`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { ctx.store.balance = 0; await ctx.reply('💳 Кошелёк!\n\n+100 Зарплата\n-50 Еда'); }},{ fallback: true, handler: async ctx => { const m = ctx.text.match(/^([+-]?\d+)\s*(.*)$/); if(!m) return; const amt = parseInt(m[1]), desc = m[2] || ''; let bal = (ctx.store.balance as number) || 0; bal += amt; ctx.store.balance = bal; const txs = (ctx.store.txs as any[]) || []; txs.push({amt,desc,time:Date.now()}); ctx.store.txs = txs; await ctx.reply(`${amt>0?'➕':'➖'} ${Math.abs(amt)}₽ ${desc}\n\n💰 Баланс: ${bal}₽`); }}], callbackHandlers: [] }),
  },
  {
    id: 'currency', name: 'Курсы валют', description: 'Конвертер валют', icon: '💱',
    category: 'crypto', tags: ['валюты'], codePreview: `const rates = {USD: 90, EUR: 100};`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('💱 Курсы валют!\n\n/conv 100 USD RUB'); }},{ command: '/conv', handler: async ctx => { const p = ctx.text.replace('/conv','').trim().split(' '); const rates: Record<string,number> = {USD:90,EUR:100,RUB:1,GBP:115}; const amt = parseFloat(p[0]), from = p[1]?.toUpperCase(), to = p[2]?.toUpperCase(); if(!amt||!rates[from]||!rates[to]) { await ctx.reply('❌ /conv 100 USD RUB'); return; } const result = amt * rates[from] / rates[to]; await ctx.reply(`💱 ${amt} ${from} = ${result.toFixed(2)} ${to}`); }}], callbackHandlers: [] }),
  },
  {
    id: 'investment', name: 'Инвестиции', description: 'Симулятор инвестора', icon: '📊',
    category: 'crypto', tags: ['инвестиции'], codePreview: `// Портфель акций`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { ctx.store.money = 100000; await ctx.reply('📊 Инвестиции!\n💰 100,000₽', { markup: inlineKeyboard([[btn('🏦 Акции', 'stocks')],[btn('💼 Портфель', 'inv_portfolio')]]) }); }}], callbackHandlers: [{ data: 'stocks', handler: async ctx => { await ctx.answer(); await ctx.editText('🏦 Акции:', { markup: inlineKeyboard([[btn('AAPL $150', 'buy_AAPL')],[btn('GOOG $140', 'buy_GOOG')],[btn('◀️', 'inv_back')]]) }); }},{ prefix: 'buy_', handler: async ctx => { const s = ctx.data.slice(4); await ctx.answer(`✅ ${s}`); }},{ data: 'inv_portfolio', handler: async ctx => { await ctx.answer(); await ctx.editText(`💼 Портфель:\n💰 ${ctx.store.money}₽`, { markup: inlineKeyboard([[btn('◀️', 'inv_back')]]) }); }},{ data: 'inv_back', handler: async ctx => { await ctx.answer(); await ctx.editText('📊 Инвестиции', { markup: inlineKeyboard([[btn('🏦 Акции', 'stocks')],[btn('💼 Портфель', 'inv_portfolio')]]) }); }}] }),
  },
];

// ═══════════════════════════════════════════════════════════════
//  ⚙️ АДМИНСКИЕ (49-50)
// ═══════════════════════════════════════════════════════════════

const adminTemplates: TemplateInfo[] = [
  {
    id: 'stats-bot', name: 'Статистика', description: 'Аналитика использования', icon: '📊',
    category: 'admin', tags: ['аналитика'], codePreview: `ctx.globalStore.visits++;`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { ctx.globalStore.visits = ((ctx.globalStore.visits as number) || 0) + 1; ctx.globalStore.users = ((ctx.globalStore.users as number) || 0) + (ctx.store.counted ? 0 : 1); ctx.store.counted = true; await ctx.reply(`📊 Статистика:\n\n👥 Пользователей: ${ctx.globalStore.users}\n👁 Визитов: ${ctx.globalStore.visits}`); }}], callbackHandlers: [] }),
  },
  {
    id: 'admin-panel', name: 'Админ-панель', description: 'Управление ботом', icon: '⚙️',
    category: 'admin', tags: ['админ'], codePreview: `if (ctx.from.id === ADMIN_ID) { ... }`,
    buildScript: () => ({ handlers: [{ command: '/start', handler: async ctx => { await ctx.reply('⚙️ Админ-панель\n\n/stats — статистика\n/broadcast — рассылка'); }},{ command: '/stats', handler: async ctx => { const users = Object.keys(ctx.globalStore).length; await ctx.reply(`📊 Пользователей: ${users}`); }},{ command: '/broadcast', handler: async ctx => { const msg = ctx.text.replace('/broadcast','').trim(); await ctx.reply(`📢 Рассылка:\n"${msg}"\n\n(Демо)`); }}], callbackHandlers: [] }),
  },
];

// ═══════════════════════════════════════════════════════════════
//  ОБЪЕДИНЕНИЕ ВСЕХ ШАБЛОНОВ
// ═══════════════════════════════════════════════════════════════

export const templates: TemplateInfo[] = [
  ...gameTemplates,
  ...toolTemplates,
  ...businessTemplates,
  ...socialTemplates,
  ...funTemplates,
  ...educationTemplates,
  ...cryptoTemplates,
  ...adminTemplates,
];

export const getTemplatesByCategory = (categoryId: string) => 
  templates.filter(t => t.category === categoryId);
