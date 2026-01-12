import axios from 'axios';

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class BinanceService {
  private baseUrl = 'https://api.binance.com/api/v3';
  private wsUrl = 'wss://stream.binance.com:9443/ws';

  async getCurrentPrice(symbol: string): Promise<PriceData> {
    try {
      let apiSymbol = `${symbol}USDT`;
      
      // Special handling for different symbol formats
      if (symbol === 'XAU') {
        apiSymbol = 'XAUUSDT';
      } else if (symbol === 'XAUUSD') {
        apiSymbol = 'XAUUSDT';
      } else if (symbol.includes('USD')) {
        apiSymbol = symbol.replace('USD', 'USDT');
      }
      
      const response = await axios.get(`${this.baseUrl}/ticker/24hr`, {
        params: { symbol: apiSymbol }
      });
      
      const data = response.data;
      return {
        symbol: data.symbol.replace('USDT', '').replace('XAU', 'XAUUSD'),
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChange),
        changePercent24h: parseFloat(data.priceChangePercent),
        volume24h: parseFloat(data.volume),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice)
      };
    } catch (error) {
      console.error('Error fetching price:', error);
      // Fallback to mock data
      return this.getMockPriceData(symbol);
    }
  }

  async getCandleData(symbol: string, interval: string = '1m', limit: number = 100): Promise<CandleData[]> {
    try {
      let apiSymbol = `${symbol}USDT`;
      
      // Special handling for different symbol formats
      if (symbol === 'XAU') {
        apiSymbol = 'XAUUSDT';
      } else if (symbol === 'XAUUSD') {
        apiSymbol = 'XAUUSDT';
      } else if (symbol.includes('USD')) {
        apiSymbol = symbol.replace('USD', 'USDT');
      }
      
      const response = await axios.get(`${this.baseUrl}/klines`, {
        params: { 
          symbol: apiSymbol,
          interval,
          limit
        }
      });
      
      return response.data.map((kline: string[]) => ({
        time: parseInt(kline[0]),
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5])
      }));
    } catch (error) {
      console.error('Error fetching candle data:', error);
      return this.getMockCandleData(symbol, limit);
    }
  }

  createWebSocket(symbol: string, onMessage: (data: CandleData) => void): WebSocket {
    let wsSymbol = `${symbol.toLowerCase()}usdt`;
    
    // Special handling for different symbol formats
    if (symbol === 'XAU') {
      wsSymbol = 'xauusdt';
    } else if (symbol === 'XAUUSD') {
      wsSymbol = 'xauusdt';
    } else if (symbol.includes('USD')) {
      wsSymbol = symbol.toLowerCase().replace('usd', 'usdt');
    }
    
    const ws = new WebSocket(`${this.wsUrl}/${wsSymbol}@kline_1m`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.k) {
          const candleData: CandleData = {
            time: data.k.t,
            open: parseFloat(data.k.o),
            high: parseFloat(data.k.h),
            low: parseFloat(data.k.l),
            close: parseFloat(data.k.c),
            volume: parseFloat(data.k.v)
          };
          onMessage(candleData);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return ws;
  }

  private getMockPriceData(symbol: string): PriceData {
    let basePrice: number;
    
    if (symbol.includes('BTC')) {
      basePrice = 42000;
    } else if (symbol.includes('ETH')) {
      basePrice = 2200;
    } else if (symbol.includes('XAU')) {
      basePrice = 2045.50; // Gold price
    } else if (symbol === 'EURUSD') {
      basePrice = 1.0895;
    } else if (symbol === 'TSLA') {
      basePrice = 245.80;
    } else if (symbol === 'US100') {
      basePrice = 19850.25;
    } else if (symbol === 'USDJPY') {
      basePrice = 148.75;
    } else {
      basePrice = 100;
    }
    
    const changePercent = (Math.random() - 0.5) * 4; // -2% to +2%
    const currentPrice = basePrice * (1 + changePercent / 100);
    
    return {
      symbol,
      price: currentPrice,
      change24h: currentPrice - basePrice,
      changePercent24h: changePercent,
      volume24h: Math.random() * 1000000,
      high24h: currentPrice * 1.02,
      low24h: currentPrice * 0.98
    };
  }

  private getMockCandleData(symbol: string, count: number): CandleData[] {
    let basePrice: number;
    
    if (symbol.includes('BTC')) {
      basePrice = 42000;
    } else if (symbol.includes('ETH')) {
      basePrice = 2200;
    } else if (symbol.includes('XAU')) {
      basePrice = 2045.50; // Gold price
    } else if (symbol === 'EURUSD') {
      basePrice = 1.0895;
    } else if (symbol === 'TSLA') {
      basePrice = 245.80;
    } else if (symbol === 'US100') {
      basePrice = 19850.25;
    } else if (symbol === 'USDJPY') {
      basePrice = 148.75;
    } else {
      basePrice = 100;
    }
    
    const data: CandleData[] = [];
    const currentTime = Math.floor(Date.now() / 1000) - (count * 60);
    let currentPrice = basePrice;

    for (let i = 0; i < count; i++) {
      const volatility = 0.002; // 0.2% volatility
      const change = (Math.random() - 0.5) * currentPrice * volatility;
      const close = currentPrice + change;
      const high = Math.max(currentPrice, close) + Math.random() * currentPrice * 0.001;
      const low = Math.min(currentPrice, close) - Math.random() * currentPrice * 0.001;

      data.push({
        time: currentTime + (i * 60),
        open: currentPrice,
        high,
        low,
        close,
        volume: Math.random() * 1000
      });

      currentPrice = close;
    }

    return data;
  }
}

export const binanceService = new BinanceService();
