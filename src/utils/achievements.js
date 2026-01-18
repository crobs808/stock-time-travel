// Achievement definitions and logic

export const ACHIEVEMENTS = {
  FIRST_TRADE: {
    id: 'first_trade',
    name: 'First Steps',
    description: 'Make your first stock purchase',
    unlocks: [],
  },
  COMPLETE_1980S: {
    id: 'complete_1980s',
    name: 'The Decade of Excess',
    description: 'Live through the entire 1980s (8+ years)',
    unlocks: ['FB', 'GOOGL', 'TSLA'],
  },
  COMPLETE_1990S: {
    id: 'complete_1990s',
    name: 'Dot-Com Era',
    description: 'Live through the 1990s (8+ years)',
    unlocks: ['NFLX'],
  },
  COMPLETE_2000S: {
    id: 'complete_2000s',
    name: 'New Millennium',
    description: 'Live through the 2000s (8+ years)',
    unlocks: [],
  },
  LONG_TERM_INVESTOR: {
    id: 'long_term_investor',
    name: 'Patient Investor',
    description: 'Hold a stock for over 1 year (365 days)',
    unlocks: [],
  },
  DIVERSIFIED: {
    id: 'diversified',
    name: 'Diversified Portfolio',
    description: 'Own at least 5 different stocks',
    unlocks: [],
  },
  PROFITABLE: {
    id: 'profitable',
    name: 'In the Green',
    description: 'Achieve a 50%+ portfolio gain',
    unlocks: [],
  },
  RECOVERY: {
    id: 'recovery',
    name: 'Market Recovery',
    description: 'Recover from a 50%+ loss',
    unlocks: [],
  },
  INDEX_FUN: {
    id: 'index_fun',
    name: 'Index Enthusiast',
    description: 'Invest in VFINX',
    unlocks: [],
  },
};

export const checkAchievements = (state) => {
  const newAchievements = new Set(state.achievements);
  const { holdings, yearsInvested, cash, currentYear } = state;

  // Check first trade
  if (Object.keys(holdings).length > 0 && !newAchievements.has('first_trade')) {
    newAchievements.add('first_trade');
  }

  // Check decade completions (simplified - just check years invested)
  if (yearsInvested >= 8 && !newAchievements.has('complete_1980s')) {
    newAchievements.add('complete_1980s');
  }
  if (yearsInvested >= 16 && !newAchievements.has('complete_1990s')) {
    newAchievements.add('complete_1990s');
  }
  if (yearsInvested >= 24 && !newAchievements.has('complete_2000s')) {
    newAchievements.add('complete_2000s');
  }

  // Check long-term holdings
  let hasLongTermHolding = false;
  Object.values(holdings).forEach((lots) => {
    if (lots) {
      lots.forEach((lot) => {
        const purchaseDate = new Date(lot.purchaseDate);
        const daysHeld = Math.floor((new Date() - purchaseDate) / (1000 * 60 * 60 * 24));
        if (daysHeld >= 365) {
          hasLongTermHolding = true;
        }
      });
    }
  });
  if (hasLongTermHolding && !newAchievements.has('long_term_investor')) {
    newAchievements.add('long_term_investor');
  }

  // Check diversification
  const uniqueStocks = Object.keys(holdings).length;
  if (uniqueStocks >= 5 && !newAchievements.has('diversified')) {
    newAchievements.add('diversified');
  }

  // Check index fund investment
  if (holdings['VFINX'] && !newAchievements.has('index_fun')) {
    newAchievements.add('index_fun');
  }

  return newAchievements;
};

export const getUnlockedStocks = (achievements) => {
  const unlockedStocks = new Set(['AAPL', 'AMZN', 'MSFT', 'INTC', 'F', 'KO', 'VFINX', 'CD', 'Debt']);
  
  achievements.forEach((achievement) => {
    const ach = Object.values(ACHIEVEMENTS).find((a) => a.id === achievement);
    if (ach && ach.unlocks.length > 0) {
      ach.unlocks.forEach((stock) => unlockedStocks.add(stock));
    }
  });

  return unlockedStocks;
};
