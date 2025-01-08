import { useEffect, useState } from "react";
import { VideoRecorder } from "@/components/VideoRecorder";
import { Chat } from "@/components/Chat";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useVideoRecording } from "@/hooks/useVideoRecording";
import { Video } from "lucide-react";

const Index = () => {
  const [hasConsent, setHasConsent] = useState(false);
  const [showConsent, setShowConsent] = useState(true);
  const { startRecording, isRecording, stream } = useVideoRecording();

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
            <DialogTitle className="text-2xl font-bold">
              Welcome to AI Interview
            </DialogTitle>
            <DialogDescription className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              This application will record video and audio during your interview
              session. The recording will start automatically after you give
              consent and will stop when you close the browser. The recording
              will be used only for interview purposes and stored securely. By
              clicking "I Agree", you consent to being recorded during this
              session.
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
        <div className="h-screen p-4">
          <div className="h-full grid grid-cols-2 gap-4">
            {/* Left side - AI Interviewer */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=interviewer"
                  alt="AI Interviewer"
                  className="w-64 h-64"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 to-transparent">
                <h2 className="text-white text-xl font-semibold mb-2">AI Interviewer</h2>
                <p className="text-gray-300 text-sm">Professional Interview Assistant</p>
              </div>
            </div>

            {/* Right side - User Video and Chat */}
            <div className="flex flex-col gap-4">
              {/* User video preview */}
              <div className="relative h-1/2 bg-gray-800 rounded-lg overflow-hidden">
                <video
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                  ref={(videoElement) => {
                    if (videoElement && stream) {
                      videoElement.srcObject = stream;
                    }
                  }}
                />
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/90 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-recording-pulse" />
                    <span className="text-white text-sm font-medium">Recording</span>
                  </div>
                )}
              </div>

              {/* Chat interface */}
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <Chat />
              </div>
            </div>
          </div>

          {/* Hidden video recorder for background recording */}
          <div className="hidden">
            <VideoRecorder />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;