import { useState, useEffect } from "react";
import { Message } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import OpenAI from "openai";
import { useConversation } from "@11labs/react";

const SYSTEM_PROMPT = `You are an AI interviewer conducting a professional job interview. 
Your responses should be concise, professional, and focused on gathering relevant information 
about the candidate's experience, skills, and qualifications. Start with a friendly introduction 
and then proceed with appropriate interview questions based on their responses.`;

export const useAudioChat = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>("");
  const [elevenLabsKey, setElevenLabsKey] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI interviewer. Could you please introduce yourself and tell me about your professional background?",
      role: "assistant",
      timestamp: Date.now(),
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const conversation = useConversation({
    overrides: {
      tts: {
        voiceId: "Charlie",
      },
    },
  });

  useEffect(() => {
    const storedApiKey = localStorage.getItem("openai_api_key");
    const storedElevenLabsKey = localStorage.getItem("elevenlabs_api_key");
    
    if (storedApiKey && storedElevenLabsKey) {
      setApiKey(storedApiKey);
      setElevenLabsKey(storedElevenLabsKey);
    } else {
      const userApiKey = prompt("Please enter your OpenAI API key:");
      const userElevenLabsKey = prompt("Please enter your ElevenLabs API key:");
      if (userApiKey && userElevenLabsKey) {
        localStorage.setItem("openai_api_key", userApiKey);
        localStorage.setItem("elevenlabs_api_key", userElevenLabsKey);
        setApiKey(userApiKey);
        setElevenLabsKey(userElevenLabsKey);
      }
    }
  }, []);

  const handleSpeechInput = async (transcript: string) => {
    if (!transcript.trim()) return;
    if (!apiKey || !elevenLabsKey) {
      toast({
        title: "Error",
        description: "API keys are required",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: transcript,
      role: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
          })),
          { role: "user", content: transcript }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const aiResponse = response.choices[0]?.message?.content || 
        "I apologize, but I couldn't generate a response. Please try again.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: "assistant",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (!isMuted) {
        await conversation.startSession({
          agentId: "default",
        });
        conversation.setVolume({ volume: 0.8 });
      }

    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to process the conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Error",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join("");

      if (event.results[0].isFinal) {
        await handleSpeechInput(transcript);
        recognition.stop();
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return {
    messages,
    isListening,
    isMuted,
    isLoading,
    startListening,
    setIsMuted,
  };
};