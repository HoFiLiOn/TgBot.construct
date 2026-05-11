import { useState, useEffect, useCallback } from 'react';
import { AppState } from '../types';

const STORAGE_KEY = 'tgbot_state_v2';
const INITIAL_TICKETS = 1800; // 30 минут бесплатно
const INITIAL_COINS = 100; // 100 монет на старте

function loadState(): AppState & { coins: number } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  
  return {
    tickets: INITIAL_TICKETS,
    coins: INITIAL_COINS,
    ticketHistory: [{
      time: Date.now(),
      amount: INITIAL_TICKETS,
      reason: '🎁 Бонус при регистрации (30 мин)',
    }],
  };
}

function saveState(state: AppState & { coins: number }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useTickets() {
  const [state, setState] = useState<AppState & { coins: number }>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addTickets = useCallback((amount: number, reason: string) => {
    setState(prev => ({
      ...prev,
      tickets: prev.tickets + amount,
      ticketHistory: [
        ...prev.ticketHistory,
        { time: Date.now(), amount, reason },
      ].slice(-100),
    }));
  }, []);

  const useTickets = useCallback((amount: number, reason: string): boolean => {
    if (state.tickets < amount) return false;
    
    setState(prev => ({
      ...prev,
      tickets: prev.tickets - amount,
      ticketHistory: [
        ...prev.ticketHistory,
        { time: Date.now(), amount: -amount, reason },
      ].slice(-100),
    }));
    return true;
  }, [state.tickets]);

  const consumeTicket = useCallback((_botName: string) => {
    setState(prev => {
      if (prev.tickets <= 0) return prev;
      return {
        ...prev,
        tickets: prev.tickets - 1,
      };
    });
  }, []);

  // Монеты
  const addCoins = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    if (state.coins < amount) return false;
    setState(prev => ({
      ...prev,
      coins: prev.coins - amount,
    }));
    return true;
  }, [state.coins]);

  // Конвертация монет в тикеты (1 монета = 60 тикетов = 1 минута)
  const convertCoinsToTickets = useCallback((coins: number) => {
    if (state.coins < coins) return false;
    const ticketsToAdd = coins * 60;
    setState(prev => ({
      ...prev,
      coins: prev.coins - coins,
      tickets: prev.tickets + ticketsToAdd,
      ticketHistory: [
        ...prev.ticketHistory,
        { time: Date.now(), amount: ticketsToAdd, reason: `💰 Конвертация ${coins} монет` },
      ].slice(-100),
    }));
    return true;
  }, [state.coins]);

  const hasTickets = state.tickets > 0;

  const formatTickets = (seconds: number): string => {
    if (seconds < 0) return '0с';
    if (seconds < 60) return `${seconds}с`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}м ${seconds % 60}с`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}ч ${m}м`;
  };

  return {
    tickets: state.tickets,
    coins: state.coins,
    ticketHistory: state.ticketHistory,
    addTickets,
    useTickets,
    consumeTicket,
    hasTickets,
    formatTickets,
    addCoins,
    spendCoins,
    convertCoinsToTickets,
  };
}
