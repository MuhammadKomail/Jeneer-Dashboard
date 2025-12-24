"use client";

import React, { useEffect, useMemo, useState } from "react";
import DataTable, { Column } from "@/components/table/DataTable";
import toast from "react-hot-toast";

type ApiUser = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  site_id: number | null;
  site_name: string;
  is_active: boolean;
  is_current_user: boolean;
  created_at?: string;
  updated_at?: string;
};

type UsersListResponse = {
  data?: ApiUser[];
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
  error?: string;
  message?: string;
};

type RoleOption = {
  id: string;
  name: string;
};

type Company = {
  id: number;
  name: string;
};

type CompaniesResponse = {
  data?: Company[];
  meta?: { page: number; pageSize: number; total: number };
  error?: string;
  message?: string;
};

type Location = {
  id: number;
  comp_id: number;
  location: string;
};

type LocationsResponse = {
  data?: Location[];
  meta?: { page: number; pageSize: number; total: number };
  error?: string;
  message?: string;
};

type UserRow = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  siteName: string;
  siteId: number | null;
  isCurrentUser: boolean;
};

export default function UserManagementPage() {
  const [query, setQuery] = useState("");
  const [queryDebounced, setQueryDebounced] = useState("");
  const [role, setRole] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");
  const [siteId, setSiteId] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUserId, setConfirmUserId] = useState<number | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string>("");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const [usernameI, setUsernameI] = useState("");
  const [firstNameI, setFirstNameI] = useState("");
  const [lastNameI, setLastNameI] = useState("");
  const [emailI, setEmailI] = useState("");
  const [roleI, setRoleI] = useState("");
  const [companyI, setCompanyI] = useState("");
  const [siteI, setSiteI] = useState("");
  const [passwordI, setPasswordI] = useState("");

  // Minimal unauthorized handler (no external deps)
  const handleUnauthorized = () => {
    try {
      document.cookie = 'AuthToken=; Max-Age=0; path=/';
      document.cookie = 'RefreshToken=; Max-Age=0; path=/';
      document.cookie = 'user_object=; Max-Age=0; path=/';
      document.cookie = 'UserAuthenticated=; Max-Age=0; path=/';
    } catch {}
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}
    window.location.replace('/admin/login');
  };

  const mapApiUser = (u: ApiUser): UserRow => ({
    id: u.id,
    username: u.username,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    siteName: u.site_name || "",
    siteId: u.site_id ?? null,
    isCurrentUser: !!u.is_current_user,
  });

  const fetchUsers = async (opts?: { nextPage?: number; nextPageSize?: number; nextQuery?: string; nextRole?: string; nextSiteId?: string }) => {
    const nextPage = opts?.nextPage ?? page;
    const nextPageSize = opts?.nextPageSize ?? pageSize;
    const nextQuery = opts?.nextQuery ?? queryDebounced;
    const nextRole = opts?.nextRole ?? role;
    const nextSiteId = opts?.nextSiteId ?? siteId;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (nextQuery) params.set('q', nextQuery);
      if (nextRole) params.set('role', nextRole);
      if (nextSiteId) params.set('site_id', nextSiteId);
      params.set('page', String(nextPage));
      params.set('pageSize', String(nextPageSize));
      const url = `/admin/api/users?${params.toString()}`;
      const res = await fetch(url, { cache: 'no-store' });
      const data: UsersListResponse = await res.json().catch(() => ({} as any));
      if (res.status === 401 || (data as any)?.reason === 'invalid_token' || data?.error === 'unauthorized') {
        return handleUnauthorized();
      }
      if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to fetch users');

      const list = Array.isArray(data?.data) ? data.data : [];
      setUsers(list.map(mapApiUser));
      setTotal(data?.meta?.total ?? list.length);
      setPage(data?.meta?.page ?? nextPage);
      setPageSize(data?.meta?.pageSize ?? nextPageSize);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers({ nextPage: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setQueryDebounced(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    // Server-side filtering (q/role/site_id)
    setPage(1);
    fetchUsers({ nextPage: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryDebounced, role, siteId]);

  useEffect(() => {
    if (success) {
      toast.success(success);
      setSuccess(null);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error]);

  const fetchRoles = async () => {
    try {
      const res = await fetch('/admin/api/roles', { cache: 'no-store' });
      const data = await res.json().catch(() => ([] as any));
      if (res.status === 401 || data?.reason === 'invalid_token' || data?.error === 'unauthorized') {
        return handleUnauthorized();
      }
      if (!res.ok) throw new Error(data?.error || 'Failed to fetch roles');
      const list = Array.isArray(data) ? data : [];
      setRoles(list.map((r: any) => ({ id: String(r.id), name: String(r.name ?? r.id) })));
    } catch (e: any) {
      // ignore roles load errors (page still usable)
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/admin/api/companies?page=1&pageSize=100&sort=name&order=asc', { cache: 'no-store' });
      const data: CompaniesResponse = await res.json().catch(() => ({} as any));
      if (res.status === 401 || (data as any)?.reason === 'invalid_token' || data?.error === 'unauthorized') {
        return handleUnauthorized();
      }
      if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to fetch companies');
      setCompanies(Array.isArray(data?.data) ? data.data : []);
    } catch (e: any) {
      // ignore companies load errors
    }
  };

  const fetchLocations = async (compId: string) => {
    if (!compId) {
      setLocations([]);
      return;
    }
    setLocationsLoading(true);
    try {
      const res = await fetch(`/admin/api/locations?company_id=${encodeURIComponent(compId)}&page=1&pageSize=200&sort=location&order=asc`, { cache: 'no-store' });
      const data: LocationsResponse = await res.json().catch(() => ({} as any));
      if (res.status === 401 || (data as any)?.reason === 'invalid_token' || data?.error === 'unauthorized') {
        return handleUnauthorized();
      }
      if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to fetch locations');
      setLocations(Array.isArray(data?.data) ? data.data : []);
    } catch (e: any) {
      setLocations([]);
    } finally {
      setLocationsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSiteId('');
    fetchLocations(companyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    setSiteI('');
    if (companyI) fetchLocations(companyI);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyI]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter((r) => {
      const matchesQ = !q ||
        r.username.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.siteName.toLowerCase().includes(q);
      const matchesRole = !role || r.role.toLowerCase() === role.toLowerCase();
      const matchesSite = !siteId || r.siteId === Number(siteId);
      return matchesQ && matchesRole && matchesSite;
    });
  }, [query, role, siteId, users]);

  const columns: Column<UserRow>[] = useMemo(() => (
    [
      { key: "username", header: "Username" },
      { key: "fullName", header: "Full Name", className: "min-w-[200px]" },
      { key: "email", header: "Email", className: "min-w-[220px]" },
      { key: "role", header: "Role" },
      { key: "siteName", header: "Site" },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        cellClassName: "text-right",
        render: (row) => (
          <div className="inline-flex items-center gap-3">
            <button
              className="text-[#0D542B]"
              title="Edit"
              aria-label="Edit"
              onClick={() => {
                setEditUserId(row.id);
                setUsernameI(row.username);
                const parts = String(row.fullName || "").split(" ");
                setFirstNameI(parts[0] || "");
                setLastNameI(parts.slice(1).join(" "));
                setEmailI(row.email);
                setRoleI(row.role);
                setSiteI(row.siteName);
                setPasswordI("");
                setEditOpen(true);
                setSuccess(null);
                setError(null);
              }}
              disabled={busy}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" strokeWidth="1.5" />
              </svg>
            </button>
            <button
              className="text-red-600"
              title="Delete"
              aria-label="Delete"
              onClick={async () => {
                if (row.isCurrentUser) return;
                setConfirmUserId(row.id);
                setConfirmMessage('Are you sure you want to delete this user?');
                setConfirmOpen(true);
              }}
              disabled={busy || row.isCurrentUser}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                <path d="M6 7h12M9 7V5h6v2m-7 4v8m4-8v8m4-8v8M7 7l1 12m8-12-1 12" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        ),
      },
    ]
  ), [busy, query, role, siteId, users]);

  const resetForm = () => {
    setEditUserId(null);
    setUsernameI('');
    setFirstNameI('');
    setLastNameI('');
    setEmailI('');
    setRoleI('');
    setCompanyI('');
    setSiteI('');
    setPasswordI('');
  };

  const handleCreate = async () => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const site_id = siteI ? Number(siteI) : undefined;
      const body = {
        username: (usernameI || `${firstNameI} ${lastNameI}`.trim()).trim(),
        email: emailI.trim(),
        fullName: `${firstNameI} ${lastNameI}`.trim(),
        role: roleI,
        site_id: Number.isFinite(site_id as any) ? Number(site_id) : undefined,
        password: passwordI,
      };
      const res = await fetch('/admin/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({} as any));
      if (res.status === 401 || data?.reason === 'invalid_token' || data?.error === 'unauthorized') {
        return handleUnauthorized();
      }
      if (!res.ok || data?.success === false) throw new Error(data?.error || data?.message || 'Failed to create user');
      setSuccess('User created successfully');
      setInviteOpen(false);
      resetForm();
      await fetchUsers({ nextPage: 1 });
    } catch (e: any) {
      setError(e?.message || 'Failed to create user');
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async () => {
    if (!editUserId) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const site_id = siteI ? Number(siteI) : undefined;
      const body: any = {
        username: (usernameI || `${firstNameI} ${lastNameI}`.trim()).trim(),
        email: emailI.trim(),
        fullName: `${firstNameI} ${lastNameI}`.trim(),
        role: roleI,
        site_id: Number.isFinite(site_id as any) ? Number(site_id) : undefined,
      };
      if (passwordI.trim()) body.password = passwordI;

      const res = await fetch(`/admin/api/users/${encodeURIComponent(String(editUserId))}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({} as any));
      if (res.status === 401 || data?.reason === 'invalid_token' || data?.error === 'unauthorized') {
        return handleUnauthorized();
      }
      if (!res.ok || data?.success === false) throw new Error(data?.error || data?.message || 'Failed to update user');
      setSuccess('User updated successfully');
      setEditOpen(false);
      resetForm();
      await fetchUsers();
    } catch (e: any) {
      setError(e?.message || 'Failed to update user');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full">
      {(loading || busy || locationsLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-xl shadow-lg px-5 py-4 flex items-center gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-gray-200 border-t-[#3BA049] animate-spin" />
            <div className="text-sm text-gray-700">Loading...</div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-5 py-4 w-[420px] max-w-full" role="dialog" aria-modal="true">
            <div className="text-sm text-gray-900 font-medium">{confirmMessage}</div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded-md border text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmUserId(null);
                  setConfirmMessage('');
                }}
                disabled={busy}
              >
                No
              </button>
              <button
                className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
                onClick={async () => {
                  if (!confirmUserId) return;
                  setConfirmOpen(false);
                  setBusy(true);
                  setError(null);
                  setSuccess(null);
                  try {
                    const res = await fetch(`/admin/api/users/${encodeURIComponent(String(confirmUserId))}`, { method: 'DELETE' });
                    const data = await res.json().catch(() => ({} as any));
                    if (res.status === 401 || data?.reason === 'invalid_token' || data?.error === 'unauthorized') {
                      return handleUnauthorized();
                    }
                    if (!res.ok || data?.success === false) throw new Error(data?.error || data?.message || 'Failed to delete user');
                    setSuccess('User deleted successfully');
                    await fetchUsers();
                  } catch (e: any) {
                    setError(e?.message || 'Failed to delete user');
                  } finally {
                    setBusy(false);
                    setConfirmUserId(null);
                    setConfirmMessage('');
                  }
                }}
                disabled={busy}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar: single responsive row */}
      <div className="flex flex-wrap items-center gap-3 mb-3 w-full">
        <div className="relative basis-full md:flex-1 md:min-w-[1000px]">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-9 pr-3 py-2.5 bg-white border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3BA049]"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <select
            className="px-3 py-2 bg-white border rounded-md text-sm text-gray-700"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">By Role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 bg-white border rounded-md text-sm text-gray-700"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
          >
            <option value="">By Company</option>
            {companies.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className={`px-3 py-2 bg-white border rounded-md text-sm text-gray-700 ${
              !companyId || locationsLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            onMouseDown={(e) => {
              if (!companyId) {
                e.preventDefault();
                toast.error('Please select company first');
              }
              if (locationsLoading) {
                e.preventDefault();
              }
            }}
          >
            <option value="">By Site</option>
            {locationsLoading && <option value="" disabled>Loading...</option>}
            {locations.map((l) => (
              <option key={l.id} value={String(l.id)}>
                {l.location}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              resetForm();
              setInviteOpen(true);
              setSuccess(null);
              setError(null);
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#3BA049] hover:bg-[#33913F] text-white text-sm whitespace-nowrap"
          >
            Add User
            <span className="ml-1">+</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="w-full border rounded-xl px-4 py-10 text-center text-gray-500">Loading...</div>
      ) : (
        <DataTable<UserRow>
          columns={columns}
          rows={filtered}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={(p) => {
            setPage(p);
            fetchUsers({ nextPage: p });
          }}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
            fetchUsers({ nextPage: 1, nextPageSize: s });
          }}
          pageSizeOptions={[10, 20, 50]}
        />
      )}

      {inviteOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="text-base font-semibold text-gray-900">Invite User</div>
              <button onClick={() => setInviteOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="px-5 pb-5">
              <p className="text-sm text-gray-500 mb-4">Select user role and add user details below. Each user will receive an invitation via email.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative sm:col-span-2">
                  <input value={usernameI} onChange={(e)=>setUsernameI(e.target.value)} placeholder="Username" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="relative">
                  <input value={firstNameI} onChange={(e)=>setFirstNameI(e.target.value)} placeholder="First Name" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="relative">
                  <input value={lastNameI} onChange={(e)=>setLastNameI(e.target.value)} placeholder="Last Name" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="relative">
                  <input value={emailI} onChange={(e)=>setEmailI(e.target.value)} placeholder="Email Address" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <select value={roleI} onChange={(e)=>setRoleI(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm text-gray-700">
                    <option value="">Role</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <select value={companyI} onChange={(e)=>setCompanyI(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm text-gray-700">
                    <option value="">Company</option>
                    {companies.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <select
                    value={siteI}
                    onChange={(e)=>setSiteI(e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 ${
                      !companyI || locationsLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onMouseDown={(e) => {
                      if (!companyI) {
                        e.preventDefault();
                        toast.error('Please select company first');
                      }
                      if (locationsLoading) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <option value="">Site</option>
                    {locationsLoading && <option value="" disabled>Loading...</option>}
                    {locations.map((l) => (
                      <option key={l.id} value={String(l.id)}>
                        {l.location}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <input value={passwordI} onChange={(e)=>setPasswordI(e.target.value)} placeholder="Password" type="password" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="mt-3">
                <button
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#3BA049] hover:bg-[#33913F] text-white text-sm"
                  onClick={handleCreate}
                  disabled={busy || !emailI.trim() || !roleI.trim() || !passwordI.trim() || !siteI.trim()}
                >
                  {busy ? 'Saving...' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="text-base font-semibold text-gray-900">Edit User</div>
              <button
                onClick={() => {
                  setEditOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="px-5 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative sm:col-span-2">
                  <input value={usernameI} onChange={(e)=>setUsernameI(e.target.value)} placeholder="Username" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="relative">
                  <input value={firstNameI} onChange={(e)=>setFirstNameI(e.target.value)} placeholder="First Name" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="relative">
                  <input value={lastNameI} onChange={(e)=>setLastNameI(e.target.value)} placeholder="Last Name" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="relative">
                  <input value={emailI} onChange={(e)=>setEmailI(e.target.value)} placeholder="Email Address" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <select value={roleI} onChange={(e)=>setRoleI(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm text-gray-700">
                    <option value="">Role</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <select value={companyI} onChange={(e)=>setCompanyI(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm text-gray-700">
                    <option value="">Company</option>
                    {companies.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <select
                    value={siteI}
                    onChange={(e)=>setSiteI(e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 ${
                      !companyI || locationsLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onMouseDown={(e) => {
                      if (!companyI) {
                        e.preventDefault();
                        toast.error('Please select company first');
                      }
                      if (locationsLoading) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <option value="">Site</option>
                    {locationsLoading && <option value="" disabled>Loading...</option>}
                    {locations.map((l) => (
                      <option key={l.id} value={String(l.id)}>
                        {l.location}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <input value={passwordI} onChange={(e)=>setPasswordI(e.target.value)} placeholder="New Password (optional)" type="password" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="mt-3">
                <button
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#3BA049] hover:bg-[#33913F] text-white text-sm"
                  onClick={handleUpdate}
                  disabled={busy || !emailI.trim() || !roleI.trim() || !siteI.trim()}
                >
                  {busy ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
