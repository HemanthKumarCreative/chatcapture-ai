import { useEffect, useRef } from "react";
import { useVideoRecording } from "@/hooks/useVideoRecording";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export const VideoRecorder = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isRecording, stream, error } = useVideoRecording();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full aspect-video object-cover bg-gray-900"
        />
        {isRecording && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full animate-recording-pulse shadow-lg"
          >
            <div className="w-2 h-2 bg-white rounded-full" />
            Recording
          </motion.div>
        )}
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700">
        {error && (
          <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
        )}
      </div>
    </Card>
  );
};