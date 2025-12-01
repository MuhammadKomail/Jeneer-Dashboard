"use client";

import React, { useMemo, useState } from "react";
import DataTable, { Column } from "@/components/table/DataTable";

type SiteRow = {
  company: string;
  siteName: string;
  location: string;
  status: "Active" | "Inactive" | "Maintenance";
  managers: string;
};

const rows: SiteRow[] = Array.from({ length: 24 }).map((_, i) => ({
  company: i % 3 === 0 ? "WC" : i % 3 === 1 ? "LCI" : "Republic",
  siteName: `Pine Bluff ${100 + i}`,
  location: i % 2 === 0 ? "Karachi" : "Lahore",
  status: (i % 3 === 0 ? "Active" : i % 3 === 1 ? "Inactive" : "Maintenance") as SiteRow["status"],
  managers: "John Doe, Jane Doe",
}));

const columns: Column<SiteRow>[] = [
  { key: "company", header: "Company" },
  { key: "siteName", header: "Site Name" },
  { key: "totalPumps", header: "Total Pumps", render: (_r, i) => 10 + (i % 5) },
  { key: "wellId", header: "Well ID", render: (_r, i) => `00${i}` },
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

export default function SiteManagementPage() {
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState<string>("");
  const [addOpen, setAddOpen] = useState(false);
  const [companyI, setCompanyI] = useState("");
  const [siteNameI, setSiteNameI] = useState("");
  const [pumpSerial, setPumpSerial] = useState("");
  const [wellId, setWellId] = useState("");
  const [pumps, setPumps] = useState<{ serial: string; well: string }[]>([]);
  const [showPumpForm, setShowPumpForm] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter((r) => {
      const matchesQ = !q ||
        r.siteName.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        r.managers.toLowerCase().includes(q);
      const matchesCompany = !company || r.company === company;
      return matchesQ && matchesCompany;
    });
  }, [query, company]);

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
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          >
            <option value="">By Company</option>
            <option value="WC">WC</option>
            <option value="LCI">LCI</option>
            <option value="Republic">Republic</option>
          </select>
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#3BA049] hover:bg-[#33913F] text-white text-sm whitespace-nowrap">
            Add Site
            <span className="ml-1">+</span>
          </button>
        </div>
      </div>

      <DataTable<SiteRow>
        columns={columns}
        rows={filtered}
        pageSizeOptions={[10, 20, 50]}
      />

      {addOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="text-base font-semibold text-gray-900">Add Site</div>
              <button onClick={() => setAddOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="px-5 pb-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Company</label>
                  <input value={companyI} onChange={(e)=>setCompanyI(e.target.value)} placeholder="Company Name" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Site Name</label>
                  <input value={siteNameI} onChange={(e)=>setSiteNameI(e.target.value)} placeholder="Site Name" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Add Pumps</label>
                  {!showPumpForm && (
                    <button
                      type="button"
                      onClick={() => setShowPumpForm(true)}
                      className="text-[#3BA049] text-xs"
                    >
                      + Add New Pump
                    </button>
                  )}

                  {showPumpForm && (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                      <input value={pumpSerial} onChange={(e)=>setPumpSerial(e.target.value)} placeholder="Serial Number" className="w-full border rounded-md px-3 py-2 text-sm" />
                      <input value={wellId} onChange={(e)=>setWellId(e.target.value)} placeholder="Well ID" className="w-full border rounded-md px-3 py-2 text-sm" />
                      <button
                        type="button"
                        onClick={() => {
                          if (!pumpSerial || !wellId) return;
                          setPumps((prev)=>[...prev, { serial: pumpSerial, well: wellId }]);
                          setPumpSerial(""); setWellId("");
                          setShowPumpForm(false);
                        }}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-[#3BA049] hover:bg-[#33913F] text-white text-sm whitespace-nowrap"
                      >
                        Add Pump
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPumpSerial(""); setWellId(""); setShowPumpForm(false); }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {pumps.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pumps.map((p, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-800 border">
                          {p.serial}
                          <button onClick={() => setPumps((prev)=>prev.filter((_,i)=>i!==idx))} className="text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <button className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#3BA049] hover:bg-[#33913F] text-white text-sm" onClick={() => setAddOpen(false)}>
                  Add Site
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
