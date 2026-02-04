import React from 'react';
import DataTable, { Column } from '@/components/table/DataTable';
import CircularProgress from '@mui/material/CircularProgress';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type SettingRow = {
  id: string;
  ts: string;
  highAdc: number;
  threshold: number;
  currentAdc: number;
  lowAdc: number;
  airOnTime: number;
  airTimeout: number;
  delay: number;
};

const fallbackRows: SettingRow[] = Array.from({ length: 18 }).map((_, i) => ({
  id: String(i + 1),
  ts: `2025-06-1${i} 08:06:40`,
  highAdc: 2800 + i,
  threshold: 4000,
  currentAdc: 2790 + i,
  lowAdc: 2790 + i,
  airOnTime: 7,
  airTimeout: i % 4 === 0 ? 1 : 0,
  delay: 5,
}));

const PumpSettingsTable: React.FC<{ deviceSerial?: string }> = ({ deviceSerial }) => {
  const [range, setRange] = React.useState<'24h' | '7d' | '30d'>('7d');
  const router = useRouter();
  const pathname = usePathname();
  const [rows, setRows] = React.useState<SettingRow[] | null>(null);
  const [total, setTotal] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [editing, setEditing] = React.useState<{ rowId: string; field: 'threshold' | 'airOnTime' | 'airTimeout' | 'delay'; value: string } | null>(null);
  const [saving, setSaving] = React.useState(false);

  const normalizeRows = React.useCallback((raw: any[]): SettingRow[] => {
    return raw.map((r: any, idx: number) => {
      const id = String(r?.id ?? r?.setting_id ?? r?.settingId ?? r?.settings_id ?? r?.ts ?? r?.timestamp ?? idx);
      const ts = String(r?.ts ?? r?.timestamp ?? r?.created_at ?? '');
      const highAdc = Number(r?.highAdc ?? r?.high_adc ?? r?.high_adc_reading ?? r?.high_adc_value ?? 0) || 0;
      const threshold = Number(r?.threshold ?? r?.adc_threshold ?? r?.adcThreshold ?? 0) || 0;
      const currentAdc = Number(r?.currentAdc ?? r?.current_adc ?? r?.current_adc_reading ?? 0) || 0;
      const lowAdc = Number(r?.lowAdc ?? r?.low_adc ?? r?.low_adc_reading ?? r?.low_adc_value ?? 0) || 0;
      const airOnTime = Number(r?.airOnTime ?? r?.air_on_time ?? r?.air_on ?? 0) || 0;
      const airTimeout = Number(r?.airTimeout ?? r?.air_timeout ?? r?.air_flow_timeout ?? 0) || 0;
      const delay = Number(r?.delay ?? r?.start_delay ?? 0) || 0;
      return { id, ts, highAdc, threshold, currentAdc, lowAdc, airOnTime, airTimeout, delay };
    });
  }, []);

  const startEdit = (row: SettingRow, field: 'threshold' | 'airOnTime' | 'airTimeout' | 'delay') => {
    setEditing({ rowId: row.id, field, value: String(row[field] ?? '') });
  };

  const saveEdit = async () => {
    if (!editing || !deviceSerial) return;
    const nextVal = Number(editing.value);
    if (!Number.isFinite(nextVal)) {
      toast.error('Invalid number');
      return;
    }

    const current = (rows || []).find(r => r.id === editing.rowId);
    if (!current) {
      toast.error('Row not found');
      return;
    }

    setSaving(true);
    try {
      const token = (() => { try { const m = document.cookie.match(/(?:^|; )AuthToken=([^;]+)/); return m ? decodeURIComponent(m[1]) : null; } catch { return null; } })();
      const url = `/admin/api/devices/${encodeURIComponent(deviceSerial)}/settings/${encodeURIComponent(editing.rowId)}`;
      const body = {
        threshold: editing.field === 'threshold' ? nextVal : current.threshold,
        airOnTime: editing.field === 'airOnTime' ? nextVal : current.airOnTime,
        airTimeout: editing.field === 'airTimeout' ? nextVal : current.airTimeout,
        delay: editing.field === 'delay' ? nextVal : current.delay,
      };

      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({} as any));
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error || json?.message || 'Failed to update settings');
      }

      setRows((prev) => {
        if (!prev) return prev;
        return prev.map(r => r.id === editing.rowId ? { ...r, ...body } : r);
      });
      toast.success('Settings updated');
      setEditing(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const renderEditable = (row: SettingRow, field: 'threshold' | 'airOnTime' | 'airTimeout' | 'delay') => {
    const isActive = editing?.rowId === row.id && editing?.field === field;
    if (!isActive) {
      return (
        <div className="inline-flex items-center gap-2">
          <span>{row[field]}</span>
          <button
            type="button"
            className="text-[#0D542B] disabled:opacity-50"
            onClick={() => startEdit(row, field)}
            disabled={saving}
            aria-label={`Edit ${field}`}
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-2">
        <input
          type="number"
          value={editing?.value ?? ''}
          onChange={(e) => setEditing((p) => p ? { ...p, value: e.target.value } : p)}
          className="w-24 px-2 py-1 border rounded"
          disabled={saving}
        />
        <button
          type="button"
          className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          onClick={saveEdit}
          disabled={saving}
          title="Save"
          aria-label="Save"
        >
          Save
        </button>
        <button
          type="button"
          className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          onClick={() => setEditing(null)}
          disabled={saving}
          title="Cancel"
          aria-label="Cancel"
        >
          Cancel
        </button>
      </div>
    );
  };

  const columns: Column<SettingRow>[] = React.useMemo(() => [
    { key: 'ts', header: 'Timestamp' },
    { key: 'highAdc', header: 'High ADC Reading' },
    { key: 'threshold', header: 'ADC Threshold Setting', render: (row) => renderEditable(row, 'threshold') },
    { key: 'currentAdc', header: 'Current ADC' },
    { key: 'lowAdc', header: 'Low ADC Reading' },
    { key: 'airOnTime', header: 'Air On Time', render: (row) => renderEditable(row, 'airOnTime') },
    { key: 'airTimeout', header: 'Air Flow Timeout', render: (row) => renderEditable(row, 'airTimeout') },
    { key: 'delay', header: 'Delay', render: (row) => renderEditable(row, 'delay') },
  ], [renderEditable, saving, editing]);

  React.useEffect(() => {
    let ignore = false;
    if (!deviceSerial) { setRows(fallbackRows); setTotal(fallbackRows.length); return; }
    (async () => {
      try {
        const token = (() => { try { const m = document.cookie.match(/(?:^|; )AuthToken=([^;]+)/); return m ? decodeURIComponent(m[1]) : null; } catch { return null; } })();
        const url = `/admin/api/devices/${encodeURIComponent(deviceSerial)}/settings?range=${range}&page=${page}&pageSize=${pageSize}`;
        const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined, cache: 'no-store' });
        const json = await res.json().catch(() => ({} as any));
        if (ignore) return;
        if (res.ok && Array.isArray(json?.rows)) {
          const normalized = normalizeRows(json.rows as any[]);
          setRows(normalized);
          setTotal(Number(json.total) || normalized.length);
        } else { setRows([]); setTotal(0); }
      } catch { if (!ignore) { setRows([]); setTotal(0); } }
    })();
    return () => { ignore = true; };
  }, [deviceSerial, range, page, pageSize, normalizeRows]);

  const exportCsv = () => {
    const header = ['Timestamp','High ADC Reading','ADC Threshold Setting','Current ADC','Low ADC Reading','Air On Time','Air Flow Timeout','Delay'];
    const lines = (rows || fallbackRows).map(r => [r.ts, r.highAdc, r.threshold, r.currentAdc, r.lowAdc, r.airOnTime, r.airTimeout, r.delay].join(','));
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
      {rows === null ? (
        <div className="w-full h-40 grid place-items-center">
          <CircularProgress color="success" size={28} />
        </div>
      ) : (
        <DataTable<SettingRow>
          columns={columns}
          rows={rows || []}
          pageSizeOptions={[10, 20, 50]}
          total={total}
          page={page}
          onPageChange={(p)=>setPage(p)}
          pageSize={pageSize}
          onPageSizeChange={(s)=>{ setPageSize(s); setPage(1); }}
        />
      )}
    </div>
  );
};

export default PumpSettingsTable;
