export const APP_TIMEZONE = 'America/New_York';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const pad2 = (n: number): string => String(n).padStart(2, '0');

/** True UTC / offset ISO instant from overview buckets (e.g. ...T04:00:00.000Z). */
function isUtcInstantString(s: string): boolean {
  return /Z$/i.test(s) || /[+-]\d{2}:\d{2}$/.test(s);
}

function getEasternParts(date: Date): DateTimeParts | null {
  if (Number.isNaN(date.getTime())) return null;
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: APP_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(date);
    const map = Object.fromEntries(parts.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]));
    return {
      year: Number(map.year),
      month: Number(map.month),
      day: Number(map.day),
      hour: Number(map.hour),
      minute: Number(map.minute),
      second: Number(map.second)
    };
  } catch {
    return null;
  }
}

/** Extract wall-clock date/time parts, ignoring any timezone suffix. */
export function extractWallClockParts(raw: unknown): DateTimeParts | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: match[4] !== undefined ? Number(match[4]) : 0,
    minute: match[5] !== undefined ? Number(match[5]) : 0,
    second: match[6] !== undefined ? Number(match[6]) : 0
  };
}

function resolveParts(raw: unknown): DateTimeParts | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  if (isUtcInstantString(s)) {
    return getEasternParts(new Date(s));
  }
  return extractWallClockParts(s);
}

export function parsePumpTimestampMs(raw: unknown): number {
  const s = String(raw ?? '').trim();
  if (!s) return 0;
  if (isUtcInstantString(s)) {
    const t = new Date(s).getTime();
    return Number.isNaN(t) ? 0 : t;
  }
  const parts = extractWallClockParts(s);
  if (!parts) return 0;
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

function formatParts(parts: DateTimeParts, includeYear: boolean, includeTime: boolean): string {
  const date = includeYear
    ? `${pad2(parts.day)} ${MONTHS_SHORT[parts.month - 1]} ${parts.year}`
    : `${pad2(parts.day)} ${MONTHS_SHORT[parts.month - 1]}`;
  if (!includeTime || (parts.hour === 0 && parts.minute === 0)) return date;
  return `${date}, ${pad2(parts.hour)}:${pad2(parts.minute)}`;
}

/**
 * Overview buckets are UTC ISO instants → convert to Eastern.
 * History/settings are already Eastern wall-clock strings → display as-is.
 * Midnight Eastern day buckets omit time (no more "04:00").
 */
export function formatPumpTimestamp(raw: unknown, includeYear = true): string {
  const parts = resolveParts(raw);
  if (!parts) return String(raw ?? '').trim();
  return formatParts(parts, includeYear, true);
}

export function formatPumpAxisLabel(
  raw: unknown,
  timeframe: 'day' | 'week' | 'month'
): string {
  const parts = resolveParts(raw);
  if (!parts) return String(raw ?? '').trim();
  if (timeframe === 'day') return `${pad2(parts.hour)}:${pad2(parts.minute)}`;
  return `${pad2(parts.day)} ${MONTHS_SHORT[parts.month - 1]}`;
}

/** True UTC instants (e.g. overview date_range) rendered in Eastern Time. */
export function formatUtcAsEastern(raw: unknown, includeTime = true): string {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  const parts = getEasternParts(new Date(s));
  if (!parts) return s;
  return formatParts(parts, true, includeTime);
}

export function formatNumber(value: number | null | undefined, digits = 2): string {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0
  });
}
