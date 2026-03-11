import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ChartCard from './ChartCard';

type Point = Record<string, any> & { name: string };

const LiquidLevelAreaChart: React.FC<{
  data?: Point[];
  controls?: React.ReactNode;
  title?: string;
  dataKey?: string;
}> = ({ data, controls, title = 'Liquid Level', dataKey = 'level' }) => {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title} subtitle="Real-time" rightControls={controls}>
        <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">No data</div>
      </ChartCard>
    );
  }
  return (
    <ChartCard title={title} subtitle="Real-time" rightControls={controls}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis
            dataKey="name"
            tick={false}
            height={0}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Area type="monotone" dataKey={dataKey} stroke="#F59E0B" fill="#FEF3C7" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default LiquidLevelAreaChart;
