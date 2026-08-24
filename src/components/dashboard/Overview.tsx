import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import GallonsBarChart, { GallonsPoint } from './GallonsBarChart';
import LiquidLevelBarChart from './LiquidLevelBarChart';
import { ADDON_KEYS, ADDON_LABELS, AddonKey, normalizeAddons, readUserAddons } from '@/utils/addons';

type Props = { companyId: number; deviceLabels?: Record<string, string> };
type BarPoint = { name: string; value: number };

const ADDON_COLORS: Record<AddonKey, string> = {
  liquid_level: '#0D9488',
  vacuum: '#8B5CF6',
  temperature: '#EF4444',
  fm_pressure: '#F59E0B',
};

/** Map company-overview payload fields → addon keys (fallback if aux is empty). */
const OVERVIEW_FIELD_BY_ADDON: Partial<Record<AddonKey, string>> = {
  liquid_level: 'liquid_level',
  temperature: 'temperature_realtime',
  fm_pressure: 'focus_main_pressure',
  vacuum: 'vacuum',
};

const Overview: React.FC<Props> = ({ companyId, deviceLabels }) => {
  const [gallons, setGallons] = React.useState<GallonsPoint[] | null>(null);
  const [cycleCounts, setCycleCounts] = React.useState<Array<{ name: string; cycleCount: number }> | null>(null);
  const [timeouts, setTimeouts] = React.useState<Array<{ name: string; timeouts: number }> | null>(null);
  const [addons, setAddons] = React.useState<AddonKey[]>([]);
  const [addonSeries, setAddonSeries] = React.useState<Partial<Record<AddonKey, BarPoint[]>>>({});
  const days = 365;

  const labelFor = React.useCallback(
    (serial: string) => {
      const mapped = deviceLabels?.[serial];
      return (mapped && mapped.trim()) || serial;
    },
    [deviceLabels]
  );

  const aggregateByDevice = React.useCallback(
    (rows: any[] | undefined): BarPoint[] => {
      if (!Array.isArray(rows)) return [];
      const totals = new Map<string, number>();
      const counts = new Map<string, number>();
      for (const r of rows) {
        const key = String(r?.device_serial ?? '');
        if (!key) continue;
        const v = Number(r?.value) || 0;
        totals.set(key, (totals.get(key) ?? 0) + v);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      return Array.from(totals.entries()).map(([serial, sum]) => {
        const n = counts.get(serial) || 1;
        return { name: labelFor(serial), value: Math.round((sum / n) * 100) / 100 };
      });
    },
    [labelFor]
  );

  React.useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const token = (() => {
          try {
            const m = document.cookie.match(/(?:^|; )AuthToken=([^;]+)/);
            return m ? decodeURIComponent(m[1]) : null;
          } catch {
            return null;
          }
        })();
        const url = `/admin/api/companies/${companyId}/overview?days=${days}&levelField=low_adc&pressureField=high_adc&temperatureField=cur_adc`;
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: 'no-store',
        });
        const json = await res.json().catch(() => ({} as any));
        if (ignore) return;
        if (res.ok && json) {
          const enabled = normalizeAddons(json.addons?.length ? json.addons : readUserAddons());
          const ordered = ADDON_KEYS.filter((k) => enabled.includes(k));
          setAddons(ordered);

          const g: GallonsPoint[] = Array.isArray(json.gallons_pumped)
            ? (() => {
                const totals = new Map<string, number>();
                for (const r of json.gallons_pumped) {
                  const key = String(r?.device_serial ?? '');
                  if (!key) continue;
                  const v = Number(r?.value) || 0;
                  totals.set(key, (totals.get(key) ?? 0) + v);
                }
                return Array.from(totals.entries()).map(([serial, gallons]) => ({
                  name: labelFor(serial),
                  gallons,
                }));
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
                return Array.from(totals.entries()).map(([serial, cycleCount]) => ({
                  name: labelFor(serial),
                  cycleCount,
                }));
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
                return Array.from(totals.entries()).map(([serial, timeouts]) => ({
                  name: labelFor(serial),
                  timeouts,
                }));
              })()
            : [];

          const nextAux: Partial<Record<AddonKey, BarPoint[]>> = {};
          for (const key of ordered) {
            const fromAux = Array.isArray(json.aux?.[key]) ? json.aux[key] : null;
            const field = OVERVIEW_FIELD_BY_ADDON[key];
            const fromLegacy = field && Array.isArray(json[field]) ? json[field] : null;
            nextAux[key] = aggregateByDevice(fromAux || fromLegacy || []);
          }

          setGallons(g);
          setCycleCounts(c);
          setTimeouts(t);
          setAddonSeries(nextAux);
        } else {
          setGallons([]);
          setCycleCounts([]);
          setTimeouts([]);
          setAddons(readUserAddons());
          setAddonSeries({});
        }
      } catch {
        if (!ignore) {
          setGallons([]);
          setCycleCounts([]);
          setTimeouts([]);
          setAddons(readUserAddons());
          setAddonSeries({});
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [companyId, days, labelFor, aggregateByDevice]);

  const loading = gallons === null || cycleCounts === null || timeouts === null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-40 bg-white/60 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-gray-300 border-t-[#3BA049] animate-spin" />
      </div>
    );
  }

  const addonCharts = addons.map((key) => {
    const series = addonSeries[key] || [];
    const hasData = series.some((p) => Number(p.value) !== 0);
    return { key, series, hasData };
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        p: 2,
      }}
    >
      <Grid container spacing={2} sx={{ width: '100%', maxWidth: '100%', m: 0 }}>
        <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
          <GallonsBarChart data={gallons || undefined} />
        </Grid>
        <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
          <LiquidLevelBarChart
            data={cycleCounts || undefined}
            title="Cycle Count"
            dataKey="cycleCount"
            barColor="#F59E0B"
          />
        </Grid>
        <Grid item xs={12} sx={{ minWidth: 0 }}>
          <LiquidLevelBarChart
            data={timeouts || undefined}
            title="Timeouts"
            dataKey="timeouts"
            barColor="#3B82F6"
          />
        </Grid>

        {addonCharts.map(({ key, series, hasData }) => (
          <Grid item xs={12} md={6} key={key} sx={{ minWidth: 0 }}>
            <LiquidLevelBarChart
              data={hasData ? series : undefined}
              title={ADDON_LABELS[key]}
              dataKey="value"
              barColor={ADDON_COLORS[key]}
              emptyMessage={`No ${ADDON_LABELS[key].toLowerCase()} readings for this wellfield yet.`}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Overview;
