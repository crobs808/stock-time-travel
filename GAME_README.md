# Stock Market Time Travel

A fun, educational stock investing game where you travel back in time with $100 and learn financial lessons through real historical stock returns!

## Features

### Core Gameplay
- **$100 Starting Capital**: Begin each game with fake money to invest
- **Time Travel Mechanic**: Advance through random years (1981-2020) and experience real historical stock returns
- **13 Investment Options**:
  - Blue-chip stocks: AAPL, AMZN, MSFT, INTC, F, KO
  - Tech unicorns (premium): FB, GOOGL, TSLA, NFLX
  - Index fund: VFINX (Vanguard S&P 500)
  - Fixed income: CD (Certificate of Deposit)
  - Liability: Credit Card Debt (negative returns)

### Investment Features
- **Real Tax Simulation**: US federal capital gains taxes
  - Short-term gains (< 1 year): 22% tax
  - Long-term gains (≥ 1 year): 15% tax
  - CD interest: Taxed as ordinary income
- **FIFO Lot Tracking**: Automatic oldest-shares-first selling for tax optimization
- **Tax Toggle**: Switch between pre-tax and after-tax portfolio values to see tax impact
- **Detailed Portfolio**: View holdings by purchase lot with dates and cost basis

### Educational Game Mechanics
- **Achievements System**: Unlock premium stocks through gameplay milestones:
  - First Steps (make first trade)
  - The Decade of Excess (8+ years)
  - Dot-Com Era (16+ years)
  - New Millennium (24+ years)
  - Patient Investor (1-year holding period)
  - Diversified Portfolio (5+ stocks)
  - In the Green (50% portfolio gain)
  - Index Enthusiast (invest in VFINX)

- **Performance Tracking**: Track total gain/loss percentage and compare to historical benchmarks

### Built-in Lessons
1. **Don't invest money you cannot afford to lose** - Debt option shows negative returns
2. **Index funds outperform most individual stocks** - VFINX historically beats others
3. **Diversification reduces risk** - Multiple uncorrelated holdings
4. **Time in market beats market timing** - Long-term investing leads to better returns
5. **Taxes significantly impact returns** - Toggle shows real-world tax drag

## Getting Started

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs on `http://localhost:5173/`

### Building for Production
```bash
npm run build

# Preview production build
npm run preview
```

## How to Play

1. **Opening Screen**: Start a new game
2. **Rules & Pro Tips**: Learn the basics
3. **Game Dashboard**: 
   - View your portfolio stats
   - See random historical headlines
   - Buy/sell stocks by clicking cards
4. **Stock Detail Page**:
   - View current holdings and gains/losses
   - See lot-by-lot breakdown for tax purposes
   - Trade stocks with instant tax calculations
5. **Year Advancement**: Click the "Advance to Random Year" button to jump to a random year and apply that year's historical returns to your portfolio

## Project Structure

```
src/
├── components/          # React components (modals, cards, panels)
├── pages/              # Screen pages (Opening, Rules, Dashboard, etc.)
├── store/              # Zustand state management
├── data/               # Historical stock data and headlines
├── styles/             # CSS for each component/page
├── utils/              # Tax calculations and achievements
└── App.jsx             # Main app with routing
```

## Data & Returns

- **Historical Data**: Annual returns for 1981-2020 from real stock performance
- **Headlines**: Placeholder system ready for ~40 headlines per year from ChatGPT
- **Base Price**: Assumed $100 starting price; returns calculated from there

## Customization

### Adding Headlines
Headlines are loaded from `src/data/headlines.js`. Format:
```javascript
export const headlines = {
  1981: [
    { date: "1981-01-01", headline: "Text here", category: "type", impact: "bullish|bearish" },
  ],
  // ... more years
};
```

### Adjusting Tax Rates
Edit `src/utils/taxCalculations.js` to change brackets:
```javascript
export const TAX_BRACKETS = {
  budget: { shortTerm: 0.12, longTerm: 0.0 },
  middle: { shortTerm: 0.22, longTerm: 0.15 },
  high: { shortTerm: 0.32, longTerm: 0.20 },
};
```

### Modifying Stock Data
Edit `src/data/stockReturns.js` to add new stocks or adjust returns:
```javascript
export const stocks = [
  { symbol: "AAPL", name: "Apple", type: "stock", premium: false },
  // ...
];
```

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Zustand** - State management
- **React Router** - Navigation
- **CSS3** - Styling with gradients and animations

## License

Apache 2.0 (see LICENSE file)

## Contributing

This is an educational game. Contributions for:
- Adding more historical data (1960-1981)
- Creating additional stocks/ETFs
- Generating more headlines
- Improving UI/UX
- Adding more achievements

...are welcome! Please submit issues or pull requests to the repository.

## Future Enhancements

- [ ] Headline display with real/generated historical events
- [ ] Portfolio benchmarking against S&P 500
- [ ] Multi-player leaderboards
- [ ] Dividend tracking
- [ ] More sophisticated tax scenarios
- [ ] Options trading (advanced)
- [ ] Mobile app version
- [ ] Deployment to Vercel/Netlify
