import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ElevenLabsVoiceServiceProvider } from "@11labs/react";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => {
  // Get ElevenLabs API key from localStorage
  const elevenLabsKey = localStorage.getItem("elevenlabs_api_key");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ElevenLabsVoiceServiceProvider apiKey={elevenLabsKey || ""}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
            </Routes>
          </BrowserRouter>
        </ElevenLabsVoiceServiceProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;