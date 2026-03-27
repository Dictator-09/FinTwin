import { Router } from 'express';

const router = Router();

const HARDCODED_PORTFOLIO = [
  { id:1, name:'Nifty 50 Index Fund', fundHouse:'Mirae Asset', type:'Equity', currentValue:580000, allocation:24.1, cagr:16.2, health:'Optimal', costBasis:420000 },
  { id:2, name:'HDFC Bank', fundHouse:'Direct Stock', type:'Equity', currentValue:240000, allocation:9.9, cagr:8.4, health:'Concentrated', costBasis:195000 },
  { id:3, name:'Parag Parikh Flexi Cap', fundHouse:'Mutual Fund', type:'Equity', currentValue:410000, allocation:17.0, cagr:18.7, health:'Excellent', costBasis:280000 },
  { id:4, name:'HDFC Short Duration Fund', fundHouse:'Debt Fund', type:'Debt', currentValue:310000, allocation:12.9, cagr:7.1, health:'Stable', costBasis:290000 },
  { id:5, name:'Sovereign Gold Bond', fundHouse:'Govt. Bond', type:'Gold', currentValue:180000, allocation:7.5, cagr:11.3, health:'Good hedge', costBasis:140000 },
  { id:6, name:'Bitcoin', fundHouse:'Crypto', type:'Crypto', currentValue:140000, allocation:5.8, cagr:62, health:'Overexposed', costBasis:90000 },
  { id:7, name:'PPF Account', fundHouse:'Tax-saving', type:'Debt', currentValue:450000, allocation:18.7, cagr:7.1, health:'Locked', costBasis:420000 }
];

router.get('/', (req, res) => {
  const totalValue = HARDCODED_PORTFOLIO.reduce((sum, item) => sum + item.currentValue, 0);
  const totalCost = HARDCODED_PORTFOLIO.reduce((sum, item) => sum + item.costBasis, 0);
  const totalGain = totalValue - totalCost;

  const allocationBreakdown = {
    equity: 0,
    debt: 0,
    gold: 0,
    crypto: 0
  };

  HARDCODED_PORTFOLIO.forEach(item => {
    const pct = (item.currentValue / totalValue) * 100;
    if (item.type === 'Equity') allocationBreakdown.equity += pct;
    else if (item.type === 'Debt') allocationBreakdown.debt += pct;
    else if (item.type === 'Gold') allocationBreakdown.gold += pct;
    else if (item.type === 'Crypto') allocationBreakdown.crypto += pct;
  });

  res.json({
    holdings: HARDCODED_PORTFOLIO,
    totalValue,
    totalGain,
    allocationBreakdown
  });
});

export default router;
