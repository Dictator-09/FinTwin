import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTwinStore } from '../store';
import { postSimulate } from '../utils/api';
import Navbar from '../components/layout/Navbar';
import ScenarioCard from '../components/simulator/ScenarioCard';
import PercentileBandsChart from '../components/simulator/PercentileBandsChart';
import StreamingInsight from '../components/simulator/StreamingInsight';
import { formatINR } from '../utils/formatCurrency';

const SCENARIOS = [
  { key: 'quitJob', name: 'Quit my job', description: 'Go full-time freelance or take a break' },
  { key: 'moveToBangalore', name: 'Move to Bangalore', description: 'Lower cost of living, career change' },
  { key: 'investInCrypto', name: 'Invest in Crypto', description: 'Allocate 20% of portfolio to BTC/ETH' }
];

export default function Simulator() {
  const [selectedScenario, setSelectedScenario] = useState('quitJob');
  const [isSimulating, setIsSimulating] = useState(false);
  const [horizonYears, setHorizonYears] = useState(15);
  
  const userProfile = useTwinStore(state => state.userProfile) || {};
  const twinState = useTwinStore(state => state.twinState) || {};
  const simulationResult = useTwinStore(state => state.simulationResult);
  const setSimulationResult = useTwinStore(state => state.setSimulationResult);

  const activeScenario = SCENARIOS.find(s => s.key === selectedScenario);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const result = await postSimulate(userProfile, selectedScenario);
      setSimulationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const compareData = [
    { name: 'Quit Job', value: 12500000 },
    { name: 'Bangalore', value: 18000000 },
    { name: 'Crypto', value: 24000000 }
  ];

  return (
    <div className="min-h-screen bg-[#080C14] text-[#EEF2FF] font-sans pb-16">
      <Navbar />
      
      <div className="max-w-[1600px] mx-auto p-[32px]">
        <div className="flex flex-col lg:flex-row gap-[24px] items-stretch">
          
          {/* Left Sidebar (260px) */}
          <div className="w-full lg:w-[260px] flex-shrink-0 flex flex-col gap-6">
            <div>
              <h1 className="text-[16px] font-semibold text-[#EEF2FF]">Run a Scenario</h1>
              <p className="text-[12px] text-[#566580] mt-1">Simulate any life decision.</p>
            </div>

            <div>
              <h3 className="text-[11px] uppercase tracking-widest text-[#566580] font-bold mb-4">Choose a scenario</h3>
              <div className="flex flex-col">
                {SCENARIOS.map(s => (
                  <ScenarioCard 
                    key={s.key} 
                    scenario={s} 
                    isSelected={selectedScenario === s.key}
                    onSelect={setSelectedScenario} 
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] uppercase tracking-widest text-[#566580] font-bold mb-4">Simulation Horizon</h3>
              <div className="relative pt-6 pb-2">
                <div className="absolute top-0 text-[11px] text-[#00E5B8] font-bold bg-[#00E5B8]/10 px-2 py-1 rounded transition-all"
                     style={{ left: `calc(${((horizonYears - 5) / 25) * 100}% - 20px)` }}>
                  {horizonYears} yrs
                </div>
                <input 
                  type="range" 
                  min="5" max="30" step="1" 
                  value={horizonYears} 
                  onChange={(e) => setHorizonYears(parseInt(e.target.value))}
                  className="w-full accent-[#00E5B8] h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: '#00E5B8' }}
                />
              </div>
            </div>

            <div>
              <h3 className="text-[11px] uppercase tracking-widest text-[#566580] font-bold mb-4">Scenario Parameters</h3>
              <div className="bg-[#0F1520] border border-white/5 rounded-xl p-4">
                <p className="text-[12px] text-[#8A9BBF] mb-4">{activeScenario?.description}</p>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#566580]">Risk Multiplier</span>
                    <span className="text-[#EEF2FF] font-semibold">{selectedScenario === 'investInCrypto' ? '3.5x' : '1.0x'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#566580]">Income Hit</span>
                    <span className="text-[#EEF2FF] font-semibold">{selectedScenario === 'quitJob' ? '-100% (6 mo)' : '0%'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <button 
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full bg-[#00E5B8] hover:bg-[#00C29A] text-[#080C14] font-bold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSimulating ? (
                  <div className="w-5 h-5 border-2 border-[#080C14] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Run Simulation <span className="text-lg">→</span></>
                )}
              </button>
              <p className="text-[11px] text-[#566580] text-center mt-3">10,000 Monte Carlo iterations</p>
            </div>
          </div>

          {/* Center (flex-1) */}
          <div className="flex-1 flex flex-col min-w-0 gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#EEF2FF]">Future Net Worth Projection</h2>
              <div className="flex items-center gap-4 text-[11px] font-semibold text-[#566580]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22D3A5]"></span> P90</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00E5B8]"></span> P50</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF4D4D]"></span> P10</span>
              </div>
            </div>

            {simulationResult ? (
              <div className="bg-[#0F1520] border border-white/5 rounded-2xl p-6 shadow-xl flex-1 flex flex-col min-h-[500px]">
                <PercentileBandsChart data={simulationResult} />
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-[#FF4D4D]/10">
                    <div className="text-[11px] text-[#566580] font-bold tracking-wider mb-1">DOWNSIDE (P10)</div>
                    <div className="text-[18px] text-[#FF4D4D] font-bold">{formatINR(simulationResult.p10[simulationResult.years.length - 1])}</div>
                    <div className="text-[11px] text-[#8A9BBF] mt-1">Worst case bounds</div>
                  </div>
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-[#00E5B8]/20">
                    <div className="text-[11px] text-[#566580] font-bold tracking-wider mb-1">EXPECTED (P50)</div>
                    <div className="text-[18px] text-[#00E5B8] font-bold">{formatINR(simulationResult.p50[simulationResult.years.length - 1])}</div>
                    <div className="text-[11px] text-[#8A9BBF] mt-1">Realistic outcome</div>
                  </div>
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-[#22D3A5]/10">
                    <div className="text-[11px] text-[#566580] font-bold tracking-wider mb-1">UPSIDE (P90)</div>
                    <div className="text-[18px] text-[#22D3A5] font-bold">{formatINR(simulationResult.p90[simulationResult.years.length - 1])}</div>
                    <div className="text-[11px] text-[#8A9BBF] mt-1">Best case scenario</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0F1520] border border-white/5 rounded-2xl shadow-xl flex-1 flex items-center justify-center min-h-[500px]">
                <p className="text-[#566580] text-sm">Select a scenario and click Run Simulation</p>
              </div>
            )}
          </div>

          {/* Right Panel (300px) */}
          <div className="w-full lg:w-[300px] flex-shrink-0 flex flex-col gap-6">
            {simulationResult && (
              <div className="h-[400px]">
                <StreamingInsight userProfile={userProfile} twinState={twinState} simulationResult={simulationResult} />
              </div>
            )}

            <div className="bg-[#0F1520] border border-white/5 rounded-2xl p-6 shadow-xl flex-1">
              <h3 className="text-[11px] uppercase tracking-widest text-[#566580] font-bold mb-6">Compare Scenarios</h3>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#566580', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(val) => `₹${val/100000}L`} tick={{ fill: '#566580', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      content={({ active, payload }) => {
                        if(active && payload && payload.length) {
                          return <div className="bg-[#080C14] border border-white/10 p-2 rounded text-xs text-white">
                            {formatINR(payload[0].value)}
                          </div>
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" fill="#00E5B8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-[#566580] text-center mt-4">Estimated 10yr median wealth</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
