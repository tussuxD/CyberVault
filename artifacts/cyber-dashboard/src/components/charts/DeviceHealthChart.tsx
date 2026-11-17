import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DeviceHealthStats } from '@workspace/api-client-react';

interface DeviceHealthChartProps {
  data?: DeviceHealthStats;
  isLoading?: boolean;
}

const COLORS = {
  healthy: '#22C55E', // Green
  warning: '#F59E0B', // Yellow
  critical: '#EF4444', // Red
  offline: '#64748B', // Slate
};

export const DeviceHealthChart: React.FC<DeviceHealthChartProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return <div className="w-full h-[300px] flex items-center justify-center bg-black/20 rounded-xl border border-primary/10 animate-pulse" />;
  }

  const chartData = [
    { name: 'Healthy', value: data.healthy ?? 0, color: COLORS.healthy },
    { name: 'Warning', value: data.warning ?? 0, color: COLORS.warning },
    { name: 'Critical', value: data.critical ?? 0, color: COLORS.critical },
    { name: 'Offline', value: data.offline ?? 0, color: COLORS.offline },
  ].filter(item => item.value > 0);

  const total = chartData.reduce((acc, item) => acc + item.value, 0);

  if (total === 0) {
    return (
      <div className="w-full h-[300px] flex flex-col items-center justify-center text-center" role="status">
        <span className="text-3xl font-bold font-mono text-white">0</span>
        <span className="text-xs text-muted-foreground uppercase">Devices</span>
        <p className="text-sm text-muted-foreground mt-3">No devices have been registered yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#1E293B', borderRadius: '8px' }}
            itemStyle={{ color: '#F9FAFB' }}
            formatter={(value: number) => [`${value} devices (${Math.round((value/total)*100)}%)`, 'Count']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
        <span className="text-3xl font-bold font-mono text-white">{total}</span>
        <span className="text-xs text-muted-foreground uppercase">Devices</span>
      </div>
    </div>
  );
};