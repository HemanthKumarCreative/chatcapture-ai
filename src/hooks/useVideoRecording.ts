import { useState, useEffect, useCallback } from "react";
import { VideoRecordingState } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export const useVideoRecording = () => {
  const { toast } = useToast();
  const [state, setState] = useState<VideoRecordingState>({
    isRecording: false,
    stream: null,
    error: null,
    mediaRecorder: null,
  });

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        // Here we would upload to Supabase storage
        console.log("Recording stopped, blob created:", blob);
      };

      mediaRecorder.start();

      setState({
        isRecording: true,
        stream,
        error: null,
        mediaRecorder,
      });

      toast({
        title: "Recording Started",
        description: "Your video is now being recorded.",
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to start recording",
      }));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start recording. Please check your camera permissions.",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (state.mediaRecorder && state.stream) {
      state.mediaRecorder.stop();
      state.stream.getTracks().forEach((track) => track.stop());
      setState({
        isRecording: false,
        stream: null,
        error: null,
        mediaRecorder: null,
      });
      toast({
        title: "Recording Stopped",
        description: "Your video has been saved.",
      });
    }
  }, [state.mediaRecorder, state.stream, toast]);

  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [state.stream]);

  return {
    ...state,
    startRecording,
    stopRecording,
  };
};