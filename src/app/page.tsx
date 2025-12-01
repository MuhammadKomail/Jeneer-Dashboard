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
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
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
  padding: theme.spacing(3),
  paddingTop: 0,
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

  useEffect(() => {
    const hasAuthToken = document.cookie.split(';').some((cookie) => cookie.trim().startsWith('AuthToken='));
    setIsAuthenticated(hasAuthToken);
    const timeout = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timeout);
  }, []);

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
              borderTopRightRadius: '12px',
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

          <List>
            {navItems.map((item, idx) => {
              // Robust selection logic to handle dashboard and other pages
              const selected = (item.href === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) || 
                               (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <ListItem key={item.text} disablePadding sx={{ px: open ? 1 : 0, py: 0.5 }}>
                  <ListItemButton
                    component={Link}
                    href={item.href} // Use the direct href for navigation
                    selected={selected}
                    onClick={() => setSelectedIdx(idx)}
                    sx={{
                      margin: '4px 8px',
                      borderRadius: '8px',
                      color: 'rgba(255,255,255,0.95)', // Default text and icon color
                      '&.Mui-selected': {
                        backgroundColor: 'white',
                        color: '#0D542B', // Selected text and icon color
                        '&:hover': {
                          backgroundColor: 'white',
                        },
                      },
                      '&:not(.Mui-selected):hover': {
                        backgroundColor: 'rgba(255,255,255,0.08)',
                      },
                      justifyContent: !open ? 'center' : 'flex-start',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        justifyContent: 'center',
                        color: 'inherit', // Force icon to inherit color from parent
                        width: '40px',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {open && <ListItemText primary={item.text} />}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Box sx={{ position: 'absolute', bottom: 0, width: '100%', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <ListItem disablePadding style={{ color: 'white' }}>
              <ListItemButton
                onClick={handleLogout}
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
                    <LogoutOutlinedIcon />
                  )}
                </ListItemIcon>
                {open && <ListItemText primary={isLoggingOut ? 'Logging out...' : 'Logout'} />}
              </ListItemButton>
            </ListItem>
          </Box>
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
              />
            );
          })()}
          <Box
            sx={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '8px',
              maxWidth: '100%',
              width: '100%',
              margin: '0 auto',
              backgroundColor: '#fff',
            }}
          >
            {children}
          </Box>
        </Main>
      </Box>

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