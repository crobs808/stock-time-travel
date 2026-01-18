import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { stocks, stockReturns } from '../data/stockReturns';
import { formatCurrency, formatPercent } from '../utils/taxCalculations';
import BuyModal from './BuyModal';
import SellModal from './SellModal';
import '../styles/stock-detail.css';

export default function StockDetail() {
  const navigate = useNavigate();
  const { symbol } = useParams();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  const {
    cash,
    holdings,
    currentYear,
  } = useGameStore();

  const stock = stocks.find((s) => s.symbol === symbol);
  if (!stock) return <div className="stock-detail error">Stock not found</div>;

  const holdings_for_stock = holdings[symbol] || [];
  const totalShares = holdings_for_stock.reduce((sum, lot) => sum + lot.shares, 0);

  // Calculate current price based on year and returns
  const basePrice = 100;
  const yearReturn = currentYear && stockReturns[symbol]?.[currentYear] ? stockReturns[symbol][currentYear] : 0;
  const currentPrice = basePrice * (1 + yearReturn);

  // Calculate total investment and current value
  const totalCostBasis = holdings_for_stock.reduce(
    (sum, lot) => sum + lot.shares * lot.costBasis,
    0
  );
  const currentValue = totalShares * currentPrice;
  const totalGain = currentValue - totalCostBasis;
  const gainPercent = totalCostBasis > 0 ? (totalGain / totalCostBasis) : 0;

  return (
    <div className="stock-detail">
      <button className="back-button" onClick={() => navigate('/game')}>
        ← Back to Dashboard
      </button>

      <div className="detail-header">
        <h1>{stock.name} ({symbol})</h1>
        <p className="type-badge">{stock.type.toUpperCase()}</p>
      </div>

      {currentYear && (
        <div className="year-info">
          <p>Year: <strong>{currentYear}</strong></p>
          <p>Annual Return: <strong className={yearReturn >= 0 ? 'positive' : 'negative'}>
            {formatPercent(yearReturn)}
          </strong></p>
          <p>Current Price: <strong>{formatCurrency(currentPrice)}</strong></p>
        </div>
      )}

      <div className="holdings-section">
        <h2>Your Holdings</h2>
        
        {totalShares > 0 ? (
          <>
            <div className="holdings-grid">
              <div className="holding-stat">
                <label>Total Shares:</label>
                <span className="value">{totalShares.toFixed(4)}</span>
              </div>
              <div className="holding-stat">
                <label>Cost Basis:</label>
                <span className="value">{formatCurrency(totalCostBasis)}</span>
              </div>
              <div className="holding-stat">
                <label>Current Value:</label>
                <span className="value">{formatCurrency(currentValue)}</span>
              </div>
              <div className="holding-stat">
                <label>Gain/Loss:</label>
                <span className={`value ${totalGain >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(totalGain)} ({formatPercent(gainPercent)})
                </span>
              </div>
            </div>

            <div className="holdings-detail">
              <h3>Lot Details (for tax purposes)</h3>
              <table className="lots-table">
                <thead>
                  <tr>
                    <th>Purchase Date</th>
                    <th>Shares</th>
                    <th>Cost/Share</th>
                    <th>Total Cost</th>
                    <th>Current Value</th>
                    <th>Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings_for_stock.map((lot) => {
                    const lotValue = lot.shares * currentPrice;
                    const lotCost = lot.shares * lot.costBasis;
                    const lotGain = lotValue - lotCost;
                    return (
                      <tr key={lot.id}>
                        <td>{lot.purchaseDate}</td>
                        <td>{lot.shares.toFixed(4)}</td>
                        <td>{formatCurrency(lot.costBasis)}</td>
                        <td>{formatCurrency(lotCost)}</td>
                        <td>{formatCurrency(lotValue)}</td>
                        <td className={lotGain >= 0 ? 'positive' : 'negative'}>
                          {formatCurrency(lotGain)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="no-holdings">
            <p>You don't own any shares of {symbol}</p>
          </div>
        )}
      </div>

      <div className="trading-section">
        <h2>Trade</h2>
        <div className="cash-info">
          <span>Available Cash:</span>
          <strong>{formatCurrency(cash)}</strong>
        </div>

        <div className="trading-buttons">
          <button
            className="buy-button"
            onClick={() => setShowBuyModal(true)}
            disabled={cash <= 0}
          >
            💰 Buy {symbol}
          </button>
          <button
            className="sell-button"
            onClick={() => setShowSellModal(true)}
            disabled={totalShares <= 0}
          >
            📊 Sell {symbol}
          </button>
        </div>
      </div>

      {showBuyModal && (
        <BuyModal
          stock={stock}
          onClose={() => setShowBuyModal(false)}
          currentPrice={currentPrice}
        />
      )}

      {showSellModal && (
        <SellModal
          stock={stock}
          holdings={holdings_for_stock}
          onClose={() => setShowSellModal(false)}
          currentPrice={currentPrice}
        />
      )}
    </div>
  );
}
