'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { assetPaths } from '@/paths/path';
import NavigineHeader from "@/components/navigine header/navigine header";

const drawerWidth = 240;
const drawerNarrowWidth = 80;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `${drawerNarrowWidth}px`,
  ...(open && {
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})({
  width: '100%',
  height: '70px',
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const ProfileSection = styled('div')<{ open: boolean }>(({ theme, open }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  flexDirection: open ? 'row' : 'column',
  gap: open ? theme.spacing(2) : theme.spacing(1),
}));

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(1); // default to "User Management"
  const pathname = usePathname();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [expandedSite, setExpandedSite] = useState<string | null>(null);
  const [selectedWell, setSelectedWell] = useState<string | null>(null);
  const isDashboard = pathname === '/' || pathname.startsWith('/dashboard');

  useEffect(() => {
    const hasAuthToken = document.cookie.split(';').some((cookie) => cookie.trim().startsWith('AuthToken='));
    setIsAuthenticated(hasAuthToken);
    const timeout = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  // Ensure Dashboard menu loads collapsed (no expanded site, no selected well)
  useEffect(() => {
    if (isDashboard) {
      setExpandedSite(null);
      setSelectedWell(null);
    }
  }, [isDashboard, pathname]);

  const handleDrawerToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      document.cookie = 'AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setIsLoggingOut(false);
      setLogoutSuccess(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }, 2000);
  };

  if (!isLoaded || isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <div>{children}</div>;
  }

  const navItems = [
    { text: 'Dashboard', href: '/dashboard', icon: <DashboardOutlinedIcon /> },
    { text: 'User Management', href: '/user-management', icon: <ManageAccountsOutlinedIcon /> },
    { text: 'Site Management', href: '/site-management', icon: <RoomOutlinedIcon /> },
    { text: 'Change Password', href: '/change-password', icon: <LockOutlinedIcon /> },
  ];

  const dashboardSites: { site: string; wells: string[] }[] = [
    { site: 'Broadhurst (Republic)', wells: ['Wellfield Overview', 'LRI2306', 'LRI2322', 'LRI2348', 'LRI2363', 'LRI2439', 'LRI3786'] },
    { site: 'Chiquita Canyon (WC)', wells: ['Wellfield Overview', 'LRI2306', 'LRI2322', 'LRI2348'] },
    { site: 'Eagle Point (GFL)', wells: ['Wellfield Overview', 'LRI2306', 'LRI2322'] },
    { site: 'Emerald Park (GFL)', wells: ['Wellfield Overview', 'LRI2306'] },
    { site: 'Heart of Florida (WC)', wells: ['Wellfield Overview', 'LRI2306'] },
    { site: 'Hickory Hill (WM)', wells: ['Wellfield Overview', 'LRI2306'] },
    { site: 'Horror County', wells: ['Wellfield Overview'] },
    { site: 'JED (WC)', wells: ['Wellfield Overview'] },
    { site: 'LRI (WC)', wells: ['Wellfield Overview', 'LRI2306', 'LRI2322', 'LRI2348', 'LRI2363', 'LRI2439', 'LRI3786'] },
  ];

  const userData = {
    name: 'Demo User',
    email: 'demo@email.com',
    profilePic: '/icons/1.png',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CssBaseline />
      {/* <AppBar position="fixed" style={{ backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Image src={assetPaths.XourceLogo} alt="Logo" width={120} height={40} priority />
          </Link>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton size="small">
              <NotificationsNoneOutlinedIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountCircleOutlinedIcon />
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>John Doe</Typography>
                <Typography variant="caption" color="text.secondary">Admin</Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar> */}

      <Box sx={{ display: 'flex', marginTop: '0px' }}>
        <IconButton
          onClick={handleDrawerToggle}
          style={{
            backgroundColor: 'white',
            borderRadius: '10%',
            width: 24,
            height: 24,
            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
            position: 'fixed',
            top: 40,
            left: (open ? drawerWidth : drawerNarrowWidth) - 12,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgb(255, 255, 255)',
          }}
        >
          {open ? (
            <ChevronLeftIcon sx={{ color: 'black', fontSize: 14 }} />
          ) : (
            <ChevronRightIcon sx={{ color: 'black', fontSize: 14 }} />
          )}
        </IconButton>

        <Drawer
          sx={{
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : drawerNarrowWidth,
              boxSizing: 'border-box',
              top: '0px',
              height: '100vh',
              transition: 'width 0.3s ease',
              backgroundColor: '#0D542B',
              borderTopRightRadius: 0,
              borderRight: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            },
          }}
          variant="persistent"
          anchor="left"
          open={true}
        >
          {/* Sidebar logo/header block */}
          <Box sx={{ px: 2, py: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Image src={assetPaths.XourceLogo} alt="Sidebar Logo" width={open ? 140 : 36} height={open ? 32 : 36} style={{ objectFit: 'contain' }} />
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

          {(() => {
            const isDashboard = pathname === '/' || pathname.startsWith('/dashboard');
            if (isDashboard) {
              return (
                <List sx={{ color: 'rgba(255,255,255,0.95)' }}>
                  {dashboardSites.map((group) => {
                    const expanded = expandedSite === group.site;
                    return (
                      <React.Fragment key={group.site}>
                        <ListItem disablePadding sx={{ px: open ? 1 : 0, py: 0.5 }}>
                          <ListItemButton
                            onClick={() => setExpandedSite(expanded ? null : group.site)}
                            sx={{
                              margin: '4px 8px',
                              borderRadius: '8px',
                              color: 'rgba(255,255,255,0.95)',
                              backgroundColor: 'transparent',
                              '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                              justifyContent: !open ? 'center' : 'flex-start',
                            }}
                          >
                            {open ? (
                              <ListItemText primary={group.site} />
                            ) : (
                              <ListItemText primary={group.site.split(' ')[0]} />
                            )}
                            {open && (expanded ? <ExpandLess sx={{ color: 'inherit' }} /> : <ExpandMore sx={{ color: 'inherit' }} />)}
                          </ListItemButton>
                        </ListItem>
                        <Collapse in={expanded} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            {group.wells.map((well) => {
                              const id = `${group.site}__${well}`;
                              const selected = selectedWell === id;
                              return (
                                <ListItem key={id} disablePadding sx={{ px: open ? 2 : 0, py: 0.25 }}>
                                  <ListItemButton
                                    onClick={() => setSelectedWell(id)}
                                    sx={{
                                      margin: '4px 8px',
                                      borderRadius: '8px',
                                      color: selected ? '#0D542B' : 'rgba(255,255,255,0.95)',
                                      backgroundColor: selected ? '#DFF3D9' : 'transparent',
                                      '&:hover': { backgroundColor: selected ? '#DFF3D9' : 'rgba(255,255,255,0.06)' },
                                      justifyContent: !open ? 'center' : 'flex-start',
                                    }}
                                  >
                                    {open && <ListItemText primary={well.startsWith('LRI') ? well : `${group.site.split(' ')[0]} ${well}`} />}
                                  </ListItemButton>
                                </ListItem>
                              );
                            })}
                          </List>
                        </Collapse>
                      </React.Fragment>
                    );
                  })}
                </List>
              );
            }
            return (
              <List>
                {navItems.map((item, idx) => {
                  const selected = (item.href === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) ||
                                   (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <ListItem key={item.text} disablePadding sx={{ px: open ? 1 : 0, py: 0.5 }}>
                      <ListItemButton
                        component={Link}
                        href={item.href}
                        selected={selected}
                        onClick={() => setSelectedIdx(idx)}
                        sx={{
                          margin: '4px 8px',
                          borderRadius: '8px',
                          color: 'rgba(255,255,255,0.95)',
                          '&.Mui-selected': {
                            backgroundColor: 'white',
                            color: '#0D542B',
                            '&:hover': { backgroundColor: 'white' },
                          },
                          '&:not(.Mui-selected):hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                          justifyContent: !open ? 'center' : 'flex-start',
                        }}
                      >
                        <ListItemIcon
                          sx={{ minWidth: 0, justifyContent: 'center', color: 'inherit', width: '40px' }}
                        >
                          {React.cloneElement(item.icon as any, { sx: { color: 'inherit' } })}
                        </ListItemIcon>
                        {open && <ListItemText primary={item.text} />}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            );
          })()}

          {!isDashboard && (
            <Box sx={{ position: 'absolute', bottom: 0, width: '100%', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
              <ListItem disablePadding style={{ color: 'white' }}>
                <ListItemButton
                  onClick={() => setConfirmLogoutOpen(true)}
                  disabled={isLoggingOut}
                  sx={{ justifyContent: !open ? 'center' : 'flex-start' }}
                >
                  <ListItemIcon
                    style={{
                      marginLeft: !open ? '0' : '0px',
                      width: '40px',
                      minWidth: !open ? '0' : '40px',
                      display: 'flex',
                      justifyContent: 'center',
                      color: 'inherit',
                    }}
                  >
                    {isLoggingOut ? (
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                    ) : (
                      <LogoutOutlinedIcon sx={{ color: 'white' }} />
                    )}
                  </ListItemIcon>
                  {open && <ListItemText primary={isLoggingOut ? 'Logging out...' : 'Logout'} />}
                </ListItemButton>
              </ListItem>
            </Box>
          )}
        </Drawer>

        <Main open={open}>
          {/* Top header aligned with the main content area */}
          {(() => {
            const currentPath = pathname === '/' ? '/dashboard' : pathname;
            const current = navItems.find((n) => currentPath.startsWith(n.href));
            const title = current?.text || 'Dashboard';
            return (
              <NavigineHeader
                title={title}
                variant="compact"
                trail={[title]}
                showBell
                userName="John Doe"
                userRole="Admin"
                offsetLeft={open ? drawerWidth : drawerNarrowWidth}
              />
            );
          })()}
          <Box
            sx={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              overflow: 'auto',
              backgroundColor: 'transparent',
              mt: '64px',
            }}
          >
            {children}
          </Box>
        </Main>
      </Box>

      <Dialog open={confirmLogoutOpen} onClose={() => setConfirmLogoutOpen(false)}>
        <DialogTitle>Log Out?</DialogTitle>
        <DialogContent>
          Are you sure you want to log out? You can sign in again to access the dashboard.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLogoutOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleLogout} disabled={isLoggingOut}>Log Out</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={logoutSuccess}
        autoHideDuration={2000}
        onClose={() => setLogoutSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setLogoutSuccess(false)} severity="success">
          Logged out successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AppLayout;