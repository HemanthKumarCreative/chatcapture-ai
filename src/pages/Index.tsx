import { useEffect, useState } from "react";
import { VideoRecorder } from "@/components/VideoRecorder";
import { Chat } from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useVideoRecording } from "@/hooks/useVideoRecording";

const Index = () => {
  const [hasConsent, setHasConsent] = useState(false);
  const [showConsent, setShowConsent] = useState(true);
  const { startRecording } = useVideoRecording();

  const handleConsent = () => {
    setHasConsent(true);
    setShowConsent(false);
    startRecording();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Dialog open={showConsent} onOpenChange={setShowConsent}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Welcome to AI Interview</DialogTitle>
            <DialogDescription className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              This application will record video and audio during your interview session. 
              The recording will start automatically after you give consent and will stop when you close the browser. 
              The recording will be used only for interview purposes and stored securely. 
              By clicking "I Agree", you consent to being recorded during this session.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button onClick={handleConsent} className="w-full sm:w-auto">
              I Agree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {hasConsent && (
        <div className="h-screen">
          {/* Hidden video recorder for background recording */}
          <div className="hidden">
            <VideoRecorder />
          </div>
          
          {/* Full screen chat */}
          <div className="h-full p-4">
            <div className="h-full flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Interviewer</h2>
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <Chat />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;