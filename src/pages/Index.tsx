
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import ApiKeyInput from '@/components/ApiKeyInput';
import { Toaster } from "@/components/ui/toaster";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  // When the API key is submitted, update global variable
  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    // Update the global API_KEY variable in the window object
    (window as any).ALPHA_VANTAGE_API_KEY = key;
    localStorage.setItem('alphaVantageApiKey', key);
    window.location.reload(); // Reload to apply new API key
  };
  
  useEffect(() => {
    // Initialize from localStorage on component mount
    const storedApiKey = localStorage.getItem('alphaVantageApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      (window as any).ALPHA_VANTAGE_API_KEY = storedApiKey;
    }
  }, []);
  
  return (
    <Layout>
      <div className="container mx-auto px-4">
        {!apiKey && (
          <Alert className="mb-4">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>API Key Required</AlertTitle>
            <AlertDescription>
              Please enter your Alpha Vantage API key to access live market data. Free tier is limited to 25 API calls per day.
              You can get a free API key at <a href="https://www.alphavantage.co/support/#api-key" className="underline" target="_blank" rel="noopener noreferrer">alphavantage.co</a>
            </AlertDescription>
          </Alert>
        )}
        <div className="flex justify-end mb-2">
          <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
        </div>
        <Dashboard />
      </div>
      <Toaster />
    </Layout>
  );
};

export default Index;
