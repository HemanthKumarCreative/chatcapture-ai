import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useAudioChat } from "@/hooks/useAudioChat";
import { MessageList } from "@/components/MessageList";
import { ApiKeyDialog } from "@/components/ApiKeyDialog";

export const Chat = () => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isListening,
    isMuted,
    isLoading,
    startListening,
    setIsMuted,
    showApiKeyDialog,
    setShowApiKeyDialog,
    saveApiKeys,
  } = useAudioChat();

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <MessageList messages={messages} isLoading={isLoading} />
      </ScrollArea>
      <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto flex justify-center gap-4">
          <Button
            onClick={toggleMute}
            variant="outline"
            size="icon"
            className="rounded-full"
            title={isMuted ? "Unmute" : "Mute"}
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

      <ApiKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
        onSave={saveApiKeys}
      />
    </div>
  );
};