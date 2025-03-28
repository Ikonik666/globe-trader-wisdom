import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChartCandlestick } from "lucide-react";
import { AnalysisResult } from "@/utils/analysis";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface AiAnalysisCardProps {
  onAnalyzeClick: () => void;
  loading: boolean;
  result: AnalysisResult | null;
  symbol: string;
}

const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({ 
  onAnalyzeClick, 
  loading, 
  result,
  symbol
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">
          Deepseek AI Analysis
          {result && (
            <Badge 
              variant={result.signal.includes('buy') ? "default" : 
                      result.signal.includes('sell') ? "destructive" : 
                      "outline"} 
              className="ml-2"
            >
              {result.signal.replace('_', ' ').toUpperCase()}
            </Badge>
          )}
        </CardTitle>
        <Button 
          size="sm" 
          variant="outline"
          onClick={onAnalyzeClick}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <ChartCandlestick className="h-4 w-4 mr-2" />
              Analyze {symbol}
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">{result.reasoning[0]}</p>
            
            <div className="mt-4 pt-2 border-t">
              <h4 className="text-sm font-semibold">Key Levels:</h4>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">Support:</span> ${result.support.toFixed(2)}
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Resistance:</span> ${result.resistance.toFixed(2)}
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Stop Loss:</span> ${result.stopLoss.toFixed(2)}
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Target:</span> ${result.targetPrice.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground">
              Confidence: {result.confidence}% • Risk/Reward: {result.riskRewardRatio.toFixed(2)}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <ChartCandlestick className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>Click "Analyze" to get AI-powered insights based on<br />Smart Money Concepts and Institutional analysis.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiAnalysisCard;
