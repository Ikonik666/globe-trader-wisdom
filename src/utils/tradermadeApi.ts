
import { MarketData, CandleData, FundamentalData } from './marketData';
import { MarketType } from './marketSymbols';

// Get the API key from the window object or localStorage
const getApiKey = (): string => {
  if ((window as any).TRADERMADE_API_KEY) {
    return (window as any).TRADERMADE_API_KEY;
  }
  
  const storedKey = localStorage.getItem('tradermadeApiKey');
  if (storedKey) {
    (window as any).TRADERMADE_API_KEY = storedKey;
    return storedKey;
  }
  
  return "cRoPhAnRp4zUx-7pPW7j"; // Default API key
};

// Check if API response contains rate limit message
const isRateLimited = (data: any): boolean => {
  return data && (
    data.error?.includes("rate limit") || 
    data.message?.includes("rate limit") ||
    data.status === 429
  );
};

// Format dates for TraderMade API
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Fetch current price data for a symbol
export async function fetchCurrentPrice(symbol: string): Promise<{ price: number; change: number; changePercent: number }> {
  try {
    const apiKey = getApiKey();
    // Tradermade requires different format - using live endpoint
    const url = `https://marketdata.tradermade.com/api/v1/live?currency=${symbol}&api_key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for rate limiting
    if (isRateLimited(data)) {
      console.warn("TraderMade API rate limit reached:", data);
      throw new Error("API rate limit reached");
    }
    
    if (data.quotes && data.quotes.length > 0) {
      const quote = data.quotes[0];
      const price = parseFloat(quote.ask);
      const bid = parseFloat(quote.bid);
      const mid = (price + bid) / 2;
      
      // TraderMade doesn't provide direct change values in live endpoint
      // We'll calculate an approximate change for display purposes
      const change = (price - bid);
      const changePercent = (change / bid) * 100;
      
      return { price: mid, change, changePercent };
    }
    
    // If no data or error, return default values
    throw new Error("No price data available");
  } catch (error) {
    console.error("Error fetching price data:", error);
    throw error; // Re-throw to handle in calling function
  }
}

// Fetch crypto data - using the same endpoint for consistency
export async function fetchCryptoPrice(symbol: string): Promise<{ price: number; change: number; changePercent: number }> {
  return fetchCurrentPrice(symbol);
}

// Fetch market data for a specific market type
export async function fetchMarketData(marketType: MarketType): Promise<MarketData[]> {
  try {
    // Get symbols for the specified market type
    const symbols = getSymbolsForMarketType(marketType);
    const promises = symbols.map(async (symbol) => {
      try {
        let priceData;
        
        if (marketType === "crypto") {
          priceData = await fetchCryptoPrice(symbol.symbol);
        } else {
          priceData = await fetchCurrentPrice(symbol.symbol);
        }
        
        return {
          symbol: symbol.symbol,
          name: symbol.name,
          price: priceData.price,
          change: priceData.change,
          changePercent: priceData.changePercent,
          volume: 0, // TraderMade doesn't provide volume in the basic endpoint
        };
      } catch (error) {
        console.warn(`Could not fetch data for ${symbol.symbol}:`, error);
        // Return a placeholder with error indication for this symbol
        return {
          symbol: symbol.symbol,
          name: symbol.name,
          price: 0,
          change: 0,
          changePercent: 0,
          volume: 0,
          error: true
        };
      }
    });
    
    const results = await Promise.all(promises);
    
    // If all results have errors, throw an exception to trigger fallback
    if (results.every(result => (result as any).error)) {
      throw new Error("Could not fetch any market data - API limit reached");
    }
    
    return results;
  } catch (error) {
    console.error("Error fetching market data:", error);
    throw error;
  }
}

// Get symbols for a specific market type (modified for TraderMade format)
function getSymbolsForMarketType(marketType: MarketType) {
  // TraderMade has different symbol conventions
  switch (marketType) {
    case "stocks":
      return [
        { symbol: "AAPL", name: "Apple Inc." },
        { symbol: "MSFT", name: "Microsoft Corp." },
        { symbol: "AMZN", name: "Amazon.com Inc." },
        { symbol: "GOOGL", name: "Alphabet Inc." },
        { symbol: "TSLA", name: "Tesla Inc." },
      ];
    case "crypto":
      return [
        { symbol: "BTCUSD", name: "Bitcoin/USD" },
        { symbol: "ETHUSD", name: "Ethereum/USD" },
        { symbol: "LTCUSD", name: "Litecoin/USD" },
        { symbol: "DOTUSD", name: "Polkadot/USD" },
        { symbol: "SOLUSD", name: "Solana/USD" },
      ];
    case "forex":
      return [
        { symbol: "EURUSD", name: "Euro/US Dollar" },
        { symbol: "GBPUSD", name: "British Pound/US Dollar" },
        { symbol: "USDJPY", name: "US Dollar/Japanese Yen" },
        { symbol: "AUDUSD", name: "Australian Dollar/US Dollar" },
        { symbol: "USDCAD", name: "US Dollar/Canadian Dollar" },
      ];
    default:
      return [];
  }
}

// Fetch candle data for a symbol and timeframe
export async function fetchCandleData(symbol: string, timeframe: string): Promise<CandleData[]> {
  try {
    let interval = "hourly"; // Default interval for TraderMade
    const apiKey = getApiKey();
    
    // Map timeframe to TraderMade interval
    switch (timeframe) {
      case "1m": 
      case "5m": 
      case "15m": 
      case "1H": interval = "hourly"; break;
      case "4H": interval = "hourly"; break;
      case "1D": interval = "daily"; break;
      case "1W": 
      case "1M": interval = "daily"; break;
      default: interval = "hourly";
    }
    
    // Calculate date range based on timeframe
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeframe === "1D" || timeframe === "1W" || timeframe === "1M") {
      // For daily/weekly/monthly, get past 3 months of data
      startDate.setMonth(startDate.getMonth() - 3);
    } else {
      // For hourly data, get past 3 days
      startDate.setDate(startDate.getDate() - 3);
    }
    
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    
    const url = `https://marketdata.tradermade.com/api/v1/timeseries?currency=${symbol}&api_key=${apiKey}&start_date=${formattedStartDate}&end_date=${formattedEndDate}&format=records&interval=${interval}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for rate limiting
    if (isRateLimited(data)) {
      console.warn("TraderMade API rate limit reached:", data);
      throw new Error("API rate limit reached");
    }
    
    if (!data.quotes || data.quotes.length === 0) {
      throw new Error("No candle data available");
    }
    
    // Convert TraderMade data to CandleData format
    const candleData: CandleData[] = data.quotes.map((quote: any) => {
      const timestamp = new Date(quote.date).getTime();
      return {
        time: timestamp,
        open: parseFloat(quote.open),
        high: parseFloat(quote.high),
        low: parseFloat(quote.low),
        close: parseFloat(quote.close),
        volume: 0 // TraderMade doesn't provide volume in timeseries
      };
    });
    
    return candleData;
  } catch (error) {
    console.error("Error fetching candle data:", error);
    throw error;
  }
}

// Fetch fundamental data (simple implementation as TraderMade doesn't provide this)
export async function fetchFundamentalData(symbol: string): Promise<FundamentalData> {
  try {
    // TraderMade doesn't provide fundamental data, so we'll return a simplified object
    return {
      symbol,
      name: symbol,
      sector: symbol.includes("USD") ? (
        symbol.includes("BTC") || symbol.includes("ETH") ? "Cryptocurrency" : "Forex"
      ) : "Stocks",
      industry: symbol.includes("USD") ? (
        symbol.includes("BTC") || symbol.includes("ETH") ? "Digital Assets" : "Currency"
      ) : "Technology",
      marketCap: 0,
      pe: 0,
      eps: 0,
      dividend: 0,
      dividendYield: 0,
      beta: 0,
      high52W: 0,
      low52W: 0
    };
  } catch (error) {
    console.error("Error fetching fundamental data:", error);
    throw error;
  }
}
