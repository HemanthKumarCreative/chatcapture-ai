import { Message } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList = ({ messages, isLoading }: MessageListProps) => {
  return (
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
  );
};