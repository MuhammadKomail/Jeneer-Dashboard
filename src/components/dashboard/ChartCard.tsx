import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  rightControls?: React.ReactNode;
  emptyMessage?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, rightControls, emptyMessage }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        border: '1px solid #EAECF0',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5,
          minHeight: 40,
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>{rightControls}</Box>
      </Box>
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          height: { xs: 260, sm: 320, md: 350 },
          position: 'relative',
        }}
      >
        {emptyMessage ? (
          <Box
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {emptyMessage}
            </Typography>
          </Box>
        ) : (
          children
        )}
      </Box>
    </Paper>
  );
};

export default ChartCard;
