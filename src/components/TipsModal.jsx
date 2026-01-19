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
        <div className="tips-modal-header">
          <img src="/img/jay.png" alt="Jay" className="tips-modal-image" />
          <div className="tips-modal-text-section">
            <h2 className="tips-modal-title">Jay's Pro Tips</h2>
            <p className="tips-modal-text">"{currentTip}" <br/><span className="tips-quote-attribution">- Jay</span></p>
          </div>
        </div>
        
        <div className="tips-modal-footer">
          <button className="tips-modal-button" onClick={closeTipsModal}>
            Cool, thanks!
          </button>
          <button className="tips-next-button" onClick={nextTip} title="Next tip">
            ➡️
          </button>
        </div>
      </div>
    </div>
  );
}
