import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AttackDistributionItem } from '@workspace/api-client-react';

interface AttackDistributionChartProps {
  data?: AttackDistributionItem[];
  isLoading?: boolean;
}

const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#06B6D4', '#8B5CF6'];

export const AttackDistributionChart: React.FC<AttackDistributionChartProps> = ({ data, isLoading }) => {
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
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={80}
            outerRadius={100}
            paddingAngle={5}
            dataKey="count"
            nameKey="type"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#1E293B', borderRadius: '8px' }}
            itemStyle={{ color: '#F9FAFB' }}
            formatter={(value: number, name: string, props: any) => [`${value} incidents (${props.payload.percentage}%)`, name]}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};