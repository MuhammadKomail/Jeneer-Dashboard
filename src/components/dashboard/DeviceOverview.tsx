import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import GallonsBarChart, { GallonsPoint } from './GallonsBarChart';
import LiquidLevelAreaChart from './LiquidLevelAreaChart';
import LiquidLevelBarChart from './LiquidLevelBarChart';
import TemperatureLineChart from './TemperatureLineChart';
import HistoryTable from './HistoryTable';
import PumpSettingsTable from './PumpSettingsTable';
import { formatUtcAsEastern, parsePumpTimestampMs } from '@/utils/datetime';
import { ADDON_LABELS, AddonKey, normalizeAddons, readUserAddons } from '@/utils/addons';

type Props = { deviceSerial: string; displayName?: string };
type ChartType = 'bar' | 'trend';
type SeriesPoint = { name: string; value: number };

const CORE_METRICS = [
  { key: 'gallons', label: 'Gallons Pumped', color: '#3BA049' },
  { key: 'cycles', label: 'Cycle Count', color: '#F59E0B' },
  { key: 'timeouts', label: 'Timeouts', color: '#3B82F6' },
] as const;

type CoreMetricKey = (typeof CORE_METRICS)[number]['key'];

const DeviceOverview: React.FC<Props> = ({ deviceSerial, displayName }) => {
  const wellLabel = (displayName && displayName.trim()) || deviceSerial;
  const [timeframe, setTimeframe] = React.useState<'day' | 'week' | 'month' | ''>('');
  const effectiveTimeframe: 'day' | 'week' | 'month' =
    timeframe === 'day' || timeframe === 'week' || timeframe === 'month' ? timeframe : 'month';

  const [dateRange, setDateRange] = React.useState<{ from: string; to: string } | null>(null);
  const [addons, setAddons] = React.useState<AddonKey[]>([]);
  const [auxMetric, setAuxMetric] = React.useState<AddonKey>('liquid_level');
  const [auxChartType, setAuxChartType] = React.useState<ChartType>('trend');
  const [auxSeries, setAuxSeries] = React.useState<Record<string, SeriesPoint[]>>({});

  const [coreChartTypes, setCoreChartTypes] = React.useState<Record<CoreMetricKey, ChartType>>({
    gallons: 'bar',
    cycles: 'bar',
    timeouts: 'bar',
  });

  const days = effectiveTimeframe === 'day' ? 1 : effectiveTimeframe === 'week' ? 7 : 30;

  const formatRangeDate = React.useCallback((raw: string, includeTime: boolean) => {
    return formatUtcAsEastern(raw, includeTime);
  }, []);

  const rangeLabel = React.useMemo(() => {
    if (!dateRange) return 'No date range available';
    const includeTime = effectiveTimeframe === 'day';
    return `${formatRangeDate(dateRange.from, includeTime)} — ${formatRangeDate(dateRange.to, includeTime)}`;
  }, [dateRange, effectiveTimeframe, formatRangeDate]);

  const sortByTimestamp = <T extends { name: string }>(rows: T[]): T[] => {
    return [...rows].sort((a, b) => parsePumpTimestampMs(a.name) - parsePumpTimestampMs(b.name));
  };

  const [gallons, setGallons] = React.useState<GallonsPoint[] | null>(null);
  const [cycleCounts, setCycleCounts] = React.useState<Array<{ name: string; cycleCount: number }> | null>(null);
  const [timeouts, setTimeouts] = React.useState<Array<{ name: string; timeouts: number }> | null>(null);

  React.useEffect(() => {
    let ignore = false;
    setGallons(null);
    setCycleCounts(null);
    setTimeouts(null);
    setDateRange(null);
    setAuxSeries({});
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
        const url = `/admin/api/devices/${encodeURIComponent(deviceSerial)}/overview?days=${days}`;
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: 'no-store',
        });
        const json = await res.json().catch(() => ({} as any));
        if (ignore) return;
        if (res.ok && json) {
          const explicitFrom =
            typeof json?.date_range?.from === 'string'
              ? json.date_range.from
              : typeof json?.dateRange?.from === 'string'
                ? json.dateRange.from
                : null;
          const explicitTo =
            typeof json?.date_range?.to === 'string'
              ? json.date_range.to
              : typeof json?.dateRange?.to === 'string'
                ? json.dateRange.to
                : null;

          const g: GallonsPoint[] = Array.isArray(json.gallons_pumped)
            ? sortByTimestamp(
                json.gallons_pumped.map((r: any) => ({
                  name: String(r.ts ?? ''),
                  gallons: Math.round((Number(r.value) || 0) * 100) / 100,
                }))
              )
            : [];
          const c: Array<{ name: string; cycleCount: number }> = sortByTimestamp(
            (Array.isArray(json.cycle_count) ? json.cycle_count : []).map((r: any) => ({
              name: String(r.ts ?? ''),
              cycleCount: Math.round(Number(r.value) || 0),
            }))
          );
          const t: Array<{ name: string; timeouts: number }> = sortByTimestamp(
            (Array.isArray(json.timeouts) ? json.timeouts : []).map((r: any) => ({
              name: String(r.ts ?? ''),
              timeouts: Math.round(Number(r.value) || 0),
            }))
          );

          const times = [...g, ...c, ...t]
            .map((r) => ({ raw: r.name, time: parsePumpTimestampMs(r.name) }))
            .filter((x) => x.time > 0)
            .sort((a, b) => a.time - b.time);
          if (explicitFrom && explicitTo) setDateRange({ from: explicitFrom, to: explicitTo });
          else if (times.length) setDateRange({ from: times[0].raw, to: times[times.length - 1].raw });

          setGallons(g);
          setCycleCounts(c);
          setTimeouts(t);

          const enabled = normalizeAddons(json.addons?.length ? json.addons : readUserAddons());
          setAddons(enabled);
          const nextAux: Record<string, SeriesPoint[]> = {};
          const auxSource = json.aux && typeof json.aux === 'object' ? json.aux : {};
          for (const key of enabled) {
            const series = Array.isArray(auxSource[key]) ? auxSource[key] : [];
            nextAux[key] = sortByTimestamp(
              series.map((r: any) => ({
                name: String(r.ts ?? r.name ?? ''),
                value: Math.round((Number(r.value ?? 0) || 0) * 100) / 100,
              }))
            );
          }
          setAuxSeries(nextAux);
          setAuxMetric((current) => {
            if (enabled.includes(current)) return current;
            if (enabled.includes('liquid_level')) return 'liquid_level';
            return enabled[0] || 'liquid_level';
          });
        } else {
          setGallons([]);
          setCycleCounts([]);
          setTimeouts([]);
          setAddons(readUserAddons());
        }
      } catch {
        if (!ignore) {
          setGallons([]);
          setCycleCounts([]);
          setTimeouts([]);
          setAddons(readUserAddons());
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [deviceSerial, days]);

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    setTimeframe(event.target.value as 'day' | 'week' | 'month' | '');
  };

  const setCoreType = (key: CoreMetricKey, next: ChartType) => {
    setCoreChartTypes((prev) => ({ ...prev, [key]: next }));
  };

  const chartTypeSelect = (value: ChartType, onChange: (next: ChartType) => void) => (
    <Select
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value as ChartType)}
      sx={{
        minWidth: 96,
        backgroundColor: 'white',
        '& .MuiSelect-select': { py: 0.8, fontSize: 13 },
      }}
    >
      <MenuItem value="bar">Bar</MenuItem>
      <MenuItem value="trend">Trend</MenuItem>
    </Select>
  );

  const renderCoreChart = (key: CoreMetricKey) => {
    const meta = CORE_METRICS.find((m) => m.key === key)!;
    const chartType = coreChartTypes[key];
    const controls = chartTypeSelect(chartType, (next) => setCoreType(key, next));
    const title =
      key === 'gallons' ? `${meta.label} (${wellLabel})` : meta.label;

    if (key === 'gallons') {
      return chartType === 'bar' ? (
        <GallonsBarChart
          data={gallons || undefined}
          title={title}
          timeframe={effectiveTimeframe}
          controls={controls}
        />
      ) : (
        <LiquidLevelAreaChart
          data={gallons || undefined}
          title={title}
          dataKey="gallons"
          timeframe={effectiveTimeframe}
          controls={controls}
        />
      );
    }

    if (key === 'cycles') {
      return chartType === 'bar' ? (
        <LiquidLevelBarChart
          data={cycleCounts || undefined}
          title={title}
          dataKey="cycleCount"
          barColor={meta.color}
          timeframe={effectiveTimeframe}
          controls={controls}
        />
      ) : (
        <LiquidLevelAreaChart
          data={cycleCounts || undefined}
          title={title}
          dataKey="cycleCount"
          timeframe={effectiveTimeframe}
          controls={controls}
        />
      );
    }

    return chartType === 'bar' ? (
      <LiquidLevelBarChart
        data={timeouts || undefined}
        title={title}
        dataKey="timeouts"
        barColor={meta.color}
        timeframe={effectiveTimeframe}
        controls={controls}
      />
    ) : (
      <TemperatureLineChart
        data={timeouts || undefined}
        title={title}
        dataKey="timeouts"
        timeframe={effectiveTimeframe}
        controls={controls}
      />
    );
  };

  const auxData = auxSeries[auxMetric] || [];
  const auxHasData = auxData.some((p) => Number(p.value) !== 0);

  const loading = gallons === null || cycleCounts === null || timeouts === null;
  if (loading) {
    return (
      <div className="fixed inset-0 z-40 bg-white/60 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-gray-300 border-t-[#3BA049] animate-spin" />
      </div>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, minWidth: 240 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Date Range
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {rangeLabel}
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <Select
            inputProps={{ 'aria-label': 'Time Range' }}
            value={timeframe}
            size="small"
            displayEmpty
            sx={{ backgroundColor: 'white' }}
            renderValue={(selected) => {
              if (!selected) return <span style={{ color: '#9CA3AF' }}>Select time range</span>;
              if (selected === 'day') return '1 Day';
              if (selected === 'week') return '1 Week';
              return '1 Month';
            }}
            onChange={handleTimeframeChange}
          >
            <MenuItem value="">
              <em>Select time range</em>
            </MenuItem>
            <MenuItem value="day">1 Day</MenuItem>
            <MenuItem value="week">1 Week</MenuItem>
            <MenuItem value="month">1 Month</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        {CORE_METRICS.map((m) => (
          <Grid item xs={12} md={6} key={m.key} sx={{ minWidth: 0 }}>
            {renderCoreChart(m.key)}
          </Grid>
        ))}

        {addons.length > 0 && (
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
            {auxChartType === 'bar' ? (
              <LiquidLevelBarChart
                data={auxHasData ? auxData : undefined}
                title={ADDON_LABELS[auxMetric] || 'Sensor'}
                dataKey="value"
                barColor="#0D9488"
                timeframe={effectiveTimeframe}
                controls={
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Select
                      size="small"
                      value={auxMetric}
                      onChange={(event) => setAuxMetric(event.target.value as AddonKey)}
                      sx={{
                        minWidth: 140,
                        backgroundColor: 'white',
                        '& .MuiSelect-select': { py: 0.8, fontSize: 13 },
                      }}
                    >
                      {addons.map((key) => (
                        <MenuItem key={key} value={key}>
                          {ADDON_LABELS[key]}
                        </MenuItem>
                      ))}
                    </Select>
                    {chartTypeSelect(auxChartType, setAuxChartType)}
                  </Box>
                }
              />
            ) : (
              <LiquidLevelAreaChart
                data={auxHasData ? auxData : undefined}
                title={ADDON_LABELS[auxMetric] || 'Sensor'}
                dataKey="value"
                timeframe={effectiveTimeframe}
                controls={
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Select
                      size="small"
                      value={auxMetric}
                      onChange={(event) => setAuxMetric(event.target.value as AddonKey)}
                      sx={{
                        minWidth: 140,
                        backgroundColor: 'white',
                        '& .MuiSelect-select': { py: 0.8, fontSize: 13 },
                      }}
                    >
                      {addons.map((key) => (
                        <MenuItem key={key} value={key}>
                          {ADDON_LABELS[key]}
                        </MenuItem>
                      ))}
                    </Select>
                    {chartTypeSelect(auxChartType, setAuxChartType)}
                  </Box>
                }
              />
            )}
            {!auxHasData && (
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                No {ADDON_LABELS[auxMetric]?.toLowerCase() || 'sensor'} readings for this pump yet.
              </Typography>
            )}
          </Grid>
        )}

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
