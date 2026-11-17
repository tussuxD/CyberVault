import React from 'react';
import { SecurityScoreData } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';

interface SecurityScoreGaugeProps {
  data?: SecurityScoreData;
  isLoading?: boolean;
}

export const SecurityScoreGauge: React.FC<SecurityScoreGaugeProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return <div className="w-full h-[300px] flex items-center justify-center bg-black/20 rounded-xl border border-primary/10 animate-pulse" />;
  }

  const score = data.score ?? 0;
  const grade = data.grade || 'A';
  
  // Determine color based on score
  let color = '#22C55E'; // Green
  let textClass = 'text-green-500';
  let shadowClass = 'shadow-[0_0_30px_rgba(34,197,94,0.3)]';
  
  if (score < 60) {
    color = '#EF4444'; // Red
    textClass = 'text-red-500';
    shadowClass = 'shadow-[0_0_30px_rgba(239,68,68,0.3)]';
  } else if (score < 80) {
    color = '#F59E0B'; // Yellow
    textClass = 'text-amber-500';
    shadowClass = 'shadow-[0_0_30px_rgba(245,158,11,0.3)]';
  }

  // Calculate SVG arc (180 degree half circle)
  const radius = 90;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="w-full h-[300px] flex flex-col items-center justify-center relative">
      <div className="relative w-[220px] h-[110px] overflow-hidden flex items-end justify-center mb-6">
        {/* Background track */}
        <svg viewBox="0 0 200 100" className="absolute top-0 w-full h-full transform scale-110 origin-bottom">
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="#1E293B"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Active track */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Score overlay */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-2">
          <span className={cn("text-5xl font-black font-mono tracking-tighter leading-none mb-1", textClass, "drop-shadow-[0_0_15px_currentColor]")}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">System Score</span>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border font-black text-2xl bg-black/40", textClass, shadowClass)}>
          {grade}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold">Grade Definition</span>
          <span className="text-xs text-muted-foreground">{score >= 80 ? 'Optimal Security' : score >= 60 ? 'Needs Attention' : 'Critical Risk'}</span>
        </div>
      </div>
    </div>
  );
};