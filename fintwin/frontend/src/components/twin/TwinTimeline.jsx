import React from 'react';

const TwinTimeline = ({ profile = {}, simulationResult = null }) => {
  const currentAge = Number(profile.age) || 28;
  const retirementAge = Number(profile.retirementAge) || 60;
  const currentYear = new Date().getFullYear();
  
  const milestones = [
    { label: 'Started investing', subtitle: `Age ${Math.max(22, currentAge - 5)}`, status: 'past' },
    { label: `NOW — Age ${currentAge}`, subtitle: 'Current', status: 'current' }
  ];

  let firstCroreYear = currentYear + 3;
  let firstCroreProb = '50%';
  let fiYear = currentYear + 10;
  let fiProb = '40%';

  if (simulationResult && simulationResult.timeline) {
    const timeline = simulationResult.timeline;
    
    // First Crore target
    const croreIdx = timeline.findIndex(t => t.p50 >= 10000000);
    if (croreIdx !== -1) {
      firstCroreYear = currentYear + croreIdx;
      firstCroreProb = timeline[croreIdx].p90 >= 10000000 ? '90%+' : '75%';
    } else {
      firstCroreYear = currentYear + timeline.length;
      firstCroreProb = '<10%';
    }

    // FI target = 300x monthly expenses
    const monthlyExpenses = Number(profile.expenses || profile.monthlyExpenses || 50000);
    const fiTarget = monthlyExpenses * 300;
    const fiIdx = timeline.findIndex(t => t.p50 >= fiTarget);
    if (fiIdx !== -1) {
      fiYear = currentYear + fiIdx;
      fiProb = timeline[fiIdx].p90 >= fiTarget ? '80%' : '55%';
    } else {
      fiYear = currentYear + timeline.length;
      fiProb = '<5%';
    }
  }

  milestones.push({ label: 'First Crore', subtitle: `${firstCroreYear}`, status: 'future', prob: firstCroreProb });
  if (fiYear > firstCroreYear) {
    milestones.push({ label: 'Financial Independence', subtitle: `${fiYear}`, status: 'future', prob: fiProb });
  }
  milestones.push({ label: 'Retirement Phase', subtitle: `Age ${retirementAge}`, status: 'future', prob: 'High' });


  return (
    <div className="rounded-2xl p-8 border border-white/5 relative overflow-hidden shadow-lg mt-6" style={{ backgroundColor: '#0F1520' }}>
      <h3 className="text-[#EEF2FF] font-semibold mb-10 text-lg flex items-center gap-2">
        <span className="text-[#00E5B8]">●</span> Financial Lifeline
      </h3>
      <div className="relative flex items-start justify-between w-full pb-2 overflow-x-auto scroller-hide">
        <div className="absolute top-4 left-0 w-[100%] min-w-[600px] h-0.5 bg-[#1F2937]" style={{ zIndex: 0 }}></div>
        <div className="absolute top-4 left-0 h-0.5 min-w-[600px]" style={{ width: '45%', backgroundColor: '#00E5B8', zIndex: 1 }}></div>

        {milestones.map((m, i) => (
          <div key={i} className="flex flex-col items-center relative min-w-[90px]" style={{ zIndex: 10 }}>
            {m.status === 'past' && (
              <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center mb-3 transition-transform hover:scale-110">
                <span className="text-gray-400 text-xs">✓</span>
              </div>
            )}
            {m.status === 'current' && (
              <div className="w-8 h-8 rounded-full bg-[#00E5B8] shadow-[0_0_15px_rgba(0,229,184,0.5)] flex items-center justify-center mb-3 ring-4 ring-[#00E5B8]/20">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
            {m.status === 'future' && (
              <div className="w-8 h-8 rounded-full border-2 border-[#00E5B8] border-dashed bg-[#0F1520] flex items-center justify-center mb-3 transition-transform hover:scale-110">
                <span className="text-[#00E5B8] text-xs font-bold">?</span>
              </div>
            )}
            <div className="text-center">
              <div className={`text-[11px] font-semibold whitespace-nowrap ${m.status === 'current' ? 'text-[#00E5B8]' : 'text-[#EEF2FF]'}`}>
                {m.label}
              </div>
              <div className="text-[10px] text-[#566580] mt-1 uppercase tracking-wider">{m.subtitle}</div>
              {m.prob && (
                <div className="text-[10px] text-[#00B28F] mt-1.5 font-bold bg-[#00E5B8]/10 rounded px-1.5 py-0.5 inline-block">{m.prob} Prob</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .scroller-hide::-webkit-scrollbar { display: none; }
        .scroller-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default TwinTimeline;
