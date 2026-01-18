import { useGameStore } from '../store/gameStore';
import '../styles/components.css';

export default function StockCard({ stock, isUnlocked, onClick }) {
  const { currentYear, isStockAvailable } = useGameStore();
  
  const isAvailable = currentYear ? isStockAvailable(stock.symbol, currentYear) : true;
  const isDisabled = !isUnlocked || !isAvailable;
  
  // Determine badge for unavailable stock
  const getUnavailableBadge = () => {
    if (stock.premium) {
      return '🏆'; // Trophy for premium stocks
    }
    return '⏰'; // Clock for other investments
  };
  
  return (
    <div 
      className={`stock-card ${isDisabled ? 'disabled' : ''}`} 
      onClick={isAvailable && isUnlocked ? onClick : undefined}
      title={!isAvailable ? `${stock.name} has not IPO'd yet` : ''}
    >
      <div className="symbol">{stock.symbol}</div>
      <div className="stock-name">{stock.name}</div>
      {!isUnlocked && <div className="lock-badge">🔒</div>}
      {!isAvailable && <div className="lock-badge">{getUnavailableBadge()}</div>}
    </div>
  );
}

