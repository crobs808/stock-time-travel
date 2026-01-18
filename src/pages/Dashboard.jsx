import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { stocks, stockReturns } from '../data/stockReturns';
import { formatCurrency, formatPercent } from '../utils/taxCalculations';
import StockCard from '../components/StockCard';
import StockTradeModal from '../components/StockTradeModal';
import TaxToggle from '../components/TaxToggle';
import AchievementToaster from '../components/AchievementToaster';
import AchievementsModal from '../components/AchievementsModal';
import headlinesData from '../data/headlines.json';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [toasterAchievement, setToasterAchievement] = useState(null);
  const [lastAchievements, setLastAchievements] = useState(new Set());

  const {
    cash,
    holdings,
    currentYear,
    currentHeadline,
    yearsInvested,
    taxToggle,
    unlockedStocks,
    achievements,
    generateRandomYear,
    applyAnnualReturns,
    getPricesForYear,
  } = useGameStore();

  // Monitor for new achievements
  useEffect(() => {
    const newAchievements = new Set([...achievements].filter((x) => !lastAchievements.has(x)));
    if (newAchievements.size > 0) {
      const firstNew = Array.from(newAchievements)[0];
      setToasterAchievement(firstNew);
      setLastAchievements(achievements);
    }
  }, [achievements, lastAchievements]);

  // Initialize year and headline if not set
  useEffect(() => {
    if (!currentYear) {
      const year = Math.floor(Math.random() * 40) + 1981;
      const yearHeadlines = headlinesData[year.toString()] || [];
      const randomHeadline = yearHeadlines.length > 0 
        ? yearHeadlines[Math.floor(Math.random() * yearHeadlines.length)]
        : `Year ${year}: A significant year for the stock market`;
      useGameStore.setState({ 
        currentYear: year,
        currentHeadline: randomHeadline,
        yearsInvested: 1
      });
    }
  }, [currentYear]);

  const handleAdvanceYear = () => {
    const year = generateRandomYear();
    
    // Apply returns to all holdings based on the year
    const returns = {};
    Object.keys(holdings).forEach((symbol) => {
      if (stockReturns[symbol] && stockReturns[symbol][year] !== undefined) {
        returns[symbol] = stockReturns[symbol][year];
      }
    });
    
    applyAnnualReturns(returns);
    
    // Check and update achievements
    useGameStore.getState().checkAndUpdateAchievements();
    
    // Set a random headline for this year from the headlines data
    const yearHeadlines = headlinesData[year.toString()] || [];
    const randomHeadline = yearHeadlines.length > 0 
      ? yearHeadlines[Math.floor(Math.random() * yearHeadlines.length)]
      : `Year ${year}: A significant year for the stock market`;
    useGameStore.setState({ 
      currentHeadline: randomHeadline
    });
  };

  const handleStockClick = (symbol) => {
    useGameStore.setState({ selectedStock: symbol });
    setSelectedStock(symbol);
  };

  const currentPrices = currentYear ? getPricesForYear(currentYear) : {};
  let portfolioValue = cash;

  Object.entries(holdings).forEach(([symbol, lots]) => {
    if (lots && lots.length > 0) {
      const price = currentPrices[symbol] || 100;
      lots.forEach((lot) => {
        portfolioValue += lot.shares * price;
      });
    }
  });

  const startingValue = 100;
  const totalGain = portfolioValue - startingValue;
  const gainPercent = totalGain / startingValue;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="portfolio-info">
          <div className="stat">
            <label>Cash:</label>
            <span>{formatCurrency(cash)}</span>
          </div>
          <div className="stat">
            <label>Portfolio Value:</label>
            <span className={totalGain >= 0 ? 'positive' : 'negative'}>
              {formatCurrency(portfolioValue)}
            </span>
          </div>
          <div className="stat">
            <label>Total Gain/Loss:</label>
            <span className={totalGain >= 0 ? 'positive' : 'negative'}>
              {formatCurrency(totalGain)} ({formatPercent(gainPercent)})
            </span>
          </div>
          <div className="stat">
            <label>Years Invested:</label>
            <span>{yearsInvested}</span>
          </div>
          {currentYear && (
            <div className="stat highlight">
              <label>Current Year:</label>
              <span>{currentYear}</span>
            </div>
          )}
        </div>
        <div className="header-right">
          <button 
            className="trophy-button" 
            onClick={() => setShowAchievementsModal(true)}
            title="View achievements"
          >
            🏆
          </button>
          <TaxToggle />
        </div>
      </div>

      <div className="headline-box">
        <div className="newspaper-container">
          <img src="/img/newspaper.png" alt="newspaper" className="newspaper-img" />
          <div className="headline-content">
            <p className="headline-text">{currentHeadline || `Year ${currentYear || '...'}: Markets in motion`}</p>
          </div>
        </div>
        <div className="year-controls">
          <div className="current-year-display">
            <span className="current-year-label">Current Year:</span>
            <span className="current-year-value">{currentYear || '...'}</span>
          </div>
          <button className="time-travel-button" onClick={handleAdvanceYear}>
            🌀 Time Travel!
          </button>
        </div>
      </div>

      <div className="stocks-grid">
        <h2>Available Investments</h2>
        <div className="grid">
          {stocks
            .sort((a, b) => {
              // Premium stocks first (those that are locked)
              const aIsPremium = !unlockedStocks.has(a.symbol);
              const bIsPremium = !unlockedStocks.has(b.symbol);
              if (aIsPremium !== bIsPremium) return aIsPremium ? -1 : 1;
              return 0;
            })
            .map((stock) => {
              const isUnlocked = unlockedStocks.has(stock.symbol);
              return (
                <StockCard
                  key={stock.symbol}
                  stock={stock}
                  isUnlocked={isUnlocked}
                  onClick={() => handleStockClick(stock.symbol)}
                />
              );
            })}
        </div>
      </div>

      {selectedStock && (
        <StockTradeModal
          symbol={selectedStock}
          onClose={() => setSelectedStock(null)}
        />
      )}

      {toasterAchievement && (
        <AchievementToaster
          achievement={toasterAchievement}
          onDismiss={() => setToasterAchievement(null)}
        />
      )}

      {showAchievementsModal && (
        <AchievementsModal
          achievements={achievements}
          onClose={() => setShowAchievementsModal(false)}
        />
      )}
    </div>
  );
}
