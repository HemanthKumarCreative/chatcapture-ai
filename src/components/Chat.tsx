import { useState, useEffect, useRef } from "react";
import { Message } from "@/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import OpenAI from "openai";
import { format } from "date-fns";
import { useConversation } from "@11labs/react";

const SYSTEM_PROMPT = `You are an AI interviewer conducting a professional job interview. 
Your responses should be concise, professional, and focused on gathering relevant information 
about the candidate's experience, skills, and qualifications. Start with a friendly introduction 
and then proceed with appropriate interview questions based on their responses.`;

export const Chat = () => {
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const conversation = useConversation({
    overrides: {
      tts: {
        voiceId: "Charlie", // Using Charlie's voice for the interviewer
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

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

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

      // Play the AI response using ElevenLabs
      if (!isMuted) {
        await conversation.startSession({
          agentId: "default", // Replace with your actual agent ID
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

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-12"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mr-12"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="break-words">{message.content}</div>
                    <div 
                      className={`text-xs ${
                        message.role === "user" 
                          ? "text-primary-foreground/80" 
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {format(message.timestamp, 'HH:mm')}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-sm flex items-center space-x-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto flex justify-center gap-4">
          <Button
            onClick={toggleMute}
            variant="outline"
            size="icon"
            className="rounded-full"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button
            onClick={startListening}
            disabled={isLoading || isListening}
            className={`px-8 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 mr-2" />
            ) : (
              <Mic className="w-4 h-4 mr-2" />
            )}
            {isListening ? 'Listening...' : 'Speak'}
          </Button>
        </div>
      </div>
    </div>
  );
};