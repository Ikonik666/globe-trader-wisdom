
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NewsItem } from '@/utils/marketData';
import { Newspaper, Clock, ExternalLink, TrendingUp, TrendingDown, BarChart } from 'lucide-react';

interface NewsCardProps {
  news: NewsItem[];
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const getSentimentIcon = (sentiment: NewsItem["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="w-4 h-4" />;
      case "negative":
        return <TrendingDown className="w-4 h-4" />;
      case "neutral":
        return <BarChart className="w-4 h-4" />;
    }
  };

  const getSentimentClass = (sentiment: NewsItem["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return "text-success bg-success/10";
      case "negative":
        return "text-danger bg-danger/10";
      case "neutral":
        return "text-neutral bg-neutral/10";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes}m ago`;
    } else if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours}h ago`;
    } else {
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className="glass transition-all duration-300 hover:shadow-lg animate-slide-up overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Newspaper className="w-5 h-5 mr-2" /> 
          Market News
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {news.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Separator />}
              <div className="p-4 transition-all hover:bg-muted/20">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{item.title}</h3>
                  <Badge className={`ml-2 shrink-0 ${getSentimentClass(item.sentiment)}`}>
                    {getSentimentIcon(item.sentiment)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.summary}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{formatTimestamp(item.timestamp)}</span>
                    <span className="mx-2">•</span>
                    <span>{item.source}</span>
                  </div>
                  <a 
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-primary transition-colors"
                  >
                    <span className="mr-1">Read</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
