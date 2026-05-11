import { useState } from 'react';
import { Ticket, Gift, Zap, History, AlertCircle, Coins, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { TicketTransaction } from '../types';

interface TicketsPageProps {
  tickets: number;
  coins: number;
  ticketHistory: TicketTransaction[];
  formatTickets: (s: number) => string;
  onAddTickets: (amount: number, reason: string) => void;
  onAddCoins: (amount: number) => void;
  onConvertCoins: (coins: number) => boolean;
}

export default function TicketsPage({
  tickets,
  coins,
  ticketHistory,
  formatTickets,
  onAddTickets,
  onAddCoins,
  onConvertCoins,
}: TicketsPageProps) {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [convertAmount, setConvertAmount] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');

  // Адекватные цены!
  const ticketPackages = [
    { id: 1, tickets: 1800, label: '30 мин', price: 0, priceLabel: 'Бесплатно', bonus: true },
    { id: 2, tickets: 10800, label: '3 часа', price: 29, priceLabel: '29 ₽' },
    { id: 3, tickets: 43200, label: '12 часов', price: 79, priceLabel: '79 ₽', popular: true },
    { id: 4, tickets: 86400, label: '24 часа', price: 129, priceLabel: '129 ₽' },
    { id: 5, tickets: 604800, label: '7 дней', price: 699, priceLabel: '699 ₽' },
    { id: 6, tickets: 2592000, label: '30 дней', price: 1990, priceLabel: '1 990 ₽' },
  ];

  const coinPackages = [
    { id: 1, coins: 100, price: 0, priceLabel: 'Бесплатно', bonus: true },
    { id: 2, coins: 500, price: 49, priceLabel: '49 ₽' },
    { id: 3, coins: 1500, price: 99, priceLabel: '99 ₽', popular: true },
    { id: 4, coins: 5000, price: 249, priceLabel: '249 ₽' },
  ];

  const handlePurchase = async (type: 'tickets' | 'coins') => {
    if (!selectedPackage) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));

    if (type === 'tickets') {
      const pkg = ticketPackages.find(p => p.id === selectedPackage);
      if (pkg) {
        onAddTickets(pkg.tickets, pkg.bonus ? '🎁 Бонус' : `💳 ${pkg.label}`);
        setSuccess(`+${formatTickets(pkg.tickets)}!`);
      }
    } else {
      const pkg = coinPackages.find(p => p.id === selectedPackage);
      if (pkg) {
        onAddCoins(pkg.coins);
        setSuccess(`+${pkg.coins} монет!`);
      }
    }

    setProcessing(false);
    setSelectedPackage(null);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleConvert = () => {
    if (onConvertCoins(convertAmount)) {
      setSuccess(`Конвертировано: ${convertAmount} монет → ${convertAmount * 60} тикетов`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">💎 Валюта</h2>
        <p className="mt-1 text-gray-400">Тикеты для работы ботов, монеты для покупок</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 animate-pulse">
          <CheckCircle2 className="h-6 w-6 text-green-400" />
          <span className="font-medium text-green-400">{success}</span>
        </div>
      )}

      {/* Balances */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20">
              <Ticket className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Тикеты</div>
              <div className="text-2xl font-bold text-white">{tickets.toLocaleString()}</div>
              <div className="text-xs text-yellow-400/70">{formatTickets(tickets)} работы</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20">
              <Coins className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Монеты</div>
              <div className="text-2xl font-bold text-white">{coins.toLocaleString()}</div>
              <div className="text-xs text-cyan-400/70">1 монета = 1 минута</div>
            </div>
          </div>
        </div>
      </div>

      {/* Convert coins to tickets */}
      <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-5">
        <h3 className="flex items-center gap-2 mb-4 text-sm font-semibold text-purple-400">
          <Sparkles className="h-4 w-4" />
          Конвертация монет → тикеты
        </h3>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="number"
            value={convertAmount}
            onChange={e => setConvertAmount(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-24 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-center text-white"
            min={1}
            max={coins}
          />
          <span className="text-gray-400">монет</span>
          <ArrowRight className="h-4 w-4 text-gray-500" />
          <span className="font-bold text-green-400">{(convertAmount * 60).toLocaleString()} тикетов</span>
          <span className="text-gray-500">({formatTickets(convertAmount * 60)})</span>
          <button
            onClick={handleConvert}
            disabled={coins < convertAmount || convertAmount <= 0}
            className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 disabled:opacity-50"
          >
            Конвертировать
          </button>
        </div>
      </div>

      {/* Ticket packages */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">⏱ Купить тикеты</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ticketPackages.map(pkg => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                selectedPackage === pkg.id
                  ? 'border-yellow-500 bg-yellow-500/10 scale-[1.02]'
                  : pkg.bonus
                  ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/50'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {pkg.bonus && <span className="absolute right-2 top-2 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400"><Gift className="inline h-3 w-3 mr-1"/>FREE</span>}
              {'popular' in pkg && pkg.popular && <span className="absolute right-2 top-2 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">ХИТ</span>}
              <div className="text-xl font-bold text-white">{pkg.label}</div>
              <div className="text-xs text-gray-500">{pkg.tickets.toLocaleString()} тикетов</div>
              <div className={`mt-2 text-lg font-semibold ${pkg.bonus ? 'text-green-400' : 'text-yellow-400'}`}>
                {pkg.priceLabel}
              </div>
            </button>
          ))}
        </div>
        {selectedPackage && ticketPackages.find(p => p.id === selectedPackage) && (
          <button
            onClick={() => handlePurchase('tickets')}
            disabled={processing}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 py-3 font-semibold text-white disabled:opacity-70"
          >
            {processing ? '⏳ Обработка...' : `Купить ${ticketPackages.find(p => p.id === selectedPackage)?.priceLabel}`}
          </button>
        )}
      </div>

      {/* Coin packages */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">💰 Купить монеты</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {coinPackages.map(pkg => (
            <button
              key={`c${pkg.id}`}
              onClick={() => setSelectedPackage(100 + pkg.id)}
              className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                selectedPackage === 100 + pkg.id
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : pkg.bonus
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {pkg.bonus && <span className="absolute right-2 top-2 text-xs text-green-400">🎁</span>}
              {'popular' in pkg && pkg.popular && <span className="absolute right-2 top-2 text-xs text-cyan-400">⭐</span>}
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-cyan-400" />
                <span className="text-xl font-bold text-white">{pkg.coins}</span>
              </div>
              <div className={`mt-1 text-sm ${pkg.bonus ? 'text-green-400' : 'text-cyan-400'}`}>{pkg.priceLabel}</div>
            </button>
          ))}
        </div>
        {selectedPackage && selectedPackage > 100 && (
          <button
            onClick={() => handlePurchase('coins')}
            disabled={processing}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3 font-semibold text-white disabled:opacity-70"
          >
            {processing ? '⏳...' : `Купить ${coinPackages.find(p => p.id === selectedPackage - 100)?.priceLabel}`}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-white">
          <Zap className="h-4 w-4 text-yellow-400" />
          Как работает
        </h3>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-lg bg-gray-800/50 p-3">
            <div className="text-xl mb-1">⏱</div>
            <div className="font-medium text-white">1 тикет = 1 секунда</div>
            <div className="text-xs text-gray-400">Расходуется при работе бота</div>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-3">
            <div className="text-xl mb-1">💰</div>
            <div className="font-medium text-white">1 монета = 60 тикетов</div>
            <div className="text-xs text-gray-400">Конвертируй в любое время</div>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-3">
            <div className="text-xl mb-1">🤖</div>
            <div className="font-medium text-white">AI генерация = 50 тикетов</div>
            <div className="text-xs text-gray-400">Создание бота через AI</div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h3 className="flex items-center gap-2 mb-4 text-sm font-semibold text-white">
          <History className="h-4 w-4" />
          История
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {ticketHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">Нет транзакций</p>
          ) : (
            [...ticketHistory].reverse().slice(0, 15).map((tx, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={tx.amount > 0 ? 'text-green-400' : 'text-red-400'}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                  </span>
                  <span className="text-gray-500">{tx.reason}</span>
                </div>
                <span className="text-xs text-gray-600">
                  {new Date(tx.time).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {tickets <= 300 && tickets > 0 && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Мало тикетов!</span>
          </div>
          <p className="mt-1 text-sm text-yellow-400/70">Пополните баланс или конвертируйте монеты</p>
        </div>
      )}
    </div>
  );
}
