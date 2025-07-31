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
import { useEffect, useState } from 'react';
import { assetPaths } from '@/paths/path';

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

  const navigationItems = [
    { text: 'Computer Vision', icon: '/icons/cv.png', path: '/cv' },
    { text: 'NLP', icon: '/icons/nlp.png', path: '/nlp' },
    { text: 'Forecasting', icon: '/icons/forecasting.png', path: '/forecasting' },
    { text: 'GEN AI', icon: '/icons/cv.png', path: '/vlm' },
  ];

  const userData = {
    name: 'Demo User',
    email: 'demo@email.com',
    profilePic: '/icons/1.png',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" style={{ backgroundColor: '#fff' }}>
        <Toolbar>
          <Link href="/dashboard">
            <Image src={assetPaths.XourceLogo} alt="Logo" priority width={170} height={70} style={{ objectFit: 'contain', cursor: 'pointer' }} />
          </Link>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', marginTop: '70px' }}>
        <IconButton
          onClick={handleDrawerToggle}
          style={{
            backgroundColor: 'white',
            borderRadius: '10%',
            width: 24,
            height: 24,
            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
            position: 'fixed',
            top: 150,
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
              top: '70px',
              height: 'calc(100vh - 70px)',
              transition: 'width 0.3s ease',
              backgroundColor: '#ffffff',
              color: '#333333',
            },
          }}
          variant="persistent"
          anchor="left"
          open={true}
        >
          <ProfileSection open={open}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image
                src={userData.profilePic}
                alt="Profile Picture"
                width={open ? 35 : 40}
                height={open ? 35 : 40}
                style={{ objectFit: 'contain' }}
              />
            </Box>
            {open && (
              <Box>
                <ListItemText primary={userData.name} primaryTypographyProps={{ fontWeight: 'bold' }} />
                <ListItemText primary={userData.email} primaryTypographyProps={{ fontSize: '0.875rem', color: '#929292' }} />
              </Box>
            )}
          </ProfileSection>

          <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.12)' }} />

          <List>
            {navigationItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding style={{ color: isActive ? '#1976d2' : '#929292' }}>
                  <Link href={item.path} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                    <ListItemButton
                      selected={isActive}
                      sx={{
                        justifyContent: !open ? 'center' : 'flex-start',
                        padding: !open ? '10px 0' : undefined,
                      }}
                    >
                      <ListItemIcon
                        style={{
                          marginLeft: !open ? '0' : '0px',
                          width: '40px',
                          minWidth: !open ? '0' : '40px',
                          marginTop: !open ? '10px' : '0px',
                          marginBottom: !open ? '10px' : '0px',
                          color: isActive ? '#1976d2' : 'inherit',
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <Image src={item.icon} alt={item.text} width={20} height={20} />
                      </ListItemIcon>
                      {open && <ListItemText primary={item.text} />}
                    </ListItemButton>
                  </Link>
                </ListItem>
              );
            })}
          </List>

          <Box sx={{ position: 'absolute', bottom: 0, width: '100%', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <ListItem disablePadding style={{ color: 'red' }}>
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
                  }}
                >
                  {isLoggingOut ? (
                    <CircularProgress size={20} color="error" />
                  ) : (
                    <Image src="/icons/logout.png" alt="Logout" width={20} height={20} />
                  )}
                </ListItemIcon>
                {open && <ListItemText primary={isLoggingOut ? 'Logging out...' : 'Logout'} />}
              </ListItemButton>
            </ListItem>
          </Box>
        </Drawer>

        <Main open={open}>
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