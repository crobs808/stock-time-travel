import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency } from '../utils/taxCalculations';
import '../styles/modals.css';

export default function BuyModal({ stock, onClose, currentPrice }) {
  const [shares, setShares] = useState('');
  const { cash, buyStock } = useGameStore();

  const numShares = parseFloat(shares) || 0;
  const totalCost = numShares * currentPrice;
  const canAfford = totalCost <= cash && numShares > 0;

  const handleBuy = () => {
    if (canAfford) {
      buyStock(stock.symbol, numShares, currentPrice);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Buy {stock.name} ({stock.symbol})</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="price-info">
            <span className="label">Current Price:</span>
            <span className="value">{formatCurrency(currentPrice)}</span>
          </div>

          <div className="input-group">
            <label>Shares to Buy:</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="calculation">
            <div className="calc-row">
              <span>Shares:</span>
              <span>{numShares.toFixed(2)}</span>
            </div>
            <div className="calc-row">
              <span>× Price:</span>
              <span>{formatCurrency(currentPrice)}</span>
            </div>
            <div className="calc-row highlight">
              <span>Total Cost:</span>
              <span>{formatCurrency(totalCost)}</span>
            </div>
            <div className="calc-row">
              <span>Available Cash:</span>
              <span className={totalCost > cash ? 'insufficient' : 'sufficient'}>
                {formatCurrency(cash)}
              </span>
            </div>
            {totalCost > cash && (
              <div className="error-message">Insufficient funds</div>
            )}
          </div>

          <div className="modal-footer">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="buy-button"
              onClick={handleBuy}
              disabled={!canAfford}
            >
              Buy {numShares.toFixed(2)} Shares
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
