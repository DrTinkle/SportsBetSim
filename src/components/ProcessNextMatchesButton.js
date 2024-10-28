// ProcessNextMatchesButton.js
import React, { useState } from 'react';
import LoadingOverlay from './LoadingOverlay';

const ProcessNextMatchesButton = ({ onProcessed }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const doneDisplayTime = 3000; // Display "Done" for 2 seconds

  const handleClick = async () => {
    setLoading(true);
    setMessage('');
    setProgress(0);

    // Simulate a progress timer with increments every 100 ms
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + 10;
        return nextProgress >= 100 ? 100 : nextProgress;
      });
    }, 200);

    try {
      const response = await fetch('/api/processNextMatches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        onProcessed();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }

    // Clear the interval when progress completes or fetch finishes
    setTimeout(() => {
      clearInterval(progressInterval);
      setLoading(false);
      setTimeout(() => setMessage(''), doneDisplayTime); // Hide "Done" message after display time
    }, doneDisplayTime);
  };

  return (
    <div className="process-next-matches-container">
      <button onClick={handleClick} disabled={loading} className="process-next-matches-button">
        {loading ? 'Processing...' : 'Next Day'}
      </button>
      {message && <p>{message}</p>}
      {loading && <LoadingOverlay progress={progress} />} {/* Pass progress to LoadingOverlay */}
    </div>
  );
};

export default ProcessNextMatchesButton;
