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
    second: match[6] !== undefined ? Number(match[6]) : 0,
  };
}

export function parsePumpTimestampMs(raw: unknown): number {
  const parts = extractWallClockParts(raw);
  if (!parts) return 0;
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

/** Pump/history timestamps are already Eastern wall-clock values from the API. */
export function formatPumpTimestamp(raw: unknown, includeYear = true): string {
  const parts = extractWallClockParts(raw);
  if (!parts) return String(raw ?? '').trim();
  const date = `${pad2(parts.day)} ${MONTHS_SHORT[parts.month - 1]}`;
  const time = `${pad2(parts.hour)}:${pad2(parts.minute)}`;
  if (includeYear) return `${date} ${parts.year}, ${time}`;
  return `${date}, ${time}`;
}

export function formatPumpAxisLabel(
  raw: unknown,
  timeframe: 'day' | 'week' | 'month',
): string {
  const parts = extractWallClockParts(raw);
  if (!parts) return String(raw ?? '').trim();
  if (timeframe === 'day') return `${pad2(parts.hour)}:${pad2(parts.minute)}`;
  return `${pad2(parts.day)} ${MONTHS_SHORT[parts.month - 1]}`;
}

/** True UTC instants (e.g. overview date_range) rendered in Eastern Time. */
export function formatUtcAsEastern(raw: unknown, includeTime = true): string {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) return s;
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: APP_TIMEZONE,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
    }).format(parsed);
  } catch {
    return parsed.toLocaleString('en-US', { timeZone: APP_TIMEZONE });
  }
}
