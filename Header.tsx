import { Zap, Menu, X, Ticket, Sparkles, Coins } from 'lucide-react';

interface HeaderProps {
  activePage: string;
  setActivePage: (page: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  runningCount: number;
  tickets: number;
  coins: number;
  formatTickets: (s: number) => string;
}

export default function Header({
  activePage,
  setActivePage,
  mobileMenuOpen,
  setMobileMenuOpen,
  runningCount,
  tickets,
  coins,
  formatTickets,
}: HeaderProps) {
  const navItems = [
    { id: 'dashboard', label: 'Боты' },
    { id: 'ai', label: '✨ AI' },
    { id: 'templates', label: 'Шаблоны' },
    { id: 'tickets', label: 'Магазин' },
    { id: 'admin', label: '⚙️' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="hidden sm:inline font-bold text-white">
            TG Bot<span className="text-purple-400"> Construct</span>
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                activePage === item.id
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Coins */}
          <button
            onClick={() => setActivePage('tickets')}
            className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-1"
          >
            <Coins className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs font-medium text-cyan-400">{coins}</span>
          </button>

          {/* Tickets */}
          <button
            onClick={() => setActivePage('tickets')}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
              tickets > 600 ? 'bg-green-500/10' : tickets > 0 ? 'bg-yellow-500/10' : 'bg-red-500/10'
            }`}
          >
            <Ticket className={`h-3.5 w-3.5 ${
              tickets > 600 ? 'text-green-400' : tickets > 0 ? 'text-yellow-400' : 'text-red-400'
            }`} />
            <span className={`text-xs font-medium ${
              tickets > 600 ? 'text-green-400' : tickets > 0 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {formatTickets(tickets)}
            </span>
          </button>

          {/* Running bots */}
          {runningCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1">
              <Zap className="h-3.5 w-3.5 text-green-400 animate-pulse" />
              <span className="text-xs font-medium text-green-400">{runningCount}</span>
            </div>
          )}

          {/* Mobile menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-800 bg-gray-950 p-3 md:hidden">
          <nav className="grid grid-cols-3 gap-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`rounded-lg py-2 text-center text-sm font-medium transition-all ${
                  activePage === item.id
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
