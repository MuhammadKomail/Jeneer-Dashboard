"use client";

import React, { useMemo, useState } from "react";
import DataTable, { Column } from "@/components/table/DataTable";

type UserRow = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  site: string;
};

const rows: UserRow[] = Array.from({ length: 18 }).map((_, i) => ({
  firstName: "John",
  lastName: "Doe",
  email: `john.doe${i}@example.com`,
  role: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Basic" : "Manager",
  site: "LCI",
}));

const columns: Column<UserRow>[] = [
  { key: "firstName", header: "First Name" },
  { key: "lastName", header: "Last Name" },
  { key: "email", header: "Email", className: "min-w-[220px]" },
  { key: "role", header: "Role" },
  { key: "site", header: "Site" },
  {
    key: "actions",
    header: "Actions",
    className: "text-right",
    cellClassName: "text-right",
    render: (_row) => (
      <div className="inline-flex items-center gap-3">
        <button className="text-[#0D542B]" title="Edit" aria-label="Edit">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" strokeWidth="1.5" />
          </svg>
        </button>
        <button className="text-red-600" title="Delete" aria-label="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
            <path d="M6 7h12M9 7V5h6v2m-7 4v8m4-8v8m4-8v8M7 7l1 12m8-12-1 12" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    ),
  },
];

export default function UserManagementPage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string>("");
  const [site, setSite] = useState<string>("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [firstNameI, setFirstNameI] = useState("");
  const [lastNameI, setLastNameI] = useState("");
  const [emailI, setEmailI] = useState("");
  const [roleI, setRoleI] = useState("");
  const [siteI, setSiteI] = useState("");
  const [invited, setInvited] = useState<string[]>(["jane@modoui.com", "jane@modoui.com", "jane@modoui.com"]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter((r) => {
      const matchesQ = !q ||
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.site.toLowerCase().includes(q);
      const matchesRole = !role || r.role === role;
      const matchesSite = !site || r.site === site;
      return matchesQ && matchesRole && matchesSite;
    });
  }, [query, role, site]);

  return (
    <div className="w-full">
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
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Basic">Basic</option>
          </select>
          <select
            className="px-3 py-2 bg-white border rounded-md text-sm text-gray-700"
            value={site}
            onChange={(e) => setSite(e.target.value)}
          >
            <option value="">By Site</option>
            <option value="LCI">LCI</option>
            <option value="ABC">ABC</option>
            <option value="XYZ">XYZ</option>
          </select>
          <button onClick={() => setInviteOpen(true)} className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#3BA049] hover:bg-[#33913F] text-white text-sm whitespace-nowrap">
            Add User
            <span className="ml-1">+</span>
          </button>
        </div>
      </div>

      <DataTable<UserRow>
        columns={columns}
        rows={filtered}
        pageSizeOptions={[10, 20, 50]}
      />

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
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Basic">Basic</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <select value={siteI} onChange={(e)=>setSiteI(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm text-gray-700">
                    <option value="">Site</option>
                    <option value="LCI">LCI</option>
                    <option value="ABC">ABC</option>
                    <option value="XYZ">XYZ</option>
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <button
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#3BA049] hover:bg-[#33913F] text-white text-sm"
                  onClick={() => {
                    if (emailI) setInvited((prev)=>[emailI, ...prev]);
                    setFirstNameI(""); setLastNameI(""); setEmailI(""); setRoleI(""); setSiteI("");
                  }}
                >
                  Create User
                </button>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium text-gray-900 mb-2">Invited</div>
                <div className="space-y-2">
                  {invited.map((em, idx)=> (
                    <div key={idx} className="flex items-center justify-between border rounded-md px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex w-6 h-6 rounded-full bg-gray-200" />
                        <span className="text-sm text-gray-900">{em}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Pending</span>
                        <button className="text-gray-500">⋮</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
