
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import ApiKeyInput from '@/components/ApiKeyInput';
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  // When the API key is submitted, update global variable
  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    // Update the global API_KEY variable in the window object
    (window as any).ALPHA_VANTAGE_API_KEY = key;
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
