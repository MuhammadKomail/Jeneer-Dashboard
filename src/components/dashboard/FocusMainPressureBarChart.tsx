import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ChartCard from './ChartCard';

export type PressurePoint = { name: string; pressure: number };

const fallbackData: PressurePoint[] = Array.from({ length: 8 }).map((_, i) => ({
  name: `LRI230${i + 1}`,
  pressure: 20 + ((i * 6) % 22),
}));

const FocusMainPressureBarChart: React.FC<{ data?: PressurePoint[]; controls?: React.ReactNode }> = ({ data, controls }) => {
  const defaultControls = (
    <select className="px-2 py-1 border rounded text-xs text-gray-700">
      <option>Last 7 Days</option>
      <option>Last 24 Hours</option>
      <option>Last 1 Month</option>
    </select>
  );
  return (
    <ChartCard title="Focus Main Pressure" subtitle="" rightControls={controls ?? defaultControls}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data && data.length ? data : fallbackData}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="pressure" fill="#EA860A" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default FocusMainPressureBarChart;
