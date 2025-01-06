import { useState, useEffect, useRef } from "react";
import { Message } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import OpenAI from "openai";
import { format } from "date-fns";

const SYSTEM_PROMPT = `You are an AI interviewer conducting a professional job interview. 
Your responses should be concise, professional, and focused on gathering relevant information 
about the candidate's experience, skills, and qualifications. Start with a friendly introduction 
and then proceed with appropriate interview questions based on their responses.`;

export const Chat = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI interviewer. Could you please introduce yourself and tell me about your professional background?",
      role: "assistant",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("openai_api_key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      const userApiKey = prompt("Please enter your OpenAI API key:");
      if (userApiKey) {
        localStorage.setItem("openai_api_key", userApiKey);
        setApiKey(userApiKey);
      }
    }
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!apiKey) {
      toast({
        title: "Error",
        description: "OpenAI API key is required",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
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
          { role: "user", content: input }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.",
        role: "assistant",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setIsTyping(e.target.value.length > 0);
            }}
            placeholder="Type your response..."
            onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
            disabled={isLoading}
            className={`bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 ${
              isTyping ? 'border-primary ring-1 ring-primary' : ''
            }`}
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading}
            className="px-4 rounded-full"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};