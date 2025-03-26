
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
  peRatio?: number;
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
  { symbol: "BTCUSD", name: "Bitcoin/USD", price: 64287.32, change: 1257.41, changePercent: 1.99, volume: 28761245 },
  { symbol: "ETHUSD", name: "Ethereum/USD", price: 3456.78, change: 78.45, changePercent: 2.32, volume: 18954321 },
  { symbol: "XRPUSD", name: "Ripple/USD", price: 0.5432, change: -0.0134, changePercent: -2.41, volume: 9876543 },
  { symbol: "LTCUSD", name: "Litecoin/USD", price: 87.65, change: 1.23, changePercent: 1.42, volume: 5432167 },
  { symbol: "ADAUSD", name: "Cardano/USD", price: 0.4321, change: 0.0087, changePercent: 2.06, volume: 7654321 },
  { symbol: "DOTUSD", name: "Polkadot/USD", price: 6.78, change: -0.12, changePercent: -1.74, volume: 3456789 },
  { symbol: "DOGEUSD", name: "Dogecoin/USD", price: 0.1234, change: 0.0056, changePercent: 4.76, volume: 9876543 },
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

// Generate mock candle data for charts
export const getCandleData = (symbol: string, timeframe: string): CandleData[] => {
  const now = new Date().getTime();
  const data: CandleData[] = [];
  
  // Generate realistic candle data based on timeframe
  let interval = 86400000; // 1 day in milliseconds
  let dataPoints = 30;
  
  if (timeframe === "1m") {
    interval = 60000; // 1 minute
    dataPoints = 60;
  } else if (timeframe === "5m") {
    interval = 300000; // 5 minutes
    dataPoints = 60;
  } else if (timeframe === "15m") {
    interval = 900000; // 15 minutes
    dataPoints = 60;
  } else if (timeframe === "1H") {
    interval = 3600000; // 1 hour
    dataPoints = 48;
  } else if (timeframe === "4H") {
    interval = 14400000; // 4 hours
    dataPoints = 48;
  } else if (timeframe === "1D") {
    interval = 86400000; // 1 day
    dataPoints = 30;
  } else if (timeframe === "1W") {
    interval = 604800000; // 1 week
    dataPoints = 20;
  } else if (timeframe === "1M") {
    interval = 2592000000; // 30 days
    dataPoints = 12;
  }
  
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
  
  // Generate candles
  for (let i = 0; i < dataPoints; i++) {
    const time = now - ((dataPoints - i) * interval);
    const priceDelta = (Math.random() - 0.5) * volatility * basePrice;
    const open = basePrice + priceDelta;
    const high = open * (1 + Math.random() * volatility * 0.5);
    const low = open * (1 - Math.random() * volatility * 0.5);
    const close = (open + high + low) / 3 + (Math.random() - 0.5) * volatility * basePrice * 0.5;
    const volume = Math.floor(Math.random() * 10000000) + 1000000;
    
    data.push({
      time,
      open,
      high: Math.max(open, close, high),
      low: Math.min(open, close, low),
      close,
      volume
    });
    
    // Update base price for next candle
    basePrice = close;
  }
  
  return data;
};

// Get fundamental data for a symbol
export const getFundamentalData = (symbol: string): FundamentalData => {
  // Find the corresponding market data for the symbol
  const allMarketData = [...stocksData, ...cryptoData, ...forexData];
  const marketData = allMarketData.find(m => m.symbol === symbol);
  
  if (!marketData) {
    return { symbol, name: "Unknown" };
  }
  
  if (symbol.includes("USD") && (symbol.includes("BTC") || symbol.includes("ETH"))) {
    // Crypto fundamental data
    return {
      symbol,
      name: marketData.name,
      marketCap: Math.random() * 1000000000000,
      sector: "Cryptocurrency",
      industry: "Digital Assets",
      avgVolume: Math.random() * 10000000000,
      high52W: marketData.price * (1 + Math.random() * 0.5),
      low52W: marketData.price * (1 - Math.random() * 0.5),
    };
  } else if (symbol.includes("USD") || symbol.includes("EUR") || symbol.includes("GBP")) {
    // Forex fundamental data
    return {
      symbol,
      name: marketData.name,
      sector: "Forex",
      industry: "Currency Exchange",
      beta: Math.random() * 0.5,
      avgVolume: Math.random() * 100000000000,
      high52W: marketData.price * (1 + Math.random() * 0.1),
      low52W: marketData.price * (1 - Math.random() * 0.1),
    };
  } else {
    // Stock fundamental data
    return {
      symbol,
      name: marketData.name,
      sector: ["Technology", "Healthcare", "Finance", "Energy", "Consumer Goods"][Math.floor(Math.random() * 5)],
      industry: ["Software", "Hardware", "Biotech", "Banking", "Oil & Gas", "Retail"][Math.floor(Math.random() * 6)],
      marketCap: Math.random() * 2000000000000,
      peRatio: 10 + Math.random() * 30,
      eps: Math.random() * 10,
      dividend: Math.random() * 5,
      dividendYield: Math.random() * 0.05,
      beta: 0.5 + Math.random() * 1.5,
      avgVolume: Math.random() * 50000000,
      high52W: marketData.price * (1 + Math.random() * 0.3),
      low52W: marketData.price * (1 - Math.random() * 0.3),
      priceToBook: 1 + Math.random() * 10,
      priceToSales: 1 + Math.random() * 20,
      shortRatio: Math.random() * 10,
      shortFloat: Math.random() * 0.2,
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
      relatedSymbols: ["SPY", "QQQ", "AAPL", "MSFT"]
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
      relatedSymbols: ["BTCUSD", "ETHUSD", "COIN"]
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
      relatedSymbols: ["AAPL", "GOOGL", "MSFT", "AMZN"]
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
      relatedSymbols: ["USO", "XLE", "CVX", "XOM"]
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
      relatedSymbols: ["EURUSD", "FXE", "UUP"]
    }
  ];
};
