import { useGameStore } from '../store/gameStore';
import '../styles/tips-toggle.css';

export default function TipsToggle() {
  const { tipsEnabled, toggleTips } = useGameStore();

  return (
    <div className="tips-toggle-container">
      <label className="tips-toggle-label">Auto Tips?</label>
      <button
        className={`tips-toggle ${tipsEnabled ? 'enabled' : 'disabled'}`}
        onClick={toggleTips}
        aria-label="Toggle tips"
      >
        <div className="toggle-slider" />
      </button>
    </div>
  );
}
