import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useApiKeys = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>("");
  const [elevenLabsKey, setElevenLabsKey] = useState<string>("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("openai_api_key");
    const storedElevenLabsKey = localStorage.getItem("elevenlabs_api_key");
    
    if (storedApiKey && storedElevenLabsKey) {
      setApiKey(storedApiKey);
      setElevenLabsKey(storedElevenLabsKey);
    } else {
      setShowApiKeyDialog(true);
    }
  }, []);

  const saveApiKeys = (openaiKey: string, elevenLabsApiKey: string) => {
    if (openaiKey && elevenLabsApiKey) {
      localStorage.setItem("openai_api_key", openaiKey);
      localStorage.setItem("elevenlabs_api_key", elevenLabsApiKey);
      setApiKey(openaiKey);
      setElevenLabsKey(elevenLabsApiKey);
      setShowApiKeyDialog(false);
      toast({
        title: "Success",
        description: "API keys have been saved successfully.",
      });
    }
  };

  return {
    apiKey,
    elevenLabsKey,
    showApiKeyDialog,
    setShowApiKeyDialog,
    saveApiKeys,
  };
};