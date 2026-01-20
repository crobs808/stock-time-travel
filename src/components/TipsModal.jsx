import { useGameStore } from '../store/gameStore';
import tips from '../data/tips.json';
import '../styles/tips-modal.css';

export default function TipsModal() {
  const { showTipsModal, currentTipIndex, closeTipsModal, nextTip } = useGameStore();

  if (!showTipsModal) return null;

  const currentTip = tips[currentTipIndex] || tips[0];
  
  // Dynamically size text based on quote length
  const getTextSizeClass = (text) => {
    const length = text.length;
    if (length < 60) return 'tips-text-large';
    if (length < 120) return 'tips-text-medium';
    return 'tips-text-small';
  };
  
  const textSizeClass = getTextSizeClass(currentTip);

  return (
    <div className="tips-modal-overlay" onClick={closeTipsModal}>
      <div className="tips-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="tips-modal-title">Jay's Pro Tip</h2>
        
        <div className="tips-modal-body">
          <img src="/img/jay-tips.png" alt="Jay" className="tips-modal-image" />
          <div className="tips-modal-text-section">
            <p className={`tips-modal-text ${textSizeClass}`}>"{currentTip}" <br/><span className="tips-quote-attribution">- Jay</span></p>
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
