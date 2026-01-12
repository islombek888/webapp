import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, BrainCircuit } from 'lucide-react';
import { TradingChart } from './TradingChart';
import { motion, AnimatePresence } from 'framer-motion';
import { binanceService, type PriceData } from '../services/binanceService';

interface TradingTerminalProps {
    symbol: string;
    onBack: () => void;
}

interface AIPrediction {
    direction: 'UP' | 'DOWN';
    confidence: number;
    predictionTime: number;
    targetTime: number;
    entryPrice: number;
    targetPrice: number;
    rsi: number;
    macd: number;
    trend: number;
    yearlyData: {
        avgMonthlyReturn: number;
        volatility: number;
        support: number;
        resistance: number;
    };
}

export const TradingTerminal: React.FC<TradingTerminalProps> = ({ symbol, onBack }) => {
    const [aiActive, setAiActive] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [currentPrediction, setCurrentPrediction] = useState<AIPrediction | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [realTimeData, setRealTimeData] = useState<{time: number, price: number}[]>([]);
    const [currentPriceData, setCurrentPriceData] = useState<PriceData | null>(null);
    const [timeInterval, setTimeInterval] = useState<string>('1m');

    const timeIntervals = [
        { value: '15m', label: '15m' },
        { value: '30m', label: '30m' },
        { value: '1h', label: '1h' },
        { value: '4h', label: '4h' },
        { value: '1d', label: '1d' },
        { value: '1w', label: '1w' },
        { value: '1M', label: '1m' },
    ];

    const handleAiClick = () => {
        if (aiActive) {
            // Agar AI aktiv bo'lsa, to'xtatish
            setAiActive(false);
            setCurrentPrediction(null);
            setCountdown(null);
            return;
        }

        // Agar AI aktiv bo'lmasa, yangi analiz boshlash
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setAiActive(true);
            generateAIPrediction();
        }, 2000); // 2 soniya analiz
    };

    const generateAIPrediction = () => {
        const now = Date.now();
        const targetTime = now + 300000; // 5 daqiqa prediction
        
        // Use real price data if available
        const basePrice = currentPriceData?.price || 42000;
        
        const entryPrice = basePrice + (Math.random() - 0.5) * basePrice * 0.005;
        const direction = Math.random() > 0.5 ? 'UP' : 'DOWN';
        const confidence = 75 + Math.random() * 20; // 75-95% confidence
        const priceChangePercent = 0.5 + Math.random() * 2; // 0.5-2.5% change
        const targetPrice = direction === 'UP' 
            ? entryPrice * (1 + priceChangePercent / 100)
            : entryPrice * (1 - priceChangePercent / 100);

        // Generate 1 year historical data analysis
        const yearlyData = {
            avgMonthlyReturn: (Math.random() - 0.5) * 0.12, // -6% to +6%
            volatility: 0.15 + Math.random() * 0.35, // 15-50% volatility
            support: basePrice * 0.82,
            resistance: basePrice * 1.18
        };

        const prediction: AIPrediction = {
            direction,
            confidence,
            predictionTime: now,
            targetTime,
            entryPrice,
            targetPrice,
            rsi: 25 + Math.random() * 50,
            macd: (Math.random() - 0.5) * 150,
            trend: (Math.random() - 0.5) * 0.12,
            yearlyData
        };

        setCurrentPrediction(prediction);
        setCountdown(300); // 5 minut countdown
    };

    // Countdown effect
    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(prev => {
                    if (prev !== null && prev > 1) {
                        return prev - 1;
                    } else if (prev !== null && prev === 1) {
                        // 5 minut tugaganda, yangi analiz uchun tayyor
                        setAiActive(false);
                        setCurrentPrediction(null);
                        return null;
                    }
                    return null;
                });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Fetch real-time price data
    useEffect(() => {
        const fetchPriceData = async () => {
            try {
                const symbolKey = symbol.replace('USD', '');
                const priceData = await binanceService.getCurrentPrice(symbolKey);
                setCurrentPriceData(priceData);
            } catch (error) {
                console.error('Error fetching price data:', error);
            }
        };

        fetchPriceData();
        const interval = setInterval(fetchPriceData, 3000); // Update every 3 seconds
        return () => clearInterval(interval);
    }, [symbol]);

    // Real-time data simulation
    useEffect(() => {
        if (aiActive && currentPrediction) {
            const interval = setInterval(() => {
                setRealTimeData(prev => {
                    const newPrice = currentPrediction.entryPrice + (Math.random() - 0.5) * currentPrediction.entryPrice * 0.002;
                    return [...prev.slice(-199), { time: Date.now(), price: newPrice }];
                });
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [aiActive, currentPrediction]);

    return (
        <div className="h-full w-full flex flex-col bg-[#0b0e11] text-white relative overflow-hidden">
                {/* Top Header with Price Info */}
                <div className="absolute top-0 left-0 right-0 bg-[#1e2329]/90 backdrop-blur-md border-b border-[#2b3139] z-10">
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                            <button onClick={onBack} className="p-1 hover:bg-[#2b3139] rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5 text-[#848e9c]" />
                            </button>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1 font-bold text-lg leading-none">
                                    {symbol.replace('USD', '')} <span className="text-[#fcd535] text-xs bg-[#fcd535]/10 px-1 rounded">OTC</span>
                                </div>
                                {currentPriceData && (
                                    <span className={`text-xs ${
                                        currentPriceData.changePercent24h >= 0 ? 'text-[#2ebd85]' : 'text-[#f6465d]'
                                    }`}>
                                        {currentPriceData.changePercent24h >= 0 ? '+' : ''}{currentPriceData.changePercent24h.toFixed(2)}%
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-xs text-[#848e9c]">Current Price</div>
                                {currentPriceData ? (
                                    <span className="font-mono font-bold text-lg text-white">
                                        ${currentPriceData.price.toFixed(2)}
                                    </span>
                                ) : (
                                    <span className="font-mono font-bold text-[#eaecef]">Loading...</span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Price Lines */}
                    <div className="flex items-center justify-between px-3 pb-2">
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-[#2ebd85] rounded-full"></div>
                                <span className="text-[#848e9c]">Buy: ${currentPriceData ? (currentPriceData.price * 1.001).toFixed(2) : '0.00'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-[#f6465d] rounded-full"></div>
                                <span className="text-[#848e9c]">Sell: ${currentPriceData ? (currentPriceData.price * 0.999).toFixed(2) : '0.00'}</span>
                            </div>
                        </div>
                        <div className="text-xs text-[#848e9c]">
                            24h High: ${currentPriceData ? currentPriceData.high24h.toFixed(2) : '0.00'} | Low: ${currentPriceData ? currentPriceData.low24h.toFixed(2) : '0.00'}
                        </div>
                    </div>
                </div>

            {/* Main Content Area: Chart + Sidebar Overlay */}
            <div className="flex-1 relative pt-20">
                <TradingChart symbol={symbol.replace('USD', '')} showPrediction={aiActive} interval={timeInterval} />

                {/* Analyzing Overlay */}
                <AnimatePresence>
                    {analyzing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center"
                        >
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-[#2b3139] border-t-[#00b4c9] rounded-full animate-spin"></div>
                                <BrainCircuit className="w-8 h-8 text-[#00b4c9] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <p className="mt-4 text-[#00b4c9] font-bold tracking-widest animate-pulse">AI ANALYZING MARKET...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Controls (Right Side / Bottom on Mobile) */}
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-[#1e2329]/90 backdrop-blur-md border-l border-[#2b3139] flex flex-col items-center py-4 gap-4 z-20 max-sm:w-full max-sm:h-auto max-sm:top-auto max-sm:flex-row max-sm:px-4 max-sm:py-3 max-sm:border-t max-sm:border-l-0">

                    {/* Controls Group */}
                    <div className="flex flex-col gap-3 w-full px-2 max-sm:flex-row max-sm:w-auto max-sm:gap-2">
                        <div className="bg-[#0b0e11] rounded-lg p-2 w-full max-sm:w-24 border border-[#2b3139]">
                            <div className="text-[10px] text-[#848e9c] mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Analysis</div>
                            <div className="font-mono font-bold text-center text-xs">{timeInterval}</div>
                        </div>
                        <div className="bg-[#0b0e11] rounded-lg p-2 w-full max-sm:w-24 border border-[#2b3139]">
                            <div className="text-[10px] text-[#848e9c] mb-1 flex items-center gap-1"><BrainCircuit className="w-3 h-3" /> AI Mode</div>
                            <div className="font-mono font-bold text-center text-xs">{aiActive ? 'ACTIVE' : 'OFF'}</div>
                        </div>
                    </div>

                    {/* Time Intervals */}
                    <div className="flex flex-col gap-2 w-full px-2">
                        <div className="text-[10px] text-[#848e9c] mb-1">Time Frame</div>
                        <div className="grid grid-cols-2 gap-1">
                            {timeIntervals.map((interval) => (
                                <button
                                    key={interval.value}
                                    onClick={() => setTimeInterval(interval.value)}
                                    className={`text-xs font-mono py-1 px-2 rounded transition-colors ${
                                        timeInterval === interval.value
                                            ? 'bg-[#00b4c9] text-black'
                                            : 'bg-[#0b0e11] text-[#848e9c] hover:text-white'
                                    }`}
                                >
                                    {interval.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Trade History Section */}
                    <div className="flex flex-col gap-2 w-full px-2">
                        <div className="text-[10px] text-[#848e9c] mb-1">Recent Trades</div>
                        <div className="space-y-1">
                            <div className="bg-[#0b0e11] rounded p-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-[#2ebd85]">BUY</span>
                                    <span className="text-white">$42,150.00</span>
                                </div>
                                <div className="text-[#848e9c] text-[9px]">2 min ago</div>
                            </div>
                            <div className="bg-[#0b0e11] rounded p-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-[#f6465d]">SELL</span>
                                    <span className="text-white">$42,120.00</span>
                                </div>
                                <div className="text-[#848e9c] text-[9px]">5 min ago</div>
                            </div>
                            <div className="bg-[#0b0e11] rounded p-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-[#2ebd85]">BUY</span>
                                    <span className="text-white">$42,100.00</span>
                                </div>
                                <div className="text-[#848e9c] text-[9px]">8 min ago</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 max-sm:hidden"></div> {/* Spacer */}

                    {/* AI Button */}
                    <button
                        onClick={handleAiClick}
                        className={`w-[90%] aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all shadow-[0_0_20px_rgba(0,180,201,0.3)] border border-[#00b4c9]/50 relative overflow-hidden group max-sm:w-16 max-sm:aspect-square max-sm:rounded-xl
              ${aiActive ? 'bg-[#00b4c9] text-black' : 'bg-[#0b0e11] text-[#00b4c9]'}
            `}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00b4c9]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <BrainCircuit className={`w-8 h-8 ${aiActive ? 'animate-none' : 'animate-pulse'}`} />
                        <span className="text-[10px] font-bold">AI ANALYTICS</span>
                    </button>

                    {/* Status Display */}
                    <div className="w-full px-2">
                        <div className="bg-[#0b0e11] rounded-lg p-3 border border-[#2b3139]">
                            <div className="text-center">
                                <div className="text-[10px] text-[#848e9c] mb-1">Status</div>
                                <div className={`font-bold text-xs ${
                                    aiActive ? 'text-[#00b4c9]' : 'text-[#848e9c]'
                                }`}>
                                    {aiActive ? 'ANALYZING MARKET' : 'READY'}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* AI Prediction Panel */}
            {currentPrediction && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-20 left-4 right-28 bg-[#1e2329]/95 backdrop-blur-md rounded-xl p-4 border border-[#00b4c9]/30 shadow-[0_0_20px_rgba(0,180,201,0.2)]"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-[#00b4c9]">AI PREDICTION</h3>
                        {countdown !== null && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#00b4c9] rounded-full animate-pulse"></div>
                                <span className="text-[#00b4c9] font-mono font-bold">{countdown}s</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="bg-[#0b0e11] rounded-lg p-2">
                            <div className="text-xs text-[#848e9c] mb-1">Direction</div>
                            <div className={`text-lg font-bold ${
                                currentPrediction.direction === 'UP' ? 'text-[#2ebd85]' : 'text-[#f6465d]'
                            }`}>
                                {currentPrediction.direction} {currentPrediction.direction === 'UP' ? '📈' : '📉'}
                            </div>
                        </div>
                        <div className="bg-[#0b0e11] rounded-lg p-2">
                            <div className="text-xs text-[#848e9c] mb-1">Confidence</div>
                            <div className="text-lg font-bold text-[#fcd535]">
                                {currentPrediction.confidence.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="bg-[#0b0e11] rounded-lg p-2">
                            <div className="text-xs text-[#848e9c] mb-1">Entry Price</div>
                            <div className="text-sm font-mono text-white">
                                ${currentPrediction.entryPrice.toFixed(2)}
                            </div>
                        </div>
                        <div className="bg-[#0b0e11] rounded-lg p-2">
                            <div className="text-xs text-[#848e9c] mb-1">Target Price</div>
                            <div className="text-sm font-mono text-white">
                                ${currentPrediction.targetPrice.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0b0e11] rounded-lg p-3 mb-3">
                        <div className="text-xs text-[#848e9c] mb-2">Technical Indicators</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                                <div className="text-[#848e9c]">RSI</div>
                                <div className="font-mono text-white">{currentPrediction.rsi.toFixed(1)}</div>
                            </div>
                            <div>
                                <div className="text-[#848e9c]">MACD</div>
                                <div className="font-mono text-white">{currentPrediction.macd.toFixed(2)}</div>
                            </div>
                            <div>
                                <div className="text-[#848e9c]">Trend</div>
                                <div className="font-mono text-white">{(currentPrediction.trend * 100).toFixed(2)}%</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0b0e11] rounded-lg p-3">
                        <div className="text-xs text-[#848e9c] mb-2">1 Year Historical Analysis</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <div className="text-[#848e9c]">Avg Monthly Return</div>
                                <div className={`font-mono ${
                                    currentPrediction.yearlyData.avgMonthlyReturn > 0 ? 'text-[#2ebd85]' : 'text-[#f6465d]'
                                }`}>
                                    {(currentPrediction.yearlyData.avgMonthlyReturn * 100).toFixed(2)}%
                                </div>
                            </div>
                            <div>
                                <div className="text-[#848e9c]">Volatility</div>
                                <div className="font-mono text-white">
                                    {(currentPrediction.yearlyData.volatility * 100).toFixed(1)}%
                                </div>
                            </div>
                            <div>
                                <div className="text-[#848e9c]">Support</div>
                                <div className="font-mono text-white">
                                    ${currentPrediction.yearlyData.support.toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <div className="text-[#848e9c]">Resistance</div>
                                <div className="font-mono text-white">
                                    ${currentPrediction.yearlyData.resistance.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Real-time Price Updates */}
                    {realTimeData.length > 0 && (
                        <div className="mt-3 bg-[#0b0e11] rounded-lg p-3">
                            <div className="text-xs text-[#848e9c] mb-2">Real-time Analysis</div>
                            <div className="flex items-center justify-between">
                                <div className="text-xs">
                                    <div className="text-[#848e9c]">Live Price</div>
                                    <div className="font-mono text-white">
                                        ${realTimeData[realTimeData.length - 1]?.price.toFixed(2) || '0.00'}
                                    </div>
                                </div>
                                <div className="text-xs">
                                    <div className="text-[#848e9c]">Updates</div>
                                    <div className="font-mono text-white">{realTimeData.length}/100</div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

        </div>
    );
};
