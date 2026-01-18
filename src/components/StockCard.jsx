import '../styles/components.css';

export default function StockCard({ stock, isUnlocked, onClick }) {
  return (
    <div className={`stock-card ${!isUnlocked ? 'locked' : ''}`} onClick={isUnlocked ? onClick : undefined}>
      <div className="symbol">{stock.symbol}</div>
      {!isUnlocked && <div className="lock-badge">🔒</div>}
    </div>
  );
}
