
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

// Timeframes used in ICT/SMC analysis
const ictTimeframes = ["M15", "H1", "H4", "D1", "W1"];

// Analyze technical patterns including ICT concepts
export const analyzeTechnicalPatterns = (
  symbol: string,
  candles: CandleData[]
): PatternDetection[] => {
  if (!candles || candles.length === 0) {
    return [];
  }
  
  // This would normally use sophisticated algorithms to detect ICT/SMC patterns
  // For demo, returning mock pattern detections
  
  const lastCandle = candles[candles.length - 1];
  const mockPatterns: PatternDetection[] = [];
  
  // Determine if the general trend is bullish or bearish
  const isBullishTrend = lastCandle.close > lastCandle.open;
  
  // Select appropriate patterns based on trend
  const patterns = isBullishTrend ? bullishSMCPatterns : bearishSMCPatterns;
  
  // Generate 2-4 patterns (more realistic)
  const numPatterns = 2 + Math.floor(Math.random() * 3);
  
  // Create a shuffle to randomize the pattern selection
  const shuffledPatterns = [...patterns].sort(() => Math.random() - 0.5);
  const selectedPatterns = shuffledPatterns.slice(0, numPatterns);
  
  // Create patterns with various confidence levels
  selectedPatterns.forEach((patternName) => {
    const timeframe = ictTimeframes[Math.floor(Math.random() * ictTimeframes.length)];
    
    mockPatterns.push({
      name: patternName,
      timeframe: timeframe,
      confidence: 65 + Math.floor(Math.random() * 25), // 65-90% confidence
      bullish: isBullishTrend,
      description: smcDescriptions[patternName as keyof typeof smcDescriptions] || 
                 "ICT/SMC pattern detected based on institutional order flow."
    });
  });
  
  // Add one opposite pattern for realism (e.g., a bearish pattern in bullish trend)
  const oppositePatterns = isBullishTrend ? bearishSMCPatterns : bullishSMCPatterns;
  const oppositePattern = oppositePatterns[Math.floor(Math.random() * oppositePatterns.length)];
  
  mockPatterns.push({
    name: oppositePattern,
    timeframe: ictTimeframes[Math.floor(Math.random() * ictTimeframes.length)],
    confidence: 50 + Math.floor(Math.random() * 20), // Less confident (50-70%)
    bullish: !isBullishTrend,
    description: smcDescriptions[oppositePattern as keyof typeof smcDescriptions] || 
               "Conflicting pattern detected, suggesting caution."
  });
  
  // Sort by confidence (highest first)
  return mockPatterns.sort((a, b) => b.confidence - a.confidence);
};

// Analyze market sentiment from news
export const analyzeSentiment = (news: NewsItem[]): {
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  impactfulNews: NewsItem[];
} => {
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
    highlights: highlights.slice(0, 3) // Return top 3 highlights
  };
};

// Generate trading signals by combining technical, fundamental and sentiment analysis
export const generateSignal = (
  symbol: string,
  marketData: MarketData,
  candles: CandleData[],
  fundData: FundamentalData,
  news: NewsItem[]
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

  const technicalPatterns = analyzeTechnicalPatterns(symbol, candles);
  const sentiment = analyzeSentiment(news);
  const fundamentals = analyzeFundamentals(fundData);
  
  // Calculate weighted scores
  const technicalScore = technicalPatterns.reduce(
    (sum, pattern) => sum + (pattern.bullish ? pattern.confidence : -pattern.confidence),
    0
  ) / (technicalPatterns.length * 100) * 100;
  
  // Weight the different analysis components
  const technicalWeight = 0.5;
  const fundamentalWeight = 0.3;
  const sentimentWeight = 0.2;
  
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
  
  // Calculate support and resistance
  const prices = candles.map(c => c.close);
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const range = max - min;
  
  const currentPrice = marketData.price;
  const support = currentPrice - (range * 0.1);
  const resistance = currentPrice + (range * 0.15);
  
  // Calculate stop loss and target using ICT concepts
  const stopLoss = signal === "strong_buy" || signal === "buy" 
    ? currentPrice - (range * 0.07) // Just below the discount zone
    : currentPrice + (range * 0.07); // Just above the premium zone
    
  const targetPrice = signal === "strong_buy" || signal === "buy"
    ? currentPrice + (range * 0.21) // Optimal profit taking zone
    : currentPrice - (range * 0.21);
  
  // Calculate risk/reward ratio
  const risk = Math.abs(currentPrice - stopLoss);
  const reward = Math.abs(targetPrice - currentPrice);
  const riskRewardRatio = reward / risk;
  
  // Generate reasoning with ICT/SMC terminology
  const reasoning: string[] = [];
  
  // Add technical reasoning with SMC focus
  const bullishPatterns = technicalPatterns.filter(p => p.bullish);
  const bearishPatterns = technicalPatterns.filter(p => !p.bullish);
  
  if (bullishPatterns.length > 0) {
    reasoning.push(`SMC analysis shows ${bullishPatterns.length} bullish patterns including ${bullishPatterns[0]?.name} on ${bullishPatterns[0]?.timeframe} timeframe`);
    if (bullishPatterns[0]) {
      reasoning.push(bullishPatterns[0].description);
    }
  }
  
  if (bearishPatterns.length > 0) {
    reasoning.push(`SMC analysis shows ${bearishPatterns.length} bearish patterns including ${bearishPatterns[0]?.name} on ${bearishPatterns[0]?.timeframe} timeframe`);
    if (signal === "sell" || signal === "strong_sell") {
      if (bearishPatterns[0]) {
        reasoning.push(bearishPatterns[0].description);
      }
    }
  }
  
  // Add market structure analysis
  reasoning.push(`Market structure shows ${signal.includes('buy') ? 'bullish' : signal.includes('sell') ? 'bearish' : 'neutral'} bias with ${signal.includes('strong') ? 'strong' : 'moderate'} confirmation`);
  
  // Add fundamental reasoning
  reasoning.push(`Fundamental outlook is ${fundamentals.outlook} (${Math.round(fundamentals.score)}/100)`);
  if (fundamentals.highlights.length > 0) {
    reasoning.push(fundamentals.highlights[0]);
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
    timeFrame: "medium",
    reasoning,
    support: parseFloat(support.toFixed(2)),
    resistance: parseFloat(resistance.toFixed(2)),
    stopLoss: parseFloat(stopLoss.toFixed(2)),
    targetPrice: parseFloat(targetPrice.toFixed(2)),
    riskRewardRatio: parseFloat(riskRewardRatio.toFixed(2)),
    timestamp: Date.now()
  };
};
