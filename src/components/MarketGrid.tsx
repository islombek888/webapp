import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { binanceService, type PriceData } from '../services/binanceService';

interface MarketItem {
    symbol: string;
    name: string;
    fullName: string;
    type: 'crypto' | 'forex' | 'commodity';
}

const MARKETS: MarketItem[] = [
    { symbol: 'BTCUSD', name: 'BITCOIN', fullName: 'Bitcoin vs US Dollar', type: 'crypto' },
    { symbol: 'ETHUSD', name: 'ETHEREUM', fullName: 'Ethereum vs US Dollar', type: 'crypto' },
    { symbol: 'BNBUSD', name: 'BNB', fullName: 'Binance Coin vs US Dollar', type: 'crypto' },
    { symbol: 'SOLUSD', name: 'SOLANA', fullName: 'Solana vs US Dollar', type: 'crypto' },
    { symbol: 'XRPUSD', name: 'RIPPLE', fullName: 'XRP vs US Dollar', type: 'crypto' },
    { symbol: 'ADAUSD', name: 'CARDANO', fullName: 'Cardano vs US Dollar', type: 'crypto' },
];

interface MarketGridProps {
    onSelect: (symbol: string) => void;
}

export const MarketGrid: React.FC<MarketGridProps> = ({ onSelect }) => {
    const [priceData, setPriceData] = useState<{ [key: string]: PriceData }>({});
    const [loading, setLoading] = useState(true);

    const getMockForexData = (symbol: string): PriceData => {
        const basePrices: { [key: string]: number } = {
            'BTCUSD': 42000,
            'ETHUSD': 2200,
            'BNBUSD': 300,
            'SOLUSD': 95,
            'XRPUSD': 0.55,
            'ADAUSD': 0.40,
        };
        
        const basePrice = basePrices[symbol] || 100;
        const changePercent = (Math.random() - 0.5) * 0.5; // -0.25% to +0.25%
        const currentPrice = basePrice * (1 + changePercent / 100);
        
        return {
            symbol,
            price: currentPrice,
            change24h: currentPrice - basePrice,
            changePercent24h: changePercent,
            volume24h: Math.random() * 10000000,
            high24h: currentPrice * 1.002,
            low24h: currentPrice * 0.998
        };
    };

    const formatPrice = (symbol: string, price: number): string => {
        if (symbol.includes('BTC')) {
            return price.toFixed(2);
        } else if (symbol.includes('ETH')) {
            return price.toFixed(2);
        } else if (symbol.includes('BNB')) {
            return price.toFixed(2);
        } else if (symbol.includes('SOL')) {
            return price.toFixed(2);
        } else if (symbol.includes('XRP')) {
            return price.toFixed(4);
        } else if (symbol.includes('ADA')) {
            return price.toFixed(4);
        } else {
            return price.toFixed(2);
        }
    };

    useEffect(() => {
        const fetchAllPrices = async () => {
            setLoading(true);
            const newPriceData: { [key: string]: PriceData } = {};
            
            for (const market of MARKETS) {
                try {
                    const symbol = market.symbol.replace('USD', '');
                    const data = await binanceService.getCurrentPrice(symbol);
                    newPriceData[market.symbol] = data;
                } catch (error) {
                    console.error(`Error fetching price for ${market.symbol}:`, error);
                    newPriceData[market.symbol] = getMockForexData(market.symbol);
                }
            }
            
            setPriceData(newPriceData);
            setLoading(false);
        };

        fetchAllPrices();
        const interval = setInterval(fetchAllPrices, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen bg-[#0b0e11] flex flex-col">
            {/* Header */}
            <div className="bg-[#1e2329] border-b border-[#2b3139] p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-white">
                        <div className="text-sm text-[#848e9c]">591214980 Netting Raw +</div>
                        <div className="text-xs text-[#848e9c]">Demo MT5</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[#2ebd85] font-bold">+$10,000.00</div>
                        <div className="text-xs text-[#848e9c]">Balance</div>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-6">
                    <button className="text-white font-semibold border-b-2 border-[#00b4c9] pb-2">
                        Kvotalar
                    </button>
                    <button className="text-[#848e9c] pb-2 hover:text-white transition-colors">
                        Savdolar
                    </button>
                    <button className="text-[#848e9c] pb-2 hover:text-white transition-colors">
                        Tarix
                    </button>
                </div>
            </div>

            {/* Market List */}
            <div className="flex-1 overflow-y-auto">
                {loading && Object.keys(priceData).length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-[#848e9c]">Loading crypto data...</div>
                    </div>
                ) : (
                    <div className="divide-y divide-[#2b3139]">
                        {MARKETS.map((market, index) => {
                            const data = priceData[market.symbol];
                            if (!data) return null;
                            
                            return (
                                <motion.div
                                    key={market.symbol}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => onSelect(market.symbol)}
                                    className="p-4 bg-[#1e2329] hover:bg-[#2b3139] cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-bold text-lg">
                                                    {market.name}
                                                </span>
                                                <span className="text-[#848e9c] text-sm">
                                                    {market.fullName}
                                                </span>
                                            </div>
                                            
                                            {/* Mini Chart Placeholder */}
                                            <div className="mt-2 h-8 bg-[#0b0e11] rounded flex items-center px-2">
                                                <div className="flex-1 h-4 flex items-center">
                                                    <div className={`h-full w-full ${
                                                        data.changePercent24h >= 0 
                                                            ? 'bg-gradient-to-r from-transparent to-[#2ebd85]/20' 
                                                            : 'bg-gradient-to-r from-transparent to-[#f6465d]/20'
                                                    } rounded`}></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right ml-4">
                                            <div className="flex items-center gap-4">
                                                {/* Sell Price */}
                                                <div>
                                                    <div className="text-xs text-[#848e9c]">Soting</div>
                                                    <div className="text-[#f6465d] font-mono font-bold">
                                                        ${formatPrice(market.symbol, data.price * 0.999)}
                                                    </div>
                                                </div>
                                                
                                                {/* Change % */}
                                                <div className="text-center">
                                                    <div className={`font-bold ${
                                                        data.changePercent24h >= 0 ? 'text-[#2ebd85]' : 'text-[#f6465d]'
                                                    }`}>
                                                        {data.changePercent24h >= 0 ? '+' : ''}{data.changePercent24h.toFixed(2)}%
                                                    </div>
                                                </div>
                                                
                                                {/* Buy Price */}
                                                <div>
                                                    <div className="text-xs text-[#848e9c]">Sotib oling</div>
                                                    <div className="text-[#2ebd85] font-mono font-bold">
                                                        ${formatPrice(market.symbol, data.price * 1.001)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="bg-[#1e2329] border-t border-[#2b3139] p-4">
                <div className="flex justify-around">
                    <button className="flex flex-col items-center gap-1 text-[#00b4c9]">
                        <div className="w-6 h-6 bg-[#00b4c9] rounded"></div>
                        <span className="text-xs">Uy</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-[#848e9c] hover:text-white transition-colors">
                        <div className="w-6 h-6 bg-[#848e9c] rounded"></div>
                        <span className="text-xs">Fond</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-[#848e9c] hover:text-white transition-colors">
                        <div className="w-6 h-6 bg-[#848e9c] rounded"></div>
                        <span className="text-xs">Savdo</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-[#848e9c] hover:text-white transition-colors">
                        <div className="w-6 h-6 bg-[#848e9c] rounded"></div>
                        <span className="text-xs">Taqvim</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-[#848e9c] hover:text-white transition-colors">
                        <div className="w-6 h-6 bg-[#848e9c] rounded"></div>
                        <span className="text-xs">Profil</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
