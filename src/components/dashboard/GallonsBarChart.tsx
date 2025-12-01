import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ChartCard from './ChartCard';

const data = [
  { name: 'Jul 04', gallons: 320 },
  { name: 'Jul 05', gallons: 180 },
  { name: 'Jul 06', gallons: 540 },
  { name: 'Jul 07', gallons: 460 },
  { name: 'Jul 08', gallons: 610 },
  { name: 'Jul 09', gallons: 380 },
  { name: 'Jul 10', gallons: 420 },
  { name: 'Jul 11', gallons: 360 },
];

const GallonsBarChart: React.FC = () => {
  return (
    <ChartCard title="Gallons Pumped" subtitle="Last 7 Days">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="gallons" fill="#3BA049" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default GallonsBarChart;
