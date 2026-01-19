import { useGameStore } from '../store/gameStore';
import { formatCurrency } from '../utils/taxCalculations';
import { stocks } from '../data/stockReturns';
import '../styles/investments-modal.css';

export default function InvestmentsModal() {
  const { holdings, currentYear, showInvestmentsModal, timeTravelMode } = useGameStore();
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

        <button className="investments-close-button" onClick={closeInvestmentsModal}>
          Close
        </button>
      </div>
    </div>
  );
}
