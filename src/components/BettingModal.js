import React, { useEffect, useState } from 'react';
import './BettingModal.css';

const BettingModal = ({ isOpen, onClose, children, refreshBalanceTrigger }) => {
  const [bankBalance, setBankBalance] = useState(0);

  const fetchBankBalance = () => {
    fetch('/api/bank')
      .then((response) => response.json())
      .then((data) => setBankBalance(data.balance))
      .catch((error) => console.error('Error fetching bank balance:', error));
  };

  useEffect(() => {
    if (isOpen) {
      fetchBankBalance();
    }
  }, [isOpen]);

  useEffect(() => {
    fetchBankBalance();
  }, [refreshBalanceTrigger]);

  if (!isOpen) return null;

  return (
    <div className="betting-modal-overlay">
      <div className="betting-modal">
        <button className="betting-modal-close-button" onClick={onClose}>
          X
        </button>
        <div className="betting-modal-content">{children}</div>
        <div className="betting-modal-account-balance">
          <strong>Account Balance: ${bankBalance.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
};

export default BettingModal;
