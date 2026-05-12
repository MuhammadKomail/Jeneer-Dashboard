/**
 * Front-end limits for pump timing parameters (seconds, whole numbers).
 */
export const PUMP_TIME_FIELD_KEYS = ['minAir', 'maxAir', 'rest'] as const;
export type PumpTimeFieldKey = (typeof PUMP_TIME_FIELD_KEYS)[number];

export const PUMP_TIME_LIMITS: Record<
  PumpTimeFieldKey,
  { min: number; max: number; label: string }
> = {
  /** Air on time */
  minAir: { min: 1, max: 15, label: 'Air On Time' },
  /** Air flow timeout (0–25 sec) */
  maxAir: { min: 0, max: 25, label: 'Air Flow Timeout' },
  /** Delay */
  rest: { min: 2, max: 60, label: 'Delay' },
};

export function isPumpTimeField(field: string): field is PumpTimeFieldKey {
  return (PUMP_TIME_FIELD_KEYS as readonly string[]).includes(field);
}

/** Whole seconds within allowed range, or null if invalid / non-integer. */
export function parsePumpTimeSeconds(
  field: PumpTimeFieldKey,
  raw: string | number
): { ok: true; value: number } | { ok: false; error: string } {
  const { min, max, label } = PUMP_TIME_LIMITS[field];
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n)) {
    return { ok: false, error: `${label} must be a valid number` };
  }
  const v = Math.round(n);
  if (Math.abs(n - v) > 1e-6) {
    return { ok: false, error: `${label} must be a whole number of seconds` };
  }
  if (v < min || v > max) {
    return { ok: false, error: `${label} must be between ${min} and ${max} seconds` };
  }
  return { ok: true, value: v };
}

export function inputPropsForPumpTimeField(field: PumpTimeFieldKey) {
  const { min, max } = PUMP_TIME_LIMITS[field];
  return { min, max, step: 1 };
}
