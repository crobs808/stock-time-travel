import { create } from 'zustand';
import { checkAchievements, getUnlockedStocks } from '../utils/achievements';
import headlinesData from '../data/headlines.json';
import { stockReturns } from '../data/stockReturns';

export const useGameStore = create((set, get) => ({
  // Game state
  currentYear: null,
  currentHeadline: null,
  cash: 100,
  gameStarted: false,
  currentScreen: 'opening', // opening, rules, pro-tips, game, stock-detail
  selectedStock: null,
  yearsInvested: 0,

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

  // Headlines loaded from JSON
  headlines: headlinesData,

  // Actions
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setSelectedStock: (stock) => set({ selectedStock: stock }),
  setTaxBracket: (bracket) => set((state) => ({
    taxState: { ...state.taxState, taxBracket: bracket },
  })),

  // Start a new game
  startGame: (taxBracket = 'middle') => set((state) => {
    const year = Math.floor(Math.random() * 40) + 1981; // 1981 to 2020
    const yearHeadlines = headlinesData[year.toString()] || [];
    const randomHeadline = yearHeadlines.length > 0 
      ? yearHeadlines[Math.floor(Math.random() * yearHeadlines.length)]
      : `Year ${year}: A significant year for the stock market`;
    
    return {
      gameStarted: true,
      currentScreen: 'game',
      cash: 100,
      currentYear: year,
      currentHeadline: randomHeadline,
      holdings: {},
      yearsInvested: 1,
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
    const year = Math.floor(Math.random() * 40) + 1981; // 1981 to 2020
    set((state) => ({
      currentYear: year,
      yearsInvested: state.yearsInvested + 1,
    }));
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
  sellStock: (symbol, shares) => set((state) => {
    const lots = state.holdings[symbol];
    if (!lots || lots.length === 0) return state;

    let sharesToSell = shares;
    let totalProceeds = 0;
    let lotsToRemove = [];
    let updatedLots = [...lots];

    for (let i = 0; i < updatedLots.length && sharesToSell > 0; i++) {
      const lot = updatedLots[i];
      const sharesToSellFromLot = Math.min(sharesToSell, lot.shares);

      // Calculate proceeds and tax liability
      const currentPrice = state.holdings._currentPrices?.[symbol] || lot.costBasis;
      const proceeds = sharesToSellFromLot * currentPrice;
      totalProceeds += proceeds;

      // Track gain/loss
      const gain = (currentPrice - lot.costBasis) * sharesToSellFromLot;
      const purchaseDate = new Date(lot.purchaseDate);
      const saleDate = new Date();
      const daysHeld = Math.floor((saleDate - purchaseDate) / (1000 * 60 * 60 * 24));
      const isLongTerm = daysHeld >= 365;

      if (isLongTerm) {
        state.taxState.ytdLongTermGains += gain;
      } else {
        state.taxState.ytdShortTermGains += gain;
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
