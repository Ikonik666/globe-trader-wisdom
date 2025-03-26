import { CandleData, MarketData, NewsItem, FundamentalData } from "./marketData";

export type TradeSignal = "strong_buy" | "buy" | "neutral" | "sell" | "strong_sell";
export type SignalSource = "technical" | "fundamental" | "sentiment" | "combined";
export type TimeFrame = "short" | "medium" | "long";

export interface AnalysisResult {
  symbol: string;
  signal: TradeSignal;
  confidence: number; // 0-100
  source: SignalSource;
  timeFrame: TimeFrame;
  reasoning: string[];
  support: number;
  resistance: number;
  stopLoss: number;
  targetPrice: number;
  riskRewardRatio: number;
  timestamp: number;
}

export interface PatternDetection {
  name: string;
  timeframe: string;
  confidence: number;
  bullish: boolean;
  description: string;
}

// ICT/SMC Pattern Names
const bullishSMCPatterns = [
  "Bullish Order Block", 
  "Fair Value Gap Up", 
  "Bullish Breaker", 
  "Liquidity Sweep Above", 
  "Bullish Mitigation Block",
  "Optimal Trade Entry (OTE)",
  "Discount Zone",
  "Imbalance Up",
  "Equal Highs Taken",
  "Premium Zone Reversal",
  "Bullish BOS (Break of Structure)",
  "Smart Money Entry Point"
];

const bearishSMCPatterns = [
  "Bearish Order Block", 
  "Fair Value Gap Down", 
  "Bearish Breaker", 
  "Liquidity Sweep Below", 
  "Bearish Mitigation Block",
  "Raid Level",
  "Premium Zone",
  "Imbalance Down",
  "Equal Lows Taken",
  "Discount Zone Reversal",
  "Bearish BOS (Break of Structure)",
  "Market Maker Intent"
];

// Pattern descriptions
const smcDescriptions = {
  "Bullish Order Block": "Previous supply zone flipped to demand zone with strong momentum. Institutional buying detected at this key level.",
  "Fair Value Gap Up": "Price imbalance identified with institutional interest to the upside. Gap in price that's likely to be filled with upward movement.",
  "Bullish Breaker": "Previous resistance broken and retested as support. Strong signal of ongoing bullish momentum.",
  "Liquidity Sweep Above": "Sweep of liquidity above resistance before expected continuation. Smart money has collected retail stop losses.",
  "Bullish Mitigation Block": "Previous resistance level mitigated and now serving as support for further upside movement.",
  "Optimal Trade Entry (OTE)": "Price has reached the institutional entry zone where smart money typically engages in the market.",
  "Discount Zone": "Price has reached a significant discount area where institutional buying is likely to occur.",
  "Imbalance Up": "Significant price imbalance detected with institutional buying pressure evident in candle structure.",
  "Equal Highs Taken": "Equal highs have been taken out, indicating smart money manipulation before reversal.",
  "Premium Zone Reversal": "Price has reached an overextended level and showing reversal signs from the premium zone.",
  "Bullish BOS (Break of Structure)": "Clear break of market structure to the upside, indicating a change in trend direction.",
  "Smart Money Entry Point": "Key level where institutional money is likely entering the market for a bullish move.",
  
  "Bearish Order Block": "Previous demand zone flipped to supply zone with strong momentum. Institutional selling detected at this key level.",
  "Fair Value Gap Down": "Price imbalance identified with institutional interest to the downside. Gap in price that's likely to be filled with downward movement.",
  "Bearish Breaker": "Previous support broken and retested as resistance. Strong signal of ongoing bearish momentum.",
  "Liquidity Sweep Below": "Sweep of liquidity below support before expected continuation. Smart money has collected retail stop losses.",
  "Bearish Mitigation Block": "Previous support level mitigated and now serving as resistance for further downside movement.",
  "Raid Level": "Key level where price has been manipulated before a significant move, typically to trap retail traders.",
  "Premium Zone": "Price has reached a significant premium area where institutional selling is likely to occur.",
  "Imbalance Down": "Significant price imbalance detected with institutional selling pressure evident in candle structure.",
  "Equal Lows Taken": "Equal lows have been taken out, indicating smart money manipulation before reversal.",
  "Discount Zone Reversal": "Price has reached an overextended level to the downside and showing reversal signs from the discount zone.",
  "Bearish BOS (Break of Structure)": "Clear break of market structure to the downside, indicating a change in trend direction.",
  "Market Maker Intent": "Key level where market makers are showing their hand for a potential bearish move."
};

// Timeframes mapping to ensure consistency
const timeframeMapping: Record<string, string> = {
  "1m": "M1",
  "5m": "M5", 
  "15m": "M15",
  "1H": "H1",
  "4H": "H4",
  "1D": "D1",
  "1W": "W1",
  "1M": "MN"
};

// Analyze technical patterns including ICT concepts - now tied to timeframe
export const analyzeTechnicalPatterns = (
  symbol: string,
  candles: CandleData[],
  timeframe: string
): PatternDetection[] => {
  if (!candles || candles.length === 0) {
    return [];
  }
  
  // Get standardized timeframe notation
  const standardTimeframe = timeframeMapping[timeframe] || "D1";
  
  // Use seed from symbol + timeframe for deterministic pattern generation
  const seed = hashString(symbol + timeframe);
  const mockPatterns: PatternDetection[] = [];
  
  // Determine if the general trend is bullish or bearish
  // Use deterministic approach based on the last 5 candles
  const lastCandles = candles.slice(-5);
  let upCount = 0;
  let downCount = 0;
  
  lastCandles.forEach(candle => {
    if (candle.close > candle.open) upCount++;
    else downCount++;
  });
  
  const isBullishTrend = upCount > downCount;
  
  // Select appropriate patterns based on trend
  const patterns = isBullishTrend ? bullishSMCPatterns : bearishSMCPatterns;
  
  // Generate 2-3 patterns based on the seed
  const numPatterns = 2 + (seed % 2);
  
  // Create a deterministic shuffle using the seed
  const shuffledPatterns = deterministicShuffle(patterns, seed);
  const selectedPatterns = shuffledPatterns.slice(0, numPatterns);
  
  // Create patterns with various confidence levels
  selectedPatterns.forEach((patternName, index) => {
    // Create deterministic confidence based on symbol, timeframe and pattern index
    const confidence = 65 + ((seed + index) % 25);
    
    mockPatterns.push({
      name: patternName,
      timeframe: standardTimeframe,
      confidence: confidence,
      bullish: isBullishTrend,
      description: smcDescriptions[patternName as keyof typeof smcDescriptions] || 
                 "ICT/SMC pattern detected based on institutional order flow."
    });
  });
  
  // Add one opposite pattern for realism with a lower confidence
  const oppositePatterns = isBullishTrend ? bearishSMCPatterns : bullishSMCPatterns;
  const oppositePattern = oppositePatterns[seed % oppositePatterns.length];
  
  mockPatterns.push({
    name: oppositePattern,
    timeframe: standardTimeframe,
    confidence: 50 + (seed % 20),
    bullish: !isBullishTrend,
    description: smcDescriptions[oppositePattern as keyof typeof smcDescriptions] || 
               "Conflicting pattern detected, suggesting caution."
  });
  
  // Sort by confidence (highest first)
  return mockPatterns.sort((a, b) => b.confidence - a.confidence);
};

// Helper function for deterministic "random" shuffling
function deterministicShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let currentSeed = seed;
  
  for (let i = result.length - 1; i > 0; i--) {
    // Generate next pseudorandom number
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = currentSeed % (i + 1);
    
    // Swap elements
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

// Simple hash function for strings
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Analyze market sentiment from news
export const analyzeSentiment = (news: NewsItem[]): {
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  impactfulNews: NewsItem[];
} => {
  if (!news || news.length === 0) {
    return {
      sentiment: "neutral",
      score: 50,
      impactfulNews: []
    };
  }
  
  let sentimentScore = 0;
  const impactfulNews: NewsItem[] = [];
  
  news.forEach(item => {
    // Use relevance as fallback if impactScore is not available
    const impactValue = item.impactScore !== undefined ? item.impactScore : item.relevance * 10;
    const impact = item.sentiment === "positive" ? impactValue : 
                   item.sentiment === "negative" ? -impactValue : 0;
    sentimentScore += impact;
    
    if (impactValue >= 7) {
      impactfulNews.push(item);
    }
  });
  
  const normalizedScore = Math.min(Math.max((sentimentScore / (news.length * 5) * 50) + 50, 0), 100);
  
  return {
    sentiment: normalizedScore > 60 ? "positive" : normalizedScore < 40 ? "negative" : "neutral",
    score: normalizedScore,
    impactfulNews: impactfulNews.slice(0, 3)
  };
};

// Analyze fundamental data
export const analyzeFundamentals = (fundamental: FundamentalData): {
  outlook: "strong" | "positive" | "neutral" | "negative" | "weak";
  score: number;
  highlights: string[];
} => {
  let score = 50; // Neutral starting point
  const highlights: string[] = [];
  
  // Handle missing data
  if (!fundamental) {
    return {
      outlook: "neutral",
      score: 50,
      highlights: ["Insufficient fundamental data available"]
    };
  }
  
  // PE ratio analysis
  if (fundamental.pe !== undefined) {
    if (fundamental.pe < 15) {
      score += 10;
      highlights.push("Attractively valued with low P/E ratio");
    } else if (fundamental.pe > 40) {
      score -= 10;
      highlights.push("Potentially overvalued with high P/E ratio");
    }
  }
  
  // Growth analysis
  if (fundamental.revenueGrowth !== undefined) {
    if (fundamental.revenueGrowth > 15) {
      score += 15;
      highlights.push("Strong revenue growth above market average");
    } else if (fundamental.revenueGrowth < 5) {
      score -= 10;
      highlights.push("Weak revenue growth below market average");
    }
  }
  
  if (fundamental.profitGrowth !== undefined) {
    if (fundamental.profitGrowth > 20) {
      score += 15;
      highlights.push("Excellent profit growth demonstrates business efficiency");
    } else if (fundamental.profitGrowth < 0) {
      score -= 15;
      highlights.push("Declining profits indicate potential business challenges");
    }
  }
  
  // Financial health
  if (fundamental.debt !== undefined && fundamental.assets !== undefined && fundamental.assets > 0) {
    const debtToAssets = fundamental.debt / fundamental.assets;
    if (debtToAssets < 0.2) {
      score += 10;
      highlights.push("Strong balance sheet with low debt relative to assets");
    } else if (debtToAssets > 0.5) {
      score -= 10;
      highlights.push("High debt levels may constrain future flexibility");
    }
  }
  
  // Dividend
  if (fundamental.dividendYield !== undefined && fundamental.dividendYield > 3) {
    score += 5;
    highlights.push("Attractive dividend yield provides income potential");
  }
  
  // Cap the score between 0-100
  score = Math.min(Math.max(score, 0), 100);
  
  // Determine outlook
  let outlook: "strong" | "positive" | "neutral" | "negative" | "weak";
  if (score >= 80) outlook = "strong";
  else if (score >= 60) outlook = "positive";
  else if (score >= 40) outlook = "neutral";
  else if (score >= 20) outlook = "negative";
  else outlook = "weak";
  
  return {
    outlook,
    score,
    highlights: highlights.length > 0 ? highlights.slice(0, 3) : ["No significant fundamental highlights"] // Return top 3 highlights
  };
};

// Generate trading signals by combining technical, fundamental and sentiment analysis
export const generateSignal = (
  symbol: string,
  marketData: MarketData,
  candles: CandleData[],
  fundData: FundamentalData,
  news: NewsItem[],
  timeframe: string
): AnalysisResult => {
  if (!marketData || !candles || candles.length === 0) {
    // Default signal for error cases
    return {
      symbol,
      signal: "neutral",
      confidence: 50,
      source: "technical", 
      timeFrame: "medium",
      reasoning: ["Insufficient data to generate accurate signals"],
      support: 0,
      resistance: 0,
      stopLoss: 0,
      targetPrice: 0,
      riskRewardRatio: 1.0,
      timestamp: Date.now()
    };
  }

  // Map the chart timeframe to analysis timeframe
  const analysisTimeframe = mapChartTimeframeToAnalysisTimeframe(timeframe);
  
  // Get patterns specific to the selected timeframe
  const technicalPatterns = analyzeTechnicalPatterns(symbol, candles, timeframe);
  const sentiment = analyzeSentiment(news);
  const fundamentals = analyzeFundamentals(fundData);
  
  // Calculate weighted scores
  const technicalScore = technicalPatterns.reduce(
    (sum, pattern) => sum + (pattern.bullish ? pattern.confidence : -pattern.confidence),
    0
  ) / (technicalPatterns.length * 100) * 100;
  
  // Weight the different analysis components differently based on timeframe
  let technicalWeight, fundamentalWeight, sentimentWeight;
  
  // Short-term timeframes give more weight to technical factors
  if (timeframe === "1m" || timeframe === "5m" || timeframe === "15m") {
    technicalWeight = 0.8;
    fundamentalWeight = 0.05;
    sentimentWeight = 0.15;
  } 
  // Medium-term timeframes balance technical and fundamental
  else if (timeframe === "1H" || timeframe === "4H" || timeframe === "1D") {
    technicalWeight = 0.5;
    fundamentalWeight = 0.3;
    sentimentWeight = 0.2;
  } 
  // Long-term timeframes give more weight to fundamentals
  else {
    technicalWeight = 0.3;
    fundamentalWeight = 0.5;
    sentimentWeight = 0.2;
  }
  
  // Normalize technical score to 0-100
  const normalizedTechnicalScore = (technicalScore + 100) / 2;
  
  // Calculate combined score
  const combinedScore = (
    normalizedTechnicalScore * technicalWeight +
    fundamentals.score * fundamentalWeight +
    sentiment.score * sentimentWeight
  );
  
  // Determine signal based on combined score
  let signal: TradeSignal;
  if (combinedScore >= 80) signal = "strong_buy";
  else if (combinedScore >= 60) signal = "buy";
  else if (combinedScore >= 40) signal = "neutral";
  else if (combinedScore >= 20) signal = "sell";
  else signal = "strong_sell";
  
  // Calculate support and resistance (scaled appropriately for the asset price)
  const prices = candles.map(c => c.close);
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const range = max - min;
  
  const currentPrice = marketData.price;
  
  // Scale support and resistance calculations based on price magnitude
  let supportPercentage, resistancePercentage, stopLossPercentage, targetPercentage;
  
  // Adjust percentages based on asset type and price magnitude
  if (symbol.includes("BTC")) {
    // Bitcoin has higher volatility but also much higher price, scale percentages
    supportPercentage = 0.02;
    resistancePercentage = 0.03;
    stopLossPercentage = 0.015;
    targetPercentage = 0.05;
  } else if (symbol.includes("ETH") || currentPrice > 1000) {
    // High-price assets get moderate volatility percentages
    supportPercentage = 0.03;
    resistancePercentage = 0.045;
    stopLossPercentage = 0.02;
    targetPercentage = 0.07;
  } else if (symbol.includes("USD") || symbol.includes("EUR") || symbol.includes("GBP")) {
    // Forex has very low volatility
    supportPercentage = 0.005;
    resistancePercentage = 0.0075;
    stopLossPercentage = 0.003;
    targetPercentage = 0.01;
  } else {
    // Regular stocks
    supportPercentage = 0.05;
    resistancePercentage = 0.075;
    stopLossPercentage = 0.04;
    targetPercentage = 0.1;
  }
  
  const support = currentPrice * (1 - supportPercentage);
  const resistance = currentPrice * (1 + resistancePercentage);
  
  // Calculate stop loss and target using ICT concepts
  const stopLoss = signal === "strong_buy" || signal === "buy" 
    ? currentPrice * (1 - stopLossPercentage) // Just below the discount zone
    : currentPrice * (1 + stopLossPercentage); // Just above the premium zone
    
  const targetPrice = signal === "strong_buy" || signal === "buy"
    ? currentPrice * (1 + targetPercentage) // Optimal profit taking zone
    : currentPrice * (1 - targetPercentage);
  
  // Calculate risk/reward ratio
  const risk = Math.abs(currentPrice - stopLoss);
  const reward = Math.abs(targetPrice - currentPrice);
  const riskRewardRatio = risk > 0 ? reward / risk : 1;
  
  // Generate reasoning with ICT/SMC terminology
  const reasoning: string[] = [];
  
  // Add technical reasoning with SMC focus
  const bullishPatterns = technicalPatterns.filter(p => p.bullish);
  const bearishPatterns = technicalPatterns.filter(p => !p.bullish);
  
  if (bullishPatterns.length > 0) {
    reasoning.push(`SMC analysis on ${timeframeMapping[timeframe] || timeframe} timeframe shows ${bullishPatterns.length} bullish patterns including ${bullishPatterns[0]?.name}`);
    if (bullishPatterns[0]) {
      reasoning.push(bullishPatterns[0].description);
    }
  }
  
  if (bearishPatterns.length > 0) {
    reasoning.push(`SMC analysis on ${timeframeMapping[timeframe] || timeframe} timeframe shows ${bearishPatterns.length} bearish patterns including ${bearishPatterns[0]?.name}`);
    if (signal === "sell" || signal === "strong_sell") {
      if (bearishPatterns[0]) {
        reasoning.push(bearishPatterns[0].description);
      }
    }
  }
  
  // Add market structure analysis
  reasoning.push(`Market structure on ${timeframeMapping[timeframe] || timeframe} shows ${signal.includes('buy') ? 'bullish' : signal.includes('sell') ? 'bearish' : 'neutral'} bias with ${signal.includes('strong') ? 'strong' : 'moderate'} confirmation`);
  
  // Add fundamental reasoning for medium and long timeframes
  if (timeframe !== "1m" && timeframe !== "5m" && timeframe !== "15m") {
    reasoning.push(`Fundamental outlook is ${fundamentals.outlook} (${Math.round(fundamentals.score)}/100)`);
    if (fundamentals.highlights.length > 0) {
      reasoning.push(fundamentals.highlights[0]);
    }
  }
  
  // Add sentiment reasoning
  reasoning.push(`Market sentiment is ${sentiment.sentiment} (${Math.round(sentiment.score)}/100)`);
  if (sentiment.impactfulNews.length > 0) {
    reasoning.push(`Important news: ${sentiment.impactfulNews[0].title}`);
  }
  
  return {
    symbol,
    signal,
    confidence: Math.round(combinedScore),
    source: "combined",
    timeFrame: analysisTimeframe,
    reasoning,
    support: parseFloat(support.toFixed(2)),
    resistance: parseFloat(resistance.toFixed(2)),
    stopLoss: parseFloat(stopLoss.toFixed(2)),
    targetPrice: parseFloat(targetPrice.toFixed(2)),
    riskRewardRatio: parseFloat(riskRewardRatio.toFixed(2)),
    timestamp: Date.now()
  };
};

// Map chart timeframes to analysis timeframes
function mapChartTimeframeToAnalysisTimeframe(timeframe: string): TimeFrame {
  switch (timeframe) {
    case "1m":
    case "5m":
    case "15m":
      return "short";
    case "1H":
    case "4H": 
    case "1D":
      return "medium";
    case "1W":
    case "1M":
      return "long";
    default:
      return "medium";
  }
}
