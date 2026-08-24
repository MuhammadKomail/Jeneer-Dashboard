export const ADDON_KEYS = ['liquid_level', 'vacuum', 'temperature', 'fm_pressure'] as const;

export type AddonKey = (typeof ADDON_KEYS)[number];

export const ADDON_LABELS: Record<AddonKey, string> = {
  liquid_level: 'Liquid Level',
  vacuum: 'Vacuum',
  temperature: 'Temperature',
  fm_pressure: 'FM Pressure',
};

export function normalizeAddons(input: unknown): AddonKey[] {
  const list = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(input);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return input.split(',').map((s) => s.trim()).filter(Boolean);
          }
        })()
      : [];

  const allowed = new Set<string>(ADDON_KEYS);
  return [...new Set(list.map((k) => String(k || '').trim()).filter((k): k is AddonKey => allowed.has(k)))];
}

export function isAdminRole(role: unknown): boolean {
  const r = String(role || '').trim().toLowerCase();
  return r === 'admin' || r === 'system administrator' || r === 'system admin' || r === 'super admin';
}

export function readUserAddons(): AddonKey[] {
  try {
    if (typeof window === 'undefined') return [];
    const role = localStorage.getItem('role');
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : null;
    if (isAdminRole(role) || isAdminRole(user?.role)) return [...ADDON_KEYS];
    return normalizeAddons(user?.addons);
  } catch {
    return [];
  }
}

/** Site empty → user-only. Site set + user empty → inherit site. Both set → site ∩ user. */
export function resolveAddons({
  userAddons,
  siteAddons,
  roles = [],
}: {
  userAddons?: unknown;
  siteAddons?: unknown;
  roles?: unknown[];
} = {}): AddonKey[] {
  const isAdmin = roles.some((role) => isAdminRole(role));
  const site = normalizeAddons(siteAddons);
  const user = normalizeAddons(userAddons);

  if (isAdmin) return site.length ? site : [...ADDON_KEYS];
  if (!site.length) return user;
  if (!user.length) return site;
  return user.filter((k) => site.includes(k));
}
