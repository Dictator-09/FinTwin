import React from 'react';

const TwinTimeline = () => {
  const milestones = [
    { label: 'Started investing', subtitle: 'Age 22', status: 'past' },
    { label: 'Emergency fund', subtitle: 'Age 25', status: 'past' },
    { label: 'First 10L', subtitle: 'Age 27', status: 'past' },
    { label: 'NOW — Age 28', subtitle: 'Current', status: 'current' },
    { label: 'First Crore', subtitle: '2029', status: 'future', prob: '84%' },
    { label: 'Home Purchase', subtitle: '2031', status: 'future', prob: '62%' },
    { label: 'Financial Independence', subtitle: '2041', status: 'future', prob: '41%' }
  ];

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
