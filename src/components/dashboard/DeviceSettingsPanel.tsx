import React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import toast from 'react-hot-toast';

type DeviceSettingsRow = {
  setting_id: number | string;
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

type SettingFieldKey = 'hold' | 'minAir' | 'maxAir' | 'ledOn' | 'purge' | 'maxIdle' | 'rest' | 'thres' | 'volPerCycle';

type FieldConfig = {
  key: SettingFieldKey;
  label: string;
  unit: string;
  step?: string;
};

const editableFields: FieldConfig[] = [
  { key: 'hold', label: 'Timeout Duration', unit: 'sec' },
  { key: 'minAir', label: 'Air On Time', unit: 'sec' },
  { key: 'maxAir', label: 'Airflow Timeout', unit: 'sec' },
  { key: 'ledOn', label: 'Display On Time', unit: 'sec' },
  { key: 'purge', label: 'Purge Time', unit: 'sec' },
  { key: 'maxIdle', label: 'Max Idle Time', unit: 'sec' },
  { key: 'rest', label: 'Delay', unit: 'sec' },
  { key: 'thres', label: 'Sensor Threshold', unit: 'V', step: '0.1' },
  { key: 'volPerCycle', label: 'Cycle Volume', unit: 'mL', step: '0.1' },
];

const readOnlyAdcFields: Array<{ key: keyof Pick<DeviceSettingsRow, 'highAdc' | 'currentAdc' | 'lowAdc'>; label: string }> = [
  { key: 'highAdc', label: 'High ADC' },
  { key: 'currentAdc', label: 'Current ADC' },
  { key: 'lowAdc', label: 'Low ADC' },
];

const getToken = (): string | null => {
  try {
    const match = document.cookie.match(/(?:^|; )AuthToken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

const formatTimestamp = (raw: string): string => {
  const s = String(raw || '').trim();
  if (!s) return '-';
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

const formatNumber = (value: number | string | null | undefined): string => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

const parseNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const getApiBaseUrl = (): string => {
  return (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
};

const buildBackendUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

const normalizeRow = (row: any): DeviceSettingsRow => ({
  setting_id: row?.setting_id ?? row?.settingId ?? row?.id ?? '',
  ts: String(row?.ts ?? row?.timestamp ?? row?.created_at ?? ''),
  highAdc: parseNumber(row?.highAdc ?? row?.high_adc ?? row?.high_adc_reading ?? row?.high_adc_value),
  currentAdc: parseNumber(row?.currentAdc ?? row?.current_adc ?? row?.current_adc_reading),
  lowAdc: parseNumber(row?.lowAdc ?? row?.low_adc ?? row?.low_adc_reading ?? row?.low_adc_value),
  hold: parseNumber(row?.hold),
  minAir: parseNumber(row?.minAir ?? row?.min_air ?? row?.airOnTime ?? row?.air_on_time ?? row?.air_on),
  maxAir: parseNumber(row?.maxAir ?? row?.max_air ?? row?.airTimeout ?? row?.air_timeout ?? row?.air_flow_timeout),
  ledOn: parseNumber(row?.ledOn ?? row?.led_on),
  purge: parseNumber(row?.purge),
  maxIdle: parseNumber(row?.maxIdle ?? row?.max_idle),
  rest: parseNumber(row?.rest),
  thres: parseNumber(row?.thres ?? row?.threshold ?? row?.adc_threshold ?? row?.adcThreshold),
  volPerCycle: parseNumber(row?.volPerCycle ?? row?.vol_per_cycle ?? row?.vol_percycle),
});

const toDraft = (settings: DeviceSettingsRow): Record<SettingFieldKey, string> => ({
  hold: String(settings.hold ?? ''),
  minAir: String(settings.minAir ?? ''),
  maxAir: String(settings.maxAir ?? ''),
  ledOn: String(settings.ledOn ?? ''),
  purge: String(settings.purge ?? ''),
  maxIdle: String(settings.maxIdle ?? ''),
  rest: String(settings.rest ?? ''),
  thres: String(settings.thres ?? ''),
  volPerCycle: String(settings.volPerCycle ?? ''),
});

const DeviceSettingsPanel: React.FC<{ deviceSerial?: string }> = ({ deviceSerial }) => {
  const [settings, setSettings] = React.useState<DeviceSettingsRow | null>(null);
  const [draft, setDraft] = React.useState<Record<SettingFieldKey, string> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadSettings = React.useCallback(async () => {
    if (!deviceSerial) {
      setSettings(null);
      setDraft(null);
      setError('Select a device to view its settings.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const res = await fetch(
        `${buildBackendUrl(`/admin/api/devices/${encodeURIComponent(deviceSerial)}/settings`)}?range=all&page=1&pageSize=1`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: 'no-store',
        }
      );

      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        throw new Error(json?.error || json?.message || 'Failed to load settings');
      }

      const firstRow = Array.isArray(json?.rows) && json.rows.length > 0 ? json.rows[0] : null;
      if (!firstRow) {
        setSettings(null);
        setDraft(null);
        setError('No settings found for this device.');
        return;
      }

      const normalized = normalizeRow(firstRow);
      setSettings(normalized);
      setDraft(toDraft(normalized));
    } catch (e: any) {
      const message = e?.message || 'Failed to load settings';
      setError(message);
      setSettings(null);
      setDraft(null);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [deviceSerial]);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleFieldChange = (field: SettingFieldKey, value: string) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!deviceSerial || !settings || !draft) return;

    const changes: Partial<Record<SettingFieldKey, number>> = {};

    for (const field of editableFields) {
      const nextValue = Number(draft[field.key]);
      if (!Number.isFinite(nextValue)) {
        toast.error(`${field.label} must be a valid number`);
        return;
      }

      if (nextValue !== settings[field.key]) {
        changes[field.key] = nextValue;
      }
    }

    if (Object.keys(changes).length === 0) {
      toast('No changes to save');
      return;
    }

    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch(
        buildBackendUrl(`/admin/api/devices/${encodeURIComponent(deviceSerial)}/settings/${encodeURIComponent(String(settings.setting_id))}`),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(changes),
        }
      );

      const json = await res.json().catch(() => ({} as any));
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error || json?.message || 'Failed to update settings');
      }

      toast.success('Settings updated successfully');
      await loadSettings();
    } catch (e: any) {
      const message = e?.message || 'Failed to update settings';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const disabled = loading || saving || !deviceSerial;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Pump Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {deviceSerial ? `Device ${deviceSerial}` : 'No device selected'}
          </Typography>
          {settings?.ts ? (
            <Typography variant="caption" color="text.secondary">
              Last synced: {formatTimestamp(settings.ts)}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={loadSettings} disabled={loading || saving || !deviceSerial}>
            Refresh
          </Button>
          <Button variant="contained" color="success" onClick={handleSave} disabled={disabled || !settings || !draft}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #EAECF0', display: 'flex', justifyContent: 'center' }}>
          <CircularProgress color="success" size={30} />
        </Paper>
      ) : error && !settings ? (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      ) : settings && draft ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #EAECF0' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Sensor Readings
            </Typography>
            <Grid container spacing={2}>
              {readOnlyAdcFields.map((field) => (
                <Grid item xs={12} md={4} key={field.key}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#F9FAFB',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {field.label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formatNumber(settings[field.key])}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #EAECF0' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Editable Controls
            </Typography>
            <Grid container spacing={2}>
              {editableFields.map((field) => (
                <Grid item xs={12} sm={6} md={4} key={field.key}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={`${field.label} (${field.unit})`}
                    value={draft[field.key] ?? ''}
                    onChange={(event) => handleFieldChange(field.key, event.target.value)}
                    disabled={disabled}
                    inputProps={field.step ? { step: field.step } : undefined}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      ) : null}
    </Box>
  );
};

export default DeviceSettingsPanel;
