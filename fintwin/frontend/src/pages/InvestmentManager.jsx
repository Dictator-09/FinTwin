import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTwinStore } from '../store';
import { getPortfolio } from '../utils/api';
import Navbar from '../components/layout/Navbar';
import MetricCard from '../components/shared/MetricCard';
import Badge from '../components/shared/Badge';
import { formatINR } from '../utils/formatCurrency';

export default function InvestmentManager() {
  const navigate = useNavigate();
  const portfolio = useTwinStore(state => state.portfolio) || [];
  const setPortfolio = useTwinStore(state => state.setPortfolio);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    if (!portfolio || portfolio.length === 0) {
      getPortfolio().then(res => {
        if (res && res.holdings) setPortfolio(res.holdings);
      }).catch(console.error);
    }
  }, [portfolio, setPortfolio]);

  const filteredPortfolio = portfolio.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.fundHouse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalInvested = portfolio.reduce((s, i) => s + i.costBasis, 0);
  const currentValue = portfolio.reduce((s, i) => s + i.currentValue, 0);
  
  const currentAlloc = [
    { name: 'Equity', value: 58, color: '#8B7FFF' },
    { name: 'Debt', value: 33, color: '#00E5B8' },
    { name: 'Gold', value: 7, color: '#F5A623' },
    { name: 'Crypto', value: 5, color: '#FF4D4D' }
  ];
  const recommendedAlloc = [
    { name: 'Equity', value: 65, color: '#8B7FFF' },
    { name: 'Debt', value: 30, color: '#00E5B8' },
    { name: 'Gold', value: 5, color: '#F5A623' },
    { name: 'Crypto', value: 0, color: '#FF4D4D' }
  ];

  return (
    <div className="min-h-screen bg-[#080C14] text-[#EEF2FF] font-sans pb-16">
      <Navbar />
      <div className="max-w-[1400px] mx-auto p-[32px]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Investment Manager</h1>
            <p className="text-[#566580] text-sm mt-1">Review your holdings and asset mix.</p>
          </div>
          <button 
            onClick={() => navigate('/rebalance')}
            className="bg-[#00E5B8] hover:bg-[#00C29A] text-[#080C14] font-bold py-2.5 px-6 rounded-xl transition-colors duration-200 flex items-center gap-2"
          >
            AI Rebalance →
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Invested" value={formatINR(totalInvested || 1840000)} />
          <MetricCard label="Current Value" value={formatINR(currentValue || 2410000)} subtext="+₹5,70,000" subtextColor="green" />
          <MetricCard label="XIRR" value="14.2%" subtext="Beat benchmark by 2%" subtextColor="green" />
          <MetricCard label="Risk Score" value="72 / 100" subtext="Moderately Aggressive" subtextColor="amber" />
        </div>

        <div className="flex flex-col lg:flex-row gap-[24px] items-start">
          {/* Left Column 58% */}
          <div className="w-full lg:w-[58%] border border-white/5 bg-[#0F1520] rounded-2xl p-6 shadow-xl gap-6 flex flex-col">
            <div className="flex justify-between items-center bg-[#141B28] p-2 rounded-xl border border-white/5">
              <input 
                type="text" 
                placeholder="Search holdings..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-[13px] text-[#EEF2FF] px-4 w-1/3 placeholder-[#566580]"
              />
              <div className="flex gap-2">
                {['All', 'Equity', 'Debt', 'Gold', 'Crypto'].map(f => (
                  <button 
                    key={f} 
                    onClick={() => setFilterType(f)}
                    className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${filterType === f ? 'bg-[#00E5B8] text-[#080C14]' : 'bg-transparent text-[#566580] hover:text-[#EEF2FF]'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#141B28] text-[11px] uppercase tracking-wider text-[#566580] border-b border-white/5">
                    <th className="py-3 px-4 rounded-tl-xl font-semibold">Asset</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold text-right">Value</th>
                    <th className="py-3 px-4 font-semibold text-center">Alloc%</th>
                    <th className="py-3 px-4 font-semibold text-right">CAGR</th>
                    <th className="py-3 px-4 rounded-tr-xl font-semibold">Health</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPortfolio.map((item, i) => {
                    const healthColor = item.health === 'Overexposed' ? '#FF4D4D' : item.health === 'Concentrated' ? '#F5A623' : '#22D3A5';
                    const cagrColor = item.cagr > 12 ? '#22D3A5' : item.cagr >= 7 ? '#F5A623' : '#FF4D4D';
                    
                    return (
                      <tr key={item.id || i} className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${item.health === 'Overexposed' ? 'bg-[#FF4D4D]/[0.03]' : ''}`} style={{ borderLeft: item.health === 'Overexposed' ? '2px solid #FF4D4D' : item.health === 'Concentrated' ? '2px solid #F5A623' : '2px solid transparent' }}>
                        <td className="py-4 px-4">
                          <div className="text-[13px] text-[#EEF2FF] font-medium">{item.name}</div>
                          <div className="text-[11px] text-[#566580] mt-0.5">{item.fundHouse}</div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge type={item.type.toLowerCase()} label={item.type} />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="text-[13px] text-[#EEF2FF] font-semibold">{formatINR(item.currentValue)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[12px] text-[#8A9BBF] font-medium">{item.allocation}%</span>
                            <div className="w-12 h-[3px] bg-[#1A2235] rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${item.allocation}%`, backgroundColor: currentAlloc.find(a => a.name === item.type)?.color || '#00E5B8' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="text-[13px] font-bold" style={{ color: cagrColor }}>{item.cagr}%</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: healthColor }}></div>
                            <span className="text-[11px] text-[#8A9BBF] font-medium">{item.health}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPortfolio.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-[#566580] text-sm">No holdings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column 42% */}
          <div className="w-full lg:w-[42%] flex flex-col gap-6">
            
            {/* Asset Allocation */}
            <div className="border border-white/5 bg-[#0F1520] rounded-2xl p-6 shadow-xl">
              <h3 className="text-[11px] uppercase tracking-widest text-[#00E5B8] font-bold mb-6">Current vs Recommended</h3>
              <div className="flex justify-around items-center h-[140px]">
                <div className="w-[130px] h-[130px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={currentAlloc} innerRadius={45} outerRadius={60} dataKey="value" stroke="none">
                        {currentAlloc.map((e, i) => <Cell key={`cell-${i}`} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[11px] text-[#566580] font-bold">CURRENT</span>
                  </div>
                </div>
                <div className="text-[#566580] text-2xl font-light">→</div>
                <div className="w-[130px] h-[130px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={recommendedAlloc} innerRadius={45} outerRadius={60} dataKey="value" stroke="none">
                        {recommendedAlloc.map((e, i) => <Cell key={`cell-${i}`} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[11px] text-[#00E5B8] font-bold">TARGET</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Badge type="equity" label="Eq: 58% → 65%" />
                <Badge type="debt" label="Db: 33% → 30%" />
                <Badge type="gold" label="Au: 7% → 5%" />
                <Badge type="crypto" label="Cr: 5% → 0%" />
              </div>
            </div>

            {/* Risk Score */}
            <div className="border border-white/5 bg-[#0F1520] rounded-2xl p-6 shadow-xl flex flex-col items-center">
              <h3 className="text-[14px] text-[#EEF2FF] font-semibold w-full mb-4">Portfolio Risk Profiler</h3>
              
              <div className="relative w-[200px] h-[100px] flex items-end justify-center mb-2 overflow-hidden">
                <svg viewBox="0 0 200 120" className="w-full">
                  <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeLinecap="round" />
                  <path 
                    d="M 20 110 A 80 80 0 0 1 180 110" 
                    fill="none" 
                    stroke="#F5A623" 
                    strokeWidth="12" 
                    strokeLinecap="round" 
                    strokeDasharray="251.2" 
                    strokeDashoffset="75.36" 
                  />
                </svg>
                <div className="absolute bottom-1 flex flex-col items-center">
                  <span className="text-[28px] font-bold text-[#EEF2FF]">72</span>
                  <span className="text-[11px] text-[#F5A623] font-semibold">Moderately Aggressive</span>
                </div>
              </div>

              <div className="w-full mt-6 space-y-3">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-[#8A9BBF]">Concentration Risk</span>
                  <span className="text-[#F5A623] font-semibold">68%</span>
                </div>
                <div className="w-full h-1 bg-[#1A2235] rounded-full"><div className="h-full bg-[#F5A623] rounded-full w-[68%]"></div></div>
                
                <div className="flex justify-between items-center text-[12px] pt-1">
                  <span className="text-[#8A9BBF]">Volatility Risk</span>
                  <span className="text-[#F5A623] font-semibold">71%</span>
                </div>
                <div className="w-full h-1 bg-[#1A2235] rounded-full"><div className="h-full bg-[#F5A623] rounded-full w-[71%]"></div></div>
                
                <div className="flex justify-between items-center text-[12px] pt-1">
                  <span className="text-[#8A9BBF]">Liquidity Risk</span>
                  <span className="text-[#22D3A5] font-semibold">45%</span>
                </div>
                <div className="w-full h-1 bg-[#1A2235] rounded-full"><div className="h-full bg-[#22D3A5] rounded-full w-[45%]"></div></div>
              </div>
            </div>

            {/* AI Quick Insight */}
            <div className="border border-white/5 bg-[#0F1520] rounded-2xl p-6 shadow-xl">
              <h3 className="text-[12px] uppercase tracking-widest text-[#00E5B8] font-bold mb-4 flex items-center gap-2">✦ AI Insights</h3>
              <ul className="text-[13px] text-[#8A9BBF] space-y-3 list-disc pl-4 mb-5">
                <li>Crypto allocation (5.8%) creates unnecessary drag to downside variance.</li>
                <li>Debt is heavily concentrated in PPF which restricts liquidity.</li>
                <li>Nifty 50 allocation forms a solid base but flexi-cap overlap reduces alpha.</li>
              </ul>
              <button 
                onClick={() => navigate('/rebalance')}
                className="text-[#00E5B8] text-[13px] font-semibold hover:text-[#22D3A5] transition-colors"
              >
                See full rebalance plan →
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
