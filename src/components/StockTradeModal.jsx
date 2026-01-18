import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { stocks, stockReturns } from '../data/stockReturns';
import { formatCurrency } from '../utils/taxCalculations';
import '../styles/modals.css';

export default function StockTradeModal({ symbol, onClose }) {
  const [transactionFlash, setTransactionFlash] = useState(false);
  
  const {
    cash,
    holdings,
    currentYear,
    getPricesForYear,
    buyStock,
    sellStock,
  } = useGameStore();

  const stock = stocks.find((s) => s.symbol === symbol);
  if (!stock) return null;

  const currentPrices = currentYear ? getPricesForYear(currentYear) : {};
  const currentPrice = currentPrices[symbol] || 100;
  const holdings_for_stock = holdings[symbol] || [];
  const totalShares = holdings_for_stock.reduce((sum, lot) => sum + lot.shares, 0);
  const investmentValue = totalShares * currentPrice;

  const triggerFlash = () => {
    setTransactionFlash(true);
    setTimeout(() => setTransactionFlash(false), 500);
  };

  // Get fresh state values from store to avoid closure issues
  const getLatestState = () => {
    const state = useGameStore.getState();
    const latestCash = state.cash;
    const latestHoldings = state.holdings[symbol] || [];
    const latestTotalShares = latestHoldings.reduce((sum, lot) => sum + lot.shares, 0);
    return { latestCash, latestTotalShares };
  };

  const handleBuyMax = () => {
    const { latestCash } = getLatestState();
    // Use all cash - fractional shares supported
    const sharesToBuy = latestCash / currentPrice;
    if (sharesToBuy > 0) {
      buyStock(symbol, sharesToBuy, currentPrice);
      triggerFlash();
    }
  };

  const handleBuy90 = () => {
    const { latestCash } = getLatestState();
    const cashToSpend = latestCash * 0.9;
    const sharesToBuy = cashToSpend / currentPrice;
    if (sharesToBuy > 0) {
      buyStock(symbol, sharesToBuy, currentPrice);
      triggerFlash();
    }
  };

  const handleBuy50 = () => {
    const { latestCash } = getLatestState();
    const cashToSpend = latestCash * 0.5;
    const sharesToBuy = cashToSpend / currentPrice;
    if (sharesToBuy > 0) {
      buyStock(symbol, sharesToBuy, currentPrice);
      triggerFlash();
    }
  };

  const handleBuy10 = () => {
    const { latestCash } = getLatestState();
    const cashToSpend = latestCash * 0.1;
    const sharesToBuy = cashToSpend / currentPrice;
    if (sharesToBuy > 0) {
      buyStock(symbol, sharesToBuy, currentPrice);
      triggerFlash();
    }
  };

  const handleSellMax = () => {
    const { latestTotalShares } = getLatestState();
    if (latestTotalShares > 0) {
      sellStock(symbol, latestTotalShares, currentPrice);
      triggerFlash();
    }
  };

  const handleSell90 = () => {
    const { latestTotalShares } = getLatestState();
    const sharesToSell = latestTotalShares * 0.9;
    if (sharesToSell > 0) {
      sellStock(symbol, sharesToSell, currentPrice);
      triggerFlash();
    }
  };

  const handleSell50 = () => {
    const { latestTotalShares } = getLatestState();
    const sharesToSell = latestTotalShares * 0.5;
    if (sharesToSell > 0) {
      sellStock(symbol, sharesToSell, currentPrice);
      triggerFlash();
    }
  };

  const handleSell10 = () => {
    const { latestTotalShares } = getLatestState();
    const sharesToSell = latestTotalShares * 0.1;
    if (sharesToSell > 0) {
      sellStock(symbol, sharesToSell, currentPrice);
      triggerFlash();
    }
  };

  // Prepare chart data
  const chartData = [];
  if (stockReturns[symbol]) {
    for (let year = 1981; year <= 2020; year++) {
      if (stockReturns[symbol][year] !== undefined) {
        const price = 100 * (1 + stockReturns[symbol][year]);
        chartData.push({ year, price });
      }
    }
  }

  const maxPrice = Math.max(...chartData.map(d => d.price), 100);
  const minPrice = Math.min(...chartData.map(d => d.price), 100);
  const priceRange = maxPrice - minPrice || 1;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content trade-modal ${transactionFlash ? 'flash' : ''}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Portfolio Stats at Top */}
        <div className="portfolio-stats">
          <div className="stat-box">
            <div className="stat-label">Cash</div>
            <div className="stat-value">{formatCurrency(cash)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Investments</div>
            <div className="stat-value">{formatCurrency(investmentValue)}</div>
          </div>
        </div>

        {/* Stock Tile */}
        <div className="stock-tile">
          <div className="stock-symbol">{symbol}</div>
          <div className="stock-name">{stock.name}</div>
          <div className="stock-price">Current: {formatCurrency(currentPrice)}</div>
        </div>

        {/* Price Chart */}
        <div className="price-chart-container">
          <div className="chart-title">Annual Return (%)</div>
          <div className="price-chart">
            {chartData.map((data) => {
              const returnPct = ((data.price - 100) / 100) * 100;
              const normalized = ((data.price - minPrice) / priceRange) * 100;
              const height = normalized || 5;
              const isPositive = returnPct >= 0;
              
              return (
                <div key={data.year} className="chart-bar-wrapper">
                  <div
                    className={`chart-bar ${isPositive ? 'positive' : 'negative'}`}
                    style={{ height: `${height}%` }}
                    title={`${data.year}: ${returnPct.toFixed(1)}%`}
                  />
                  <div className="chart-year">{data.year}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trading Buttons */}
        <div className="trading-buttons-grid">
          <div className="button-column buy-column">
            <button
              className="trade-button buy-max"
              onClick={handleBuyMax}
              disabled={cash <= 0}
            >
              BUY<br />MAX
            </button>
            <button
              className="trade-button buy-90"
              onClick={handleBuy90}
              disabled={cash <= 0}
            >
              BUY<br />90%
            </button>
            <button
              className="trade-button buy-50"
              onClick={handleBuy50}
              disabled={cash <= 0}
            >
              BUY<br />50%
            </button>
            <button
              className="trade-button buy-10"
              onClick={handleBuy10}
              disabled={cash <= 0}
            >
              BUY<br />10%
            </button>
          </div>

          <div className="button-column sell-column">
            <button
              className="trade-button sell-max"
              onClick={handleSellMax}
              disabled={totalShares === 0}
            >
              SELL<br />MAX
            </button>
            <button
              className="trade-button sell-90"
              onClick={handleSell90}
              disabled={totalShares === 0}
            >
              SELL<br />90%
            </button>
            <button
              className="trade-button sell-50"
              onClick={handleSell50}
              disabled={totalShares === 0}
            >
              SELL<br />50%
            </button>
            <button
              className="trade-button sell-10"
              onClick={handleSell10}
              disabled={totalShares === 0}
            >
              SELL<br />10%
            </button>
          </div>
        </div>

        {/* Return Home Button */}
        <div className="modal-footer-trade">
          <button className="return-home-button" onClick={onClose}>
            ← Return Home
          </button>
        </div>

        <button className="close-button" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}
