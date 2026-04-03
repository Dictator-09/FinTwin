import React, { useState, useEffect, useRef } from 'react';
import StreamingText from '../shared/StreamingText';

const StreamingInsight = ({ userProfile, twinState, simulationResult }) => {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const prevResultRef = useRef(null);

  // Auto-reset and re-generate when simulationResult changes
  useEffect(() => {
    if (!simulationResult) return;
    // Skip if it's the exact same object reference
    if (prevResultRef.current === simulationResult) return;
    prevResultRef.current = simulationResult;

    // Auto-generate insight for every new simulation run
    generateInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationResult]);

  const generateInsight = async () => {
    setIsStreaming(true);
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-[#00E5B8] text-lg">✦</span>
          <h2 className="text-[#EEF2FF] text-[14px] uppercase tracking-widest font-bold">AI Insight</h2>
        </div>
        {text.length > 0 && !isStreaming && (
          <button
            onClick={generateInsight}
            className="text-[#566580] hover:text-[#00E5B8] text-[11px] font-semibold transition-colors"
          >
            ↻ Regenerate
          </button>
        )}
      </div>

      {!simulationResult ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-[#8A9BBF] text-sm">Run a simulation to generate AI insights.</p>
        </div>
      ) : isStreaming || text.length > 0 ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 text-[#8A9BBF] text-[13px] leading-relaxed overflow-y-auto pr-2 custom-scrollbar">
            <StreamingText text={text} isStreaming={isStreaming} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-5 h-5 border-2 border-[#00E5B8] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#566580] text-sm mt-3">Analyzing your scenario...</p>
        </div>
      )}
    </div>
  );
};

export default StreamingInsight;
