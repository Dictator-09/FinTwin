import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwinStore } from '../store';
import Navbar from '../components/layout/Navbar';
import LoadingSkeleton from '../components/shared/LoadingSkeleton';
import MetricCard from '../components/shared/MetricCard';
import PersonalityCard from '../components/twin/PersonalityCard';
import TwinTimeline from '../components/twin/TwinTimeline';
import { formatINR } from '../utils/formatCurrency';
import { formatPercent } from '../utils/formatPercent';

export default function Dashboard() {
  const navigate = useNavigate();
  const twinState = useTwinStore((state) => state.twinState);
  const userProfile = useTwinStore((state) => state.userProfile) || {};

  if (!twinState) {
    return (
      <div className="min-h-screen bg-[#080C14] text-[#EEF2FF]">
        <Navbar />
        <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center mt-20">
          <div className="w-12 h-12 border-4 border-[#00E5B8] border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-semibold text-[#EEF2FF] mb-8">Your financial twin is being built...</h2>
          <div className="w-full max-w-2xl bg-[#0F1520] p-8 rounded-2xl border border-white/5">
            <LoadingSkeleton rows={5} height={24} />
          </div>
        </div>
      </div>
    );
  }

  const income = userProfile.income || 150000;
  const fixedExpenses = userProfile.expenses || 40000;
  const variableSpend = userProfile.variableSpend || 30000;
  const emis = userProfile.emi || 25000;
  const netSurplus = twinState.monthlyNetWorth || (income - fixedExpenses - variableSpend - emis);
  
  const equityPortfolio = userProfile.portfolioValue ? userProfile.portfolioValue * 0.7 : 1230000;
  const debtPortfolio = userProfile.portfolioValue ? userProfile.portfolioValue * 0.2 : 310000;
  const goldPortfolio = userProfile.portfolioValue ? userProfile.portfolioValue * 0.05 : 180000;
  const cryptoPortfolio = userProfile.portfolioValue ? userProfile.portfolioValue * 0.05 : 140000;
  const currentTotal = userProfile.portfolioValue || 1860000;
  const totalInvested = currentTotal * 0.76;

  return (
    <div className="min-h-screen bg-[#080C14] text-[#EEF2FF] font-sans pb-16">
      <Navbar />
      
      <div className="max-w-[1400px] mx-auto p-[32px]">
        <h1 className="text-2xl font-bold mb-6">Twin Dashboard</h1>
        
        <div className="flex flex-col lg:flex-row gap-[24px]">
          <div className="w-full lg:w-[60%] flex flex-col gap-6">
            <PersonalityCard twinState={twinState} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard 
                label="Net Worth"
                value={formatINR(twinState.estimatedNetWorth || currentTotal)}
                subtext="↑ +₹3,20,000 this year"
                subtextColor="green"
              />
              <MetricCard 
                label="Monthly Surplus"
                value={formatINR(netSurplus)}
                subtext="After all expenses & EMIs"
                subtextColor="muted"
              />
              <MetricCard 
                label="Savings Rate"
                value={formatPercent(twinState.savingsRate || 0)}
                subtext="↑ above your 25% target"
                subtextColor="green"
              />
              <MetricCard 
                label="Portfolio Health"
                value="74 / 100"
                subtext="Moderately Optimized"
                subtextColor="amber"
              />
            </div>

            <TwinTimeline />
          </div>

          <div className="w-full lg:w-[40%] flex flex-col gap-6">
            <div className="bg-[#0F1520] rounded-2xl p-6 border border-white/5 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-[#22D3A5] animate-pulse"></div>
                <h2 className="text-[#00E5B8] text-[11px] uppercase tracking-widest font-bold">Live Financial Snapshot</h2>
              </div>

              <div className="space-y-4 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-[#566580]">Monthly Income</span>
                  <span className="text-[#EEF2FF] font-medium">{formatINR(income)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#566580]">Fixed Expenses</span>
                  <span className="text-[#FF4D4D] font-medium">-{formatINR(fixedExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#566580]">Variable Spend</span>
                  <span className="text-[#F5A623] font-medium">-{formatINR(variableSpend)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#566580]">EMIs</span>
                  <span className="text-[#F5A623] font-medium">-{formatINR(emis)}</span>
                </div>
                
                <div className="border-b border-white/5 my-2"></div>
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#EEF2FF] font-semibold">Net Surplus</span>
                  <span className="text-[#00E5B8] font-bold text-[16px]">{formatINR(netSurplus)}</span>
                </div>

                <div className="border-b border-white/5 my-2"></div>

                <div className="flex justify-between">
                  <span className="text-[#566580]">Equity Portfolio</span>
                  <span className="text-[#EEF2FF] font-medium">{formatINR(equityPortfolio)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#566580]">Debt Portfolio</span>
                  <span className="text-[#EEF2FF] font-medium">{formatINR(debtPortfolio)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#566580]">Gold</span>
                  <span className="text-[#EEF2FF] font-medium">{formatINR(goldPortfolio)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#566580] flex items-center gap-2">Crypto <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div></span>
                  <span className="text-[#EEF2FF] font-medium">{formatINR(cryptoPortfolio)}</span>
                </div>

                <div className="border-b border-white/5 my-2"></div>
                
                <div className="flex justify-between">
                  <span className="text-[#566580]">Total Invested</span>
                  <span className="text-[#EEF2FF] font-medium">{formatINR(totalInvested)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#EEF2FF] font-semibold">Current Value</span>
                  <span className="text-[#22D3A5] font-bold text-[16px]">{formatINR(currentTotal)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-[#566580]">Total Returns</span>
                  <span className="text-[#22D3A5] font-semibold text-[13px] bg-[#22D3A5]/10 px-2 py-0.5 rounded">+₹5,70,000 (+31%)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate('/simulator')}
                className="w-full bg-[#00E5B8] hover:bg-[#00C29A] text-[#080C14] font-bold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Run Simulation <span className="text-lg">→</span>
              </button>
              <button 
                onClick={() => navigate('/')}
                className="w-full bg-transparent border border-[#566580] hover:border-[#8A9BBF] text-[#EEF2FF] hover:bg-white/5 font-semibold py-4 px-6 rounded-xl transition-all duration-200"
              >
                Update Twin Data
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
