import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import ApiKeyInput from '@/components/ApiKeyInput';
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [alphaVantageApiKey, setAlphaVantageApiKey] = useState<string | null>(null);
  const [tradermadeApiKey, setTradermadeApiKey] = useState<string | null>(null);
  const [deepseekApiKey, setDeepseekApiKey] = useState<string | null>(null);
  const [currentApiService, setCurrentApiService] = useState<string>("tradermade");
  
  const handleAlphaVantageApiKeySubmit = (key: string) => {
    setAlphaVantageApiKey(key);
    // Update the global API_KEY variable in the window object
    (window as any).ALPHA_VANTAGE_API_KEY = key;
    localStorage.setItem('alphaVantageApiKey', key);
    window.location.reload(); // Reload to apply new API key
  };
  
  const handleTradermadeApiKeySubmit = (key: string) => {
    setTradermadeApiKey(key);
    // Update the global API_KEY variable in the window object
    (window as any).TRADERMADE_API_KEY = key;
    localStorage.setItem('tradermadeApiKey', key);
    window.location.reload(); // Reload to apply new API key
  };
  
  const handleDeepseekApiKeySubmit = (key: string) => {
    setDeepseekApiKey(key);
    // Update the global API_KEY variable in the window object
    (window as any).DEEPSEEK_API_KEY = key;
    localStorage.setItem('deepseekApiKey', key);
    toast({
      title: "Deepseek API Key Saved",
      description: "Your Deepseek API key has been saved for AI analysis"
    });
  };
  
  const handleApiServiceChange = (value: string) => {
    setCurrentApiService(value);
    localStorage.setItem('currentApiService', value);
    window.location.reload(); // Reload to apply new API service
  };
  
  useEffect(() => {
    // Initialize from localStorage on component mount
    const storedAlphaVantageApiKey = localStorage.getItem('alphaVantageApiKey');
    if (storedAlphaVantageApiKey) {
      setAlphaVantageApiKey(storedAlphaVantageApiKey);
      (window as any).ALPHA_VANTAGE_API_KEY = storedAlphaVantageApiKey;
    }
    
    const storedTradermadeApiKey = localStorage.getItem('tradermadeApiKey');
    if (storedTradermadeApiKey) {
      setTradermadeApiKey(storedTradermadeApiKey);
      (window as any).TRADERMADE_API_KEY = storedTradermadeApiKey;
    } else {
      // Set default Tradermade API key if not in localStorage
      setTradermadeApiKey("cRoPhAnRp4zUx-7pPW7j");
      (window as any).TRADERMADE_API_KEY = "cRoPhAnRp4zUx-7pPW7j";
      localStorage.setItem('tradermadeApiKey', "cRoPhAnRp4zUx-7pPW7j");
    }
    
    const storedDeepseekApiKey = localStorage.getItem('deepseekApiKey');
    if (storedDeepseekApiKey) {
      setDeepseekApiKey(storedDeepseekApiKey);
      (window as any).DEEPSEEK_API_KEY = storedDeepseekApiKey;
    } else {
      // Set default Deepseek API key
      setDeepseekApiKey("sk-2f6e58af385d4ca3919269b02b890a34");
      (window as any).DEEPSEEK_API_KEY = "sk-2f6e58af385d4ca3919269b02b890a34";
      localStorage.setItem('deepseekApiKey', "sk-2f6e58af385d4ca3919269b02b890a34");
    }
    
    // Check which API service to use
    const storedApiService = localStorage.getItem('currentApiService');
    if (storedApiService) {
      setCurrentApiService(storedApiService);
    } else {
      // Default to Tradermade
      localStorage.setItem('currentApiService', "tradermade");
    }
  }, []);
  
  const currentApiKey = currentApiService === "tradermade" ? tradermadeApiKey : alphaVantageApiKey;
  
  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <Tabs value={currentApiService} onValueChange={handleApiServiceChange} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="tradermade">TraderMade API</TabsTrigger>
              <TabsTrigger value="alphavantage">Alpha Vantage API</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex justify-end mt-2 sm:mt-0 space-x-2">
            {currentApiService === "tradermade" ? (
              <ApiKeyInput 
                onApiKeySubmit={handleTradermadeApiKeySubmit} 
                apiKeyLabel="TraderMade API Key"
                initialValue={tradermadeApiKey || ""}
              />
            ) : (
              <ApiKeyInput 
                onApiKeySubmit={handleAlphaVantageApiKeySubmit} 
                apiKeyLabel="Alpha Vantage API Key"
                initialValue={alphaVantageApiKey || ""}
              />
            )}
            
            <ApiKeyInput 
              onApiKeySubmit={handleDeepseekApiKeySubmit}
              apiKeyLabel="Deepseek AI API Key"
              initialValue={deepseekApiKey || ""}
            />
          </div>
        </div>
        
        {!currentApiKey && (
          <Alert className="mb-4">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>API Key Required</AlertTitle>
            <AlertDescription>
              {currentApiService === "tradermade" ? (
                <>
                  Please enter your TraderMade API key to access live market data. A default key is provided but may be limited.
                  You can get a free API key at <a href="https://tradermade.com/signup" className="underline" target="_blank" rel="noopener noreferrer">tradermade.com</a>
                </>
              ) : (
                <>
                  Please enter your Alpha Vantage API key to access live market data. Free tier is limited to 25 API calls per day.
                  You can get a free API key at <a href="https://www.alphavantage.co/support/#api-key" className="underline" target="_blank" rel="noopener noreferrer">alphavantage.co</a>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <Dashboard apiService={currentApiService} deepseekApiKey={deepseekApiKey} />
      </div>
      <Toaster />
    </Layout>
  );
};

export default Index;
