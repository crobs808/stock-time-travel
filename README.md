# Stock Market Time Travel

An educational stock investing game where you travel through time with $100 in starting capital and learn investment principles by trading real historical stocks (1981-2020).

## How to Play

1. **Start**: Choose a game mode (Sequential or Chaotic)
2. **Learn**: Read the Rules and Pro Tips
3. **Trade**: Buy and sell stocks through the dashboard
4. **Advance**: Travel through years and experience historical stock returns
5. **Achieve**: Unlock achievements as you play
6. **Finish**: Game ends after 39 travels or in Sequential mode at year 2020

## Game Modes

- **Sequential Mode**: Travel chronologically from 1981 to 2020
- **Chaotic Mode**: Jump to random years within 1981-2020

## Main Features

- **Dashboard**: View portfolio, cash balance, and available stocks
- **Stock Trading**: Click any stock to open the quick-trade modal with preset percentages (10%, 50%, 90%, MAX)
- **Investment Modal**: View all current holdings with gains/losses at a glance
- **Achievements**: Unlock badges through gameplay milestones
- **Tips System**: Get random investment tips while playing
- **Game Over States**: End screen shows your final performance status

## Stock Selection

- **Blue Chip Stocks**: AAPL, AMZN, MSFT, INTC, F, KO
- **Tech Leaders**: GOOGL, FB, TSLA, NFLX (premium unlock)
- **Index Fund**: VFINX
- **Fixed Income**: CD (Certificate of Deposit)

## Setup & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app uses:
- **React** for UI
- **Zustand** for state management with localStorage persistence
- **Vite** for bundling
- Real historical stock returns from 1981-2020

## Key Concepts

- **Time Travel Credits**: You have 39 travels before the game ends
- **Portfolio Tracking**: All holdings are preserved across travels
- **Real Returns**: Historical performance is calculated from actual stock data
- **Achievements**: Earn badges for specific gameplay accomplishments

## Special Note on Chaotic Mode Investment Valuation

In Chaotic Mode, stock prices are calculated from your **purchase date forward**, not from a fixed starting point (1981). Here's why:

**The Problem**: Without this logic, jumping backward in time would create phantom losses. For example:
- Buy Amazon in 1997 for $100
- Jump to 2005: Stock is worth $150 (great!)
- Jump back to 2000: Stock would incorrectly show as down 20% (based on 1981-2000 data)

**The Solution**: Stock values are always calculated from when **you purchased it**:
- Buy Amazon in 1997: Price = $100 × (1997 returns) × (1998 returns) × ... × (current year returns)
- Jump to 2000: Price = $100 × (1997→2000 returns only)
- Jump back to 1995 (before purchase): Shows purchase price ($100), treating it as if it hasn't been bought yet

This makes time jumping fair and intuitive—you only see returns that happened *after* your purchase date in the timeline, regardless of how you jump around temporally. The future hasn't happened yet, so previous losses from future years reset when you go back in time.
