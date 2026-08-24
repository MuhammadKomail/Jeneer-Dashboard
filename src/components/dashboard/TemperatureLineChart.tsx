import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';
import { formatPumpAxisLabel, formatPumpTimestamp } from '@/utils/datetime';

type Point = Record<string, any> & { name: string };

type Timeframe = 'day' | 'week' | 'month';

const TemperatureLineChart: React.FC<{
  data?: Point[];
  controls?: React.ReactNode;
  title?: string;
  dataKey?: string;
  timeframe?: Timeframe;
}> = ({ data, controls, title = 'Temperature', dataKey = 'temperature', timeframe = 'month' }) => {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title} subtitle="" rightControls={controls} emptyMessage="No data">
        <div />
      </ChartCard>
    );
  }
  return (
    <ChartCard title={title} subtitle="" rightControls={controls}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            height={50}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={16}
            angle={timeframe === 'day' ? -25 : -20}
            textAnchor="end"
            tickFormatter={(v: any) => formatPumpAxisLabel(v, timeframe)}
          />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip labelFormatter={(label: any) => formatPumpTimestamp(label, false)} />
          <Line type="monotone" dataKey={dataKey} stroke="#3B82F6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TemperatureLineChart;
