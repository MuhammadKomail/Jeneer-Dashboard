import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import GallonsBarChart, { GallonsPoint } from './GallonsBarChart';
import LiquidLevelBarChart from './LiquidLevelBarChart';
import LiquidLevelAreaChart from './LiquidLevelAreaChart';
import TemperatureLineChart from './TemperatureLineChart';
import HistoryTable from './HistoryTable';
import PumpSettingsTable from './PumpSettingsTable';

type Props = { deviceSerial: string };

const DeviceOverview: React.FC<Props> = ({ deviceSerial }) => {
  const days = 365;

  const MAX_POINTS = 7;

  const takeLatest = <T extends { name: string }>(rows: T[]): T[] => {
    const toTime = (s: string): number => {
      const v = String(s || '').trim();
      const d = new Date(v.includes('T') ? v : v.replace(' ', 'T'));
      const t = d.getTime();
      return Number.isNaN(t) ? 0 : t;
    };
    return [...rows].sort((a, b) => toTime(a.name) - toTime(b.name)).slice(-MAX_POINTS);
  };

  const [gallonsChartType, setGallonsChartType] = React.useState<'trend' | 'bar'>('bar');
  const [cycleChartType, setCycleChartType] = React.useState<'trend' | 'bar'>('bar');
  const [timeoutsChartType, setTimeoutsChartType] = React.useState<'trend' | 'bar'>('bar');

  const [gallons, setGallons] = React.useState<GallonsPoint[] | null>(null);
  const [cycleCounts, setCycleCounts] = React.useState<Array<{ name: string; cycleCount: number }> | null>(null);
  const [timeouts, setTimeouts] = React.useState<Array<{ name: string; timeouts: number }> | null>(null);

  React.useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const token = (() => {
          try { const m = document.cookie.match(/(?:^|; )AuthToken=([^;]+)/); return m ? decodeURIComponent(m[1]) : null; } catch { return null; }
        })();
        const url = `/admin/api/devices/${encodeURIComponent(deviceSerial)}/overview?days=${days}`;
        const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined, cache: 'no-store' });
        const json = await res.json().catch(() => ({} as any));
        if (ignore) return;
        if (res.ok && json) {
          const g: GallonsPoint[] = Array.isArray(json.gallons_pumped) ? json.gallons_pumped.map((r: any) => ({ name: r.ts, gallons: Number(r.value) || 0 })) : [];
          const c = Array.isArray(json.cycle_count) ? json.cycle_count.map((r: any) => ({ name: r.ts, cycleCount: Number(r.value) || 0 })) : [];
          const t = Array.isArray(json.timeouts) ? json.timeouts.map((r: any) => ({ name: r.ts, timeouts: Number(r.value) || 0 })) : [];
          setGallons(takeLatest(g));
          setCycleCounts(takeLatest(c));
          setTimeouts(takeLatest(t));
        } else {
          setGallons([]);
          setCycleCounts([]);
          setTimeouts([]);
        }
      } catch {
        if (!ignore) { setGallons([]); setCycleCounts([]); setTimeouts([]); }
      }
    })();
    return () => { ignore = true; };
  }, [deviceSerial, days]);

  const cycleControls = (
    <select value={cycleChartType} onChange={(e)=>setCycleChartType(e.target.value as any)} className="px-2 py-1 border rounded text-xs text-gray-700 w-full sm:w-auto">
      <option value="trend">Trend</option>
      <option value="bar">Bar</option>
    </select>
  );

  const timeoutsControls = (
    <select value={timeoutsChartType} onChange={(e)=>setTimeoutsChartType(e.target.value as any)} className="px-2 py-1 border rounded text-xs text-gray-700 w-full sm:w-auto">
      <option value="trend">Trend</option>
      <option value="bar">Bar</option>
    </select>
  );

  const gallonsControls = (
    <select value={gallonsChartType} onChange={(e)=>setGallonsChartType(e.target.value as any)} className="px-2 py-1 border rounded text-xs text-gray-700 w-full sm:w-auto">
      <option value="trend">Trend</option>
      <option value="bar">Bar</option>
    </select>
  );

  const loading = gallons === null || cycleCounts === null || timeouts === null;
  if (loading) {
    return (
      <div className="fixed inset-0 z-40 bg-white/60 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-gray-300 border-t-[#3BA049] animate-spin" />
      </div>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
          {gallonsChartType === 'bar' ? (
            <GallonsBarChart data={gallons || undefined} title={`Gallons Pumped (${deviceSerial})`} controls={gallonsControls} />
          ) : (
            <LiquidLevelAreaChart data={gallons as any} title={`Gallons Pumped (${deviceSerial})`} dataKey="gallons" controls={gallonsControls} />
          )}
        </Grid>
        <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
          {cycleChartType === 'bar' ? (
            <LiquidLevelBarChart data={cycleCounts || undefined} title="Cycle Count" dataKey="cycleCount" barColor="#F59E0B" controls={cycleControls} />
          ) : (
            <LiquidLevelAreaChart data={cycleCounts || undefined} title="Cycle Count" dataKey="cycleCount" controls={cycleControls} />
          )}
        </Grid>
        <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
          {timeoutsChartType === 'bar' ? (
            <LiquidLevelBarChart data={timeouts || undefined} title="Timeouts" dataKey="timeouts" barColor="#3B82F6" controls={timeoutsControls} />
          ) : (
            <TemperatureLineChart data={timeouts || undefined} title="Timeouts" dataKey="timeouts" controls={timeoutsControls} />
          )}
        </Grid>
        <Grid item xs={12}>
          <HistoryTable deviceSerial={deviceSerial} />
        </Grid>
        <Grid item xs={12}>
          <PumpSettingsTable deviceSerial={deviceSerial} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeviceOverview;
