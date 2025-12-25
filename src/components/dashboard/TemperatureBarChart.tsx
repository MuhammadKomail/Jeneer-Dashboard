import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ChartCard from './ChartCard';

export type TemperaturePoint = { name: string; temp: number };

const fallbackData: TemperaturePoint[] = Array.from({ length: 8 }).map((_, i) => ({
  name: `LRI230${i + 1}`,
  temp: 40 + ((i * 5) % 20),
}));

const TemperatureBarChart: React.FC<{ data?: TemperaturePoint[]; controls?: React.ReactNode }> = ({ data, controls }) => {
  const defaultControls = (
    <select className="px-2 py-1 border rounded text-xs text-gray-700">
      <option>Last 7 Days</option>
      <option>Last 24 Hours</option>
      <option>Last 1 Month</option>
    </select>
  );
  return (
    <ChartCard title="Temperature (Real-time)" subtitle="" rightControls={controls ?? defaultControls}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data && data.length ? data : fallbackData}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="temp" fill="#9AC40C" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TemperatureBarChart;
