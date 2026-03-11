import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import GallonsBarChart, { GallonsPoint } from './GallonsBarChart';
import FocusMainPressureAreaChart from './FocusMainPressureAreaChart';
import LiquidLevelAreaChart from './LiquidLevelAreaChart';
import TemperatureLineChart from './TemperatureLineChart';
import HistoryTable from './HistoryTable';
import PumpSettingsTable from './PumpSettingsTable';

type Props = { deviceSerial: string };

const DeviceOverview: React.FC<Props> = ({ deviceSerial }) => {
  const [range, setRange] = React.useState<'1d' | '7d' | '1m' | '1y'>('1m');
  const days = range === '1d' ? 1 : range === '7d' ? 7 : range === '1m' ? 30 : 365;

  const [cycleCounts, setCycleCounts] = React.useState<Array<{ name: string; cycleCount: number }> | null>(null);
  const [timeouts, setTimeouts] = React.useState<Array<{ name: string; timeouts: number }> | null>(null);
  const [pressures, setPressures] = React.useState<Array<{ name: string; pressure: number }> | null>(null);
  const [gallons, setGallons] = React.useState<GallonsPoint[] | null>(null);

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
          const c = Array.isArray(json.cycle_count) ? json.cycle_count.map((r: any) => ({ name: r.ts, cycleCount: Number(r.value) || 0 })) : [];
          const t = Array.isArray(json.timeouts) ? json.timeouts.map((r: any) => ({ name: r.ts, timeouts: Number(r.value) || 0 })) : [];
          const p = Array.isArray(json.focus_main_pressure) ? json.focus_main_pressure.map((r: any) => ({ name: r.ts, pressure: Number(r.value) || 0 })) : [];
          const g: GallonsPoint[] = Array.isArray(json.gallons_pumped) ? json.gallons_pumped.map((r: any) => ({ name: r.ts, gallons: Number(r.value) || 0 })) : [];
          setCycleCounts(c); setTimeouts(t); setPressures(p); setGallons(g);
        } else {
          setCycleCounts([]); setTimeouts([]); setPressures([]); setGallons([]);
        }
      } catch {
        if (!ignore) { setCycleCounts([]); setTimeouts([]); setPressures([]); setGallons([]); }
      }
    })();
    return () => { ignore = true; };
  }, [deviceSerial, days]);

  const controls = (
    <select value={range} onChange={(e)=>setRange(e.target.value as any)} className="px-2 py-1 border rounded text-xs text-gray-700 w-full sm:w-auto">
      <option value="1d">Last 1 Day</option>
      <option value="7d">Last 7 Days</option>
      <option value="1m">Last 1 Month</option>
      <option value="1y">Last 1 Year</option>
    </select>
  );

  const loading = cycleCounts === null || timeouts === null || pressures === null || gallons === null;
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
        <Grid item xs={12} md={6}>
          <GallonsBarChart data={gallons || undefined} title={`Gallons Pumped (${deviceSerial})`} controls={controls} />
        </Grid>
        <Grid item xs={12} md={6}>
          <LiquidLevelAreaChart data={cycleCounts || undefined} title="Cycle Count" dataKey="cycleCount" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TemperatureLineChart data={timeouts || undefined} title="Timeouts" dataKey="timeouts" />
        </Grid>
        <Grid item xs={12} md={6}>
          <FocusMainPressureAreaChart data={pressures || undefined} />
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
