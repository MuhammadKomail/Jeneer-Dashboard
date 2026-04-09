import React from 'react';
import DataTable, { Column } from '@/components/table/DataTable';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type SettingRow = {
  id: string;
  ts: string;
  highAdc: number;
  currentAdc: number;
  lowAdc: number;
  hold: number;
  minAir: number;
  maxAir: number;
  ledOn: number;
  purge: number;
  maxIdle: number;
  rest: number;
  thres: number;
  volPerCycle: number;
};

const formatTimestamp = (raw: string): string => {
  const s = String(raw || '').trim();
  if (!s) return '';
  const parsed = new Date(s.includes('T') ? s : s.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return s;
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(parsed);
  } catch {
    return parsed.toLocaleString();
  }
};

const format2 = (n: number): string => {
  const x = Number(n);
  if (!Number.isFinite(x)) return '';
  return Number.isInteger(x) ? String(x) : x.toFixed(2);
};

const fallbackRows: SettingRow[] = Array.from({ length: 18 }).map((_, i) => ({
  id: String(i + 1),
  ts: `2025-06-1${i} 08:06:40`,
  highAdc: 3150,
  currentAdc: 455,
  lowAdc: 310,
  hold: 1200,
  minAir: 3,
  maxAir: 15,
  ledOn: 7,
  purge: 10,
  maxIdle: 0,
  rest: 2,
  thres: 1499,
  volPerCycle: 0.3,
}));

const PumpSettingsTable: React.FC<{ deviceSerial?: string }> = ({ deviceSerial }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [rows, setRows] = React.useState<SettingRow[] | null>(null);
  const [total, setTotal] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [saving, setSaving] = React.useState(false);
  const [bulkEdit, setBulkEdit] = React.useState<{
    field: 'hold' | 'minAir' | 'maxAir' | 'ledOn' | 'purge' | 'maxIdle' | 'rest' | 'thres' | 'volPerCycle';
    label: string;
    value: string;
  } | null>(null);

  const normalizeRows = React.useCallback((raw: any[]): SettingRow[] => {
    return raw.map((r: any, idx: number) => {
      const id = String(r?.id ?? r?.setting_id ?? r?.settingId ?? r?.settings_id ?? r?.ts ?? r?.timestamp ?? idx);
      const ts = String(r?.ts ?? r?.timestamp ?? r?.created_at ?? '');
      const highAdc = Number(r?.highAdc ?? r?.high_adc ?? 0) || 0;
      const currentAdc = Number(r?.currentAdc ?? r?.current_adc ?? 0) || 0;
      const lowAdc = Number(r?.lowAdc ?? r?.low_adc ?? 0) || 0;
      const hold = Number(r?.hold ?? 0) || 0;
      const minAir = Number(r?.minAir ?? r?.min_air ?? 0) || 0;
      const maxAir = Number(r?.maxAir ?? r?.max_air ?? 0) || 0;
      const ledOn = Number(r?.ledOn ?? r?.led_on ?? 0) || 0;
      const purge = Number(r?.purge ?? 0) || 0;
      const maxIdle = Number(r?.maxIdle ?? r?.max_idle ?? 0) || 0;
      const rest = Number(r?.rest ?? 0) || 0;
      const thres = Number(r?.thres ?? r?.threshold ?? 0) || 0;
      const volPerCycle = Number(r?.volPerCycle ?? r?.vol_per_cycle ?? 0) || 0;
      return { id, ts, highAdc, currentAdc, lowAdc, hold, minAir, maxAir, ledOn, purge, maxIdle, rest, thres, volPerCycle };
    });
  }, []);

  const startBulkEdit = (field: 'hold' | 'minAir' | 'maxAir' | 'ledOn' | 'purge' | 'maxIdle' | 'rest' | 'thres' | 'volPerCycle', label: string) => {
    const first = (rows && rows.length > 0) ? rows[0] : null;
    const initial = first ? String(first[field] ?? '') : '';
    setBulkEdit({ field, label, value: initial });
  };

  const saveBulkEdit = async () => {
    if (!bulkEdit || !deviceSerial) return;
    const nextVal = Number(bulkEdit.value);
    if (!Number.isFinite(nextVal)) {
      toast.error('Invalid number');
      return;
    }

    const targetRowId = (() => {
      const first = (rows && rows.length > 0) ? rows[0] : null;
      return first?.id || '0';
    })();

    setSaving(true);
    try {
      const token = (() => { try { const m = document.cookie.match(/(?:^|; )AuthToken=([^;]+)/); return m ? decodeURIComponent(m[1]) : null; } catch { return null; } })();
      const url = `/admin/api/devices/${encodeURIComponent(deviceSerial)}/settings/${encodeURIComponent(targetRowId)}`;

      const body: any = {};
      body[bulkEdit.field] = nextVal;

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
        return prev.map(r => ({ ...r, [bulkEdit.field]: nextVal }));
      });

      toast.success('Settings updated');
      setBulkEdit(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const headerWithEdit = React.useCallback((label: string, field: 'hold' | 'minAir' | 'maxAir' | 'ledOn' | 'purge' | 'maxIdle' | 'rest' | 'thres' | 'volPerCycle') => {
    return (
      <div className="inline-flex items-center gap-2">
        <span>{label}</span>
        <button
          type="button"
          className="text-white/90 hover:text-white disabled:opacity-50"
          onClick={() => startBulkEdit(field, label)}
          disabled={saving || !deviceSerial}
          aria-label={`Edit ${label}`}
          title="Edit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    );
  }, [deviceSerial, saving, startBulkEdit]);

  const columns: Column<SettingRow>[] = React.useMemo(() => [
    { key: 'ts', header: 'Timestamp', render: (r) => formatTimestamp(r.ts) },
    { key: 'highAdc', header: 'High ADC Reading' },
    { key: 'thres', header: headerWithEdit('ADC Threshold Setting', 'thres') },
    { key: 'currentAdc', header: 'Current ADC' },
    { key: 'lowAdc', header: 'Low ADC Reading' },
    { key: 'minAir', header: headerWithEdit('Air On Time', 'minAir') },
    { key: 'maxAir', header: headerWithEdit('Air Flow Timeout', 'maxAir') },
    { key: 'rest', header: headerWithEdit('Delay', 'rest') },
    { key: 'volPerCycle', header: headerWithEdit('Vol Per Cycle', 'volPerCycle'), render: (r) => format2(r.volPerCycle) },
  ], [headerWithEdit]);

  React.useEffect(() => {
    let ignore = false;
    if (!deviceSerial) { setRows(fallbackRows); setTotal(fallbackRows.length); return; }
    (async () => {
      try {
        const token = (() => { try { const m = document.cookie.match(/(?:^|; )AuthToken=([^;]+)/); return m ? decodeURIComponent(m[1]) : null; } catch { return null; } })();
        const url = `/admin/api/devices/${encodeURIComponent(deviceSerial)}/settings?range=all&page=${page}&pageSize=${pageSize}`;
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
  }, [deviceSerial, page, pageSize, normalizeRows]);

  const exportCsv = () => {
    const header = ['Timestamp','High ADC Reading','ADC Threshold Setting','Current ADC','Low ADC Reading','Air On Time','Air Flow Timeout','Delay','Vol Per Cycle'];
    const lines = (rows || fallbackRows).map(r => [r.ts, r.highAdc, r.thres, r.currentAdc, r.lowAdc, r.minAir, r.maxAir, r.rest, r.volPerCycle].join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pump_settings_all.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <div className="text-base font-semibold">Jeneer FloatLes pump setting</div>
        <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
          {/* Expand fullscreen */}
          <button
            type="button"
            onClick={()=>{
              const url = `${pathname}?view=settings${deviceSerial ? `&device=${encodeURIComponent(deviceSerial)}` : ''}`;
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

      <Dialog open={!!bulkEdit} onClose={() => !saving && setBulkEdit(null)} fullWidth maxWidth="xs">
        <DialogTitle>Update {bulkEdit?.label}</DialogTitle>
        <DialogContent sx={{ pt: 2, overflow: 'visible' }}>
          <TextField
            label={bulkEdit?.label}
            placeholder=""
            InputLabelProps={{ shrink: true }}
            type="number"
            value={bulkEdit?.value ?? ''}
            onChange={(e) => setBulkEdit((p) => (p ? { ...p, value: e.target.value } : p))}
            fullWidth
            size="small"
            margin="dense"
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#fff',
              },
              '& .MuiInputBase-input': {
                color: '#111827',
              },
              '& .MuiInputLabel-root': {
                color: '#374151',
              },
            }}
            disabled={saving}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkEdit(null)} disabled={saving}>Cancel</Button>
          <Button variant="contained" color="success" onClick={saveBulkEdit} disabled={saving || !bulkEdit?.value?.trim()}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PumpSettingsTable;
