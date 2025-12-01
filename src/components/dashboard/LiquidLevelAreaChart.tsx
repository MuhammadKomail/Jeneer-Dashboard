import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ChartCard from './ChartCard';

const data = Array.from({ length: 30 }).map((_, i) => ({
  name: `Jul ${i + 1}`,
  level: Math.max(0, Math.round(6 - i * 0.08 + Math.sin(i / 4))),
}));

const LiquidLevelAreaChart: React.FC = () => {
  return (
    <ChartCard title="Liquid Level" subtitle="Real-time">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Area type="monotone" dataKey="level" stroke="#F59E0B" fill="#FEF3C7" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default LiquidLevelAreaChart;
