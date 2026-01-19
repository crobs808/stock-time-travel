import { create } from 'zustand';
import { checkAchievements, getUnlockedStocks } from '../utils/achievements';
import headlinesData from '../data/headlines.json';
import { stockReturns, stocks } from '../data/stockReturns';

export const useGameStore = create((set, get) => ({
  // Game state
  currentYear: null,
  currentHeadline: null,
  cash: 100,
  gameStarted: false,
  currentScreen: 'opening', // opening, mode-selection, rules, pro-tips, game, stock-detail
  selectedStock: null,
  yearsInvested: 0,
  timeTravelMode: null, // 'sequential' or 'chaotic'
  currentSequentialYear: 1981, // For sequential mode tracking

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

      // Calculate proceeds with year-aware pricing
      const purchaseYear = new Date(lot.purchaseDate).getFullYear();
      const get = useGameStore.getState();
      const yearAwarePrice = get.getStockPriceForYear(symbol, state.currentYear, lot.costBasis, purchaseYear);
      const price = currentPrice || yearAwarePrice || lot.costBasis;
      const proceeds = sharesToSellFromLot * price;
      totalProceeds += proceeds;

      // Track gain/loss
      const gain = (price - lot.costBasis) * sharesToSellFromLot;
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
    const newHoldings = { ...state.holdings };
    let newCash = state.cash;

    Object.entries(newHoldings).forEach(([symbol, lots]) => {
      if (lots && lots.length > 0 && returns[symbol] !== undefined) {
        const returnRate = returns[symbol];
        
        lots.forEach((lot) => {
          // Update cost basis to reflect returns (simulating growth)
          const oldValue = lot.shares * lot.costBasis;
          const newValue = oldValue * (1 + returnRate);
          const newCostBasis = newValue / lot.shares;
          
          lot.costBasis = newCostBasis;
        });
      }
    });

    return {
      holdings: newHoldings,
      cash: newCash,
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
      if (stockReturns[symbol][year]) {
        const returnRate = stockReturns[symbol][year];
        prices[symbol] = 100 * (1 + returnRate);
      }
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
  // If year < IPO year, returns purchase price (frozen)
  // Otherwise returns calculated price based on returns
  getStockPriceForYear: (symbol, year, purchasePrice, purchaseYear) => {
    const stock = stocks.find((s) => s.symbol === symbol);
    if (!stock) return purchasePrice;
    
    // If current year is before company's IPO, use purchase price (frozen)
    if (year < stock.ipoYear) {
      return purchasePrice;
    }
    
    // If current year is before purchase year, use purchase price
    if (year < purchaseYear) {
      return purchasePrice;
    }
    
    // Otherwise calculate price based on returns for this year
    if (stockReturns[symbol] && stockReturns[symbol][year]) {
      const returnRate = stockReturns[symbol][year];
      return 100 * (1 + returnRate);
    }
    
    return purchasePrice;
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

  // Reset game
  resetGame: () => set({
    currentYear: null,
    currentHeadline: null,
    cash: 100,
    gameStarted: false,
    currentScreen: 'opening',
    selectedStock: null,
    yearsInvested: 0,
    holdings: {},
    taxState: {
      ytdShortTermGains: 0,
      ytdLongTermGains: 0,
      carryforwardLoss: 0,
      taxBracket: 'middle',
    },
  }),
}));
