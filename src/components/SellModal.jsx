import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency, calculateCapitalGainsTax, getDaysHeld } from '../utils/taxCalculations';
import '../styles/modals.css';

export default function SellModal({ stock, holdings, onClose, currentPrice }) {
  const [shares, setShares] = useState('');
  const { sellStock, taxState } = useGameStore();

  const numShares = parseFloat(shares) || 0;
  const totalSharesToSell = holdings.reduce((sum, lot) => sum + lot.shares, 0);
  const canSell = numShares > 0 && numShares <= totalSharesToSell;

  // Calculate proceeds and taxes
  const proceeds = numShares * currentPrice;
  let totalTax = 0;

  // Simple calculation: assume we're selling from oldest lots first (FIFO)
  let remainingShares = numShares;
  holdings.forEach((lot) => {
    if (remainingShares <= 0) return;
    const sharesToSellFromLot = Math.min(remainingShares, lot.shares);
    const gain = (currentPrice - lot.costBasis) * sharesToSellFromLot;
    const daysHeld = getDaysHeld(lot.purchaseDate);
    totalTax += calculateCapitalGainsTax(gain, daysHeld, taxState.taxBracket);
    remainingShares -= sharesToSellFromLot;
  });

  const afterTaxProceeds = proceeds - totalTax;

  const handleSell = () => {
    if (canSell) {
      sellStock(stock.symbol, numShares);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Sell {stock.name} ({stock.symbol})</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="price-info">
            <span className="label">Current Price:</span>
            <span className="value">{formatCurrency(currentPrice)}</span>
          </div>

          <div className="holdings-summary">
            <span className="label">Total Holdings:</span>
            <span className="value">{totalSharesToSell.toFixed(2)} shares</span>
          </div>

          <div className="input-group">
            <label>Shares to Sell:</label>
            <input
              type="number"
              min="0"
              step="0.01"
              max={totalSharesToSell}
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
              <span>Gross Proceeds:</span>
              <span>{formatCurrency(proceeds)}</span>
            </div>
            <div className="calc-row highlight">
              <span>After-Tax Proceeds:</span>
              <span>{formatCurrency(afterTaxProceeds)}</span>
            </div>

            {!canSell && numShares > 0 && (
              <div className="error-message">Cannot sell more than {totalSharesToSell.toFixed(2)} shares</div>
            )}
          </div>

          <div className="modal-footer">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="sell-button"
              onClick={handleSell}
              disabled={!canSell}
            >
              Sell {numShares.toFixed(2)} Shares
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
