import { useGameStore } from '../store/gameStore';
import { formatCurrency } from '../utils/taxCalculations';
import '../styles/investments-modal.css';

export default function InvestmentsModal() {
  const { holdings, currentYear, showInvestmentsModal } = useGameStore();
  const closeInvestmentsModal = useGameStore((state) => state.closeInvestmentsModal);
  const getPricesForYear = useGameStore((state) => state.getPricesForYear);
  const getStockPriceForYear = useGameStore((state) => state.getStockPriceForYear);

  if (!showInvestmentsModal) return null;

  const currentPrices = getPricesForYear(currentYear);

  // Gather all investments with their current values
  const investments = [];
  Object.entries(holdings).forEach(([symbol, lots]) => {
    if (lots && lots.length > 0) {
      let totalShares = 0;
      let totalValue = 0;

      lots.forEach((lot) => {
        const purchaseYear = new Date(lot.purchaseDate).getFullYear();
        const price = getStockPriceForYear(symbol, currentYear, lot.costBasis, purchaseYear);
        totalShares += lot.shares;
        totalValue += lot.shares * price;
      });

      investments.push({
        symbol,
        quantity: totalShares,
        value: totalValue,
      });
    }
  });

  return (
    <div className="modal-overlay" onClick={closeInvestmentsModal}>
      <div className="investments-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Your investments as of {currentYear}</h2>
        
        {investments.length === 0 ? (
          <p className="no-investments">No investments yet. Start trading to build your portfolio!</p>
        ) : (
          <div className="investments-list">
            <div className="investments-header">
              <div className="column symbol">Symbol</div>
              <div className="column quantity">Quantity</div>
              <div className="column value">Current Value</div>
            </div>
            {investments.map((investment) => (
              <div key={investment.symbol} className="investment-row">
                <div className="column symbol">{investment.symbol}</div>
                <div className="column quantity">{investment.quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className="column value">{formatCurrency(investment.value)}</div>
              </div>
            ))}
          </div>
        )}

        <button className="close-button" onClick={closeInvestmentsModal}>
          Close
        </button>
      </div>
    </div>
  );
}
