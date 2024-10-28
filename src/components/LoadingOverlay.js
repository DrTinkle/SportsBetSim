// LoadingOverlay.js
import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = ({ progress }) => (
  <div className="loading-overlay">
    <div className="progress-bar">
      <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
    </div>
    <p className="overlay-message">{progress < 100 ? 'Processing Next Matchups...' : 'Done'}</p>
  </div>
);

export default LoadingOverlay;
