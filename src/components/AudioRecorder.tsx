import useAudioRecorder from 'Hooks/useAudioRecorder';
import useProcessAudio from 'Hooks/useProcessAudio';
import React from 'react';

const AudioRecorder: React.FC = () => {
  const { isRecording, start, stop, getRecording } = useAudioRecorder();
  const { processing, responseAudioUrl, error, processAudio } = useProcessAudio();

  const handleRecordClick = () => {
    if (!isRecording) {
      start();
    } else {
      stop();
    }
  };

  const handleProcessAudio = async () => {
    const audioBlob = getRecording();
    if (audioBlob) {
      await processAudio(audioBlob);
    } else {
      console.log("No audio recorded yet");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={handleRecordClick}
        className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {getRecording() && (
        <>
        <p>Your recorded audio</p>
        <div className="mt-4">
          <audio controls src={URL.createObjectURL(getRecording())} />
        </div>
        <button
          onClick={handleProcessAudio}
          className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          Process response
        </button>
        </>
      )}
      {processing && <p>Processing...</p>}
      {error && <p>Error: {error}</p>}
      {responseAudioUrl && (
        <>
          <p>Response:</p>
          <div className="mt-4">
            <audio controls src={responseAudioUrl} />
          </div>
       </>
      )}
      </div>
  );
};

export default AudioRecorder;
