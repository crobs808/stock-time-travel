import { useGameStore } from '../store/gameStore';
import tips from '../data/tips.json';
import '../styles/tips-modal.css';

export default function TipsModal() {
  const { showTipsModal, currentTipIndex, closeTipsModal, nextTip } = useGameStore();

  if (!showTipsModal) return null;

  const currentTip = tips[currentTipIndex] || tips[0];

  return (
    <div className="tips-modal-overlay" onClick={closeTipsModal}>
      <div className="tips-modal-content" onClick={(e) => e.stopPropagation()}>
        <img src="/img/jay.png" alt="Jay" className="tips-modal-image" />
        <h2 className="tips-modal-title">Jay's Pro Tips</h2>
        <p className="tips-modal-text">{currentTip}</p>
        
        <div className="tips-modal-footer">
          <button className="tips-modal-button" onClick={closeTipsModal}>
            Cool, thanks!
          </button>
          <button className="tips-next-button" onClick={nextTip} title="Next tip">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
