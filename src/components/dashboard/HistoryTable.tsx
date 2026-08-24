import React from 'react';
import DataTable, { Column } from '@/components/table/DataTable';
import { usePathname, useRouter } from 'next/navigation';
import { formatPumpTimestamp } from '@/utils/datetime';
import { ADDON_KEYS, ADDON_LABELS, AddonKey, normalizeAddons, readUserAddons } from '@/utils/addons';

type HistoryRow = {
  ts: string;
  highAdc: number;
  currentAdc: number;
  lowAdc: number;
  gallons: number;
  cycle: number;
  timeouts: number;
  totalGallons: number;
  totalCycles: number;
  totalTimeouts: number;
  battery: number;
} & Partial<Record<AddonKey, number | null>>;

const format2 = (n: number | null | undefined): string => {
  if (n == null) return '';
  const x = Number(n);
  if (!Number.isFinite(x)) return '';
  return Number.isInteger(x) ? String(x) : x.toFixed(2);
};

const fallbackRows: HistoryRow[] = Array.from({ length: 18 }).map((_, i) => ({
  ts: `2025-06-1${i} 08:06:40`,
  highAdc: 1500 + (i % 5),
  currentAdc: 1200 + (i % 7) * 3,
  lowAdc: 900 + (i % 4),
  gallons: 2800 + (i % 7) * 15,
  cycle: 4000,
  timeouts: i % 9 === 0 ? 1 : 0,
  totalGallons: 114654 + i * 120,
  totalCycles: 327583 + i * 7,
  totalTimeouts: 575 + Math.floor(i / 6),
  battery: 12.8 + (i % 6) * 0.2,
}));

const baseColumns: Column<HistoryRow>[] = [
  { key: 'ts', header: 'Timestamp', render: (r) => formatPumpTimestamp(r.ts) },
  { key: 'highAdc', header: 'High ADC' },
  { key: 'currentAdc', header: 'Current ADC' },
  { key: 'lowAdc', header: 'Low ADC' },
  { key: 'gallons', header: 'Gallons', render: (r) => format2(r.gallons) },
  { key: 'cycle', header: 'Cycles' },
  { key: 'timeouts', header: 'Timeouts' },
];

const batteryColumn: Column<HistoryRow> = {
  key: 'battery',
  header: 'Battery',
  render: (r) => format2(r.battery),
};

function buildColumns(addons: AddonKey[]): Column<HistoryRow>[] {
  const addonColumns: Column<HistoryRow>[] = addons.map((key) => ({
    key,
    header: ADDON_LABELS[key],
    render: (r) => format2(r[key] as number | null | undefined),
  }));
  return [...baseColumns, ...addonColumns, batteryColumn];
}

const HistoryTable: React.FC<{ deviceSerial?: string; wellId?: string }> = ({ deviceSerial, wellId }) => {
  const [range, setRange] = React.useState<'24h' | '7d' | '30d'>('30d');
  const router = useRouter();
  const pathname = usePathname();
  const [rows, setRows] = React.useState<HistoryRow[] | null>(null);
  const [addons, setAddons] = React.useState<AddonKey[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [exporting, setExporting] = React.useState(false);

  const columns = React.useMemo(() => buildColumns(addons), [addons]);

  const authHeaders = React.useCallback(() => {
    try {
      const m = document.cookie.match(/(?:^|; )AuthToken=([^;]+)/);
      const token = m ? decodeURIComponent(m[1]) : null;
      return token ? { Authorization: `Bearer ${token}` } : undefined;
    } catch {
      return undefined;
    }
  }, []);

  const normalizeHistoryRows = React.useCallback((rawRows: any[], ordered: AddonKey[]): HistoryRow[] => {
    return (rawRows || []).map((row) => {
      const base: HistoryRow = {
        ts: String(row?.ts ?? row?.timestamp ?? row?.created_at ?? ''),
        highAdc: Number(row?.highAdc ?? row?.high_adc ?? row?.high_adc_reading ?? 0) || 0,
        currentAdc: Number(row?.currentAdc ?? row?.current_adc ?? row?.current_adc_reading ?? 0) || 0,
        lowAdc: Number(row?.lowAdc ?? row?.low_adc ?? row?.low_adc_reading ?? 0) || 0,
        gallons: Number(row?.gallons ?? 0) || 0,
        cycle: Number(row?.cycle ?? 0) || 0,
        timeouts: Number(row?.timeouts ?? 0) || 0,
        totalGallons: Number(row?.totalGallons ?? row?.total_gallons ?? 0) || 0,
        totalCycles: Number(row?.totalCycles ?? row?.total_cycles ?? 0) || 0,
        totalTimeouts: Number(row?.totalTimeouts ?? row?.total_timeouts ?? 0) || 0,
        battery: Number(row?.battery ?? 0) || 0,
      };
      for (const key of ordered) {
        const raw = row?.[key];
        if (raw == null || raw === '') {
          base[key] = null;
        } else {
          const n = Number(raw);
          base[key] = Number.isFinite(n) ? n : null;
        }
      }
      return base;
    });
  }, []);

  React.useEffect(() => {
    let ignore = false;
    if (!deviceSerial) {
      setAddons(readUserAddons());
      setRows(fallbackRows);
      setTotal(fallbackRows.length);
      return;
    }
    (async () => {
      try {
        const url = `/admin/api/devices/${encodeURIComponent(deviceSerial)}/history?range=${range}&page=${page}&pageSize=${pageSize}`;
        const res = await fetch(url, {
          headers: authHeaders(),
          cache: 'no-store',
        });
        const json = await res.json().catch(() => ({} as any));
        if (ignore) return;
        if (res.ok && Array.isArray(json?.rows)) {
          const enabled = normalizeAddons(json.addons?.length ? json.addons : readUserAddons());
          const ordered = ADDON_KEYS.filter((k) => enabled.includes(k));
          setAddons(ordered);
          const normalized = normalizeHistoryRows(json.rows, ordered);
          setRows(normalized);
          setTotal(Number(json.total) || normalized.length);
        } else {
          setAddons(readUserAddons());
          setRows([]);
          setTotal(0);
        }
      } catch {
        if (!ignore) {
          setAddons(readUserAddons());
          setRows([]);
          setTotal(0);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [deviceSerial, range, page, pageSize, authHeaders, normalizeHistoryRows]);

  const fetchAllRowsForExport = async (): Promise<HistoryRow[]> => {
    if (!deviceSerial) return rows || [];
    const exportPageSize = 1000;
    let pageNum = 1;
    let totalRows = Infinity;
    const all: HistoryRow[] = [];
    let ordered = addons;

    while (all.length < totalRows) {
      const url = `/admin/api/devices/${encodeURIComponent(deviceSerial)}/history?range=${range}&page=${pageNum}&pageSize=${exportPageSize}`;
      const res = await fetch(url, { headers: authHeaders(), cache: 'no-store' });
      const json = await res.json().catch(() => ({} as any));
      if (!res.ok || !Array.isArray(json?.rows)) break;
      if (pageNum === 1) {
        const enabled = normalizeAddons(json.addons?.length ? json.addons : readUserAddons());
        ordered = ADDON_KEYS.filter((k) => enabled.includes(k));
        totalRows = Number(json.total) || json.rows.length;
      }
      const chunk = normalizeHistoryRows(json.rows, ordered);
      all.push(...chunk);
      if (chunk.length === 0) break;
      if (chunk.length < exportPageSize) break;
      pageNum += 1;
      if (pageNum > 200) break;
    }
    return all;
  };

  const exportCsv = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const exportRows = await fetchAllRowsForExport();
      if (!exportRows.length) return;
      const header = columns.map((c) => String(c.header));
      const keys = columns.map((c) => String(c.key));
      const lines = exportRows.map((r) =>
        keys
          .map((k) => {
            const val = (r as any)[k] ?? '';
            const s = String(val);
            return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(',')
      );
      const csv = [header.join(','), ...lines].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeWell = String(wellId || deviceSerial || 'well')
        .trim()
        .replace(/[^\w.-]+/g, '_');
      a.download = `history_${range}_${safeWell}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <div className="text-base font-semibold">History</div>
        <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
          <select
            value={range}
            onChange={(e) => {
              setRange(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-white border rounded-md text-sm text-gray-700"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 1 Month</option>
          </select>
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams();
              params.set('view', 'history');
              if (deviceSerial) params.set('device', deviceSerial);
              if (wellId) params.set('well', wellId);
              router.push(`${pathname}?${params.toString()}`);
            }}
            className="p-2 rounded-md border hover:bg-gray-50"
            title="Fullscreen"
            aria-label="Fullscreen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
              <path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" strokeWidth="1.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              void exportCsv();
            }}
            disabled={exporting || rows === null}
            className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50"
            title={exporting ? 'Exporting…' : 'Save CSV'}
            aria-label="Save CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>
      {rows === null ? (
        <div className="fixed inset-0 z-40 bg-white/60 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-gray-300 border-t-[#3BA049] animate-spin" />
        </div>
      ) : (
        <DataTable<HistoryRow>
          columns={columns}
          rows={rows || []}
          pageSizeOptions={[10, 20, 50]}
          total={total}
          page={page}
          onPageChange={(p) => setPage(p)}
          pageSize={pageSize}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
        />
      )}
    </div>
  );
};

export default HistoryTable;
