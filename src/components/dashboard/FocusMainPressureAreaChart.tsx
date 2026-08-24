import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ChartCard from './ChartCard';
import { formatPumpTimestamp } from '@/utils/datetime';

type Point = { name: string; pressure: number };

const FocusMainPressureAreaChart: React.FC<{ data?: Point[]; controls?: React.ReactNode }> = ({ data, controls }) => {
  if (!data || data.length === 0) {
    return (
      <ChartCard title="Focus Main Pressure" subtitle="" rightControls={controls} emptyMessage="No data">
        <div />
      </ChartCard>
    );
  }
  return (
    <ChartCard title="Focus Main Pressure" subtitle="" rightControls={controls}>
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
          <Tooltip labelFormatter={(label: any) => formatPumpTimestamp(label)} />
          <Area type="monotone" dataKey="pressure" stroke="#F59E0B" fill="#FDE68A" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default FocusMainPressureAreaChart;
