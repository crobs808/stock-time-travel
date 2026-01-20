import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { stocks, stockReturns } from '../data/stockReturns';
import { formatCurrency, formatPercent } from '../utils/taxCalculations';
import StockCard from '../components/StockCard';
import StockTradeModal from '../components/StockTradeModal';
import AchievementToaster from '../components/AchievementToaster';
import AchievementsModal from '../components/AchievementsModal';
import InvestmentsModal from '../components/InvestmentsModal';
import TipsModal from '../components/TipsModal';
import TipsToggle from '../components/TipsToggle';
import UnavailableStockModal from '../components/UnavailableStockModal';
import GameOverModal from '../components/GameOverModal';
import headlinesData from '../data/headlines.json';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [toasterAchievement, setToasterAchievement] = useState(null);
  const [lastAchievements, setLastAchievements] = useState(new Set());
  const [headlineIndex, setHeadlineIndex] = useState(0);

  const {
    cash,
    holdings,
    currentYear,
    currentHeadline,
    yearsInvested,
    unlockedStocks,
    achievements,
    travelCreditsUsed,
    notification,
    generateRandomYear,
    applyAnnualReturns,
    getPricesForYear,
    getStockPriceForYear,
    getPortfolioAnalysis,
    incrementClickCounter,
    checkPreIPOStocks,
    clearNotification,
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

  // Check for pre-IPO stocks when year changes
  useEffect(() => {
    if (currentYear) {
      checkPreIPOStocks(currentYear);
    }
  }, [currentYear, checkPreIPOStocks]);

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  // Initialize year and headline if not set
  useEffect(() => {
    if (!currentYear && useGameStore.getState().timeTravelMode) {
      let year;
      if (useGameStore.getState().timeTravelMode === 'sequential') {
        year = 1981; // Start at 1981 for sequential mode
      } else {
        year = Math.floor(Math.random() * 40) + 1981;
      }
      const yearHeadlines = headlinesData[year.toString()] || [];
      const randomHeadline = yearHeadlines.length > 0 
        ? yearHeadlines[Math.floor(Math.random() * yearHeadlines.length)]
        : `Year ${year}: A significant year for the stock market`;
      useGameStore.setState({ 
        currentYear: year,
        currentHeadline: randomHeadline,
        yearsInvested: 1,
        currentSequentialYear: 1982, // Set next year for sequential mode
      });
    }
  }, [currentYear]);

  const handleAdvanceYear = () => {
    const { travelCreditsUsed, timeTravelMode, currentYear } = useGameStore.getState();
    
    // Check if they've exceeded travel limit (39 max)
    if (travelCreditsUsed >= 39) {
      setShowGameOverModal(true);
      return;
    }
    
    // For sequential mode, check if they're at 2020
    if (timeTravelMode === 'sequential' && currentYear === 2020) {
      useGameStore.setState({ travelCreditsUsed: travelCreditsUsed + 1 });
      setShowGameOverModal(true);
      return;
    }
    
    // Increment travel credits
    useGameStore.setState({ travelCreditsUsed: travelCreditsUsed + 1 });
    
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

  const getYearHeadlines = () => {
    return headlinesData[currentYear?.toString()] || [];
  };

  const handlePrevHeadline = () => {
    const headlines = getYearHeadlines();
    if (headlines.length > 1) {
      const newIndex = headlineIndex === 0 ? headlines.length - 1 : headlineIndex - 1;
      setHeadlineIndex(newIndex);
      useGameStore.setState({ currentHeadline: headlines[newIndex] });
    }
  };

  const handleNextHeadline = () => {
    const headlines = getYearHeadlines();
    if (headlines.length > 1) {
      const newIndex = (headlineIndex + 1) % headlines.length;
      setHeadlineIndex(newIndex);
      useGameStore.setState({ currentHeadline: headlines[newIndex] });
    }
  };

  const currentPrices = currentYear ? getPricesForYear(currentYear) : {};
  const portfolioAnalysis = getPortfolioAnalysis(currentYear, currentPrices);
  const portfolioValue = portfolioAnalysis.total;
  const realizedValue = portfolioAnalysis.realized;

  const startingValue = 100;
  const totalGain = portfolioValue - startingValue;
  const gainPercent = totalGain / startingValue;

  // Update portfolio value in store for use elsewhere
  useEffect(() => {
    useGameStore.setState({ portfolioValue });
  }, [portfolioValue]);

  return (
    <div className="dashboard" onClick={incrementClickCounter}>
      <div className="dashboard-header">
        <div className="portfolio-info">
          <div className="portfolio-grid">
            <div className="grid-row header-row">
              <div className="grid-cell header-cell"><strong>Cash</strong></div>
              <div className="grid-cell header-cell"><strong>Portfolio Value</strong></div>
              <div className="grid-cell header-cell"><strong>Realized</strong></div>
              <div className="grid-cell header-cell"><strong>Unrealized</strong></div>
              <div className="grid-cell header-cell"><strong>Total Gain/Loss</strong></div>
            </div>
            <div className="grid-row value-row">
              <div className="grid-cell value-cell">
                {formatCurrency(cash)}
              </div>
              <div className={`grid-cell value-cell ${totalGain >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(portfolioValue)}
              </div>
              <div className={`grid-cell value-cell ${realizedValue - startingValue >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(realizedValue)}
              </div>
              <div className="grid-cell value-cell warning">
                {formatCurrency(portfolioAnalysis.unrealized)}
              </div>
              <div className={`grid-cell value-cell ${totalGain >= 0 ? 'positive' : 'negative'}`}>
                {formatPercent(gainPercent)}
              </div>
            </div>
          </div>
          <div className="portfolio-info-extra">
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
            <div className="stat">
              <label>Travel Credits:</label>
              <span>{39 - travelCreditsUsed}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <TipsToggle />
          <button 
            className="investments-button" 
            onClick={() => {
              useGameStore.setState({
                showTipsModal: true,
                currentTipIndex: Math.floor(Math.random() * 13),
              });
            }}
            title="View Jay's Tips"
          >
            👍
          </button>
          <button 
            className="investments-button" 
            onClick={() => useGameStore.getState().openInvestmentsModal()}
            title="View investments"
          >
            📊
          </button>
          <button 
            className="trophy-button" 
            onClick={() => setShowAchievementsModal(true)}
            title="View achievements"
          >
            🏆
          </button>
        </div>
      </div>

      <div className="headline-box">
        <div className="newspaper-container">
          <img src="/img/newspaper.png" alt="newspaper" className="newspaper-img" />
          <div className="headline-content">
            <p className="headline-text">{currentHeadline || `Year ${currentYear || '...'}: Markets in motion`}</p>
            <button 
              className="headline-refresh-btn"
              onClick={handleNextHeadline}
              disabled={getYearHeadlines().length <= 1}
              title="Next headline"
            >
              ♻️
            </button>
          </div>
        </div>
        <div className="year-controls">
          <div className="current-year-display">
            <span className="current-year-value">It's {currentYear || '...'}</span>
          </div>
          <button className="time-travel-button" onClick={handleAdvanceYear}>
            Time<br />Travel 🌀
          </button>
        </div>
      </div>

      <div className="stocks-grid">
        {/* Premium Stocks Section */}
        <div className="stocks-section">
          <h3 className="section-title">Premium Investments</h3>
          <div className="grid premium-grid">
            {stocks
              .filter((stock) => stock.premium)
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

        {/* Standard Stocks Section */}
        <div className="stocks-section">
          <h3 className="section-title">Other Investments</h3>
          <div className="grid">
            {stocks
              .filter((stock) => !stock.premium)
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

      {notification && (
        <div className={`notification-toaster notification-${notification.type}`}>
          <div className="notification-content">
            {notification.message}
          </div>
          <button 
            className="notification-close"
            onClick={() => clearNotification()}
          >
            ✕
          </button>
        </div>
      )}

      {showAchievementsModal && (
        <AchievementsModal
          achievements={achievements}
          onClose={() => setShowAchievementsModal(false)}
        />
      )}

      <InvestmentsModal />

      <TipsModal />

      <UnavailableStockModal />

      {showGameOverModal && <GameOverModal />}
    </div>
  );
}
