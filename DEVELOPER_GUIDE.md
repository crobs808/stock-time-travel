# Stock Market Time Travel - Developer Guide

## Zustand Store API

The game state is managed by a single Zustand store in `src/store/gameStore.js`. Here's the complete API:

### State Properties

```javascript
// Game state
currentYear: null              // Currently active year (1981-2020)
currentHeadline: string        // Market headline for current year
cash: number                   // Available cash balance
taxToggle: boolean             // Show tax impact on/off
gameStarted: boolean           // Game initialization flag
currentScreen: string          // Current UI screen
selectedStock: string          // Currently selected stock
yearsInvested: number          // Total years played

// Portfolio tracking (lot-based for FIFO)
holdings: {
  AAPL: [
    {
      id: string,              // Unique lot identifier
      shares: number,
      purchaseDate: "YYYY-MM-DD",
      costBasis: number        // Price per share at purchase
    },
    // ... more lots
  ],
  // ... more symbols
}

// Tax state
taxState: {
  ytdShortTermGains: number,   // Year-to-date short-term gains
  ytdLongTermGains: number,    // Year-to-date long-term gains
  carryforwardLoss: number,    // Tax loss carryforward
  taxBracket: 'budget'|'middle'|'high'
}

// Freemium system
unlockedStocks: Set<string>    // Unlocked stock symbols
achievements: Set<string>      // Completed achievements
```

### Actions (Methods)

#### Game Control
```javascript
startGame(taxBracket = 'middle')  // Initialize new game
resetGame()                        // Reset to opening screen
```

#### Navigation
```javascript
setCurrentScreen(screen)           // Update current screen
setSelectedStock(stock)            // Set active stock
```

#### Preferences
```javascript
setTaxToggle(toggle)               // Toggle tax view
setTaxBracket(bracket)             // Change tax bracket
```

#### Trading
```javascript
buyStock(symbol, shares, price)    // Purchase shares (updates holdings)
sellStock(symbol, shares)          // Sell shares (FIFO from oldest lot)
```

#### Year Advancement
```javascript
generateRandomYear()               // Pick random year 1981-2020
getPricesForYear(year)             // Get all stock prices for year
getCurrentPrice(symbol, year)      // Get price for one stock
applyAnnualReturns(returns)        // Apply returns to holdings
```

#### Achievements
```javascript
checkAndUpdateAchievements()       // Check & unlock new achievements
addAchievement(id)                 // Manually unlock achievement
```

### Usage Example

```javascript
import { useGameStore } from '../store/gameStore';

function MyComponent() {
  const {
    cash,
    holdings,
    currentYear,
    buyStock,
    sellStock,
    generateRandomYear,
    applyAnnualReturns,
  } = useGameStore();

  // Start new game
  useGameStore.getState().startGame('middle');

  // Buy shares
  buyStock('AAPL', 10, 150);  // 10 shares @ $150

  // Sell shares (FIFO)
  sellStock('AAPL', 5);  // Sells 5 oldest shares

  // Advance year
  const year = generateRandomYear();
  const prices = useGameStore.getState().getPricesForYear(year);
  applyAnnualReturns(prices);
}
```

---

## Tax Calculation API

Functions in `src/utils/taxCalculations.js`:

```javascript
// Calculate tax on capital gain
calculateCapitalGainsTax(gain, daysHeld, bracket = 'middle')
// Returns: tax amount
// bracket: 'budget' | 'middle' | 'high'

// Calculate tax on CD interest
calculateCDInterestTax(interest, bracket = 'middle')
// Returns: tax amount

// Calculate after-tax portfolio value
calculateAfterTaxValue(holdings, cash, currentPrices, bracket)
// Returns: portfolio value after taxes

// Get days held for a position
getDaysHeld(purchaseDate)
// Returns: number of days held

// Check if position qualifies for long-term rates
isLongTermGain(purchaseDate)
// Returns: boolean

// Format currency for display
formatCurrency(value)
// Returns: "$X,XXX.XX"

// Format percentage for display
formatPercent(value)
// Returns: "X.XX%"
```

### Tax Brackets

```javascript
export const TAX_BRACKETS = {
  budget: { 
    shortTerm: 0.12,   // 12% for < 1 year
    longTerm: 0.0      // 0% for ≥ 1 year
  },
  middle: { 
    shortTerm: 0.22,   // 22% for < 1 year
    longTerm: 0.15     // 15% for ≥ 1 year
  },
  high: { 
    shortTerm: 0.32,   // 32% for < 1 year
    longTerm: 0.20     // 20% for ≥ 1 year
  },
};
```

---

## Achievement System API

Functions in `src/utils/achievements.js`:

```javascript
// Get all achievement definitions
ACHIEVEMENTS = {
  FIRST_TRADE: { id, name, description, unlocks: [] },
  COMPLETE_1980S: { ... },
  // ... more achievements
}

// Check and return new achievements
checkAchievements(state)
// Returns: Set of achievement IDs earned

// Get unlocked stocks based on achievements
getUnlockedStocks(achievements)
// Returns: Set of unlocked stock symbols
```

### Achievement Definitions

Each achievement has:
```javascript
{
  id: string,              // Unique identifier
  name: string,            // Display name
  description: string,     // What player needs to do
  unlocks: [string, ...]   // Stock symbols unlocked
}
```

---

## Stock Data API

In `src/data/stockReturns.js`:

```javascript
// Annual returns by symbol and year
stockReturns = {
  AAPL: { 1981: 0.12, 1982: -0.05, ... },
  AMZN: { ... },
  // ... 13 stocks total
}

// Stock metadata
stocks = [
  { 
    symbol: "AAPL",
    name: "Apple",
    type: "stock",
    premium: false
  },
  // ... 13 stocks total
]
```

### Available Stocks

**Free Tier** (always available):
- AAPL, AMZN, MSFT, INTC, F, KO, VFINX, CD, Debt

**Premium** (unlock via achievements):
- FB (unlocks: COMPLETE_1980S)
- GOOGL (unlocks: COMPLETE_1980S)
- TSLA (unlocks: COMPLETE_1980S)
- NFLX (unlocks: COMPLETE_1990S)

### Return Format

Returns are annual decimals:
- `0.12` = +12% return
- `-0.05` = -5% return
- `0.00` = 0% return (not yet traded, pre-IPO)

---

## Component API

### BuyModal

Props:
```javascript
<BuyModal
  stock={{ symbol, name, type }}
  onClose={() => {}}
  currentPrice={number}
/>
```

Triggers `useGameStore().buyStock()` on purchase.

### SellModal

Props:
```javascript
<SellModal
  stock={{ symbol, name, type }}
  holdings={[{ id, shares, purchaseDate, costBasis }, ...]}
  onClose={() => {}}
  currentPrice={number}
/>
```

Triggers `useGameStore().sellStock()` on sale.
Shows tax impact when `taxToggle` is enabled.

### AchievementsPanel

Automatically displays unlocked achievements:
```javascript
<AchievementsPanel />
```

Self-contained - reads from store directly.

---

## Data Structure Examples

### Holdings Example

```javascript
holdings = {
  AAPL: [
    {
      id: "AAPL-1700000000000",
      shares: 10,
      purchaseDate: "2024-01-15",
      costBasis: 150.00
    },
    {
      id: "AAPL-1705000000000",
      shares: 5,
      purchaseDate: "2024-06-20",
      costBasis: 180.00
    }
  ],
  VFINX: [
    {
      id: "VFINX-1710000000000",
      shares: 0.5,
      purchaseDate: "2024-03-10",
      costBasis: 200.00
    }
  ]
}
```

### Tax Calculation Example

```javascript
// Position held for 400 days (long-term)
const purchaseDate = "2023-06-01";
const daysHeld = getDaysHeld(purchaseDate);  // ~400 days
const gain = 1000;  // $1,000 profit
const tax = calculateCapitalGainsTax(gain, daysHeld, 'middle');
// tax = 150 (15% of $1,000)
```

### Achievement Check Example

```javascript
const state = {
  yearsInvested: 20,
  holdings: { AAPL: [...], MSFT: [...] },
  achievements: new Set(['first_trade'])
};

const newAchievements = checkAchievements(state);
// If yearsInvested >= 16, adds 'complete_1990s'
// If yearsInvested >= 24, adds 'complete_2000s'
```

---

## Performance Notes

- Zustand updates are batched for efficiency
- FIFO selling scans lots only once during sale
- Tax calculations are memoized via component props
- No external API calls - fully client-side
- Portfolio valuations are instant

---

## Testing Notes

### Manual Testing Checklist
- [ ] Buy stock → Holdings update correctly
- [ ] Sell stock → FIFO applied (oldest first)
- [ ] Year advance → Returns applied to all holdings
- [ ] Tax toggle → Pre/after-tax values switch
- [ ] Achievement unlock → Stock becomes available
- [ ] New game → State resets, portfolio clears
- [ ] Responsive → Works on mobile/tablet/desktop

### Common Issues

**Insufficient funds error**: Check `cash > cost` before buying
**Sell failing**: Ensure stock symbol exists in holdings
**Tax not applying**: Verify `taxToggle` is enabled
**Achievements not unlocking**: Check achievement conditions in `src/utils/achievements.js`
