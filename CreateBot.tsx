import { useState } from 'react';
import { Key, ArrowLeft, Rocket, Info, Workflow, Code2 } from 'lucide-react';
import { Bot } from '../types';
import { templates } from '../data/templates';
import { DEFAULT_CODE } from '../engine/code-parser';
import CodeEditor from './CodeEditor';

interface CreateBotProps {
  canAddMore: boolean;
  maxBots: number;
  totalBots: number;
  onCreateBot: (name: string, token: string, templateId: string | null, customCode?: string) => Bot | null;
  onNavigate: (page: string) => void;
  selectedTemplateId?: string | null;
  hasTickets: boolean;
  initialCode?: string;
  initialName?: string;
}

export default function CreateBot({
  canAddMore,
  maxBots,
  totalBots,
  onCreateBot,
  onNavigate,
  selectedTemplateId = null,
  hasTickets,
  initialCode,
  initialName,
}: CreateBotProps) {
  const tmpl = selectedTemplateId ? templates.find(t => t.id === selectedTemplateId) : null;

  const [name, setName] = useState(initialName || (tmpl ? tmpl.name.replace(/^[^\s]+\s/, '') : ''));
  const [token, setToken] = useState('');
  const [mode, setMode] = useState<'template' | 'custom'>(initialCode ? 'custom' : (tmpl ? 'template' : 'custom'));
  const [customCode, setCustomCode] = useState(initialCode || DEFAULT_CODE);
  const [step, setStep] = useState(initialCode ? 2 : 1);
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Введите название бота');
      return;
    }
    if (!token.trim() || token.trim().length < 10) {
      setError('Введите корректный токен бота');
      return;
    }
    if (!canAddMore) {
      setError(`Достигнут лимит: ${maxBots} ботов`);
      return;
    }
    if (!hasTickets) {
      setError('Нет тикетов! Пополните баланс.');
      return;
    }

    const templateId = mode === 'template' ? selectedTemplateId : null;
    const code = mode === 'custom' ? customCode : undefined;
    
    const bot = onCreateBot(name.trim(), token.trim(), templateId, code);
    if (bot) {
      onNavigate('dashboard');
    } else {
      setError('Не удалось создать бота');
    }
  };

  if (!canAddMore) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10">
          <Info className="h-8 w-8 text-yellow-400" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-white">Лимит достигнут</h2>
        <p className="mb-6 text-center text-gray-400">
          У вас уже {totalBots} из {maxBots} ботов. Удалите неиспользуемого бота.
        </p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="rounded-lg bg-purple-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-600"
        >
          К моим ботам
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onNavigate(selectedTemplateId ? 'templates' : 'dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </button>
          <span className="text-sm text-gray-500">Шаг {step} из 3</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-purple-500' : 'bg-gray-800'
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Step 1: Mode selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Создание бота</h2>
            <p className="mt-1 text-gray-400">Выберите способ создания</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => { setMode('template'); setStep(2); }}
              className={`relative rounded-xl border-2 p-6 text-left transition-all ${
                selectedTemplateId
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-gray-700 hover:border-purple-500/50 hover:bg-purple-500/5'
              }`}
            >
              {selectedTemplateId && (
                <span className="absolute right-3 top-3 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                  Выбран
                </span>
              )}
              <Workflow className="mb-3 h-8 w-8 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Из шаблона</h3>
              <p className="mt-1 text-sm text-gray-400">
                {selectedTemplateId && tmpl
                  ? `${tmpl.icon} ${tmpl.name}`
                  : 'Готовые боты: игры, биржа, викторина...'}
              </p>
            </button>

            <button
              onClick={() => { setMode('custom'); setStep(2); }}
              className="rounded-xl border-2 border-gray-700 p-6 text-left transition-all hover:border-purple-500/50 hover:bg-purple-500/5"
            >
              <Code2 className="mb-3 h-8 w-8 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Свой код</h3>
              <p className="mt-1 text-sm text-gray-400">
                Написать или загрузить .js файл
              </p>
            </button>
          </div>

          {!selectedTemplateId && (
            <div className="text-center">
              <button
                onClick={() => onNavigate('templates')}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                → Посмотреть все шаблоны
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Name, Token & Code */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {mode === 'template' ? 'Настройка бота' : 'Код бота'}
            </h2>
            <p className="mt-1 text-gray-400">
              {mode === 'template'
                ? `Шаблон: ${tmpl?.icon} ${tmpl?.name || 'Не выбран'}`
                : 'Напишите или загрузите свой код'}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Название бота
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Мой бот"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  <Key className="mr-1.5 inline h-4 w-4" />
                  Токен бота
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="1234567890:ABCdefGhIjKlmnOpQrsTUVwxyz"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 font-mono text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
                />
                <div className="mt-2 rounded-lg bg-purple-500/5 p-3 text-xs text-purple-400/80">
                  <p>Получить у <strong>@BotFather</strong>: /newbot → скопировать токен</p>
                </div>
              </div>
            </div>

            {mode === 'template' && tmpl && (
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{tmpl.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white">{tmpl.name}</h3>
                    <p className="text-xs text-gray-400">{tmpl.description}</p>
                  </div>
                </div>
                <pre className="rounded-lg bg-gray-950 p-3 font-mono text-xs text-gray-500 overflow-auto max-h-32">
                  {tmpl.codePreview}
                </pre>
              </div>
            )}
          </div>

          {mode === 'custom' && (
            <CodeEditor
              code={customCode}
              onChange={setCustomCode}
            />
          )}

          <button
            onClick={() => {
              if (!name.trim()) { setError('Введите название'); return; }
              if (!token.trim() || token.trim().length < 10) { setError('Введите токен'); return; }
              if (mode === 'custom' && !customCode.trim()) { setError('Добавьте код'); return; }
              setError('');
              setStep(3);
            }}
            className="w-full rounded-lg bg-purple-500 py-3 text-sm font-medium text-white hover:bg-purple-600"
          >
            Далее →
          </button>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Готово к запуску! 🚀</h2>
            <p className="mt-1 text-gray-400">Проверьте настройки</p>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
              <div className="mb-1 text-xs text-gray-500">Название</div>
              <div className="font-medium text-white">{name}</div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
              <div className="mb-1 text-xs text-gray-500">Токен</div>
              <div className="font-mono text-sm text-gray-300">
                {token.slice(0, 8)}{'•'.repeat(8)}{token.slice(-4)}
              </div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
              <div className="mb-1 text-xs text-gray-500">Режим</div>
              <div className="text-sm text-gray-300">
                {mode === 'template' && tmpl
                  ? `📦 Шаблон: ${tmpl.icon} ${tmpl.name}`
                  : `📝 Свой код (${customCode.split('\n').length} строк)`}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
            <h4 className="mb-2 text-sm font-medium text-purple-400">При запуске:</h4>
            <ul className="space-y-1 text-xs text-purple-400/70">
              <li>• Проверка токена (getMe)</li>
              <li>• Компиляция кода</li>
              <li>• Long Polling (getUpdates)</li>
              <li>• Каждую секунду списывается 1 тикет</li>
            </ul>
          </div>

          {!hasTickets && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">
                ⚠️ Нет тикетов! <button onClick={() => onNavigate('tickets')} className="underline">Пополните баланс</button>
              </p>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={!hasTickets}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Rocket className="h-5 w-5" />
            Создать бота
          </button>
        </div>
      )}
    </div>
  );
}
