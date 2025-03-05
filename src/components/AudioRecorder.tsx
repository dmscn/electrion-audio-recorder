import useAudioRecorder from 'Hooks/useAudioRecorder';
import React from 'react';

const AudioRecorderComponent: React.FC = () => {
  const { recording, audioUrl, startRecording, stopRecording } = useAudioRecorder();

  const handleRecordClick = () => {
    if (!recording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={handleRecordClick}
        className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
      >
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {audioUrl && (
        <div className="mt-4">
          <audio controls src={audioUrl} />
        </div>
      )}
    </div>
  );
};

export default AudioRecorderComponent;
