import React from 'react';
import './AccountModal.css';

const AccountModal = ({ isOpen, onClose, bankData }) => {
  if (!isOpen) return null;

  const { balance, loans, rentDue, daysRemaining } = bankData;

  return (
    <div className="account-modal">
      <div className="account-modal-content">
        <h2>Account Overview</h2>
        <p>
          <strong>Balance:</strong> ${balance.toFixed(2)}
        </p>
        <p>
          <strong>Rent Due:</strong> ${rentDue} in {daysRemaining} days
        </p>
        <h3>Loans</h3>
        {loans.length > 0 ? (
          <ul>
            {loans.map((loan, index) => (
              <li key={index}>
                <strong>Amount:</strong> ${loan.amount} -<strong> Daily Interest:</strong>{' '}
                {loan.interestRate}% -<strong> Days Remaining:</strong> {loan.daysRemaining}
              </li>
            ))}
          </ul>
        ) : (
          <p>No active loans</p>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AccountModal;
