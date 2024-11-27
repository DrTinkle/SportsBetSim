import React, { useState } from 'react';
import LoadingOverlay from './LoadingOverlay';

const ProcessNextMatchesButton = ({ onProcessed }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const doneDisplayTime = 3000;

  const handleClick = async () => {
    setLoading(true);
    setMessage('');
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + 10;
        return nextProgress >= 100 ? 100 : nextProgress;
      });
    }, 200);

    try {
      const nextMatchesResponse = await fetch('/api/processNextMatches', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const nextMatchesData = await nextMatchesResponse.json();
      if (!nextMatchesData.success) {
        throw new Error(nextMatchesData.error || 'Failed to process next matches');
      }

      const betsResponse = await fetch('/api/processBets', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const betsData = await betsResponse.json();
      if (!betsData.success) {
        throw new Error(betsData.error || 'Failed to process bets');
      }

      onProcessed();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }

    setTimeout(() => {
      clearInterval(progressInterval);
      setLoading(false);
      setTimeout(() => setMessage(''), doneDisplayTime);
    }, doneDisplayTime);
  };

  return (
    <div className="process-next-matches-container">
      <button onClick={handleClick} disabled={loading} className="process-next-matches-button">
        {loading ? 'Processing...' : 'Next Day'}
      </button>
      {message && <p>{message}</p>}
      {loading && <LoadingOverlay progress={progress} />}
    </div>
  );
};

export default ProcessNextMatchesButton;
