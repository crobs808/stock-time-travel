import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { checkAchievements, getUnlockedStocks } from '../utils/achievements';
import headlinesData from '../data/headlines.json';
import { stockReturns, stocks } from '../data/stockReturns';

export const useGameStore = create(
  persist(
    (set, get) => ({
  // Game state
  currentYear: null,
  currentHeadline: null,
  cash: 100,
  gameStarted: false,
  currentScreen: 'opening', // opening, mode-selection, rules, pro-tips, game
  selectedStock: null,
  yearsInvested: 0,
  timeTravelMode: null, // 'sequential' or 'chaotic'
  currentSequentialYear: 1981, // For sequential mode tracking
  portfolioValue: 100, // Current total portfolio value
  travelCreditsUsed: 0, // Track how many times user has traveled (max 39)

  // Portfolio tracking (lot-based for FIFO)
  holdings: {}, // { AAPL: [{ id, shares, purchaseDate, costBasis }, ...], ... }

  // Tax tracking
  taxState: {
    ytdShortTermGains: 0,
    ytdLongTermGains: 0,
    carryforwardLoss: 0,
    taxBracket: 'middle', // 'budget', 'middle', 'high'
  },

  // Freemium unlocks
  unlockedStocks: new Set(['AAPL', 'AMZN', 'MSFT', 'INTC', 'F', 'KO', 'VFINX', 'CD', 'Debt']),
  achievements: new Set(),

  // Tips system
  tipsEnabled: true,
  clickCounter: 0,
  showTipsModal: false,
  currentTipIndex: 0,

  // Investments modal
  showInvestmentsModal: false,

  // Unavailable stock modal
  showUnavailableStockModal: false,

  // Generic notification system
  notification: null, // { type: 'success' | 'warning' | 'info', message: string }

  // Track stocks that have shown the "reset" notification (pre-IPO)
  preIPOStocksNotified: new Set(),

  // Headlines loaded from JSON
  headlines: headlinesData,

  // Actions
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setSelectedStock: (stock) => set({ selectedStock: stock }),
  setTaxBracket: (bracket) => set((state) => ({
    taxState: { ...state.taxState, taxBracket: bracket },
  })),

  // Tips actions
  toggleTips: () => set((state) => ({ tipsEnabled: !state.tipsEnabled })),
  incrementClickCounter: () => set((state) => {
    if (!state.tipsEnabled) return state;
    
    const newCounter = state.clickCounter + 1;
    if (newCounter >= 30) {
      return {
        clickCounter: 0,
        showTipsModal: true,
        currentTipIndex: Math.floor(Math.random() * 13), // Random tip from 13 tips
      };
    }
    return { clickCounter: newCounter };
  }),
  closeTipsModal: () => set({ showTipsModal: false }),
  
  // Advance to next tip (loops at end)
  nextTip: () => set((state) => ({
    currentTipIndex: (state.currentTipIndex + 1) % 13,
  })),
  
  // Investments modal actions
  openInvestmentsModal: () => set({ showInvestmentsModal: true }),
  closeInvestmentsModal: () => set({ showInvestmentsModal: false }),

  // Unavailable stock modal actions
  openUnavailableStockModal: () => set({ showUnavailableStockModal: true }),
  closeUnavailableStockModal: () => set({ showUnavailableStockModal: false }),

  // Time travel mode selection
  setTimeTravelMode: (mode) => set({ 
    timeTravelMode: mode,
    currentSequentialYear: 1981,
    currentScreen: 'game'
  }),

  // Start a new game
  startGame: (taxBracket = 'middle') => set((state) => {
    const year = Math.floor(Math.random() * 40) + 1981; // 1981 to 2020
    const yearHeadlines = headlinesData[year.toString()] || [];
    const randomHeadline = yearHeadlines.length > 0 
      ? yearHeadlines[Math.floor(Math.random() * yearHeadlines.length)]
      : `Year ${year}: A significant year for the stock market`;
    
    return {
      gameStarted: true,
      currentScreen: 'opening',
      cash: 100,
      currentYear: null,
      currentHeadline: randomHeadline,
      holdings: {},
      yearsInvested: 0,
      timeTravelMode: null,
      currentSequentialYear: 1981,
      taxState: {
        ytdShortTermGains: 0,
        ytdLongTermGains: 0,
        carryforwardLoss: 0,
        taxBracket,
      },
      achievements: new Set(),
    };
  }),

  // Generate random year (1981-2020)
  generateRandomYear: () => {
    const state = get();
    let year;
    
    if (state.timeTravelMode === 'sequential') {
      year = state.currentSequentialYear;
      // Advance to next year for next time, or wrap back to 1981 if at 2020
      const nextYear = year === 2020 ? 1981 : year + 1;
      set((s) => ({
        currentYear: year,
        currentSequentialYear: nextYear,
        yearsInvested: s.yearsInvested + 1,
      }));
    } else {
      // Chaotic mode - random year
      year = Math.floor(Math.random() * 40) + 1981; // 1981 to 2020
      set((s) => ({
        currentYear: year,
        yearsInvested: s.yearsInvested + 1,
      }));
    }
    return year;
  },

  // Buy stocks (add lot)
  buyStock: (symbol, shares, price) => set((state) => {
    const cost = shares * price;
    if (cost > state.cash) return state; // Insufficient funds

    const lotId = `${symbol}-${Date.now()}`;
    const newHoldings = { ...state.holdings };
    if (!newHoldings[symbol]) newHoldings[symbol] = [];

    newHoldings[symbol].push({
      id: lotId,
      shares,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseYear: state.currentYear, // Store the in-game year
      costBasis: price,
    });

    // Check achievements after purchase
    const updatedState = {
      cash: state.cash - cost,
      holdings: newHoldings,
      achievements: state.achievements,
      unlockedStocks: state.unlockedStocks,
    };

    // Check for first trade
    if (Object.keys(newHoldings).length === 1 && !state.achievements.has('first_trade')) {
      updatedState.achievements = new Set(state.achievements);
      updatedState.achievements.add('first_trade');
    }

    return updatedState;
  }),

  // Sell stocks (FIFO method)
  sellStock: (symbol, shares, currentPrice) => set((state) => {
    const lots = state.holdings[symbol];
    if (!lots || lots.length === 0) return state;

    let sharesToSell = shares;
    let totalProceeds = 0;
    let lotsToRemove = [];
    let updatedLots = [...lots];
    let ytdShortTermGains = state.taxState.ytdShortTermGains;
    let ytdLongTermGains = state.taxState.ytdLongTermGains;

    for (let i = 0; i < updatedLots.length && sharesToSell > 0; i++) {
      const lot = updatedLots[i];
      const sharesToSellFromLot = Math.min(sharesToSell, lot.shares);

      // Always recalculate price using year-aware logic, don't rely on passed currentPrice
      const purchaseYear = lot.purchaseYear || new Date(lot.purchaseDate).getFullYear();
      const get = useGameStore.getState();
      const salePrice = get.getStockPriceForYear(symbol, state.currentYear, lot.costBasis, purchaseYear);
      const proceeds = sharesToSellFromLot * salePrice;
      totalProceeds += proceeds;

      // Track gain/loss
      const gain = (salePrice - lot.costBasis) * sharesToSellFromLot;
      const purchaseDate = new Date(lot.purchaseDate);
      const saleDate = new Date();
      const daysHeld = Math.floor((saleDate - purchaseDate) / (1000 * 60 * 60 * 24));
      const isLongTerm = daysHeld >= 365;

      if (isLongTerm) {
        ytdLongTermGains += gain;
      } else {
        ytdShortTermGains += gain;
      }

      if (sharesToSellFromLot === lot.shares) {
        lotsToRemove.push(i);
      } else {
        updatedLots[i] = { ...lot, shares: lot.shares - sharesToSellFromLot };
      }

      sharesToSell -= sharesToSellFromLot;
    }

    // Remove fully sold lots in reverse order to avoid index issues
    lotsToRemove.reverse().forEach((index) => {
      updatedLots.splice(index, 1);
    });

    const newHoldings = { ...state.holdings };
    if (updatedLots.length === 0) {
      delete newHoldings[symbol];
    } else {
      newHoldings[symbol] = updatedLots;
    }

    return {
      cash: state.cash + totalProceeds,
      holdings: newHoldings,
      taxState: {
        ...state.taxState,
        ytdShortTermGains,
        ytdLongTermGains,
      },
    };
  }),

  // Apply annual returns to all holdings and update cash from dividends
  applyAnnualReturns: (returns) => set((state) => {
    // Note: We don't modify holdings here anymore. 
    // Stock prices are calculated on-demand in getPortfolioAnalysis using getStockPriceForYear
    // This preserves the original costBasis for all lots
    return {
      holdings: state.holdings,
      cash: state.cash,
    };
  }),

  // Get current price for a stock based on year
  getCurrentPrice: (symbol, year) => {
    if (!stockReturns[symbol] || !stockReturns[symbol][year]) {
      return 100; // Default base price
    }
    const returnRate = stockReturns[symbol][year];
    return 100 * (1 + returnRate);
  },

  // Get all current prices for a given year
  getPricesForYear: (year) => {
    const prices = {};
    
    Object.keys(stockReturns).forEach((symbol) => {
      let price = 100; // Start with $100
      // Calculate cumulative price from 1981 to the given year
      for (let y = 1981; y <= year; y++) {
        if (stockReturns[symbol][y] !== undefined) {
          const returnRate = stockReturns[symbol][y];
          price = price * (1 + returnRate);
        }
      }
      prices[symbol] = price;
    });
    
    return prices;
  },

  // Check if a stock is available (IPO'd) for a given year
  isStockAvailable: (symbol, year) => {
    const stock = stocks.find((s) => s.symbol === symbol);
    if (!stock) return false;
    return year >= stock.ipoYear;
  },

  // Get stock price for a given year, accounting for IPO year
  // Calculates cumulative returns from IPO year to the given year
  // If year < IPO year, returns purchase price (stock doesn't exist)
  // Otherwise returns actual historical market price from IPO year forward
  getStockPriceForYear: (symbol, year, purchasePrice, purchaseYear) => {
    const stock = stocks.find((s) => s.symbol === symbol);
    if (!stock) return purchasePrice;
    
    // If current year is before company's IPO, use purchase price (stock doesn't exist)
    if (year < stock.ipoYear) {
      return purchasePrice;
    }
    
    // Calculate cumulative price from IPO year to given year using historical data
    let price = 100; // Start with $100 at IPO
    for (let y = stock.ipoYear; y <= year; y++) {
      if (stockReturns[symbol] && stockReturns[symbol][y] !== undefined) {
        const returnRate = stockReturns[symbol][y];
        price = price * (1 + returnRate);
      }
    }
    return price;
  },

  // Calculate portfolio value (pre-tax)
  getPortfolioValue: (currentPrices = {}) => {
    const state = get();
    let total = state.cash;

    Object.entries(state.holdings).forEach(([symbol, lots]) => {
      if (lots && lots.length > 0) {
        const price = currentPrices[symbol] || lots[0].costBasis;
        lots.forEach((lot) => {
          total += lot.shares * price;
        });
      }
    });

    return total;
  },

  // Calculate portfolio value (after-tax)
  getAfterTaxPortfolioValue: (currentPrices = {}) => {
    const state = get();
    let preTaxValue = get().getPortfolioValue(currentPrices);

    // Calculate unrealized gains on current holdings
    let unrealizedGains = 0;
    Object.entries(state.holdings).forEach(([symbol, lots]) => {
      if (lots && lots.length > 0) {
        const price = currentPrices[symbol] || lots[0].costBasis;
        lots.forEach((lot) => {
          const gainPerShare = price - lot.costBasis;
          const gain = gainPerShare * lot.shares;

          const purchaseDate = new Date(lot.purchaseDate);
          const daysHeld = Math.floor((new Date() - purchaseDate) / (1000 * 60 * 60 * 24));
          const isLongTerm = daysHeld >= 365;

          if (isLongTerm) {
            unrealizedGains += gain * 0.85; // 15% tax
          } else {
            unrealizedGains += gain * 0.78; // 22% tax
          }
        });
      }
    });

    return Math.max(0, preTaxValue - (preTaxValue - unrealizedGains));
  },

  // Calculate portfolio analysis with realized vs unrealized holdings based on current year
  // Returns { realized, unrealized, total }
  // Realized: value of holdings for companies that have IPO'd in current year
  // Unrealized: value of holdings for companies that haven't IPO'd yet (worthless in past)
  getPortfolioAnalysis: (currentYear, currentPrices = {}) => {
    const state = get();
    let realized = state.cash; // Cash is always realized
    let unrealized = 0;

    Object.entries(state.holdings).forEach(([symbol, lots]) => {
      if (lots && lots.length > 0) {
        const isAvailable = state.isStockAvailable(symbol, currentYear);

        lots.forEach((lot) => {
          // Use stored purchaseYear, or fall back to extracting from purchaseDate for backwards compatibility
          const purchaseYear = lot.purchaseYear || new Date(lot.purchaseDate).getFullYear();
          const price = state.getStockPriceForYear(symbol, currentYear, lot.costBasis, purchaseYear);
          const lotValue = lot.shares * price;
          
          if (isAvailable) {
            realized += lotValue;
          } else {
            unrealized += lotValue;
          }
        });
      }
    });

    return {
      realized,
      unrealized,
      total: realized + unrealized,
    };
  },

  // Unlock a premium stock
  unlockStock: (symbol) => set((state) => {
    const newUnlocked = new Set(state.unlockedStocks);
    newUnlocked.add(symbol);
    return { unlockedStocks: newUnlocked };
  }),

  // Add achievement
  addAchievement: (achievement) => set((state) => {
    const newAchievements = new Set(state.achievements);
    newAchievements.add(achievement);
    const newUnlocked = getUnlockedStocks(newAchievements);
    return { 
      achievements: newAchievements,
      unlockedStocks: newUnlocked,
    };
  }),

  // Check and update achievements
  checkAndUpdateAchievements: () => set((state) => {
    const newAchievements = checkAchievements(state);
    const newUnlocked = getUnlockedStocks(newAchievements);
    return {
      achievements: newAchievements,
      unlockedStocks: newUnlocked,
    };
  }),

  // Check for stocks in pre-IPO years and return list to notify
  checkPreIPOStocks: (currentYear) => {
    const state = get();
    const preIPOStocks = [];
    
    Object.keys(state.holdings).forEach((symbol) => {
      const stock = stocks.find((s) => s.symbol === symbol);
      if (stock && currentYear < stock.ipoYear && !state.preIPOStocksNotified.has(symbol)) {
        preIPOStocks.push(symbol);
      }
    });
    
    if (preIPOStocks.length > 0) {
      set((state) => {
        const newNotified = new Set(state.preIPOStocksNotified);
        preIPOStocks.forEach((symbol) => newNotified.add(symbol));
        return { 
          preIPOStocksNotified: newNotified,
          notification: {
            type: 'warning',
            message: `You traveled to the past before the following investments existed so they have been reset to the purchase price: ${preIPOStocks.join(', ')}`
          }
        };
      });
    }
    
    return preIPOStocks;
  },

  // Clear notification
  clearNotification: () => set({ notification: null }),

  // Reset game
  resetGame: () => set({
    currentYear: null,
    currentHeadline: null,
    cash: 100,
    gameStarted: false,
    currentScreen: 'opening',
    selectedStock: null,
    yearsInvested: 0,
    travelCreditsUsed: 0,
    holdings: {},
    achievements: new Set(),
    preIPOStocksNotified: new Set(),
    taxState: {
      ytdShortTermGains: 0,
      ytdLongTermGains: 0,
      carryforwardLoss: 0,
      taxBracket: 'middle',
    },
  }),
    }),
    {
      name: 'stock-time-travel-game-state',
      partialize: (state) => ({
        // Only persist essential game state (do NOT persist portfolioValue - it should be calculated)
        currentYear: state.currentYear,
        currentHeadline: state.currentHeadline,
        cash: state.cash,
        yearsInvested: state.yearsInvested,
        timeTravelMode: state.timeTravelMode,
        currentSequentialYear: state.currentSequentialYear,
        travelCreditsUsed: state.travelCreditsUsed,
        holdings: state.holdings,
        taxState: state.taxState,
        unlockedStocks: Array.from(state.unlockedStocks),
        achievements: Array.from(state.achievements),
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        unlockedStocks: new Set(persistedState.unlockedStocks || []),
        achievements: new Set(persistedState.achievements || []),
      }),
    }
  )
);
