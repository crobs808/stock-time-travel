import { useGameStore } from '../store/gameStore';
import tips from '../data/tips.json';
import '../styles/tips-modal.css';

export default function TipsModal() {
  const { showTipsModal, currentTipIndex, closeTipsModal } = useGameStore();

  if (!showTipsModal) return null;

  const currentTip = tips[currentTipIndex] || tips[0];

  return (
    <div className="tips-modal-overlay" onClick={closeTipsModal}>
      <div className="tips-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="tips-modal-title">Tip</h2>
        <p className="tips-modal-text">{currentTip}</p>
        <button className="tips-modal-button" onClick={closeTipsModal}>
          Cool, thanks!
        </button>
      </div>
    </div>
  );
}
