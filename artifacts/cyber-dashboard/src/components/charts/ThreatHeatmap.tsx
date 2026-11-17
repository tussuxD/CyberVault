import React from 'react';
import { HeatmapCell } from '@workspace/api-client-react';

interface ThreatHeatmapProps {
  data?: HeatmapCell[];
  isLoading?: boolean;
}

export const ThreatHeatmap: React.FC<ThreatHeatmapProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return <div className="w-full h-[400px] flex items-center justify-center bg-black/20 rounded-xl border border-primary/10 animate-pulse" />;
  }

  const heatmapData = data;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }).map((_, i) => `${i}:00`);

  // Helper to determine cell color based on value
  const getCellColor = (value: number) => {
    if (value === 0) return 'bg-[#1E293B]';
    if (value < 20) return 'bg-blue-900/50';
    if (value < 40) return 'bg-blue-800/80';
    if (value < 60) return 'bg-blue-600';
    if (value < 80) return 'bg-cyan-500';
    return 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]';
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* X-axis (Hours) */}
        <div className="flex ml-12 mb-2">
          {hours.map((hour, i) => (
            <div key={i} className="flex-1 text-[10px] text-muted-foreground text-center transform -rotate-45 origin-bottom-left pb-2">
              {hour}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex flex-col gap-1">
          {days.map((day, dIdx) => (
            <div key={day} className="flex gap-1 items-center">
              <div className="w-10 text-xs text-muted-foreground font-medium text-right pr-2">
                {day}
              </div>
              <div className="flex flex-1 gap-1">
                {Array.from({ length: 24 }).map((_, hIdx) => {
                  const cell = heatmapData.find(c => c.day === dIdx && c.hour === hIdx);
                  const value = cell ? cell.value : 0;
                  return (
                    <div 
                      key={`${dIdx}-${hIdx}`} 
                      className={`flex-1 aspect-square rounded-sm ${getCellColor(value)} transition-colors hover:ring-2 hover:ring-white/50 relative group`}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none transition-opacity">
                        {value} threats at {day} {hIdx}:00
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-6 text-xs text-muted-foreground">
          <span>Low</span>
          <div className="w-3 h-3 rounded-sm bg-[#1E293B]"></div>
          <div className="w-3 h-3 rounded-sm bg-blue-900/50"></div>
          <div className="w-3 h-3 rounded-sm bg-blue-600"></div>
          <div className="w-3 h-3 rounded-sm bg-cyan-500"></div>
          <div className="w-3 h-3 rounded-sm bg-cyan-400"></div>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};