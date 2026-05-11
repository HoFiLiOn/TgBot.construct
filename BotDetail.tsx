import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Play,
  Square,
  RotateCw,
  Trash2,
  Terminal,
  Settings,
  Copy,
  Check,
  Activity,
  Workflow,
  Database,
  Code2,
  Save,
} from 'lucide-react';
import { Bot } from '../types';
import { templates } from '../data/templates';
import CodeEditor from './CodeEditor';

interface BotDetailProps {
  bot: Bot;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Bot>) => void;
  onBack: () => void;
  getRuntimeStats: (id: string) => { messages: number; callbacks: number; uptime: number; botUsername: string | null } | null;
  getRuntimeDatabase: (id: string) => { users: Map<number, Record<string, unknown>>; global: Record<string, unknown> } | null;
  formatTickets: (s: number) => string;
}

export default function BotDetail({
  bot,
  onStart,
  onStop,
  onRestart,
  onDelete,
  onUpdate,
  onBack,
  getRuntimeStats,
  getRuntimeDatabase,
  formatTickets,
}: BotDetailProps) {
  const [activeTab, setActiveTab] = useState<'logs' | 'code' | 'database' | 'settings'>('logs');
  const [editName, setEditName] = useState(bot.name);
  const [editToken, setEditToken] = useState(bot.token);
  const [editCode, setEditCode] = useState(bot.customCode);
  const [copied, setCopied] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<{ messages: number; callbacks: number; uptime: number; botUsername: string | null } | null>(null);
  const [database, setDatabase] = useState<{ users: Map<number, Record<string, unknown>>; global: Record<string, unknown> } | null>(null);

  const tmpl = bot.templateId ? templates.find(t => t.id === bot.templateId) : null;

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [bot.logs]);

  useEffect(() => {
    if (bot.status !== 'running') {
      setStats(null);
      setDatabase(null);
      return;
    }
    const iv = setInterval(() => {
      setStats(getRuntimeStats(bot.id));
      setDatabase(getRuntimeDatabase(bot.id));
    }, 1000);
    setStats(getRuntimeStats(bot.id));
    setDatabase(getRuntimeDatabase(bot.id));
    return () => clearInterval(iv);
  }, [bot.status, bot.id, getRuntimeStats, getRuntimeDatabase]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(bot.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = () => {
    onUpdate(bot.id, {
      name: editName.trim() || bot.name,
      token: editToken.trim() || bot.token,
    });
  };

  const handleSaveCode = () => {
    onUpdate(bot.id, { customCode: editCode, templateId: null });
  };

  const statusColors = { running: 'text-green-400', stopped: 'text-gray-400', error: 'text-red-400' };
  const statusLabels = { running: 'Работает', stopped: 'Остановлен', error: 'Ошибка' };

  function formatUptime(ms: number) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}ч ${m % 60}м ${s % 60}с`;
    if (m > 0) return `${m}м ${s % 60}с`;
    return `${s}с`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-2xl">{tmpl?.icon || '🤖'}</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{bot.name}</h2>
              <span className={`text-sm font-medium ${statusColors[bot.status]}`}>• {statusLabels[bot.status]}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {stats?.botUsername && <span className="text-cyan-400">@{stats.botUsername}</span>}
              <span>{tmpl ? tmpl.name : 'Свой код'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {bot.status === 'running' ? (
            <>
              <button onClick={() => onStop(bot.id)} className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20">
                <Square className="h-4 w-4" /> Стоп
              </button>
              <button onClick={() => onRestart(bot.id)} className="flex items-center gap-1.5 rounded-lg bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-400 hover:bg-yellow-500/20">
                <RotateCw className="h-4 w-4" /> Рестарт
              </button>
            </>
          ) : (
            <button onClick={() => onStart(bot.id)} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600">
              <Play className="h-4 w-4" /> Запустить
            </button>
          )}
          <button onClick={() => { if (confirm('Удалить бота?')) { onDelete(bot.id); onBack(); }}} className="rounded-lg bg-gray-800 px-3 py-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      {bot.status === 'running' && stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
            <div className="text-xs text-green-400/70">Аптайм</div>
            <div className="mt-1 text-lg font-bold text-green-400">{formatUptime(stats.uptime)}</div>
          </div>
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <div className="text-xs text-blue-400/70">Сообщений</div>
            <div className="mt-1 text-lg font-bold text-blue-400">{stats.messages}</div>
          </div>
          <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
            <div className="text-xs text-purple-400/70">Callback</div>
            <div className="mt-1 text-lg font-bold text-purple-400">{stats.callbacks}</div>
          </div>
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
            <div className="text-xs text-yellow-400/70">Тикетов потрачено</div>
            <div className="mt-1 text-lg font-bold text-yellow-400">{formatTickets(bot.ticketsUsed)}</div>
          </div>
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
            <div className="text-xs text-cyan-400/70">Режим</div>
            <div className="mt-1 flex items-center gap-1 text-sm font-bold text-cyan-400">
              <Activity className="h-3.5 w-3.5 animate-pulse" /> Polling
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-900/50 p-1 overflow-x-auto">
        {[
          { id: 'logs' as const, icon: Terminal, label: 'Логи' },
          { id: 'code' as const, icon: Code2, label: 'Код' },
          { id: 'database' as const, icon: Database, label: 'БД' },
          { id: 'settings' as const, icon: Settings, label: 'Настройки' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Logs */}
      {activeTab === 'logs' && (
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-gray-300">Консоль</span>
              {bot.status === 'running' && (
                <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" /> live
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">{bot.logs.length} записей</span>
          </div>
          <div ref={logContainerRef} className="h-[400px] overflow-y-auto p-4 font-mono text-sm">
            {bot.logs.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-gray-600">
                <Terminal className="mb-2 h-8 w-8" />
                <p>Нет логов. Запустите бота.</p>
              </div>
            ) : (
              bot.logs.map((log, i) => (
                <div key={i} className="mb-0.5 flex gap-2 leading-relaxed">
                  <span className="flex-shrink-0 text-gray-600">[{new Date(log.time).toLocaleTimeString('ru-RU')}]</span>
                  <span className={log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-gray-300'}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Code Editor */}
      {activeTab === 'code' && (
        <div className="space-y-4">
          {tmpl && !bot.customCode ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
              <div className="flex items-center gap-2 mb-2 text-yellow-400">
                <Workflow className="h-4 w-4" />
                <span className="text-sm font-medium">Используется шаблон: {tmpl.icon} {tmpl.name}</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Чтобы редактировать код, скопируйте шаблон и внесите изменения:
              </p>
              <button
                onClick={() => setEditCode(tmpl.codePreview)}
                className="rounded-lg bg-purple-500/20 px-4 py-2 text-sm text-purple-400 hover:bg-purple-500/30"
              >
                Конвертировать в свой код
              </button>
            </div>
          ) : (
            <>
              <CodeEditor
                code={editCode}
                onChange={setEditCode}
                onSave={handleSaveCode}
                onTest={() => {
                  handleSaveCode();
                  onRestart(bot.id);
                }}
              />
              {editCode !== bot.customCode && (
                <div className="flex gap-2">
                  <button onClick={handleSaveCode} className="flex items-center gap-1.5 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600">
                    <Save className="h-4 w-4" /> Сохранить
                  </button>
                  <button onClick={() => setEditCode(bot.customCode)} className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-400 hover:text-white">
                    Отменить
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Database Viewer */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-semibold text-white">Хранилище данных</span>
              {bot.status === 'running' && (
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">live</span>
              )}
            </div>

            {bot.status !== 'running' ? (
              <p className="text-sm text-gray-500">Запустите бота для просмотра данных</p>
            ) : !database ? (
              <p className="text-sm text-gray-500">Загрузка...</p>
            ) : (
              <div className="space-y-4">
                {/* Global store */}
                <div>
                  <h4 className="text-xs font-medium text-gray-400 mb-2">🌐 Глобальное хранилище</h4>
                  <pre className="rounded-lg bg-gray-950 p-3 font-mono text-xs text-green-400 overflow-auto max-h-32">
                    {JSON.stringify(database.global, null, 2) || '{}'}
                  </pre>
                </div>

                {/* User stores */}
                <div>
                  <h4 className="text-xs font-medium text-gray-400 mb-2">👥 Пользователи ({database.users.size})</h4>
                  {database.users.size === 0 ? (
                    <p className="text-xs text-gray-500">Нет данных пользователей</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {Array.from(database.users.entries()).map(([userId, data]) => (
                        <div key={userId} className="rounded-lg bg-gray-950 p-3">
                          <div className="text-xs text-gray-400 mb-1">ID: {userId}</div>
                          <pre className="font-mono text-xs text-cyan-400 overflow-auto">
                            {JSON.stringify(data, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-purple-500/5 border border-purple-500/20 p-3 text-xs text-purple-400/80">
            <p><strong>ctx.store</strong> — данные текущего пользователя (сохраняются между сообщениями)</p>
            <p><strong>ctx.globalStore</strong> — общие данные для всех пользователей</p>
          </div>
        </div>
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <h3 className="mb-4 text-sm font-medium text-white">Основные</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-400">Название</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-400">Токен</label>
                <div className="flex gap-2">
                  <input type="password" value={editToken} onChange={e => setEditToken(e.target.value)} className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-purple-500" />
                  <button onClick={handleCopyToken} className="rounded-lg bg-gray-800 px-3 text-gray-400 hover:text-white">
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            {(editName !== bot.name || editToken !== bot.token) && (
              <button onClick={handleSaveSettings} className="mt-4 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600">
                Сохранить
              </button>
            )}
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <h3 className="mb-3 text-sm font-medium text-white">Информация</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">ID</span><span className="font-mono text-gray-300">{bot.id}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Создан</span><span className="text-gray-300">{new Date(bot.createdAt).toLocaleString('ru-RU')}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Тикетов потрачено</span><span className="text-yellow-400">{formatTickets(bot.ticketsUsed)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Тип</span><span className="text-gray-300">{tmpl ? `Шаблон: ${tmpl.name}` : 'Свой код'}</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <h3 className="mb-2 text-sm font-medium text-red-400">Опасная зона</h3>
            <button onClick={() => { if (confirm('Удалить бота?')) { onDelete(bot.id); onBack(); }}} className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20">
              <Trash2 className="mr-1.5 inline h-4 w-4" /> Удалить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
