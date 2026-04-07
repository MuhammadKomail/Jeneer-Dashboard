import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
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

type Props = { deviceSerial: string };

const DeviceOverview: React.FC<Props> = ({ deviceSerial }) => {
  const [timeframe, setTimeframe] = React.useState<'day' | 'week' | 'month' | ''>('');
  const effectiveTimeframe: 'day' | 'week' | 'month' = timeframe === 'day' || timeframe === 'week' || timeframe === 'month' ? timeframe : 'month';
  const [gallonsChartType, setGallonsChartType] = React.useState<'bar' | 'trend'>('bar');
  const [cycleChartType, setCycleChartType] = React.useState<'bar' | 'trend'>('bar');
  const [timeoutsChartType, setTimeoutsChartType] = React.useState<'bar' | 'trend'>('bar');
  const [dateRange, setDateRange] = React.useState<{ from: string; to: string } | null>(null);

  const days = effectiveTimeframe === 'day' ? 1 : effectiveTimeframe === 'week' ? 7 : 30;

  const formatRangeDate = React.useCallback((raw: string, includeTime: boolean) => {
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;
    try {
      return new Intl.DateTimeFormat('en-GB', includeTime ? {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      } : {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(parsed);
    } catch {
      return parsed.toLocaleString();
    }
  }, []);

  const rangeLabel = React.useMemo(() => {
    if (!dateRange) return 'No date range available';
    const includeTime = effectiveTimeframe === 'day';
    return `${formatRangeDate(dateRange.from, includeTime)} — ${formatRangeDate(dateRange.to, includeTime)}`;
  }, [dateRange, effectiveTimeframe, formatRangeDate]);

  const sortByTimestamp = <T extends { name: string }>(rows: T[]): T[] => {
    const toTime = (s: string): number => {
      const v = String(s || '').trim();
      const d = new Date(v.includes('T') ? v : v.replace(' ', 'T'));
      const t = d.getTime();
      return Number.isNaN(t) ? 0 : t;
    };
    return [...rows].sort((a, b) => toTime(a.name) - toTime(b.name));
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
          const explicitFrom = typeof json?.date_range?.from === 'string' ? json.date_range.from : typeof json?.dateRange?.from === 'string' ? json.dateRange.from : null;
          const explicitTo = typeof json?.date_range?.to === 'string' ? json.date_range.to : typeof json?.dateRange?.to === 'string' ? json.dateRange.to : null;
          const rawTimes = [
            ...(Array.isArray(json.gallons_pumped) ? json.gallons_pumped : []).map((r: any) => r?.ts).filter(Boolean),
            ...(Array.isArray(json.cycle_count) ? json.cycle_count : []).map((r: any) => r?.ts).filter(Boolean),
            ...(Array.isArray(json.timeouts) ? json.timeouts : []).map((r: any) => r?.ts).filter(Boolean),
          ] as string[];
          const sortedTimes = rawTimes
            .map((value) => ({ raw: value, time: new Date(value).getTime() }))
            .filter((item) => !Number.isNaN(item.time))
            .sort((a, b) => a.time - b.time);
          const inferredFrom = sortedTimes.length ? sortedTimes[0].raw : null;
          const inferredTo = sortedTimes.length ? sortedTimes[sortedTimes.length - 1].raw : null;
          if (explicitFrom && explicitTo) {
            setDateRange({ from: explicitFrom, to: explicitTo });
          } else if (inferredFrom && inferredTo) {
            setDateRange({ from: inferredFrom, to: inferredTo });
          }

          const g: GallonsPoint[] = Array.isArray(json.gallons_pumped)
            ? sortByTimestamp(json.gallons_pumped.map((r: any) => ({ name: r.ts, gallons: Number(r.value) || 0 })))
            : [];
          const c: Array<{ name: string; cycleCount: number }> = Array.isArray(json.cycle_count)
            ? sortByTimestamp(json.cycle_count.map((r: any) => ({ name: String(r?.ts ?? ''), cycleCount: Number(r?.value) || 0 })))
            : [];
          const t: Array<{ name: string; timeouts: number }> = Array.isArray(json.timeouts)
            ? sortByTimestamp(json.timeouts.map((r: any) => ({ name: String(r?.ts ?? ''), timeouts: Number(r?.value) || 0 })))
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
        if (!ignore) { setGallons([]); setCycleCounts([]); setTimeouts([]); }
      }
    })();
    return () => { ignore = true; };
  }, [deviceSerial, days]);

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    setTimeframe(event.target.value as 'day' | 'week' | 'month' | '');
  };

  const chartTypeControl = (
    value: 'bar' | 'trend',
    onChange: (next: 'bar' | 'trend') => void,
  ) => (
    <Select
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value as 'bar' | 'trend')}
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
              if (!selected) {
                return <span style={{ color: '#9CA3AF' }}>Select time range</span>;
              }
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
        <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
          {gallonsChartType === 'bar' ? (
            <GallonsBarChart
              data={gallons || undefined}
              title={`Gallons Pumped (${deviceSerial})`}
              timeframe={effectiveTimeframe}
              controls={chartTypeControl(gallonsChartType, setGallonsChartType)}
            />
          ) : (
            <LiquidLevelAreaChart
              data={gallons || undefined}
              title={`Gallons Pumped (${deviceSerial})`}
              dataKey="gallons"
              timeframe={effectiveTimeframe}
              controls={chartTypeControl(gallonsChartType, setGallonsChartType)}
            />
          )}
        </Grid>
        <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
          {cycleChartType === 'bar' ? (
            <LiquidLevelBarChart
              data={cycleCounts || undefined}
              title="Cycle Count"
              dataKey="cycleCount"
              barColor="#F59E0B"
              timeframe={effectiveTimeframe}
              controls={chartTypeControl(cycleChartType, setCycleChartType)}
            />
          ) : (
            <LiquidLevelAreaChart
              data={cycleCounts || undefined}
              title="Cycle Count"
              dataKey="cycleCount"
              timeframe={effectiveTimeframe}
              controls={chartTypeControl(cycleChartType, setCycleChartType)}
            />
          )}
        </Grid>
        <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
          {timeoutsChartType === 'bar' ? (
            <LiquidLevelBarChart
              data={timeouts || undefined}
              title="Timeouts"
              dataKey="timeouts"
              barColor="#3B82F6"
              timeframe={effectiveTimeframe}
              controls={chartTypeControl(timeoutsChartType, setTimeoutsChartType)}
            />
          ) : (
            <TemperatureLineChart
              data={timeouts || undefined}
              title="Timeouts"
              dataKey="timeouts"
              timeframe={effectiveTimeframe}
              controls={chartTypeControl(timeoutsChartType, setTimeoutsChartType)}
            />
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
