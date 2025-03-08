import { useRef, useState } from "react";

type AudioRecorderReturn = {
  isRecording: boolean;
  start: () => Promise<void>;
  stop: () => void;
  getRecording: () => Blob | null;
};

export default function useAudioRecorder(): AudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);

  // List available microphone devices
  const getAvailableMicrophones = async (): Promise<MediaDeviceInfo[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const microphones = devices.filter((device) => device.kind === "audioinput");

      console.log("Available microphones:", microphones.map((mic) => mic.label || "Unknown Microphone"));

      if (microphones.length === 0) {
        console.error("No microphone devices found.");
        return [];
      }
      return microphones;
    } catch (error) {
      console.error("Error listing microphone devices:", error);
      return [];
    }
  };

  const start = async () => {
    if (isRecording) {
      console.warn("Recording is already in progress.");
      return;
    }

    const microphones = await getAvailableMicrophones();
    if (microphones.length === 0) {
      console.error("Cannot start recording: No microphones available.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        audioBlobRef.current = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = []; // Reset for next recording
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting audio recording:", error);
    }
  };

  const stop = () => {
    if (!isRecording || !mediaRecorderRef.current) {
      console.warn("No active recording to stop.");
      return;
    }

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop()); // Release microphone
    mediaRecorderRef.current = null;
    setIsRecording(false);
  };

  const getRecording = () => audioBlobRef.current;

  return { isRecording, start, stop, getRecording };
}
