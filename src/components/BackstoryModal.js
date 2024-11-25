import React from 'react';
import './BackstoryModal.css';

const BackstoryModal = ({ onClose }) => {
  return (
    <div className="backstory-modal-overlay">
      <div className="backstory-modal-content">
        <h2>The Gamble of a Lifetime</h2>
        <strong>Welcome to SportsBetSim.</strong>
        <p>
          In this game, you’ll experience the high-stakes world of sports betting, where every
          decision could mean the difference between fortune and ruin. Think fast, bet smart, and
          above all—survive.
        </p>
        <p>
          You’ve always lived on the edge, scraping by month to month. But this time, you’ve hit
          rock bottom. Rent is overdue, and eviction notices are piling up. Desperate and out of
          options, you turn to a loan shark for quick cash—a decision you’ll soon regret.
        </p>
        <p>
          The deal seemed simple: a $2,000 loan to cover your rent, with just a small repayment
          every week. What you didn’t know is that the loan shark works for the mafia, and their
          terms are anything but fair. Miss a payment, and you won’t just lose your apartment—you
          could lose your life.
        </p>
        <p>
          Now, you’re in deeper than you ever imagined. The rent is still due every week, and the
          mafia’s interest is climbing. With no way to earn honest money fast enough, you turn to
          the only thing you know—sports betting.
        </p>
        <p>
          Win big, and you might escape this nightmare. Lose, and the consequences don’t bear
          thinking about.
        </p>
        <p>
          This is your gamble of a lifetime. Will you play it safe and survive, or risk it all to
          break free?
        </p>
        <button className="backstory-close-button" onClick={onClose}>
          Start Game
        </button>
      </div>
    </div>
  );
};

export default BackstoryModal;
