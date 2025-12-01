import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ChartCard from './ChartCard';

const data = Array.from({ length: 30 }).map((_, i) => ({
  name: `Jul ${i + 1}`,
  pressure: Math.max(0, Math.round(20 + Math.sin(i / 3) * 10 + (i % 5) * 2)),
}));

const FocusMainPressureAreaChart: React.FC = () => {
  return (
    <ChartCard title="Focus Main Pressure" subtitle="Real-time">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Area type="monotone" dataKey="pressure" stroke="#F59E0B" fill="#FDE68A" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default FocusMainPressureAreaChart;
