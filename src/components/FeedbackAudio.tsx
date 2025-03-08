import React from 'react';

interface FeedbackAudioProps {
  audioUrl: string | null;
}

const FeedbackAudio: React.FC<FeedbackAudioProps> = ({ audioUrl }) => {
  if (!audioUrl) return null;

  return (
    <div className="max-w-md mx-auto mt-4 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">API Response Audio</h2>
      <audio controls className="w-full">
        <source src={audioUrl} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default FeedbackAudio;
