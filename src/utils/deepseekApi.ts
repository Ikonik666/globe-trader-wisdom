
import { AnalysisResult } from './analysis';
import { CandleData, FundamentalData } from './marketData';
import { toast } from "@/components/ui/use-toast";

interface DeepseekApiRequest {
  symbol: string;
  timeframe: string;
  candles: CandleData[];
  fundamentalData: FundamentalData;
  marketType: string;
}

interface DeepseekApiResponse {
  analysis: {
    summary: string;
    technical_analysis: string;
    fundamental_analysis: string;
    smc_ict_analysis: string;
    signal: string;
    confidence: number;
    support: number;
    resistance: number;
    stopLoss: number;
    targetPrice: number;
    riskRewardRatio: number;
  };
}

export async function getDeepseekAnalysis(
  apiKey: string,
  symbol: string, 
  timeframe: string,
  candles: CandleData[],
  fundamentalData: FundamentalData,
  marketType: string
): Promise<AnalysisResult | null> {
  // Check if we have a valid API key
  if (!apiKey) {
    toast({
      title: "API Key Required",
      description: "Please provide a Deepseek API key for AI analysis",
      variant: "destructive",
    });
    return null;
  }

  try {
    // Prepare the data for Deepseek API
    const requestData: DeepseekApiRequest = {
      symbol,
      timeframe,
      candles: candles.slice(-30), // Send only the most recent 30 candles to keep request size reasonable
      fundamentalData,
      marketType,
    };

    // Call the Deepseek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are a professional market analyst specialized in technical and fundamental analysis. 
                     You follow Smart Money Concepts (SMC) and Institutional Concepts (ICT).
                     Analyze the market data provided and give a comprehensive analysis.`
          },
          {
            role: "user",
            content: `Analyze this ${marketType} market data for ${symbol} on ${timeframe} timeframe: 
                     ${JSON.stringify(requestData)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Deepseek API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Parse the AI response
    const aiResponse = JSON.parse(data.choices[0].message.content) as DeepseekApiResponse;
    
    // Map the Deepseek response to our AnalysisResult format
    const analysisResult: AnalysisResult = {
      symbol,
      signal: mapSignalType(aiResponse.analysis.signal),
      confidence: aiResponse.analysis.confidence,
      source: "combined",
      timeFrame: mapTimeFrame(timeframe),
      reasoning: [
        aiResponse.analysis.summary,
        `Technical: ${aiResponse.analysis.technical_analysis}`,
        `Fundamental: ${aiResponse.analysis.fundamental_analysis}`,
        `SMC/ICT: ${aiResponse.analysis.smc_ict_analysis}`
      ],
      support: aiResponse.analysis.support,
      resistance: aiResponse.analysis.resistance,
      stopLoss: aiResponse.analysis.stopLoss,
      targetPrice: aiResponse.analysis.targetPrice,
      riskRewardRatio: aiResponse.analysis.riskRewardRatio,
      timestamp: Date.now()
    };
    
    return analysisResult;
  } catch (error) {
    console.error("Error with Deepseek API:", error);
    toast({
      title: "AI Analysis Failed",
      description: error instanceof Error ? error.message : "Could not connect to Deepseek API",
      variant: "destructive",
    });
    return null;
  }
}

// Helper function to map signal string to our defined types
function mapSignalType(signal: string): "strong_buy" | "buy" | "neutral" | "sell" | "strong_sell" {
  signal = signal.toLowerCase();
  if (signal.includes("strong buy")) return "strong_buy";
  if (signal.includes("buy")) return "buy";
  if (signal.includes("strong sell")) return "strong_sell";
  if (signal.includes("sell")) return "sell";
  return "neutral";
}

// Map timeframe string to our defined types
function mapTimeFrame(timeframe: string): "short" | "medium" | "long" {
  if (["1m", "5m", "15m"].includes(timeframe)) return "short";
  if (["1H", "4H", "1D"].includes(timeframe)) return "medium";
  return "long";
}
