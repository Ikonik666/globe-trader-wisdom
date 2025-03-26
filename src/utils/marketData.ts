
import { MarketType } from './marketSymbols';

// Market data types
export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FundamentalData {
  symbol: string;
  name: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  pe?: number;
  eps?: number;
  dividend?: number;
  dividendYield?: number;
  beta?: number;
  avgVolume?: number;
  high52W?: number;
  low52W?: number;
  priceToBook?: number;
  priceToSales?: number;
  shortRatio?: number;
  shortFloat?: number;
  revenue?: number;
  revenueGrowth?: number;
  profit?: number;
  profitGrowth?: number;
  debt?: number;
  assets?: number;
}

export interface NewsItem {
  id: number;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevance: number;
  summary: string;
  relatedSymbols: string[];
  impactScore?: number;
  timestamp?: number;
}

// Mock data for different market types
const stocksData: MarketData[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 187.92, change: 1.21, changePercent: 0.65, volume: 32498657 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 402.75, change: 3.46, changePercent: 0.87, volume: 18345231 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.15, change: -0.89, changePercent: -0.5, volume: 29856471 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.65, change: 0.32, changePercent: 0.23, volume: 15674129 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 209.45, change: -7.65, changePercent: -3.52, volume: 42893651 },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 887.32, change: 12.47, changePercent: 1.43, volume: 38762145 },
];

const cryptoData: MarketData[] = [
  { symbol: "BTCUSD", name: "Bitcoin/USD", price: 87196.00, change: -240.00, changePercent: -0.27, volume: 28761245 },
  { symbol: "ETHUSD", name: "Ethereum/USD", price: 2010.80, change: -55.70, changePercent: -2.70, volume: 18954321 },
  { symbol: "XRPUSD", name: "Ripple/USD", price: 0.54, change: -0.01, changePercent: -2.41, volume: 9876543 },
  { symbol: "LTCUSD", name: "Litecoin/USD", price: 87.65, change: 1.23, changePercent: 1.42, volume: 5432167 },
  { symbol: "ADAUSD", name: "Cardano/USD", price: 0.43, change: 0.01, changePercent: 2.06, volume: 7654321 },
  { symbol: "DOTUSD", name: "Polkadot/USD", price: 6.78, change: -0.12, changePercent: -1.74, volume: 3456789 },
  { symbol: "DOGEUSD", name: "Dogecoin/USD", price: 0.12, change: 0.01, changePercent: 4.76, volume: 9876543 },
  { symbol: "SOLUSD", name: "Solana/USD", price: 140.25, change: 7.68, changePercent: 5.79, volume: 6543219 },
];

const forexData: MarketData[] = [
  { symbol: "EURUSD", name: "Euro/US Dollar", price: 1.0934, change: 0.0012, changePercent: 0.11, volume: 98765432 },
  { symbol: "GBPUSD", name: "British Pound/US Dollar", price: 1.2754, change: -0.0023, changePercent: -0.18, volume: 76543219 },
  { symbol: "USDJPY", name: "US Dollar/Japanese Yen", price: 149.87, change: 0.34, changePercent: 0.23, volume: 65432198 },
  { symbol: "USDCHF", name: "US Dollar/Swiss Franc", price: 0.8876, change: -0.0043, changePercent: -0.48, volume: 54321987 },
  { symbol: "AUDUSD", name: "Australian Dollar/US Dollar", price: 0.6598, change: 0.0034, changePercent: 0.52, volume: 43219876 },
  { symbol: "USDCAD", name: "US Dollar/Canadian Dollar", price: 1.3654, change: 0.0067, changePercent: 0.49, volume: 32198765 },
  { symbol: "NZDUSD", name: "New Zealand Dollar/US Dollar", price: 0.6143, change: -0.0021, changePercent: -0.34, volume: 21987654 },
];

// Generate deterministic price data based on symbol and timeframe
// This ensures the same data is returned for a given symbol and timeframe
function generateDeterministicData(symbol: string, timeframe: string, basePrice: number, volatility: number): CandleData[] {
  const data: CandleData[] = [];
  const now = new Date().getTime();
  
  // Determine interval and data points based on timeframe
  let interval = 86400000; // Default: 1 day in milliseconds
  let dataPoints = 30;
  
  switch (timeframe) {
    case "1m": interval = 60000; dataPoints = 60; break;
    case "5m": interval = 300000; dataPoints = 60; break;
    case "15m": interval = 900000; dataPoints = 60; break;
    case "1H": interval = 3600000; dataPoints = 48; break;
    case "4H": interval = 14400000; dataPoints = 48; break;
    case "1D": interval = 86400000; dataPoints = 30; break;
    case "1W": interval = 604800000; dataPoints = 20; break;
    case "1M": interval = 2592000000; dataPoints = 12; break;
    default: interval = 86400000; dataPoints = 30;
  }
  
  // Use string hash function to create a deterministic seed
  const seed = hashStringToNumber(symbol + timeframe);
  let currentPrice = basePrice;
  
  // Generate candles with deterministic values
  for (let i = 0; i < dataPoints; i++) {
    const time = now - ((dataPoints - i) * interval);
    
    // Use deterministic "random" values based on symbol, timeframe, and iteration
    const priceDelta = ((((seed * (i + 1)) % 100) / 100) - 0.5) * volatility * currentPrice;
    const open = currentPrice;
    const close = open + priceDelta;
    
    // Ensure high is always higher than both open and close
    const highAddition = Math.abs(((seed * (i + 2)) % 100) / 100) * volatility * currentPrice * 0.5;
    const high = Math.max(open, close) + highAddition;
    
    // Ensure low is always lower than both open and close
    const lowSubtraction = Math.abs(((seed * (i + 3)) % 100) / 100) * volatility * currentPrice * 0.5;
    const low = Math.min(open, close) - lowSubtraction;
    
    // Volume based on the seed and iteration
    const volume = 1000000 + (seed * (i+1) % 10000000);
    
    data.push({
      time,
      open,
      high,
      low,
      close,
      volume: Math.floor(volume)
    });
    
    // Update price for next candle
    currentPrice = close;
  }
  
  return data;
}

// Simple hash function to convert string to number for seed
function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Make sure it's always positive
  return Math.abs(hash);
}

// Get market data based on market type
export const getMarketData = (marketType: MarketType = "stocks"): MarketData[] => {
  switch (marketType) {
    case "stocks":
      return stocksData;
    case "crypto":
      return cryptoData;
    case "forex":
      return forexData;
    default:
      return stocksData;
  }
};

// Generate consistent candle data for charts based on symbol and timeframe
export const getCandleData = (symbol: string, timeframe: string): CandleData[] => {
  // Find the corresponding market data for the symbol
  let basePrice = 100;
  let volatility = 0.02;
  
  const allMarketData = [...stocksData, ...cryptoData, ...forexData];
  const marketData = allMarketData.find(m => m.symbol === symbol);
  
  if (marketData) {
    basePrice = marketData.price;
    // Adjust volatility based on market type
    if (symbol.includes("BTC") || symbol.includes("ETH")) {
      volatility = 0.05; // Higher volatility for crypto
    } else if (symbol.includes("USD") || symbol.includes("EUR") || symbol.includes("GBP")) {
      volatility = 0.005; // Lower volatility for forex
    } else {
      volatility = 0.02; // Medium volatility for stocks
    }
  }
  
  return generateDeterministicData(symbol, timeframe, basePrice, volatility);
};

// Get fundamental data for a symbol
export const getFundamentalData = (symbol: string): FundamentalData => {
  // Find the corresponding market data for the symbol
  const allMarketData = [...stocksData, ...cryptoData, ...forexData];
  const marketData = allMarketData.find(m => m.symbol === symbol);
  
  if (!marketData) {
    return { symbol, name: "Unknown" };
  }
  
  // Use symbol as seed for deterministic values
  const seed = hashStringToNumber(symbol);
  
  if (symbol.includes("USD") && (symbol.includes("BTC") || symbol.includes("ETH"))) {
    // Crypto fundamental data
    return {
      symbol,
      name: marketData.name,
      marketCap: 1000000000 * (seed % 1000),
      sector: "Cryptocurrency",
      industry: "Digital Assets",
      avgVolume: 1000000 * (seed % 10000),
      high52W: marketData.price * (1 + (seed % 100) / 200),
      low52W: marketData.price * (1 - (seed % 100) / 200),
      revenue: 10000000 * (seed % 100),
      revenueGrowth: ((seed % 50) - 10),
      profit: 5000000 * (seed % 100),
      profitGrowth: ((seed % 60) - 15),
      debt: 1000000 * (seed % 100),
      assets: 20000000 * (seed % 100),
      pe: 15 + (seed % 25),
      eps: (seed % 500) / 100,
      dividendYield: 0,
    };
  } else if (symbol.includes("USD") || symbol.includes("EUR") || symbol.includes("GBP")) {
    // Forex fundamental data
    return {
      symbol,
      name: marketData.name,
      sector: "Forex",
      industry: "Currency Exchange",
      beta: (seed % 100) / 200,
      avgVolume: 10000000 * (seed % 10000),
      high52W: marketData.price * (1 + (seed % 20) / 200),
      low52W: marketData.price * (1 - (seed % 20) / 200),
      revenue: 0,
      revenueGrowth: 0,
      profit: 0,
      profitGrowth: 0,
      debt: 0,
      assets: 10000000000 * (seed % 100),
      pe: 0,
      eps: 0,
      dividendYield: 0,
    };
  } else {
    // Stock fundamental data
    const sectors = ["Technology", "Healthcare", "Finance", "Energy", "Consumer Goods"];
    const industries = ["Software", "Hardware", "Biotech", "Banking", "Oil & Gas", "Retail"];
    
    return {
      symbol,
      name: marketData.name,
      sector: sectors[seed % sectors.length],
      industry: industries[seed % industries.length],
      marketCap: 1000000000 * (seed % 2000),
      pe: 10 + (seed % 30),
      eps: (seed % 1000) / 100,
      dividend: (seed % 500) / 100,
      dividendYield: (seed % 500) / 10000,
      beta: 0.5 + (seed % 150) / 100,
      avgVolume: 1000000 * (seed % 50),
      high52W: marketData.price * (1 + (seed % 30) / 100),
      low52W: marketData.price * (1 - (seed % 30) / 100),
      priceToBook: 1 + (seed % 1000) / 100,
      priceToSales: 1 + (seed % 2000) / 100,
      shortRatio: (seed % 1000) / 100,
      shortFloat: (seed % 20) / 100,
      revenue: 1000000000 * (seed % 50),
      revenueGrowth: ((seed % 35) - 5),
      profit: 100000000 * (seed % 100),
      profitGrowth: ((seed % 45) - 10),
      debt: 100000000 * (seed % 200),
      assets: 1000000000 * (seed % 100),
    };
  }
};

// Get financial news data
export const getNewsData = (): NewsItem[] => {
  return [
    {
      id: 1,
      title: "Federal Reserve Signals Potential Rate Cuts",
      source: "Financial Times",
      url: "#",
      publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      sentiment: "positive",
      relevance: 0.92,
      summary: "The Federal Reserve has signaled potential interest rate cuts in the near future as inflation pressures ease, potentially boosting market sentiment.",
      relatedSymbols: ["SPY", "QQQ", "AAPL", "MSFT"],
      impactScore: 8.5,
      timestamp: Date.now() - 2 * 3600000
    },
    {
      id: 2,
      title: "Bitcoin Surges Past $64,000 as Institutional Adoption Grows",
      source: "Bloomberg",
      url: "#",
      publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      sentiment: "positive",
      relevance: 0.88,
      summary: "Bitcoin has surged past $64,000 as institutional adoption continues to grow, with several major financial institutions announcing new cryptocurrency offerings.",
      relatedSymbols: ["BTCUSD", "ETHUSD", "COIN"],
      impactScore: 9.2,
      timestamp: Date.now() - 5 * 3600000
    },
    {
      id: 3,
      title: "Tech Giants Face New Antitrust Scrutiny",
      source: "Wall Street Journal",
      url: "#",
      publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      sentiment: "negative",
      relevance: 0.85,
      summary: "Major technology companies are facing renewed antitrust scrutiny as regulators announce plans for more aggressive enforcement of competition laws.",
      relatedSymbols: ["AAPL", "GOOGL", "MSFT", "AMZN"],
      impactScore: 7.8,
      timestamp: Date.now() - 12 * 3600000
    },
    {
      id: 4,
      title: "Oil Prices Drop on Demand Concerns",
      source: "Reuters",
      url: "#",
      publishedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
      sentiment: "negative",
      relevance: 0.75,
      summary: "Crude oil prices have declined amid growing concerns about global demand, particularly as major economies show signs of slowing growth.",
      relatedSymbols: ["USO", "XLE", "CVX", "XOM"],
      impactScore: 6.5,
      timestamp: Date.now() - 18 * 3600000
    },
    {
      id: 5,
      title: "Euro Strengthens Against Dollar After ECB Comments",
      source: "CNBC",
      url: "#",
      publishedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      sentiment: "neutral",
      relevance: 0.82,
      summary: "The Euro has gained strength against the US Dollar following comments from European Central Bank officials about monetary policy directions.",
      relatedSymbols: ["EURUSD", "FXE", "UUP"],
      impactScore: 7.2,
      timestamp: Date.now() - 24 * 3600000
    }
  ];
};
