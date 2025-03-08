import { useCallback, useState } from 'react';

const AUDIO_PROCESS_API_URL = 'http://127.0.0.1:8000';

interface ProcessAudioResult {
  processing: boolean;
  responseAudioUrl: string | null;
  error: string | null;
  processAudio: (audioBlob: Blob, model?: string, language?: string) => Promise<void>;
}

const useProcessAudio = (): ProcessAudioResult => {
  const [processing, setProcessing] = useState<boolean>(false);
  const [responseAudioUrl, setResponseAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processAudio = useCallback(
    async (
      audioBlob: Blob,
      model = 'llama3.1:8b',
      language = 'en-us'
    ) => {
      setProcessing(true);
      setError(null);

      try {
        // Create a FormData instance and append the necessary fields.
        const formData = new FormData();
        // We name the file "audio.wav" so that the backend uses the correct file suffix.
        formData.append('audio', audioBlob, 'audio.wav');
        formData.append('model', model);
        formData.append('language', language);

        // Send the POST request to the FastAPI endpoint.
        const response = await fetch(`${AUDIO_PROCESS_API_URL}/process_audio`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        // Retrieve the response audio file as a Blob.
        const responseBlob = await response.blob();
        // Create a URL for playback.
        const url = URL.createObjectURL(responseBlob);
        setResponseAudioUrl(url);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setProcessing(false);
      }
    },
    []
  );

  return { processing, responseAudioUrl, error, processAudio };
};

export default useProcessAudio;
