import { useGameStore } from '../store/gameStore';
import { formatCurrency } from '../utils/taxCalculations';
import { stocks } from '../data/stockReturns';
import '../styles/investments-modal.css';

export default function InvestmentsModal() {
  const { holdings, currentYear, showInvestmentsModal, timeTravelMode, cash } = useGameStore();
  const closeInvestmentsModal = useGameStore((state) => state.closeInvestmentsModal);
  const getPricesForYear = useGameStore((state) => state.getPricesForYear);
  const getStockPriceForYear = useGameStore((state) => state.getStockPriceForYear);

  if (!showInvestmentsModal) return null;

  const currentPrices = getPricesForYear(currentYear);

  // Create a map of stock symbols to IPO years
  const ipoYearMap = {};
  stocks.forEach((stock) => {
    ipoYearMap[stock.symbol] = stock.ipoYear;
  });

  // Gather all investments with their current values and purchase prices
  const investments = [];
  let totalInvestmentValue = 0;
  Object.entries(holdings).forEach(([symbol, lots]) => {
    if (lots && lots.length > 0) {
      let totalShares = 0;
      let totalValue = 0;
      let totalCost = 0;

      lots.forEach((lot) => {
        const purchaseYear = new Date(lot.purchaseDate).getFullYear();
        const price = getStockPriceForYear(symbol, currentYear, lot.costBasis, purchaseYear);
        totalShares += lot.shares;
        totalValue += lot.shares * price;
        totalCost += lot.shares * lot.costBasis;
      });

      totalInvestmentValue += totalValue;

      const avgPurchasePrice = totalShares > 0 ? totalCost / totalShares : 0;
      const ipoYear = ipoYearMap[symbol] || 1900;
      const isUnavailable = timeTravelMode === 'chaotic' && currentYear < ipoYear;

      investments.push({
        symbol,
        quantity: totalShares,
        purchasePrice: avgPurchasePrice,
        value: totalValue,
        isUnavailable,
      });
    }
  });

  // Calculate portfolio value and status
  const portfolioValue = cash + totalInvestmentValue;

  const getStatus = (value) => {
    if (value < 100) return { level: 'Struggling', index: 0 };
    if (value >= 100 && value < 1000) return { level: 'Surviving', index: 1 };
    if (value >= 1000 && value < 5000) return { level: 'Striving', index: 2 };
    if (value >= 5000 && value < 50000) return { level: 'Thriving', index: 3 };
    if (value >= 50000 && value < 500000) return { level: 'Killing It!', index: 4 };
    if (value >= 500000) return { level: 'G.O.A.T.', index: 5 };
  };

  const currentStatus = getStatus(portfolioValue);

  return (
    <div className="modal-overlay" onClick={closeInvestmentsModal}>
      <div className="investments-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-x" onClick={closeInvestmentsModal}>✕</button>
        <h2>Your investments as of {currentYear}</h2>
        
        {investments.length === 0 ? (
          <p className="no-investments">No investments yet. Start trading to build your portfolio!</p>
        ) : (
          <div className="investments-list">
            <div className="investments-header">
              <div className="column symbol">Symbol</div>
              <div className="column quantity">Qty</div>
              <div className="column purchasePrice">Purchase Price</div>
              <div className="column currentValue">Current Value</div>
            </div>
            {investments.map((investment) => (
              <div 
                key={investment.symbol} 
                className={`investment-row ${investment.isUnavailable ? 'unavailable' : ''}`}
                title={investment.isUnavailable ? `${investment.symbol} did not exist in ${currentYear}` : ''}
              >
                <div className="column symbol">{investment.symbol}</div>
                <div className="column quantity">{investment.quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className="column purchasePrice">{formatCurrency(investment.purchasePrice)}</div>
                <div className="column currentValue">{formatCurrency(investment.value)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="status-indicator">
          <div className="status-list">
            <div className={`status-item ${currentStatus.index === 0 ? 'active' : ''}`}>
              <span className="status-radio">{currentStatus.index === 0 ? '●' : '○'}</span>
              <span className="status-name">Struggling</span>
              <span className="status-range">Less than $100</span>
            </div>
            <div className={`status-item ${currentStatus.index === 1 ? 'active' : ''}`}>
              <span className="status-radio">{currentStatus.index === 1 ? '●' : '○'}</span>
              <span className="status-name">Surviving</span>
              <span className="status-range">$100 - $999</span>
            </div>
            <div className={`status-item ${currentStatus.index === 2 ? 'active' : ''}`}>
              <span className="status-radio">{currentStatus.index === 2 ? '●' : '○'}</span>
              <span className="status-name">Striving</span>
              <span className="status-range">$1,000 - $4,999</span>
            </div>
            <div className={`status-item ${currentStatus.index === 3 ? 'active' : ''}`}>
              <span className="status-radio">{currentStatus.index === 3 ? '●' : '○'}</span>
              <span className="status-name">Thriving</span>
              <span className="status-range">$5,000 - $49,999</span>
            </div>
            <div className={`status-item ${currentStatus.index === 4 ? 'active' : ''}`}>
              <span className="status-radio">{currentStatus.index === 4 ? '●' : '○'}</span>
              <span className="status-name">Killing It!</span>
              <span className="status-range">$50,000 - $499,999</span>
            </div>
            <div className={`status-item ${currentStatus.index === 5 ? 'active' : ''}`}>
              <span className="status-radio">{currentStatus.index === 5 ? '●' : '○'}</span>
              <span className="status-name">G.O.A.T.</span>
              <span className="status-range">$500,000+</span>
            </div>
          </div>
        </div>

        <button className="investments-close-button" onClick={closeInvestmentsModal}>
          Close
        </button>
      </div>
    </div>
  );
}
