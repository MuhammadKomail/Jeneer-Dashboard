'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Autocomplete
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

type Role = {
  id: string;
  name: string;
  description?: string | null;
  allowed_tables: string[];
  allowed_routes: string[];
  created_at?: string | null;
  updated_at?: string | null;
};

// Hardcoded options
const presetTables = ['auth_users', 'company', 'device', 'locations', 'pump_data', 'pump_settings', 'roles', 'user_sessions'];
const presetRoutes = ['dashboard','users:list','users:create','users:edit','roles:manage','companies','locations','devices','pump_settings','pump_data','reports','change_password',];

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof Role>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Add dialog state
  const [openAdd, setOpenAdd] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTables, setNewTables] = useState<string[]>(['auth_users', 'device', 'locations']);
  const [newRoutes, setNewRoutes] = useState<string[]>(['dashboard', 'user-management']);

  // Edit dialog state
  const [openEdit, setOpenEdit] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);

  // Delete confirm
  const [openDelete, setOpenDelete] = useState<null | string>(null);

  const filteredSorted = useMemo(() => {
    const q = search.toLowerCase();
    let list = roles.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q)
    );
    list = list.sort((a, b) => {
      const av = (a[sortKey] || '') as any; const bv = (b[sortKey] || '') as any;
      const res = String(av).localeCompare(String(bv));
      return sortAsc ? res : -res;
    });
    return list;
  }, [roles, search, sortKey, sortAsc]);

  // Minimal unauthorized handler (no external deps)
  const handleUnauthorized = () => {
    try {
      document.cookie = 'AuthToken=; Max-Age=0; path=/';
      document.cookie = 'RefreshToken=; Max-Age=0; path=/';
      document.cookie = 'user_object=; Max-Age=0; path=/';
      document.cookie = 'UserAuthenticated=; Max-Age=0; path=/';
    } catch { }
    try { localStorage.clear(); } catch { }
    try { sessionStorage.clear(); } catch { }
    window.location.replace('/admin/login');
  };

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/admin/api/roles', { cache: 'no-store' });
      const data = await res.json();
      if (res.status === 401 || data?.reason === 'invalid_token' || data?.error === 'unauthorized') {
        return handleUnauthorized();
      }
      if (!res.ok) throw new Error(data?.error || 'Failed to fetch roles');
      setRoles(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleAdd = async () => {
    setBusy(true); setError(null); setSuccess(null);
    try {
      const body = {
        id: newId.trim(),
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        allowed_tables: newTables,
        allowed_routes: newRoutes,
      };
      const res = await fetch('/admin/api/roles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || data?.reason === 'invalid_token' || data?.error === 'unauthorized') {
        return handleUnauthorized();
      }
      if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to add role');
      setSuccess('Role created');
      setOpenAdd(false);
      setNewId(''); setNewName(''); setNewDescription(''); setNewTables(['auth_users', 'device', 'locations']); setNewRoutes(['dashboard', 'user-management']);
      await fetchRoles();
    } catch (e: any) {
      setError(e?.message || 'Failed to add role');
    } finally { setBusy(false); }
  };

  const handleDelete = async (roleId: string) => {
    setBusy(true); setError(null); setSuccess(null);
    try {
      const res = await fetch(`/admin/api/roles/${encodeURIComponent(roleId)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || data?.reason === 'invalid_token' || data?.error === 'unauthorized') {
        return handleUnauthorized();
      }
      if (!res.ok || data?.success === false) throw new Error(data?.error || data?.message || 'Failed to delete role');
      setSuccess('Role deleted');
      setOpenDelete(null);
      await fetchRoles();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete role');
    } finally { setBusy(false); }
  };

  const openEditDialog = (r: Role) => {
    setEditRole(r);
    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    if (!editRole) return;
    setBusy(true); setError(null); setSuccess(null);
    try {
      const body = {
        name: editRole.name,
        description: editRole.description,
        allowed_tables: editRole.allowed_tables,
        allowed_routes: editRole.allowed_routes,
      };
      const res = await fetch(`/admin/api/roles/${encodeURIComponent(editRole.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || data?.reason === 'invalid_token' || data?.error === 'unauthorized') {
        return handleUnauthorized();
      }
      if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to update role');
      setSuccess('Role updated');
      setOpenEdit(false);
      await fetchRoles();
    } catch (e: any) {
      setError(e?.message || 'Failed to update role');
    } finally { setBusy(false); }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h5">Role Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField size="small" placeholder="Search roles" value={search} onChange={e => setSearch(e.target.value)} />
          <Button variant="contained" onClick={() => setOpenAdd(true)}>Add Role</Button>
        </Stack>
      </Toolbar>

      <Paper sx={{ p: 0, m: 0, height: 'calc(100vh - 200px)', width: '100%', display: 'flex', flexDirection: 'column', borderRadius: 1, overflow: 'hidden' }}>
        <TableContainer sx={{ flex: 1, height: '100%', width: '100%', overflowX: 'auto' }}>
          <Table stickyHeader size="small" sx={{ minWidth: { xs: 760, sm: 960, md: 1200 }, width: '100%', tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                {(['name', 'id', 'description'] as (keyof Role)[]).map((k, idx) => (
                  <TableCell
                    key={String(k)}
                    onClick={() => { setSortKey(k); setSortAsc(k === sortKey ? !sortAsc : true); }}
                    sx={{
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      width: k === 'name' ? { xs: '18%', md: '11%' } : k === 'id' ? { xs: '16%', md: '10%' } : { xs: '30%', md: '22%' },
                      position: idx === 0 ? 'sticky' : 'static',
                      left: idx === 0 ? 0 : 'auto',
                      zIndex: idx === 0 ? 3 : 'auto',
                      backgroundColor: 'background.paper',
                    }}
                    className={idx === 0 ? 'sticky-cell' : undefined}
                  >
                    <b>{String(k)}</b>{sortKey === k ? (sortAsc ? ' ▲' : ' ▼') : ''}
                  </TableCell>
                ))}
                <TableCell sx={{ width: { xs: '34%', md: '30%' } }}><b>allowed_tables</b></TableCell>
                <TableCell sx={{ width: { xs: '30%', md: '22%' } }}><b>allowed_routes</b></TableCell>
                <TableCell align="right" sx={{ width: { xs: '10%', md: '5%' }, whiteSpace: 'nowrap' }}><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ py: 6 }}>
                      <CircularProgress size={18} />
                      <Typography variant="body2">Loading roles...</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : filteredSorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }} spacing={1}>
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>No roles found</Typography>
                      <Button variant="outlined" onClick={() => setOpenAdd(true)}>Add your first role</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSorted.map((r) => (
                  <TableRow key={r.id} hover sx={{ '&:hover .sticky-cell': { backgroundColor: (theme) => theme.palette.action.hover } }}>
                    <TableCell className="sticky-cell" sx={{ fontWeight: 600, width: { xs: '18%', md: '11%' }, position: 'sticky', left: 0, zIndex: 2, backgroundColor: 'background.paper' }}>{r.name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', width: { xs: '16%', md: '10%' } }}>{r.id}</TableCell>
                    <TableCell sx={{ width: { xs: '30%', md: '22%' }, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{r.description}</TableCell>
                    <TableCell sx={{ width: { xs: '34%', md: '30%' } }}>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                        {r.allowed_tables?.map(t => <Chip key={t} label={t} size="small" sx={{ height: 22, '& .MuiChip-label': { px: 0.75, fontSize: 12 } }} />)}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ width: { xs: '30%', md: '22%' } }}>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                        {r.allowed_routes?.map(rt => <Chip key={rt} label={rt} size="small" color="success" variant="outlined" sx={{ height: 22, '& .MuiChip-label': { px: 0.75, fontSize: 12 } }} />)}
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ width: { xs: '10%', md: '5%' } }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton aria-label="Edit role" onClick={() => openEditDialog(r)} size="small"><EditOutlinedIcon fontSize="small" /></IconButton>
                        <IconButton aria-label="Delete role" color="error" onClick={() => setOpenDelete(r.id)} size="small"><DeleteOutlineIcon fontSize="small" /></IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {error && <Box sx={{ p: 2 }}><Alert severity="error" onClose={() => setError(null)}>{error}</Alert></Box>}
      </Paper>

      {/* Add Role Dialog */}
      <Dialog open={openAdd} onClose={() => !busy && setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Role</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField label="ID" value={newId} onChange={e => setNewId(e.target.value)} placeholder="manager" fullWidth size="small" />
            <TextField label="Name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Manager" fullWidth size="small" />
            <TextField label="Description" value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Manager role" fullWidth size="small" />
            <Autocomplete multiple options={presetTables}
              value={newTables}
              onChange={(_, v) => setNewTables(v)}
              renderTags={(value, getTagProps) => value.map((option, index) => (<Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} key={option} />))}
              renderInput={(params) => <TextField {...params} size="small" label="Allowed Tables" placeholder="Add table" />}
            />
            <Autocomplete multiple options={presetRoutes}
              value={newRoutes}
              onChange={(_, v) => setNewRoutes(v)}
              renderTags={(value, getTagProps) => value.map((option, index) => (<Chip color="success" variant="outlined" label={option} size="small" {...getTagProps({ index })} key={option} />))}
              renderInput={(params) => <TextField {...params} size="small" label="Allowed Routes" placeholder="Add route" />}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)} disabled={busy}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} disabled={busy || !newId.trim() || !newName.trim()}>{busy ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={openEdit} onClose={() => !busy && setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Role</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {editRole && (
            <Stack spacing={2}>
              <TextField label="ID" value={editRole.id} disabled fullWidth size="small" />
              <TextField label="Name" value={editRole.name} onChange={e => setEditRole({ ...editRole, name: e.target.value })} fullWidth size="small" />
              <TextField label="Description" value={editRole.description || ''} onChange={e => setEditRole({ ...editRole, description: e.target.value })} fullWidth size="small" />
              <Autocomplete multiple options={presetTables}
                value={editRole.allowed_tables || []}
                onChange={(_, v) => setEditRole({ ...editRole, allowed_tables: v })}
                renderTags={(value, getTagProps) => value.map((option, index) => (<Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} key={option} />))}
                renderInput={(params) => <TextField {...params} size="small" label="Allowed Tables" placeholder="Add table" />}
              />
              <Autocomplete multiple options={presetRoutes}
                value={editRole.allowed_routes || []}
                onChange={(_, v) => setEditRole({ ...editRole, allowed_routes: v })}
                renderTags={(value, getTagProps) => value.map((option, index) => (<Chip color="success" variant="outlined" label={option} size="small" {...getTagProps({ index })} key={option} />))}
                renderInput={(params) => <TextField {...params} size="small" label="Allowed Routes" placeholder="Add route" />}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)} disabled={busy}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={busy || !editRole?.name?.trim()}>{busy ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!openDelete} onClose={() => !busy && setOpenDelete(null)}>
        <DialogTitle>Delete Role?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(null)} disabled={busy}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => openDelete && handleDelete(openDelete)} disabled={busy}>{busy ? 'Deleting...' : 'Delete'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!success} autoHideDuration={2500} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess(null)} severity="success">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setError(null)} severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default RolesPage;
