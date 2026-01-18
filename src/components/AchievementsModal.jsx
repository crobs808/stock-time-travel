import '../styles/achievements-modal.css';

export default function AchievementsModal({ achievements, onClose }) {
  const allAchievements = [
    { id: 'first_trade', emoji: '🎯', name: 'First Trade', desc: 'Make your first trade' },
    { id: 'millionaire', emoji: '💰', name: 'Millionaire', desc: 'Reach $1,000,000 portfolio' },
    { id: 'time_traveler', emoji: '⏰', name: 'Time Traveler', desc: 'Travel through 10 years' },
    { id: 'diversified', emoji: '📊', name: 'Diversified', desc: 'Hold 5+ different stocks' },
    { id: 'long_term', emoji: '📈', name: 'Long Term Investor', desc: 'Hold a stock for 1+ year' },
    { id: 'tax_savvy', emoji: '📋', name: 'Tax Savvy', desc: 'Earn $10,000 in gains' },
    { id: 'diamond_hands', emoji: '💎', name: 'Diamond Hands', desc: 'Never sell a stock' },
    { id: 'comeback_kid', emoji: '🚀', name: 'Comeback Kid', desc: 'Recover from losses' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="achievements-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏆 Achievements</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="achievements-list">
          {allAchievements.map((achievement) => {
            const isUnlocked = achievements.has(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-emoji">{achievement.emoji}</div>
                <div className="achievement-info">
                  <div className="achievement-name">{achievement.name}</div>
                  <div className="achievement-desc">{achievement.desc}</div>
                </div>
                <div className="achievement-status">
                  {isUnlocked ? '✓' : '🔒'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
