import { useState, useCallback } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CreateBot from './components/CreateBot';
import Templates from './components/Templates';
import BotDetail from './components/BotDetail';
import TicketsPage from './components/TicketsPage';
import AIChat from './components/AIChat';
import AdminPanel from './components/AdminPanel';
import { useBots } from './hooks/useBots';
import { useTickets } from './hooks/useTickets';
import { TemplateInfo } from './data/templates';

export default function App() {
  const {
    tickets,
    coins,
    ticketHistory,
    addTickets,
    useTickets: spendTickets,
    consumeTicket,
    hasTickets,
    formatTickets,
    addCoins,
    convertCoinsToTickets,
  } = useTickets();

  const onTickConsume = useCallback(() => {
    if (tickets <= 0) return false;
    consumeTicket('bot');
    return true;
  }, [tickets, consumeTicket]);

  const {
    bots,
    addBot,
    updateBot,
    deleteBot,
    startBot,
    stopBot,
    restartBot,
    canAddMore,
    maxBots,
    getRuntimeStats,
    getRuntimeDatabase,
  } = useBots(onTickConsume);

  const [activePage, setActivePage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const runningCount = bots.filter(b => b.status === 'running').length;

  const handleViewBot = (id: string) => {
    setSelectedBotId(id);
    setActivePage('detail');
  };

  const handleUseTemplate = (template: TemplateInfo) => {
    setSelectedTemplateId(template.id);
    setActivePage('create');
  };

  const handleNavigate = (page: string) => {
    if (page !== 'create') {
      setSelectedTemplateId(null);
    }
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const handleAICreateBot = (name: string, code: string) => {
    sessionStorage.setItem('ai_bot_code', code);
    sessionStorage.setItem('ai_bot_name', name);
    setActivePage('create');
  };

  const selectedBot = bots.find(b => b.id === selectedBotId);

  const aiCode = activePage === 'create' ? sessionStorage.getItem('ai_bot_code') : null;
  const aiName = activePage === 'create' ? sessionStorage.getItem('ai_bot_name') : null;
  
  if (activePage === 'create' && aiCode) {
    sessionStorage.removeItem('ai_bot_code');
    sessionStorage.removeItem('ai_bot_name');
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative">
        <Header
          activePage={activePage}
          setActivePage={handleNavigate}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          runningCount={runningCount}
          tickets={tickets}
          coins={coins}
          formatTickets={formatTickets}
        />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          {activePage === 'dashboard' && (
            <Dashboard
              bots={bots}
              maxBots={maxBots}
              canAddMore={canAddMore}
              onStart={startBot}
              onStop={stopBot}
              onRestart={restartBot}
              onDelete={deleteBot}
              onView={handleViewBot}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'create' && (
            <CreateBot
              canAddMore={canAddMore}
              maxBots={maxBots}
              totalBots={bots.length}
              onCreateBot={addBot}
              onNavigate={handleNavigate}
              selectedTemplateId={selectedTemplateId}
              hasTickets={hasTickets}
              initialCode={aiCode || undefined}
              initialName={aiName || undefined}
            />
          )}

          {activePage === 'templates' && (
            <Templates onUseTemplate={handleUseTemplate} />
          )}

          {activePage === 'ai' && (
            <AIChat
              tickets={tickets}
              onUseTickets={spendTickets}
              onCreateBot={handleAICreateBot}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'tickets' && (
            <TicketsPage
              tickets={tickets}
              coins={coins}
              ticketHistory={ticketHistory}
              formatTickets={formatTickets}
              onAddTickets={addTickets}
              onAddCoins={addCoins}
              onConvertCoins={convertCoinsToTickets}
            />
          )}

          {activePage === 'admin' && (
            <AdminPanel
              bots={bots}
              onDeleteBot={deleteBot}
              tickets={tickets}
              coins={coins}
              onAddTickets={addTickets}
              onAddCoins={addCoins}
            />
          )}

          {activePage === 'detail' && selectedBot && (
            <BotDetail
              bot={selectedBot}
              onStart={startBot}
              onStop={stopBot}
              onRestart={restartBot}
              onDelete={deleteBot}
              onUpdate={updateBot}
              onBack={() => handleNavigate('dashboard')}
              getRuntimeStats={getRuntimeStats}
              getRuntimeDatabase={getRuntimeDatabase}
              formatTickets={formatTickets}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800/50 bg-gray-950/80 px-4 py-6">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="font-semibold text-white">TG Bot Construct</span>
              <span className="text-gray-600">v2.0</span>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>50 шаблонов</span>
              <span>•</span>
              <span>AI генерация</span>
              <span>•</span>
              <span>Long Polling</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
