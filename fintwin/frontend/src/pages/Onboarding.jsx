import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwinStore } from '../store';
import { postProfile } from '../utils/api';

export default function Onboarding() {
  const navigate = useNavigate();
  const setUserProfile = useTwinStore(state => state.setUserProfile);
  const setTwinState = useTwinStore(state => state.setTwinState);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1: Basic (existing)
    income: '',
    expenses: '',
    variableSpend: '',
    emi: '',
    portfolioValue: '',
    emotionalChoice: 'Security',
    // Step 2: Cash Flow (new - Upgrade 2)
    monthlyIncome: '',
    monthlyExpenses: '',
    monthlyEMI: '',
    currentSavings: '',
    monthlyInvestment: '',
    employmentType: 'salaried',
    taxBracket: 30,
    dependents: 0,
    hasHealthInsurance: false,
    hasTermInsurance: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Sync step 1 fields with step 2 (if step 2 not yet filled)
  const syncFields = () => {
    setFormData(prev => ({
      ...prev,
      monthlyIncome: prev.monthlyIncome || prev.income,
      monthlyExpenses: prev.monthlyExpenses || prev.expenses,
      monthlyEMI: prev.monthlyEMI || prev.emi,
    }));
  };

  const surplus = useMemo(() => {
    const inc = Number(formData.monthlyIncome) || Number(formData.income) || 0;
    const exp = Number(formData.monthlyExpenses) || Number(formData.expenses) || 0;
    const emi = Number(formData.monthlyEMI) || Number(formData.emi) || 0;
    const inv = Number(formData.monthlyInvestment) || 0;
    return inc - exp - emi - inv;
  }, [formData]);

  const surplusColor = surplus >= 0 ? '#00E5B8' : '#FF4D4D';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const profile = {
        income: Number(formData.monthlyIncome || formData.income),
        expenses: Number(formData.monthlyExpenses || formData.expenses),
        variableSpend: Number(formData.variableSpend),
        emi: Number(formData.monthlyEMI || formData.emi),
        portfolioValue: Number(formData.portfolioValue),
        emotionalChoice: formData.emotionalChoice,
        // New fields
        monthlyIncome: Number(formData.monthlyIncome || formData.income),
        monthlyExpenses: Number(formData.monthlyExpenses || formData.expenses),
        monthlyEMI: Number(formData.monthlyEMI || formData.emi),
        currentSavings: Number(formData.currentSavings),
        monthlyInvestment: Number(formData.monthlyInvestment),
        employmentType: formData.employmentType,
        taxBracket: Number(formData.taxBracket),
        dependents: Number(formData.dependents),
        hasHealthInsurance: formData.hasHealthInsurance,
        hasTermInsurance: formData.hasTermInsurance,
      };
      
      setUserProfile(profile);
      
      const twinResult = await postProfile(profile);
      setTwinState(twinResult);
      
      navigate('/twin');
    } catch (err) {
      console.error(err);
      setError('Failed to generate your financial twin. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = "w-full bg-[#1A2235] border border-white/5 rounded-lg px-4 py-2.5 text-[14px] text-[#EEF2FF] outline-none focus:border-[#00E5B8]/50";

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col items-center justify-center p-6 text-[#EEF2FF] font-sans">
      <div className="w-full max-w-lg bg-[#0F1520] border border-white/5 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-10 h-10 bg-[#00E5B8] text-[#080C14] rounded-xl flex items-center justify-center font-bold text-xl">FT</div>
          <h1 className="text-2xl font-bold">FinTwin</h1>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0, 1].map(step => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${
                currentStep === step ? 'bg-[#00E5B8] text-[#080C14]' : currentStep > step ? 'bg-[#22D3A5]/20 text-[#22D3A5]' : 'bg-[#1A2235] text-[#566580]'
              }`}>
                {currentStep > step ? '✓' : step + 1}
              </div>
              {step < 1 && <div className={`w-12 h-[2px] ${currentStep > step ? 'bg-[#22D3A5]' : 'bg-[#1A2235]'}`} />}
            </div>
          ))}
        </div>
        
        <h2 className="text-[14px] font-semibold mb-4 text-center text-[#566580] uppercase tracking-widest">
          {currentStep === 0 ? 'Build Your Financial Twin' : 'Your Monthly Cash Flow'}
        </h2>
        
        {error && (
          <div className="bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 text-[#FF4D4D] text-sm p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[#8A9BBF] mb-1">Monthly Income (₹)</label>
                  <input required type="number" name="income" value={formData.income} onChange={handleChange} className={inputStyle} />
                </div>
                <div>
                  <label className="block text-[12px] text-[#8A9BBF] mb-1">Fixed Expenses (₹)</label>
                  <input required type="number" name="expenses" value={formData.expenses} onChange={handleChange} className={inputStyle} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[#8A9BBF] mb-1">Variable Spend (₹)</label>
                  <input required type="number" name="variableSpend" value={formData.variableSpend} onChange={handleChange} className={inputStyle} />
                </div>
                <div>
                  <label className="block text-[12px] text-[#8A9BBF] mb-1">Monthly EMI (₹)</label>
                  <input required type="number" name="emi" value={formData.emi} onChange={handleChange} className={inputStyle} />
                </div>
              </div>
              
              <div>
                <label className="block text-[12px] text-[#8A9BBF] mb-1">Current Portfolio Value (₹)</label>
                <input required type="number" name="portfolioValue" value={formData.portfolioValue} onChange={handleChange} className={inputStyle} />
              </div>
              
              <div>
                <label className="block text-[12px] text-[#8A9BBF] mb-1">Primary Financial Drive</label>
                <select name="emotionalChoice" value={formData.emotionalChoice} onChange={handleChange} className={inputStyle + " appearance-none"}>
                  <option value="Security">Security & Peace of Mind</option>
                  <option value="Growth">Maximal Wealth Growth</option>
                  <option value="Independence">Early Financial Independence</option>
                  <option value="Balance">Balanced Lifestyle</option>
                </select>
              </div>
              
              <button 
                type="button"
                onClick={() => { syncFields(); setCurrentStep(1); }}
                className="w-full bg-[#00E5B8] hover:bg-[#00C29A] text-[#080C14] font-bold py-3.5 px-4 rounded-xl mt-2 transition-colors flex items-center justify-center gap-2"
              >
                Next: Cash Flow Details →
              </button>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-transparent border border-[#566580] hover:bg-white/5 text-[#EEF2FF] font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#EEF2FF] border-t-transparent rounded-full animate-spin"></div>
                ) : 'Skip & Initialize Twin →'}
              </button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-[12px] text-[#8A9BBF] text-center mb-2">This powers all calculations — be as accurate as possible</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[#8A9BBF] mb-1">Monthly Take-Home (₹)</label>
                  <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} placeholder="e.g. 85000" className={inputStyle} />
                </div>
                <div>
                  <label className="block text-[12px] text-[#8A9BBF] mb-1">Fixed Expenses (₹)</label>
                  <input type="number" name="monthlyExpenses" value={formData.monthlyExpenses} onChange={handleChange} placeholder="Rent, groceries..." className={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[#8A9BBF] mb-1">Total EMIs (₹)</label>
                  <input type="number" name="monthlyEMI" value={formData.monthlyEMI} onChange={handleChange} placeholder="Home, car loan..." className={inputStyle} />
                </div>
                <div>
                  <label className="block text-[12px] text-[#8A9BBF] mb-1">Monthly SIP/Investment (₹)</label>
                  <input type="number" name="monthlyInvestment" value={formData.monthlyInvestment} onChange={handleChange} placeholder="Mutual funds, stocks..." className={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[#8A9BBF] mb-1">Tax Bracket (%)</label>
                  <select name="taxBracket" value={formData.taxBracket} onChange={handleChange} className={inputStyle + " appearance-none"}>
                    <option value={5}>5%</option>
                    <option value={20}>20%</option>
                    <option value={30}>30%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-[#8A9BBF] mb-1">Total Savings (₹)</label>
                  <input type="number" name="currentSavings" value={formData.currentSavings} onChange={handleChange} placeholder="FD, savings..." className={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[#8A9BBF] mb-1">Employment</label>
                  <select name="employmentType" value={formData.employmentType} onChange={handleChange} className={inputStyle + " appearance-none"}>
                    <option value="salaried">Salaried</option>
                    <option value="business">Business</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-[#8A9BBF] mb-1">Dependents</label>
                  <input type="number" name="dependents" value={formData.dependents} onChange={handleChange} min={0} className={inputStyle} />
                </div>
              </div>

              <div className="flex gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="hasHealthInsurance" checked={formData.hasHealthInsurance} onChange={handleChange} className="accent-[#00E5B8]" />
                  <span className="text-[12px] text-[#8A9BBF]">Health Insurance</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="hasTermInsurance" checked={formData.hasTermInsurance} onChange={handleChange} className="accent-[#00E5B8]" />
                  <span className="text-[12px] text-[#8A9BBF]">Term Insurance</span>
                </label>
              </div>

              {/* Live Surplus Preview */}
              <div className="bg-[#141B28] rounded-xl p-4 border border-white/5 flex justify-between items-center">
                <span className="text-[13px] text-[#8A9BBF]">Monthly Surplus:</span>
                <strong style={{ color: surplusColor, fontSize: '16px' }}>
                  ₹{surplus.toLocaleString('en-IN')}
                </strong>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(0)}
                  className="flex-1 bg-transparent border border-[#566580] text-[#EEF2FF] font-semibold py-3 px-4 rounded-xl transition-all hover:bg-white/5"
                >
                  ← Back
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#00E5B8] hover:bg-[#00C29A] text-[#080C14] font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[#080C14] border-t-transparent rounded-full animate-spin"></div>
                  ) : 'Initialize Twin →'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
