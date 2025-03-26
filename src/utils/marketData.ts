
// Mock market data for demonstration purposes
export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  close: number;
  timestamp: number;
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  sentiment: "positive" | "negative" | "neutral";
  impactScore: number;
  timestamp: number;
}

export interface FundamentalData {
  symbol: string;
  pe: number;
  eps: number;
  dividendYield: number;
  marketCap: number;
  revenue: number;
  revenueGrowth: number;
  profit: number;
  profitGrowth: number;
  debt: number;
  assets: number;
}

// Mock data functions
export const getMarketData = (): MarketData[] => {
  return [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 182.52,
      change: 1.25,
      changePercent: 0.69,
      volume: 42500000,
      marketCap: 2850000000000,
      high: 183.12,
      low: 180.87,
      open: 181.11,
      close: 182.52,
      timestamp: Date.now()
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      price: 401.78,
      change: -2.31,
      changePercent: -0.57,
      volume: 28100000,
      marketCap: 2980000000000,
      high: 404.65,
      low: 398.22,
      open: 403.50,
      close: 401.78,
      timestamp: Date.now()
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      price: 178.12,
      change: 2.87,
      changePercent: 1.64,
      volume: 36700000,
      marketCap: 1850000000000,
      high: 179.25,
      low: 175.60,
      open: 176.10,
      close: 178.12,
      timestamp: Date.now()
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 163.95,
      change: 0.42,
      changePercent: 0.26,
      volume: 22800000,
      marketCap: 2050000000000,
      high: 164.75,
      low: 162.90,
      open: 163.45,
      close: 163.95,
      timestamp: Date.now()
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 240.80,
      change: -5.15,
      changePercent: -2.09,
      volume: 98500000,
      marketCap: 765000000000,
      high: 248.36,
      low: 239.26,
      open: 246.50,
      close: 240.80,
      timestamp: Date.now()
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      price: 103.23,
      change: 1.78,
      changePercent: 1.75,
      volume: 156000000,
      marketCap: 2540000000000,
      high: 104.89,
      low: 100.95,
      open: 101.56,
      close: 103.23,
      timestamp: Date.now()
    }
  ];
};

export const getCandleData = (symbol: string, timeframe: string): CandleData[] => {
  // This would normally fetch from an API, using mock data for demo
  const basePrice = symbol === "AAPL" ? 180 : 
                    symbol === "MSFT" ? 400 :
                    symbol === "AMZN" ? 175 :
                    symbol === "GOOGL" ? 160 :
                    symbol === "TSLA" ? 245 : 100;
  
  const candles: CandleData[] = [];
  const now = Date.now();
  const intervals = timeframe === "1D" ? 24 * 6 : // 5-minute candles
                    timeframe === "1W" ? 7 * 24 : // hourly candles 
                    timeframe === "1M" ? 30 : // daily candles
                    timeframe === "6M" ? 180 : 365; // daily candles
  
  const intervalMs = timeframe === "1D" ? 5 * 60 * 1000 : // 5 minutes
                     timeframe === "1W" ? 60 * 60 * 1000 : // 1 hour
                     24 * 60 * 60 * 1000; // 1 day
  
  for (let i = intervals; i >= 0; i--) {
    const time = now - (i * intervalMs);
    const randomVariance = (Math.random() - 0.5) * basePrice * 0.02;
    const open = basePrice + randomVariance;
    const high = open + (Math.random() * basePrice * 0.01);
    const low = open - (Math.random() * basePrice * 0.01);
    const close = (open + high + low) / 3 + (Math.random() - 0.5) * basePrice * 0.005;
    const volume = Math.floor(Math.random() * 1000000) + 500000;
    
    candles.push({ time, open, high, low, close, volume });
  }
  
  return candles;
};

export const getNewsData = (): NewsItem[] => {
  return [
    {
      id: "1",
      title: "Federal Reserve Maintains Interest Rates, Signals Potential Cut Later This Year",
      summary: "The Federal Reserve kept interest rates unchanged at its latest meeting but indicated that cuts may be coming later this year as inflation shows signs of easing.",
      source: "Financial Times",
      url: "#",
      sentiment: "positive",
      impactScore: 8,
      timestamp: Date.now() - 3600000
    },
    {
      id: "2",
      title: "Global Supply Chain Constraints Ease as Shipping Routes Normalize",
      summary: "Global supply chain pressures have decreased significantly as shipping routes normalize and port congestion clears up, potentially reducing inflationary pressures.",
      source: "Bloomberg",
      url: "#",
      sentiment: "positive",
      impactScore: 7,
      timestamp: Date.now() - 7200000
    },
    {
      id: "3",
      title: "Tech Sector Faces Increased Regulatory Scrutiny in Major Markets",
      summary: "Technology companies are facing growing regulatory challenges across the US, EU, and Asia as governments implement stricter antitrust and data privacy measures.",
      source: "Reuters",
      url: "#",
      sentiment: "negative",
      impactScore: 6,
      timestamp: Date.now() - 14400000
    },
    {
      id: "4",
      title: "Oil Prices Spike on Middle East Tensions and Production Cuts",
      summary: "Crude oil prices surged following escalating tensions in the Middle East and OPEC's decision to maintain production cuts through the end of the year.",
      source: "CNBC",
      url: "#",
      sentiment: "negative",
      impactScore: 8,
      timestamp: Date.now() - 21600000
    },
    {
      id: "5",
      title: "Major Central Banks Signal Coordinated Approach to Monetary Policy",
      summary: "Leading central banks including the Fed, ECB, and Bank of Japan have indicated a more coordinated approach to monetary policy as global economic conditions align.",
      source: "Wall Street Journal",
      url: "#",
      sentiment: "neutral",
      impactScore: 7,
      timestamp: Date.now() - 36000000
    }
  ];
};

export const getFundamentalData = (symbol: string): FundamentalData => {
  // Mock fundamental data
  const fundamentals: Record<string, FundamentalData> = {
    "AAPL": {
      symbol: "AAPL",
      pe: 30.45,
      eps: 6.00,
      dividendYield: 0.50,
      marketCap: 2850000000000,
      revenue: 383000000000,
      revenueGrowth: 6.8,
      profit: 94000000000,
      profitGrowth: 7.5,
      debt: 120000000000,
      assets: 350000000000
    },
    "MSFT": {
      symbol: "MSFT",
      pe: 34.8,
      eps: 11.58,
      dividendYield: 0.71,
      marketCap: 2980000000000,
      revenue: 212000000000,
      revenueGrowth: 15.2,
      profit: 83000000000,
      profitGrowth: 19.7,
      debt: 76000000000,
      assets: 364000000000
    },
    "AMZN": {
      symbol: "AMZN",
      pe: 45.12,
      eps: 3.95,
      dividendYield: 0,
      marketCap: 1850000000000,
      revenue: 513000000000,
      revenueGrowth: 11.5,
      profit: 32000000000,
      profitGrowth: 23.2,
      debt: 140000000000,
      assets: 420000000000
    },
    "GOOGL": {
      symbol: "GOOGL",
      pe: 27.9,
      eps: 5.9,
      dividendYield: 0.51,
      marketCap: 2050000000000,
      revenue: 307000000000,
      revenueGrowth: 12.8,
      profit: 74000000000,
      profitGrowth: 14.3,
      debt: 30000000000,
      assets: 365000000000
    },
    "TSLA": {
      symbol: "TSLA",
      pe: 60.2,
      eps: 4.15,
      dividendYield: 0,
      marketCap: 765000000000,
      revenue: 96000000000,
      revenueGrowth: 18.8,
      profit: 15000000000,
      profitGrowth: 20.4,
      debt: 12000000000,
      assets: 92000000000
    },
    "NVDA": {
      symbol: "NVDA",
      pe: 35.4,
      eps: 3.01,
      dividendYield: 0.05,
      marketCap: 2540000000000,
      revenue: 60000000000,
      revenueGrowth: 65.2,
      profit: 29000000000,
      profitGrowth: 163.7,
      debt: 11000000000,
      assets: 75000000000
    }
  };

  return fundamentals[symbol] || fundamentals["AAPL"];
};
