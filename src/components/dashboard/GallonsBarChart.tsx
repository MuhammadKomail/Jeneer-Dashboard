import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ChartCard from './ChartCard';
import { formatNumber, formatPumpAxisLabel, formatPumpTimestamp } from '@/utils/datetime';

export type GallonsPoint = { name: string; gallons: number };

type Timeframe = 'day' | 'week' | 'month';

const GallonsBarChart: React.FC<{ data?: GallonsPoint[]; title?: string; controls?: React.ReactNode; timeframe?: Timeframe }> = ({ data, title = 'Gallons Pumped', controls, timeframe = 'month' }) => {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title} subtitle="" rightControls={controls}>
        <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">No data</div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} subtitle="" rightControls={controls}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={16}
            angle={timeframe === 'day' ? -25 : -20}
            textAnchor="end"
            height={50}
            tickFormatter={(v: any) => formatPumpAxisLabel(v, timeframe)}
          />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            labelFormatter={(label: any) => formatPumpTimestamp(label)}
            formatter={(value) => [formatNumber(Number(value)), 'gallons']}
          />
          <Bar dataKey="gallons" fill="#3BA049" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default GallonsBarChart;
