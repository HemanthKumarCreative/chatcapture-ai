import { useEffect, useRef } from "react";
import { useVideoRecording } from "@/hooks/useVideoRecording";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, StopCircle } from "lucide-react";

export const VideoRecorder = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isRecording, stream, error, startRecording, stopRecording } = useVideoRecording();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <Card className="p-4">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded-lg bg-black"
        />
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full animate-recording-pulse">
            <div className="w-2 h-2 bg-white rounded-full" />
            Recording
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-center">
        {!isRecording ? (
          <Button onClick={startRecording} className="gap-2">
            <Video className="w-4 h-4" />
            Start Recording
          </Button>
        ) : (
          <Button onClick={stopRecording} variant="destructive" className="gap-2">
            <StopCircle className="w-4 h-4" />
            Stop Recording
          </Button>
        )}
      </div>
      {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
    </Card>
  );
};