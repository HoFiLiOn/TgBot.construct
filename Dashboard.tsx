import { Bot as BotIcon, Plus, Zap, AlertCircle, Workflow, ArrowRight, Cpu } from 'lucide-react';
import { Bot } from '../types';
import BotCard from './BotCard';

interface DashboardProps {
  bots: Bot[];
  maxBots: number;
  canAddMore: boolean;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onNavigate: (page: string) => void;
}

export default function Dashboard({
  bots,
  maxBots,
  canAddMore,
  onStart,
  onStop,
  onRestart,
  onDelete,
  onView,
  onNavigate,
}: DashboardProps) {
  const runningCount = bots.filter(b => b.status === 'running').length;
  const errorCount = bots.filter(b => b.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2 text-gray-400">
            <BotIcon className="h-4 w-4" />
            <span className="text-xs">Всего ботов</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {bots.length}<span className="text-sm font-normal text-gray-500">/{maxBots}</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2 text-green-400">
            <Zap className="h-4 w-4" />
            <span className="text-xs">Long Polling</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-400">{runningCount}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2 text-blue-400">
            <Cpu className="h-4 w-4" />
            <span className="text-xs">Runtime</span>
          </div>
          <p className="mt-2 text-sm font-bold text-blue-400">Browser JS</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">Ошибки</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-400">{errorCount}</p>
        </div>
      </div>

      {/* Bot list */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Мои боты</h2>
          {canAddMore && (
            <button
              onClick={() => onNavigate('create')}
              className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              Создать
            </button>
          )}
        </div>

        {bots.length === 0 ? (
          <div className="space-y-6">
            {/* Empty state */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/30 py-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800">
                <BotIcon className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-white">Нет ботов</h3>
              <p className="mb-6 max-w-sm text-center text-sm text-gray-400">
                Создайте Telegram бота — он будет работать прямо в вашем браузере через Long Polling!
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => onNavigate('ai')}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30"
                >
                  ✨ AI Конструктор
                </button>
                <button
                  onClick={() => onNavigate('templates')}
                  className="flex items-center gap-2 rounded-lg bg-purple-500/20 px-5 py-2.5 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/30"
                >
                  <ArrowRight className="h-4 w-4" />
                  Шаблоны
                </button>
                <button
                  onClick={() => onNavigate('create')}
                  className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
                >
                  <Plus className="h-4 w-4" />
                  Свой код
                </button>
              </div>
            </div>

            {/* Architecture explanation */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Workflow className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Как это работает</h3>
              </div>

              <div className="mb-6 flex flex-wrap items-center justify-center gap-2 rounded-lg bg-gray-950 p-4 font-mono text-sm">
                <span className="rounded bg-blue-500/20 px-2.5 py-1 text-blue-300">Telegram API</span>
                <span className="text-gray-500">←→</span>
                <span className="rounded bg-purple-500/20 px-2.5 py-1 text-purple-300">Long Polling (браузер)</span>
                <span className="text-gray-500">↓</span>
                <span className="rounded bg-yellow-500/20 px-2.5 py-1 text-yellow-300">Роутер сообщений</span>
                <span className="text-gray-500">↓</span>
                <span className="rounded bg-green-500/20 px-2.5 py-1 text-green-300">Обработчики</span>
                <span className="text-gray-500">↓</span>
                <span className="rounded bg-blue-500/20 px-2.5 py-1 text-blue-300">sendMessage →</span>
                <span className="rounded bg-blue-500/20 px-2.5 py-1 text-blue-300">Telegram API</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: '🔌', title: 'Long Polling', desc: 'getUpdates через fetch — держит соединение 25с, получает новые сообщения' },
                  { icon: '🔀', title: 'Роутер', desc: 'Маршрутизация: команды (/start), префиксы (buy_), regex, fallback' },
                  { icon: '⚡', title: 'Обработчики', desc: 'ctx.reply(), ctx.editText(), ctx.answer() — ваша логика' },
                  { icon: '📤', title: 'Ответ', desc: 'sendMessage, editMessageText, answerCallbackQuery → Telegram' },
                ].map(item => (
                  <div key={item.title} className="rounded-lg bg-gray-800/50 p-4">
                    <div className="mb-2 text-xl">{item.icon}</div>
                    <h4 className="mb-1 text-sm font-medium text-white">{item.title}</h4>
                    <p className="text-xs leading-relaxed text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bots.map(bot => (
              <BotCard
                key={bot.id}
                bot={bot}
                onStart={onStart}
                onStop={onStop}
                onRestart={onRestart}
                onDelete={onDelete}
                onView={onView}
              />
            ))}
            {canAddMore && (
              <button
                onClick={() => onNavigate('create')}
                className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/30 p-5 transition-all hover:border-blue-500/50 hover:bg-gray-900/50"
              >
                <Plus className="mb-2 h-8 w-8 text-gray-500" />
                <span className="text-sm font-medium text-gray-400">Добавить бота</span>
                <span className="mt-1 text-xs text-gray-500">{bots.length}/{maxBots} слотов</span>
              </button>
            )}
          </div>
        )}
      </div>

      {!canAddMore && bots.length > 0 && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Достигнут лимит: {maxBots}/{maxBots} ботов</span>
          </div>
          <p className="mt-1 text-xs text-yellow-400/70">
            Удалите неиспользуемого бота, чтобы создать нового
          </p>
        </div>
      )}
    </div>
  );
}
