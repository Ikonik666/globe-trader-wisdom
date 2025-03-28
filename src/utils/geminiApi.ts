
import { AnalysisResult } from './analysis';
import { CandleData, FundamentalData } from './marketData';
import { toast } from "@/components/ui/use-toast";

interface GeminiApiRequest {
  symbol: string;
  timeframe: string;
  candles: CandleData[];
  fundamentalData: FundamentalData;
  marketType: string;
}

export async function getGeminiAnalysis(
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
      description: "Please provide a Gemini API key for AI analysis",
      variant: "destructive",
    });
    return null;
  }

  try {
    // Prepare the data for Gemini API
    const requestData: GeminiApiRequest = {
      symbol,
      timeframe,
      candles: candles.slice(-30), // Send only the most recent 30 candles to keep request size reasonable
      fundamentalData,
      marketType,
    };

    // Call the Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a professional market analyst specialized in technical and fundamental analysis. 
                     You follow Smart Money Concepts (SMC) and Institutional Concepts (ICT).
                     Analyze the market data provided and give a comprehensive analysis in JSON format with the following structure:
                     {
                       "analysis": {
                         "summary": "Brief summary of analysis",
                         "technical_analysis": "Technical analysis details",
                         "fundamental_analysis": "Fundamental analysis details",
                         "smc_ict_analysis": "SMC/ICT analysis",
                         "signal": "strong_buy, buy, neutral, sell or strong_sell",
                         "confidence": number between 0-100,
                         "support": number,
                         "resistance": number,
                         "stopLoss": number,
                         "targetPrice": number,
                         "riskRewardRatio": number
                       }
                     }
                     
                     Analyze this ${marketType} market data for ${symbol} on ${timeframe} timeframe: 
                     ${JSON.stringify(requestData)}
                     
                     Respond ONLY with the JSON object, nothing else.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Parse the AI response
    const text = data.candidates[0].content.parts[0].text;
    // Extract JSON from the response text (it might be wrapped in code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON response from Gemini API");
    }
    
    const aiResponse = JSON.parse(jsonMatch[0]);
    
    // Map the Gemini response to our AnalysisResult format
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
    console.error("Error with Gemini API:", error);
    toast({
      title: "AI Analysis Failed",
      description: error instanceof Error ? error.message : "Could not connect to Gemini API",
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
