import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ThreatTrendPoint } from '@workspace/api-client-react';

interface ThreatTrendsChartProps {
  data?: ThreatTrendPoint[];
  isLoading?: boolean;
}

export const ThreatTrendsChart: React.FC<ThreatTrendsChartProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return <div className="w-full h-[300px] flex items-center justify-center bg-black/20 rounded-xl border border-primary/10 animate-pulse" />;
  }

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No saved alerts for this chart.</p>;
  }
  const chartData = data;

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#64748B" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => {
              const date = new Date(val);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis 
            stroke="#64748B" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#1E293B', borderRadius: '8px' }}
            itemStyle={{ color: '#F9FAFB' }}
            labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
            cursor={{ fill: '#1E293B' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar dataKey="critical" name="Critical" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
          <Bar dataKey="high" name="High" stackId="a" fill="#F59E0B" />
          <Bar dataKey="medium" name="Medium" stackId="a" fill="#EAB308" />
          <Bar dataKey="low" name="Low" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};