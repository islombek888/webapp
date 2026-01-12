import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-app.onrender.com';

class TelegramBotService {
  private bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot(BOT_TOKEN, { polling: false });
  }

  async sendWelcomeMessage(chatId: number) {
    const welcomeMessage = `
🚀 *Professional Trading Terminal*

Welcome to the most advanced crypto trading terminal with AI analytics!

📊 *Features:*
• 6 Cryptocurrencies (BTC, ETH, BNB, SOL, XRP, ADA)
• 7 Time Intervals (15m, 30m, 1h, 4h, 1d, 1w, 1m)
• AI-Powered Predictions (75-95% accuracy)
• Real-time Price Updates
• Professional Forex-style Interface

🤖 *AI Analytics:*
• Technical Analysis (RSI, MACD, Trend)
• 1-Year Historical Data
• 5-Minute Predictions
• Entry/Target Prices
• Investment Suggestions

Click below to start trading! 📈
    `;

    const replyMarkup = {
      inline_keyboard: [[
        {
          text: '📊 Open Trading Terminal',
          web_app: {
            url: WEB_APP_URL
          }
        }
      ], [
        {
          text: 'ℹ️ Help',
          callback_data: 'help'
        },
        {
          text: '📈 Market Status',
          callback_data: 'market'
        }
      ]]
    };

    try {
      await this.bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: replyMarkup
      });
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  }

  async sendHelpMessage(chatId: number) {
    const helpMessage = `
ℹ️ *Help & Instructions*

📱 *How to use:*
1. Click "Open Trading Terminal" button
2. Select cryptocurrency from market list
3. Choose time interval (15m, 1h, 1d, etc.)
4. Click "AI ANALYTICS" for predictions
5. View AI recommendations and price targets

⏰ *Time Intervals:*
• 15m, 30m - Short term trading
• 1h, 4h - Intraday trading
• 1d, 1w - Swing trading
• 1m - Long term investing

🤖 *AI Predictions:*
• Direction: UP/DOWN
• Confidence: 75-95%
• Entry Price: Optimal entry point
• Target Price: Expected price
• Validity: 5 minutes

📊 *Market Data:*
• Real-time prices from Binance
• Live candlestick charts
• 24h price changes
• Volume and volatility

Need more help? Contact support! 🎯
    `;

    try {
      await this.bot.sendMessage(chatId, helpMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🔙 Back to Terminal',
              web_app: {
                url: WEB_APP_URL
              }
            }
          ]]
        }
      });
    } catch (error) {
      console.error('Error sending help message:', error);
    }
  }

  async sendMarketStatus(chatId: number) {
    try {
      const response = await axios.get(`${WEB_APP_URL}/api/crypto/prices`);
      const prices = response.data;

      let marketMessage = '📈 *Current Market Status*\\n\\n';
      
      Object.entries(prices).forEach(([symbol, data]: [string, any]) => {
        const emoji = data.change24h >= 0 ? '🟢' : '🔴';
        const change = data.change24h >= 0 ? '+' : '';
        marketMessage += `${emoji} *${symbol}:* $${data.price.toFixed(2)} (${change}${data.change24h.toFixed(2)}%)\\n`;
      });

      marketMessage += '\\n📊 Click below for detailed analysis!';

      await this.bot.sendMessage(chatId, marketMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '📊 Open Trading Terminal',
              web_app: {
                url: WEB_APP_URL
              }
            }
          ]]
        }
      });
    } catch (error) {
      console.error('Error sending market status:', error);
    }
  }

  async handleCallbackQuery(chatId: number, data: string) {
    switch (data) {
      case 'help':
        await this.sendHelpMessage(chatId);
        break;
      case 'market':
        await this.sendMarketStatus(chatId);
        break;
      default:
        await this.sendWelcomeMessage(chatId);
    }
  }

  getBot() {
    return this.bot;
  }
}

export default TelegramBotService;
