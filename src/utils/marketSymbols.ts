
// Market symbols organized by category
export const marketSymbols = {
  stocks: [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
  ],
  crypto: [
    { symbol: "BTCUSD", name: "Bitcoin/USD" },
    { symbol: "ETHUSD", name: "Ethereum/USD" },
    { symbol: "XRPUSD", name: "Ripple/USD" },
    { symbol: "LTCUSD", name: "Litecoin/USD" },
    { symbol: "ADAUSD", name: "Cardano/USD" },
    { symbol: "DOTUSD", name: "Polkadot/USD" },
    { symbol: "DOGEUSD", name: "Dogecoin/USD" },
    { symbol: "SOLUSD", name: "Solana/USD" },
  ],
  forex: [
    { symbol: "EURUSD", name: "Euro/US Dollar" },
    { symbol: "GBPUSD", name: "British Pound/US Dollar" },
    { symbol: "USDJPY", name: "US Dollar/Japanese Yen" },
    { symbol: "USDCHF", name: "US Dollar/Swiss Franc" },
    { symbol: "AUDUSD", name: "Australian Dollar/US Dollar" },
    { symbol: "USDCAD", name: "US Dollar/Canadian Dollar" },
    { symbol: "NZDUSD", name: "New Zealand Dollar/US Dollar" },
  ]
};

export type MarketType = "stocks" | "crypto" | "forex";
export type SymbolInfo = { symbol: string; name: string };

// Get all symbols
export const getAllSymbols = (): SymbolInfo[] => {
  return [
    ...marketSymbols.stocks,
    ...marketSymbols.crypto,
    ...marketSymbols.forex
  ];
};

// Get symbols by market type
export const getSymbolsByMarketType = (marketType: MarketType): SymbolInfo[] => {
  return marketSymbols[marketType] || [];
};
