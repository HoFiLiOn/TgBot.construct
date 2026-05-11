import { Play, Square, RotateCw, Trash2, Eye, Clock, Cpu } from 'lucide-react';
import { Bot } from '../types';
import { templates } from '../data/templates';

interface BotCardProps {
  bot: Bot;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export default function BotCard({ bot, onStart, onStop, onRestart, onDelete, onView }: BotCardProps) {
  const statusConfig = {
    running: {
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      dot: 'bg-green-400',
      label: 'Работает',
      pulse: true,
    },
    stopped: {
      color: 'text-gray-400',
      bg: 'bg-gray-500/10 border-gray-500/20',
      dot: 'bg-gray-500',
      label: 'Остановлен',
      pulse: false,
    },
    error: {
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      dot: 'bg-red-400',
      label: 'Ошибка',
      pulse: false,
    },
  };

  const status = statusConfig[bot.status];
  const tmpl = bot.templateId ? templates.find(t => t.id === bot.templateId) : null;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-5 transition-all hover:border-gray-700 hover:bg-gray-900/80">
      <div className={`absolute left-0 top-0 h-0.5 w-full ${
        bot.status === 'running' ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
        bot.status === 'error' ? 'bg-gradient-to-r from-red-500 to-orange-400' :
        'bg-gray-700'
      }`} />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${
            bot.status === 'running' ? 'bg-green-500/10' :
            bot.status === 'error' ? 'bg-red-500/10' :
            'bg-gray-800'
          }`}>
            {tmpl ? tmpl.icon : '🤖'}
          </div>
          <div>
            <h3 className="font-semibold text-white">{bot.name}</h3>
            <div className="mt-0.5 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${status.bg} ${status.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot} ${status.pulse ? 'animate-pulse' : ''}`} />
                {status.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Cpu className="h-3 w-3" />
                {tmpl ? tmpl.name.replace(/^[^\s]+\s/, '') : 'Custom'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-gray-800/50 px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Token</span>
          <span className="font-mono text-xs text-gray-400">
            {bot.token.slice(0, 8)}{'•'.repeat(8)}{bot.token.slice(-4)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{bot.status === 'running' ? 'Polling...' : 'Не активен'}</span>
        </div>
        <span>{bot.logs.length} логов</span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {bot.status === 'running' ? (
          <>
            <button
              onClick={() => onStop(bot.id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              <Square className="h-3.5 w-3.5" />
              Стоп
            </button>
            <button
              onClick={() => onRestart(bot.id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-yellow-500/10 px-3 py-2 text-xs font-medium text-yellow-400 transition-colors hover:bg-yellow-500/20"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Рестарт
            </button>
          </>
        ) : (
          <button
            onClick={() => onStart(bot.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-2 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/20"
          >
            <Play className="h-3.5 w-3.5" />
            Запустить
          </button>
        )}
        <button
          onClick={() => onView(bot.id)}
          className="flex items-center justify-center rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => {
            if (confirm('Удалить этого бота?')) onDelete(bot.id);
          }}
          className="flex items-center justify-center rounded-lg bg-gray-800 px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
