import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import GallonsBarChart, { GallonsPoint } from './GallonsBarChart';
import LiquidLevelBarChart from './LiquidLevelBarChart';

type Props = { companyId: number };

const Overview: React.FC<Props> = ({ companyId }) => {
  const [gallons, setGallons] = React.useState<GallonsPoint[] | null>(null);
  const [cycleCounts, setCycleCounts] = React.useState<Array<{ name: string; cycleCount: number }> | null>(null);
  const [timeouts, setTimeouts] = React.useState<Array<{ name: string; timeouts: number }> | null>(null);
  const days = 365;

  React.useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const token = (() => {
          try {
            const m = document.cookie.match(/(?:^|; )AuthToken=([^;]+)/);
            return m ? decodeURIComponent(m[1]) : null;
          } catch { return null; }
        })();
        const url = `/admin/api/companies/${companyId}/overview?days=${days}&levelField=low_adc&pressureField=high_adc&temperatureField=cur_adc`;
        const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined, cache: 'no-store' });
        const json = await res.json().catch(() => ({} as any));
        if (ignore) return;
        if (res.ok && json) {
          const g: GallonsPoint[] = Array.isArray(json.gallons_pumped)
            ? (() => {
                const totals = new Map<string, number>();
                for (const r of json.gallons_pumped) {
                  const key = String(r?.device_serial ?? '');
                  if (!key) continue;
                  const v = Number(r?.value) || 0;
                  totals.set(key, (totals.get(key) ?? 0) + v);
                }
                return Array.from(totals.entries()).map(([name, gallons]) => ({ name, gallons }));
              })()
            : [];
          const c = Array.isArray(json.cycle_count)
            ? (() => {
                const totals = new Map<string, number>();
                for (const r of json.cycle_count) {
                  const key = String(r?.device_serial ?? '');
                  if (!key) continue;
                  const v = Number(r?.value) || 0;
                  totals.set(key, (totals.get(key) ?? 0) + v);
                }
                return Array.from(totals.entries()).map(([name, cycleCount]) => ({ name, cycleCount }));
              })()
            : [];
          const t = Array.isArray(json.timeouts)
            ? (() => {
                const totals = new Map<string, number>();
                for (const r of json.timeouts) {
                  const key = String(r?.device_serial ?? '');
                  if (!key) continue;
                  const v = Number(r?.value) || 0;
                  totals.set(key, (totals.get(key) ?? 0) + v);
                }
                return Array.from(totals.entries()).map(([name, timeouts]) => ({ name, timeouts }));
              })()
            : [];
          setGallons(g);
          setCycleCounts(c);
          setTimeouts(t);
        } else {
          setGallons([]);
          setCycleCounts([]);
          setTimeouts([]);
        }
      } catch {
        if (!ignore) {
          setGallons([]);
          setCycleCounts([]);
          setTimeouts([]);
        }
      }
    })();
    return () => { ignore = true; };
  }, [companyId, days]);

  const loading = gallons === null || cycleCounts === null || timeouts === null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-40 bg-white/60 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-gray-300 border-t-[#3BA049] animate-spin" />
      </div>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '100%', boxSizing: 'border-box', p: 2 }}>
      <Grid container spacing={2} sx={{ width: '100%', maxWidth: '100%', m: 0 }}>
        <Grid item xs={12} md={6} sx={{ minWidth: 0, display: 'flex' }}>
          <Box sx={{ width: '100%' }}>
            <GallonsBarChart data={gallons || undefined} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sx={{ minWidth: 0, display: 'flex' }}>
          <Box sx={{ width: '100%' }}>
            <LiquidLevelBarChart data={cycleCounts || undefined} title="Cycle Count" dataKey="cycleCount" barColor="#F59E0B" />
          </Box>
        </Grid>
        <Grid item xs={12} md={12} sx={{ minWidth: 0, display: 'flex' }}>
          <Box sx={{ width: '100%' }}>
            <LiquidLevelBarChart data={timeouts || undefined} title="Timeouts" dataKey="timeouts" barColor="#3B82F6" />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview;
