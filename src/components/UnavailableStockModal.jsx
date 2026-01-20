import { useGameStore } from '../store/gameStore';
import '../styles/unavailable-stock-modal.css';

export default function UnavailableStockModal() {
  const { showUnavailableStockModal, closeUnavailableStockModal } = useGameStore();

  if (!showUnavailableStockModal) return null;

  return (
    <div className="unavailable-stock-overlay" onClick={closeUnavailableStockModal}>
      <div className="unavailable-stock-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Investment Unavailable</h2>
        <p>
          The investment you have selected is either a premium investment that you haven't unlocked, 
          or the company is not yet listed on the stock market for the current year.
        </p>
        <button className="modal-close-x" onClick={closeUnavailableStockModal}>
          ✕
        </button>
      </div>
    </div>
  );
}
