import React from 'react';
import DataTable, { Column } from '@/components/table/DataTable';
import { usePathname, useRouter } from 'next/navigation';

type SettingRow = {
  ts: string;
  highAdc: number;
  threshold: number;
  currentAdc: number;
  lowAdc: number;
  airOnTime: number;
  airTimeout: number;
  delay: number;
};

const rows: SettingRow[] = Array.from({ length: 18 }).map((_, i) => ({
  ts: `2025-06-1${i} 08:06:40`,
  highAdc: 2800 + i,
  threshold: 4000,
  currentAdc: 2790 + i,
  lowAdc: 2790 + i,
  airOnTime: 7,
  airTimeout: i % 4 === 0 ? 1 : 0,
  delay: 5,
}));

const columns: Column<SettingRow>[] = [
  { key: 'ts', header: 'Timestamp' },
  { key: 'highAdc', header: 'High ADC Reading' },
  { key: 'threshold', header: 'ADC Threshold Setting' },
  { key: 'currentAdc', header: 'Current ADC' },
  { key: 'lowAdc', header: 'Low ADC Reading' },
  { key: 'airOnTime', header: 'Air On Time' },
  { key: 'airTimeout', header: 'Air Flow Timeout' },
  { key: 'delay', header: 'Delay' },
];

const PumpSettingsTable: React.FC = () => {
  const [range, setRange] = React.useState<'24h' | '7d' | '30d'>('7d');
  const router = useRouter();
  const pathname = usePathname();

  const exportCsv = () => {
    const header = ['Timestamp','High ADC Reading','ADC Threshold Setting','Current ADC','Low ADC Reading','Air On Time','Air Flow Timeout','Delay'];
    const lines = rows.map(r => [r.ts, r.highAdc, r.threshold, r.currentAdc, r.lowAdc, r.airOnTime, r.airTimeout, r.delay].join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pump_settings_${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-base font-semibold">Jeneer Floats Pump Settings</div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e)=>setRange(e.target.value as any)}
            className="px-3 py-1.5 bg-white border rounded-md text-sm text-gray-700"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 1 Month</option>
          </select>
          {/* Expand fullscreen */}
          <button
            type="button"
            onClick={()=>{
              const url = `${pathname}?view=settings`;
              router.push(url);
            }}
            className="p-2 rounded-md border hover:bg-gray-50"
            title="Fullscreen"
            aria-label="Fullscreen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" strokeWidth="1.5"/></svg>
          </button>
          {/* Save/Export */}
          <button
            type="button"
            onClick={exportCsv}
            className="p-2 rounded-md border hover:bg-gray-50"
            title="Save CSV"
            aria-label="Save CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeWidth="1.5"/></svg>
          </button>
        </div>
      </div>
      <DataTable<SettingRow> columns={columns} rows={rows} pageSizeOptions={[10, 20, 50]} />
    </div>
  );
};

export default PumpSettingsTable;
