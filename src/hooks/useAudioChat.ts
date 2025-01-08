import { useState, useEffect } from "react";
import { Message } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import OpenAI from "openai";
import { useConversation } from "@11labs/react";

const SYSTEM_PROMPT = `You are a friendly and engaging AI assistant having a natural conversation. 
Keep your responses conversational, warm, and relatable while maintaining professionalism. 
Use a natural speaking style with appropriate pauses and intonation. Feel free to ask follow-up 
questions to keep the conversation flowing naturally.`;

export const useAudioChat = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>("");
  const [elevenLabsKey, setElevenLabsKey] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi there! I'm your AI assistant. How can I help you today?",
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
        voiceId: "Charlie", // Using a natural-sounding voice
      },
    },
  });

  useEffect(() => {
    const initializeKeys = async () => {
      try {
        const storedApiKey = localStorage.getItem("openai_api_key");
        const storedElevenLabsKey = localStorage.getItem("elevenlabs_api_key");
        
        if (storedApiKey && storedElevenLabsKey) {
          setApiKey(storedApiKey);
          setElevenLabsKey(storedElevenLabsKey);
          await initializeConversation(storedElevenLabsKey);
        } else {
          toast({
            title: "Welcome!",
            description: "Please provide your API keys to start the conversation.",
          });
          const userApiKey = prompt("Please enter your OpenAI API key:");
          const userElevenLabsKey = prompt("Please enter your ElevenLabs API key:");
          if (userApiKey && userElevenLabsKey) {
            localStorage.setItem("openai_api_key", userApiKey);
            localStorage.setItem("elevenlabs_api_key", userElevenLabsKey);
            setApiKey(userApiKey);
            setElevenLabsKey(userElevenLabsKey);
            await initializeConversation(userElevenLabsKey);
          }
        }
      } catch (error) {
        console.error("Error initializing:", error);
        toast({
          title: "Error",
          description: "Failed to initialize the conversation. Please try again.",
          variant: "destructive",
        });
      }
    };

    initializeKeys();
  }, []);

  const initializeConversation = async (elevenLabsKey: string) => {
    try {
      await conversation.startSession({
        agentId: "default",
      });
      conversation.setVolume({ volume: 0.8 });
    } catch (error) {
      console.error("Error initializing conversation:", error);
      toast({
        title: "Error",
        description: "Failed to initialize voice chat. Please check your ElevenLabs API key.",
        variant: "destructive",
      });
    }
  };

  const handleSpeechInput = async (transcript: string) => {
    if (!transcript.trim()) return;
    if (!apiKey || !elevenLabsKey) {
      toast({
        title: "Error",
        description: "API keys are required to continue the conversation.",
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
        temperature: 0.8, // Slightly higher for more natural responses
        max_tokens: 500,
      });

      const aiResponse = response.choices[0]?.message?.content || 
        "I apologize, but I couldn't generate a response. Could you please try rephrasing that?";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: "assistant",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (!isMuted) {
        try {
          // Use ElevenLabs to speak the response
          await conversation.speak(aiResponse);
        } catch (error) {
          console.error("Error with text-to-speech:", error);
          toast({
            title: "Voice Error",
            description: "Couldn't play the voice response. Text response is still available.",
            variant: "destructive",
          });
        }
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
        description: "Speech recognition is not supported in your browser. Please try using Chrome.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening",
        description: "I'm listening... Speak clearly into your microphone.",
      });
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
      toast({
        title: "Error",
        description: "There was an error with speech recognition. Please try again.",
        variant: "destructive",
      });
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