import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwinStore } from '../store';
import { postProfile } from '../utils/api';

export default function Onboarding() {
  const navigate = useNavigate();
  const setUserProfile = useTwinStore(state => state.setUserProfile);
  const setTwinState = useTwinStore(state => state.setTwinState);
  
  const [formData, setFormData] = useState({
    income: '',
    expenses: '',
    variableSpend: '',
    emi: '',
    portfolioValue: '',
    emotionalChoice: 'Security'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const profile = {
        income: Number(formData.income),
        expenses: Number(formData.expenses),
        variableSpend: Number(formData.variableSpend),
        emi: Number(formData.emi),
        portfolioValue: Number(formData.portfolioValue),
        emotionalChoice: formData.emotionalChoice
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

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col items-center justify-center p-6 text-[#EEF2FF] font-sans">
      <div className="w-full max-w-md bg-[#0F1520] border border-white/5 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-[#00E5B8] text-[#080C14] rounded-xl flex items-center justify-center font-bold text-xl">FT</div>
          <h1 className="text-2xl font-bold">FinTwin</h1>
        </div>
        
        <h2 className="text-[16px] font-semibold mb-6 text-center text-[#566580] uppercase tracking-widest">Build Your Financial Twin</h2>
        
        {error && (
          <div className="bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 text-[#FF4D4D] text-sm p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-[#8A9BBF] mb-1">Monthly Income (₹)</label>
              <input required type="number" name="income" value={formData.income} onChange={handleChange} className="w-full bg-[#1A2235] border border-white/5 rounded-lg px-4 py-2.5 text-[14px] text-[#EEF2FF] outline-none focus:border-[#00E5B8]/50" />
            </div>
            <div>
              <label className="block text-[12px] text-[#8A9BBF] mb-1">Fixed Expenses (₹)</label>
              <input required type="number" name="expenses" value={formData.expenses} onChange={handleChange} className="w-full bg-[#1A2235] border border-white/5 rounded-lg px-4 py-2.5 text-[14px] text-[#EEF2FF] outline-none focus:border-[#00E5B8]/50" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-[#8A9BBF] mb-1">Variable Spend (₹)</label>
              <input required type="number" name="variableSpend" value={formData.variableSpend} onChange={handleChange} className="w-full bg-[#1A2235] border border-white/5 rounded-lg px-4 py-2.5 text-[14px] text-[#EEF2FF] outline-none focus:border-[#00E5B8]/50" />
            </div>
            <div>
              <label className="block text-[12px] text-[#8A9BBF] mb-1">Monthly EMI (₹)</label>
              <input required type="number" name="emi" value={formData.emi} onChange={handleChange} className="w-full bg-[#1A2235] border border-white/5 rounded-lg px-4 py-2.5 text-[14px] text-[#EEF2FF] outline-none focus:border-[#00E5B8]/50" />
            </div>
          </div>
          
          <div>
            <label className="block text-[12px] text-[#8A9BBF] mb-1">Current Portfolio Value (₹)</label>
            <input required type="number" name="portfolioValue" value={formData.portfolioValue} onChange={handleChange} className="w-full bg-[#1A2235] border border-white/5 rounded-lg px-4 py-2.5 text-[14px] text-[#EEF2FF] outline-none focus:border-[#00E5B8]/50" />
          </div>
          
          <div>
            <label className="block text-[12px] text-[#8A9BBF] mb-1">Primary Financial Drive</label>
            <select name="emotionalChoice" value={formData.emotionalChoice} onChange={handleChange} className="w-full bg-[#1A2235] border border-white/5 rounded-lg px-4 py-2.5 text-[14px] text-[#EEF2FF] outline-none focus:border-[#00E5B8]/50 appearance-none">
              <option value="Security">Security & Peace of Mind</option>
              <option value="Growth">Maximal Wealth Growth</option>
              <option value="Independence">Early Financial Independence</option>
              <option value="Balance">Balanced Lifestyle</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#00E5B8] hover:bg-[#00C29A] text-[#080C14] font-bold py-3.5 px-4 rounded-xl mt-6 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#080C14] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Initialize Twin →'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
