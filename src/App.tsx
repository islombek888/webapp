import { useState, useEffect } from 'react';
import { MarketGrid } from './components/MarketGrid';
import { TradingTerminal } from './components/TradingTerminal';

// Telegram WebApp Type Definition
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
          query_id?: string;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
        };
      }
    }
  }
}

function App() {
  const [activeScreen, setActiveScreen] = useState<'market' | 'terminal'>('market');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const handleSelectCoin = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveScreen('terminal');
  };

  const handleBack = () => {
    setActiveScreen('market');
    setSelectedSymbol(null);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-text font-sans">
      {activeScreen === 'market' ? (
        <MarketGrid onSelect={handleSelectCoin} />
      ) : (
        <TradingTerminal
          symbol={selectedSymbol || 'BTCUSD'}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default App;
