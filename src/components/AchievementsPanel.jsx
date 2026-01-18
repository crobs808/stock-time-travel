import { useGameStore } from '../store/gameStore';
import { ACHIEVEMENTS } from '../utils/achievements';
import '../styles/achievements.css';

export default function AchievementsPanel() {
  const { achievements } = useGameStore();

  if (achievements.size === 0) return null;

  return (
    <div className="achievements-panel">
      <div className="achievements-header">
        <h3>🏆 Achievements Unlocked</h3>
      </div>
      <div className="achievements-list">
        {Array.from(achievements).map((achId) => {
          const achievement = Object.values(ACHIEVEMENTS).find((a) => a.id === achId);
          if (!achievement) return null;

          return (
            <div key={achId} className="achievement-item">
              <div className="achievement-badge">🏆</div>
              <div className="achievement-content">
                <p className="achievement-name">{achievement.name}</p>
                <p className="achievement-desc">{achievement.description}</p>
                {achievement.unlocks.length > 0 && (
                  <p className="achievement-unlocks">
                    Unlocks: {achievement.unlocks.join(', ')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
