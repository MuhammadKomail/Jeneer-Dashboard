import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ChartCard from './ChartCard';
import { formatPumpAxisLabel, formatPumpTimestamp } from '@/utils/datetime';

type Point = Record<string, any> & { name: string };

type Timeframe = 'day' | 'week' | 'month';

const LiquidLevelAreaChart: React.FC<{
  data?: Point[];
  controls?: React.ReactNode;
  title?: string;
  dataKey?: string;
  timeframe?: Timeframe;
  emptyMessage?: string;
}> = ({ data, controls, title = 'Liquid Level', dataKey = 'level', timeframe = 'month', emptyMessage = 'No data' }) => {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title} subtitle="" rightControls={controls} emptyMessage={emptyMessage}>
        <div />
      </ChartCard>
    );
  }
  return (
    <ChartCard title={title} subtitle="" rightControls={controls}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
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
          <Area type="monotone" dataKey={dataKey} stroke="#F59E0B" fill="#FEF3C7" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default LiquidLevelAreaChart;
