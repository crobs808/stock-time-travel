import { useState, useEffect } from 'react';
import '../styles/achievement-toaster.css';

export default function AchievementToaster({ achievement, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const achievementData = {
    first_trade: { emoji: '🎯', name: 'First Trade', desc: 'Made your first trade' },
    millionaire: { emoji: '💰', name: 'Millionaire', desc: 'Reached $1,000,000 portfolio' },
    time_traveler: { emoji: '⏰', name: 'Time Traveler', desc: 'Traveled through 10 years' },
    diversified: { emoji: '📊', name: 'Diversified', desc: 'Held 5+ different stocks' },
    long_term: { emoji: '📈', name: 'Long Term Investor', desc: 'Held a stock for 1+ year' },
    tax_savvy: { emoji: '📋', name: 'Tax Savvy', desc: 'Earned $10,000 in gains' },
    diamond_hands: { emoji: '💎', name: 'Diamond Hands', desc: 'Never sold a stock' },
    comeback_kid: { emoji: '🚀', name: 'Comeback Kid', desc: 'Recovered from losses' },
  };

  const data = achievementData[achievement] || { emoji: '🏆', name: 'Achievement', desc: 'Unlocked!' };

  return (
    <div className="achievement-toaster">
      <div className="toaster-content">
        <span className="toaster-emoji">{data.emoji}</span>
        <div className="toaster-text">
          <div className="toaster-name">{data.name}</div>
          <div className="toaster-desc">{data.desc}</div>
        </div>
      </div>
    </div>
  );
}
