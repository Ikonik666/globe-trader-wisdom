
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

// Analyze technical patterns including ICT concepts
export const analyzeTechnicalPatterns = (
  symbol: string,
  candles: CandleData[]
): PatternDetection[] => {
  // This would normally use sophisticated algorithms to detect ICT/SMC patterns
  // For demo, returning mock pattern detections
  
  const lastCandle = candles[candles.length - 1];
  const mockPatterns: PatternDetection[] = [];
  
  // Simulate some ICT/SMC pattern detections
  if (lastCandle.close > lastCandle.open) {
    mockPatterns.push({
      name: "Bullish Order Block",
      timeframe: "H4",
      confidence: 78,
      bullish: true,
      description: "Previous supply zone flipped to demand zone with strong momentum"
    });
    
    mockPatterns.push({
      name: "Fair Value Gap",
      timeframe: "H1",
      confidence: 85,
      bullish: true,
      description: "Price imbalance identified with institutional interest"
    });
  } else {
    mockPatterns.push({
      name: "Bearish Breaker Block",
      timeframe: "D1",
      confidence: 82,
      bullish: false,
      description: "Institutional price rejection at liquidity grab level"
    });
    
    mockPatterns.push({
      name: "Bearish Order Block",
      timeframe: "H4",
      confidence: 75,
      bullish: false,
      description: "Previous demand zone flipped to supply with strong momentum"
    });
  }
  
  // Add some randomness to make it more realistic
  if (Math.random() > 0.5) {
    mockPatterns.push({
      name: Math.random() > 0.5 ? "Liquidity Sweep" : "Inducement Sweep",
      timeframe: "M15",
      confidence: 65 + Math.floor(Math.random() * 20),
      bullish: Math.random() > 0.4,
      description: "Sweep of liquidity before expected reversal"
    });
  }
  
  return mockPatterns;
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
    const impact = item.sentiment === "positive" ? item.impactScore : 
                   item.sentiment === "negative" ? -item.impactScore : 0;
    sentimentScore += impact;
    
    if (item.impactScore >= 7) {
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
  if (fundamental.pe < 15) {
    score += 10;
    highlights.push("Attractively valued with low P/E ratio");
  } else if (fundamental.pe > 40) {
    score -= 10;
    highlights.push("Potentially overvalued with high P/E ratio");
  }
  
  // Growth analysis
  if (fundamental.revenueGrowth > 15) {
    score += 15;
    highlights.push("Strong revenue growth above market average");
  } else if (fundamental.revenueGrowth < 5) {
    score -= 10;
    highlights.push("Weak revenue growth below market average");
  }
  
  if (fundamental.profitGrowth > 20) {
    score += 15;
    highlights.push("Excellent profit growth demonstrates business efficiency");
  } else if (fundamental.profitGrowth < 0) {
    score -= 15;
    highlights.push("Declining profits indicate potential business challenges");
  }
  
  // Financial health
  const debtToAssets = fundamental.debt / fundamental.assets;
  if (debtToAssets < 0.2) {
    score += 10;
    highlights.push("Strong balance sheet with low debt relative to assets");
  } else if (debtToAssets > 0.5) {
    score -= 10;
    highlights.push("High debt levels may constrain future flexibility");
  }
  
  // Dividend
  if (fundamental.dividendYield > 3) {
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
  
  // Calculate stop loss and target
  const stopLoss = signal === "strong_buy" || signal === "buy" 
    ? currentPrice - (range * 0.07)
    : currentPrice + (range * 0.07);
    
  const targetPrice = signal === "strong_buy" || signal === "buy"
    ? currentPrice + (range * 0.21)
    : currentPrice - (range * 0.21);
  
  // Calculate risk/reward ratio
  const risk = Math.abs(currentPrice - stopLoss);
  const reward = Math.abs(targetPrice - currentPrice);
  const riskRewardRatio = reward / risk;
  
  // Generate reasoning
  const reasoning: string[] = [];
  
  // Add technical reasoning
  const bullishPatterns = technicalPatterns.filter(p => p.bullish);
  const bearishPatterns = technicalPatterns.filter(p => !p.bullish);
  
  if (bullishPatterns.length > bearishPatterns.length) {
    reasoning.push(`Technical analysis shows ${bullishPatterns.length} bullish patterns including ${bullishPatterns[0]?.name}`);
  } else if (bearishPatterns.length > 0) {
    reasoning.push(`Technical analysis shows ${bearishPatterns.length} bearish patterns including ${bearishPatterns[0]?.name}`);
  }
  
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
