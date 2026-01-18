// Tax calculation utilities

export const TAX_BRACKETS = {
  budget: { shortTerm: 0.12, longTerm: 0.0 },
  middle: { shortTerm: 0.22, longTerm: 0.15 },
  high: { shortTerm: 0.32, longTerm: 0.20 },
};

export const calculateCapitalGainsTax = (gain, daysHeld, bracket = 'middle') => {
  if (gain <= 0) return 0; // No tax on losses
  const isLongTerm = daysHeld >= 365;
  const rate = isLongTerm ? TAX_BRACKETS[bracket].longTerm : TAX_BRACKETS[bracket].shortTerm;
  return gain * rate;
};

export const calculateCDInterestTax = (interest, bracket = 'middle') => {
  const rate = TAX_BRACKETS[bracket].shortTerm; // CD interest taxed as ordinary income
  return interest * rate;
};

export const calculateAfterTaxValue = (holdings, cash, currentPrices = {}, bracket = 'middle') => {
  let afterTaxValue = cash;

  Object.entries(holdings).forEach(([symbol, lots]) => {
    if (lots && lots.length > 0) {
      const price = currentPrices[symbol] || (lots[0]?.costBasis || 0);
      lots.forEach((lot) => {
        const currentValue = lot.shares * price;
        const costValue = lot.shares * lot.costBasis;
        const gain = currentValue - costValue;

        if (gain > 0) {
          const purchaseDate = new Date(lot.purchaseDate);
          const daysHeld = Math.floor((new Date() - purchaseDate) / (1000 * 60 * 60 * 24));
          const tax = calculateCapitalGainsTax(gain, daysHeld, bracket);
          afterTaxValue += currentValue - tax;
        } else {
          afterTaxValue += currentValue; // Losses don't reduce tax basis in simple model
        }
      });
    }
  });

  return Math.max(0, afterTaxValue);
};

export const getDaysHeld = (purchaseDate) => {
  const purchase = new Date(purchaseDate);
  const now = new Date();
  return Math.floor((now - purchase) / (1000 * 60 * 60 * 24));
};

export const isLongTermGain = (purchaseDate) => {
  return getDaysHeld(purchaseDate) >= 365;
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value) => {
  return `${(value * 100).toFixed(2)}%`;
};
