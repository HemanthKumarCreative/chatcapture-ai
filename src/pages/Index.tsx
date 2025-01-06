import { useEffect, useState } from "react";
import { VideoRecorder } from "@/components/VideoRecorder";
import { Chat } from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const Index = () => {
  const [hasConsent, setHasConsent] = useState(false);
  const [showConsent, setShowConsent] = useState(true);

  const handleConsent = () => {
    setHasConsent(true);
    setShowConsent(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Dialog open={showConsent} onOpenChange={setShowConsent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to AI Interview</DialogTitle>
            <DialogDescription>
              This application will record video and audio during your interview session. 
              The recording will be used only for interview purposes and stored securely. 
              By clicking "I Agree", you consent to being recorded during this session.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleConsent}>I Agree</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {hasConsent && (
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Video Interview</h2>
              <VideoRecorder />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">AI Interviewer</h2>
              <div className="h-[600px] border rounded-lg overflow-hidden">
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