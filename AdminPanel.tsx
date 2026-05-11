import { useState, useEffect } from 'react';
import { Shield, Bot, Ticket, Coins, Database, Trash2, Plus, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react';
import { Bot as BotType } from '../types';

interface AdminPanelProps {
  bots: BotType[];
  onDeleteBot: (id: string) => void;
  tickets: number;
  coins: number;
  onAddTickets: (amount: number, reason: string) => void;
  onAddCoins: (amount: number) => void;
}

const ADMIN_PASSWORD = 'hofilionclkc&birthday#fall#uwuw7$837';

interface UserTemplate {
  id: string;
  name: string;
  code: string;
  icon: string;
  createdAt: number;
}

export default function AdminPanel({
  bots,
  onDeleteBot,
  tickets,
  coins,
  onAddTickets,
  onAddCoins,
}: AdminPanelProps) {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'bots' | 'users' | 'db' | 'templates'>('stats');
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);

  // Загрузка пользовательских шаблонов
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tgbot_user_templates');
      if (stored) setUserTemplates(JSON.parse(stored));
    } catch {}
  }, []);

  // Проверка авторизации из сессии
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') setIsAuth(true);
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuth(true);
      sessionStorage.setItem('admin_auth', 'true');
      setError('');
    } else {
      setError('❌ Неверный пароль');
    }
  };

  const handleLogout = () => {
    setIsAuth(false);
    sessionStorage.removeItem('admin_auth');
    setPassword('');
  };

  // Статистика из localStorage
  const getStats = () => {
    const allKeys = Object.keys(localStorage);
    const totalSize = allKeys.reduce((acc, key) => {
      return acc + (localStorage.getItem(key)?.length || 0);
    }, 0);
    
    return {
      totalBots: bots.length,
      runningBots: bots.filter(b => b.status === 'running').length,
      totalTickets: tickets,
      totalCoins: coins,
      storageUsed: (totalSize / 1024).toFixed(2) + ' KB',
      userTemplates: userTemplates.length,
    };
  };

  // Получение всех данных из localStorage
  const getAllData = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    return data;
  };

  if (!isAuth) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
          <Shield className="h-10 w-10 text-white" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">Админ-панель</h2>
        <p className="mb-6 text-gray-400">Введите пароль для доступа</p>
        
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-red-400">
            {error}
          </div>
        )}

        <div className="w-full max-w-sm space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Пароль"
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 pr-12 text-white placeholder-gray-500 outline-none focus:border-red-500"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-500 py-3 font-semibold text-white hover:opacity-90"
          >
            <Lock className="mr-2 inline h-4 w-4" />
            Войти
          </button>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Админ-панель</h2>
            <p className="text-sm text-gray-500">Управление системой</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
        >
          Выйти
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-900/50 p-1">
        {[
          { id: 'stats', label: '📊 Статистика', icon: null },
          { id: 'bots', label: '🤖 Боты', icon: null },
          { id: 'templates', label: '📦 Шаблоны', icon: null },
          { id: 'db', label: '🗄 База данных', icon: null },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
              <div className="flex items-center gap-2 text-purple-400">
                <Bot className="h-4 w-4" />
                <span className="text-xs">Боты</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{stats.totalBots}</p>
              <p className="text-xs text-green-400">{stats.runningBots} активных</p>
            </div>
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex items-center gap-2 text-yellow-400">
                <Ticket className="h-4 w-4" />
                <span className="text-xs">Тикеты</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{stats.totalTickets.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <Coins className="h-4 w-4" />
                <span className="text-xs">Монеты</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{stats.totalCoins.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-gray-500/20 bg-gray-500/5 p-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Database className="h-4 w-4" />
                <span className="text-xs">Хранилище</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{stats.storageUsed}</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">⚡ Быстрые действия</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => { onAddTickets(3600, '👑 Админ: +1 час'); }}
                className="rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-400 hover:bg-yellow-500/20"
              >
                <Plus className="mr-1 inline h-4 w-4" />
                +1 час тикетов
              </button>
              <button
                onClick={() => { onAddCoins(1000); }}
                className="rounded-lg bg-cyan-500/10 p-3 text-sm text-cyan-400 hover:bg-cyan-500/20"
              >
                <Plus className="mr-1 inline h-4 w-4" />
                +1000 монет
              </button>
              <button
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="mr-1 inline h-4 w-4" />
                Очистить всё
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-gray-500/10 p-3 text-sm text-gray-400 hover:bg-gray-500/20"
              >
                <RefreshCw className="mr-1 inline h-4 w-4" />
                Перезагрузить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bots Tab */}
      {activeTab === 'bots' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <Bot className="h-4 w-4 text-purple-400" />
              Все боты ({bots.length})
            </h3>
            {bots.length === 0 ? (
              <p className="text-gray-500">Нет ботов</p>
            ) : (
              <div className="space-y-2">
                {bots.map(bot => (
                  <div key={bot.id} className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3">
                    <div>
                      <div className="font-medium text-white">{bot.name}</div>
                      <div className="text-xs text-gray-500">
                        {bot.status === 'running' ? '🟢' : bot.status === 'error' ? '🔴' : '⚪'} {bot.status} | 
                        Тикетов: {bot.ticketsUsed}
                      </div>
                    </div>
                    <button
                      onClick={() => { if(confirm('Удалить?')) onDeleteBot(bot.id); }}
                      className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">
              📦 Пользовательские шаблоны ({userTemplates.length})
            </h3>
            {userTemplates.length === 0 ? (
              <p className="text-gray-500">Нет пользовательских шаблонов</p>
            ) : (
              <div className="space-y-2">
                {userTemplates.map(t => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{t.icon}</span>
                      <div>
                        <div className="font-medium text-white">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.code.split('\n').length} строк</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const updated = userTemplates.filter(x => x.id !== t.id);
                        setUserTemplates(updated);
                        localStorage.setItem('tgbot_user_templates', JSON.stringify(updated));
                      }}
                      className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'db' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <Database className="h-4 w-4 text-cyan-400" />
              LocalStorage (база данных)
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(getAllData()).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-gray-800/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-400">{key}</span>
                    <button
                      onClick={() => { localStorage.removeItem(key); window.location.reload(); }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Удалить
                    </button>
                  </div>
                  <pre className="text-xs text-gray-400 overflow-auto max-h-24 whitespace-pre-wrap">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
