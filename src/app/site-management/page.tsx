"use client";

import React, { useEffect, useMemo, useState } from "react";
import DataTable, { Column } from "@/components/table/DataTable";
import toast from "react-hot-toast";

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

type ApiDevice = {
  id: number;
  device_serial: string;
  product: string;
  location_id: number;
  company_id: number;
};

type ApiSite = {
  location_id: number;
  site_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  total_pumps: number;
  devices: ApiDevice[];
};

type ApiCompanySites = {
  company_id: number;
  company_name: string;
  sites: ApiSite[];
};

type SitesWithDevicesResponse = {
  data?: ApiCompanySites[];
  error?: string;
  message?: string;
};

type SiteRow = {
  companyId: number;
  companyName: string;
  locationId: number;
  siteName: string;
  totalPumps: number;
};

type DeviceInput = {
  device_serial: string;
  product: string;
  description: string;
  well_id: number;
};

const columns: Column<SiteRow>[] = [
  { key: "companyName", header: "Company" },
  { key: "siteName", header: "Site Name" },
  { key: "totalPumps", header: "Total Pumps" },
  { key: "locationId", header: "Location ID" },
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

  const [rows, setRows] = useState<SiteRow[]>([]);
  const [apiLoadingCount, setApiLoadingCount] = useState(0);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyBusy, setCompanyBusy] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [companyNameI, setCompanyNameI] = useState("");
  const [companyAddressI, setCompanyAddressI] = useState("");
  const [companyCityI, setCompanyCityI] = useState("");
  const [companyStateI, setCompanyStateI] = useState("");
  const [companyZipI, setCompanyZipI] = useState("");

  const [siteCompanyIdI, setSiteCompanyIdI] = useState("");
  const [locationI, setLocationI] = useState("");
  const [deviceSerialI, setDeviceSerialI] = useState("");
  const [productI, setProductI] = useState("");
  const [descriptionI, setDescriptionI] = useState("");
  const [wellIdI, setWellIdI] = useState("");
  const [devices, setDevices] = useState<DeviceInput[]>([]);
  const [showPumpForm, setShowPumpForm] = useState(false);

  const [siteBusy, setSiteBusy] = useState(false);

  const beginLoading = () => setApiLoadingCount((c) => c + 1);
  const endLoading = () => setApiLoadingCount((c) => Math.max(0, c - 1));

  const resetAddSiteForm = () => {
    setSiteCompanyIdI('');
    setLocationI('');
    setDeviceSerialI('');
    setProductI('');
    setDescriptionI('');
    setWellIdI('');
    setDevices([]);
    setShowPumpForm(false);
  };

  const handleCreateSite = async () => {
    setSiteBusy(true);
    beginLoading();
    try {
      const payload = {
        comp_id: Number(siteCompanyIdI),
        location: locationI.trim(),
        devices,
      };

      const res = await fetch('/admin/api/locations/create-with-devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: any = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to create site');

      toast.success('Site created');
      setAddOpen(false);
      resetAddSiteForm();
      await fetchSites();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create site');
    } finally {
      setSiteBusy(false);
      endLoading();
    }
  };

  const fetchSites = async () => {
    beginLoading();
    try {
      const res = await fetch('/admin/api/companies/all/sites-with-devices', { cache: 'no-store' });
      const data: SitesWithDevicesResponse = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to fetch sites');
      const companiesList = Array.isArray(data?.data) ? data.data : [];
      const nextRows: SiteRow[] = [];
      for (const c of companiesList) {
        const sites = Array.isArray(c?.sites) ? c.sites : [];
        for (const s of sites) {
          nextRows.push({
            companyId: Number(c.company_id),
            companyName: String(c.company_name ?? ''),
            locationId: Number(s.location_id),
            siteName: String(s.site_name ?? ''),
            totalPumps: Number(s.total_pumps ?? 0),
          });
        }
      }
      setRows(nextRows);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to fetch sites');
      setRows([]);
    } finally {
      endLoading();
    }
  };

  const fetchCompanies = async () => {
    beginLoading();
    try {
      const res = await fetch('/admin/api/companies?page=1&pageSize=200&sort=name&order=asc', { cache: 'no-store' });
      const data: CompaniesResponse = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to fetch companies');
      setCompanies(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setCompanies([]);
    } finally {
      endLoading();
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchSites();
  }, []);

  const resetCompanyForm = () => {
    setCompanyNameI('');
    setCompanyAddressI('');
    setCompanyCityI('');
    setCompanyStateI('');
    setCompanyZipI('');
  };

  const handleCreateCompany = async () => {
    setCompanyBusy(true);
    beginLoading();
    try {
      const payload = {
        name: companyNameI.trim(),
        address: companyAddressI.trim(),
        city: companyCityI.trim(),
        state: companyStateI.trim(),
        zip: companyZipI.trim(),
      };

      const res = await fetch('/admin/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: any = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to create company');

      toast.success('Company created');
      setCompanyOpen(false);
      resetCompanyForm();
      await fetchCompanies();
      await fetchSites();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create company');
    } finally {
      setCompanyBusy(false);
      endLoading();
    }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter((r) => {
      const matchesQ = !q ||
        r.siteName.toLowerCase().includes(q) ||
        r.companyName.toLowerCase().includes(q) ||
        String(r.locationId).includes(q);
      const matchesCompany = !company || r.companyName === company;
      return matchesQ && matchesCompany;
    });
  }, [rows, query, company]);

  return (
    <div className="w-full">
      {apiLoadingCount > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-xl px-6 py-4 shadow-lg flex items-center gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-[#3BA049] animate-spin" />
            <div className="text-sm text-gray-700">Loading...</div>
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
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          >
            <option value="">By Company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              resetCompanyForm();
              setCompanyOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-[#3BA049] text-[#0D542B] bg-white hover:bg-[#E7F3EB] text-sm whitespace-nowrap"
          >
            Add Company
            <span className="ml-1">+</span>
          </button>
          <button
            onClick={() => {
              resetAddSiteForm();
              setAddOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#3BA049] hover:bg-[#33913F] text-white text-sm whitespace-nowrap"
          >
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
              <button onClick={() => !siteBusy && setAddOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="px-5 pb-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Company</label>
                  <select
                    value={siteCompanyIdI}
                    onChange={(e) => setSiteCompanyIdI(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm text-gray-700"
                  >
                    <option value="">Select company</option>
                    {companies.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Location</label>
                  <input value={locationI} onChange={(e)=>setLocationI(e.target.value)} placeholder="Pine Bluff 123" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Add Devices</label>
                  {!showPumpForm && (
                    <button
                      type="button"
                      onClick={() => setShowPumpForm(true)}
                      className="text-[#3BA049] text-xs"
                    >
                      + Add New Device
                    </button>
                  )}

                  {showPumpForm && (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_1fr_auto_auto] gap-2 items-center">
                      <input value={deviceSerialI} onChange={(e)=>setDeviceSerialI(e.target.value)} placeholder="Device Serial" className="w-full border rounded-md px-3 py-2 text-sm" />
                      <input value={productI} onChange={(e)=>setProductI(e.target.value)} placeholder="Product" className="w-full border rounded-md px-3 py-2 text-sm" />
                      <input value={descriptionI} onChange={(e)=>setDescriptionI(e.target.value)} placeholder="Description" className="w-full border rounded-md px-3 py-2 text-sm" />
                      <input value={wellIdI} onChange={(e)=>setWellIdI(e.target.value)} placeholder="Well ID" className="w-full border rounded-md px-3 py-2 text-sm" />
                      <button
                        type="button"
                        onClick={() => {
                          const nextWell = Number(wellIdI);
                          if (!deviceSerialI || !productI || !descriptionI || !Number.isFinite(nextWell)) return;
                          setDevices((prev)=>[
                            ...prev,
                            {
                              device_serial: deviceSerialI,
                              product: productI,
                              description: descriptionI,
                              well_id: nextWell,
                            },
                          ]);
                          setDeviceSerialI("");
                          setProductI("");
                          setDescriptionI("");
                          setWellIdI("");
                          setShowPumpForm(false);
                        }}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-[#3BA049] hover:bg-[#33913F] text-white text-sm whitespace-nowrap"
                      >
                        Add Device
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDeviceSerialI(""); setProductI(""); setDescriptionI(""); setWellIdI(""); setShowPumpForm(false); }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {devices.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {devices.map((d, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-800 border">
                          {d.device_serial}
                          <button onClick={() => setDevices((prev)=>prev.filter((_,i)=>i!==idx))} className="text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <button
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#3BA049] hover:bg-[#33913F] text-white text-sm disabled:opacity-60"
                  onClick={handleCreateSite}
                  disabled={siteBusy || !siteCompanyIdI || !locationI.trim()}
                >
                  {siteBusy ? 'Saving...' : 'Add Site'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {companyOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="text-base font-semibold text-gray-900">Add Company</div>
              <button onClick={() => !companyBusy && setCompanyOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="px-5 pb-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Name</label>
                  <input value={companyNameI} onChange={(e)=>setCompanyNameI(e.target.value)} placeholder="WC" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Address</label>
                  <input value={companyAddressI} onChange={(e)=>setCompanyAddressI(e.target.value)} placeholder="Addr" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">City</label>
                    <input value={companyCityI} onChange={(e)=>setCompanyCityI(e.target.value)} placeholder="X" className="w-full border rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">State</label>
                    <input value={companyStateI} onChange={(e)=>setCompanyStateI(e.target.value)} placeholder="Y" className="w-full border rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Zip</label>
                    <input value={companyZipI} onChange={(e)=>setCompanyZipI(e.target.value)} placeholder="000" className="w-full border rounded-md px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#3BA049] hover:bg-[#33913F] text-white text-sm disabled:opacity-60"
                  onClick={handleCreateCompany}
                  disabled={companyBusy || !companyNameI.trim()}
                >
                  {companyBusy ? 'Saving...' : 'Add Company'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
