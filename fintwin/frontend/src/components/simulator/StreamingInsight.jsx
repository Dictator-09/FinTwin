import React, { useState } from 'react';
import StreamingText from '../shared/StreamingText';

const StreamingInsight = ({ userProfile, twinState, simulationResult }) => {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const generateInsight = async () => {
    setIsStreaming(true);
    setHasStarted(true);
    setText('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationResult, userProfile, twinState })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              const token = parsed?.text || parsed?.delta?.text || parsed?.completion || '';
              if (token) setText(prev => prev + token);
            } catch {
              // If it's not JSON, try appending as plain text
              if (data && data !== '[DONE]') {
                setText(prev => prev + data);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Streaming error:', err);
      setText(prev => prev + '\n\n[Error generating insight]');
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="bg-[#0F1520] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[#00E5B8] text-lg">✦</span>
        <h2 className="text-[#EEF2FF] text-[14px] uppercase tracking-widest font-bold">AI Insight</h2>
      </div>

      {!hasStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-[#8A9BBF] text-sm mb-6">Generate personalized, deep insights based on your selected simulation scenario.</p>
          <button 
            onClick={generateInsight}
            className="bg-[#00E5B8]/10 hover:bg-[#00E5B8]/20 text-[#00E5B8] font-semibold py-2 px-6 rounded-lg transition-colors border border-[#00E5B8]/30"
          >
            Generate Insight →
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 text-[#8A9BBF] text-[13px] leading-relaxed overflow-y-auto pr-2 custom-scrollbar">
            <StreamingText text={text} isStreaming={isStreaming} />
          </div>
          
          {!isStreaming && text.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/5 flex gap-3">
              <span className="bg-[#FF4D4D]/10 text-[#FF4D4D] text-[11px] font-semibold px-3 py-1.5 rounded-full border border-[#FF4D4D]/20 cursor-pointer hover:bg-[#FF4D4D]/20">
                Cut fixed costs 15%
              </span>
              <span className="bg-[#22D3A5]/10 text-[#22D3A5] text-[11px] font-semibold px-3 py-1.5 rounded-full border border-[#22D3A5]/20 cursor-pointer hover:bg-[#22D3A5]/20">
                Add ₹60k side income
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StreamingInsight;

