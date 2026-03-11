import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';

type Point = Record<string, any> & { name: string };

const TemperatureLineChart: React.FC<{
  data?: Point[];
  controls?: React.ReactNode;
  title?: string;
  dataKey?: string;
}> = ({ data, controls, title = 'Temperature', dataKey = 'temperature' }) => {
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
        <LineChart data={data}>
          <XAxis
            dataKey="name"
            tick={false}
            height={0}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} stroke="#3B82F6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TemperatureLineChart;
