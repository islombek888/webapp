import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import TelegramBotService from './telegramBot.ts';
import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

// Initialize Telegram Bot
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL || `http://localhost:${process.env.PORT || 3000}`;
let telegramBot: TelegramBot | null = null;
let telegramService: TelegramBotService | null = null;

if (BOT_TOKEN && BOT_TOKEN !== 'YOUR_BOT_TOKEN') {
  try {
    telegramBot = new TelegramBot(BOT_TOKEN, { polling: true });
    telegramService = new TelegramBotService();
    console.log('🤖 Telegram bot initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error);
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../dist')));

// Telegram Bot WebApp
app.post('/api/telegram/webhook', (req: Request, res: Response) => {
  const { message, callback_query } = req.body;
  
  if (message?.text === '/start' && telegramService) {
    telegramService.sendWelcomeMessage(message.chat.id);
    res.json({ ok: true });
  } else if (callback_query && telegramService) {
    telegramService.handleCallbackQuery(callback_query.message.chat.id, callback_query.data);
    res.json({ ok: true });
  } else {
    res.json({ ok: true });
  }
});

// Manual bot command handler (if polling is enabled)
if (telegramBot) {
  telegramBot.onText(/\/start/, (msg) => {
    if (telegramService) {
      telegramService.sendWelcomeMessage(msg.chat.id);
    }
  });

  telegramBot.onText(/\/help/, (msg) => {
    if (telegramService) {
      telegramService.sendHelpMessage(msg.chat.id);
    }
  });

  telegramBot.onText(/\/market/, (msg) => {
    if (telegramService) {
      telegramService.sendMarketStatus(msg.chat.id);
    }
  });

  telegramBot.on('callback_query', (callbackQuery) => {
    if (telegramService && callbackQuery.message) {
      telegramService.handleCallbackQuery(callbackQuery.message.chat.id, callbackQuery.data || '');
    }
  });
}

// API Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mock cryptocurrency data
app.get('/api/crypto/prices', (req: Request, res: Response) => {
  const mockPrices: { [key: string]: { price: number; change24h: number } } = {
    BTC: { price: 42000 + Math.random() * 1000, change24h: (Math.random() - 0.5) * 5 },
    ETH: { price: 2200 + Math.random() * 100, change24h: (Math.random() - 0.5) * 3 },
    BNB: { price: 300 + Math.random() * 20, change24h: (Math.random() - 0.5) * 2 },
    SOL: { price: 95 + Math.random() * 10, change24h: (Math.random() - 0.5) * 4 },
    XRP: { price: 0.55 + Math.random() * 0.05, change24h: (Math.random() - 0.5) * 3 },
    ADA: { price: 0.40 + Math.random() * 0.04, change24h: (Math.random() - 0.5) * 2 }
  };

  const symbol = req.query.symbol as string;
  if (symbol && mockPrices[symbol]) {
    res.json({
      symbol,
      ...mockPrices[symbol],
      volume24h: Math.random() * 10000000,
      high24h: mockPrices[symbol].price * 1.02,
      low24h: mockPrices[symbol].price * 0.98,
      timestamp: Date.now()
    });
  } else {
    res.json(mockPrices);
  }
});

// Mock candle data
app.get('/api/crypto/candles/:symbol', (req: Request, res: Response) => {
  const { symbol } = req.params;
  const { interval = '1m', limit = '150' } = req.query;
  
  const basePrice = symbol === 'BTC' ? 42000 : symbol === 'ETH' ? 2200 : 100;
  const candles = [];
  
  for (let i = 0; i < parseInt(limit as string); i++) {
    const time = Date.now() - (parseInt(limit as string) - i) * 60000;
    const volatility = basePrice * 0.01;
    const open = basePrice + (Math.random() - 0.5) * volatility;
    const close = open + (Math.random() - 0.5) * volatility * 0.5;
    const high = Math.max(open, close) + Math.random() * volatility * 0.3;
    const low = Math.min(open, close) - Math.random() * volatility * 0.3;
    
    candles.push({ time, open, high, low, close });
  }
  
  res.json(candles);
});

// AI prediction endpoint
app.post('/api/ai/predict', (req: Request, res: Response) => {
  const { symbol, interval } = req.body;
  
  const prediction = {
    symbol,
    interval,
    direction: Math.random() > 0.5 ? 'UP' : 'DOWN',
    confidence: 75 + Math.random() * 20,
    entryPrice: 42000 + Math.random() * 1000,
    targetPrice: 0,
    predictionTime: Date.now(),
    targetTime: Date.now() + 300000, // 5 minutes
    technicals: {
      rsi: 30 + Math.random() * 40,
      macd: (Math.random() - 0.5) * 100,
      trend: Math.random() * 100
    }
  };
  
  const priceChange = 0.5 + Math.random() * 2; // 0.5-2.5% change
  prediction.targetPrice = prediction.direction === 'UP' 
    ? prediction.entryPrice * (1 + priceChange / 100)
    : prediction.entryPrice * (1 - priceChange / 100);
  
  res.json(prediction);
});

// Serve frontend for all other routes
app.use((req: Request, res: Response) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3000;

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 API available at http://0.0.0.0:${PORT}/api`);
  console.log(`🌐 Frontend served at http://0.0.0.0:${PORT}`);
  console.log(`🤖 Telegram webhook: http://0.0.0.0:${PORT}/api/telegram/webhook`);
  console.log(`\n📱 To set up Telegram bot:`);
  console.log(`1. Create bot with @BotFather`);
  console.log(`2. Set webhook to: https://your-app.onrender.com/api/telegram/webhook`);
  console.log(`3. Users send /start to open trading terminal`);
});

export default app;
