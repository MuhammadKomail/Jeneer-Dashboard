import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';

const data = Array.from({ length: 30 }).map((_, i) => ({
  name: `Jul ${i + 1}`,
  temperature: Math.round(60 + Math.sin(i / 2) * 15 + (i % 7)),
}));

const TemperatureLineChart: React.FC = () => {
  return (
    <ChartCard title="Temperature" subtitle="Real-time">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey="temperature" stroke="#3B82F6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TemperatureLineChart;
