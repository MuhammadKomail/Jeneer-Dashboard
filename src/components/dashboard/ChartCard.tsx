import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  rightControls?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, rightControls }) => {
  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2, border: '1px solid #EAECF0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{title}</Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {rightControls}
        </Box>
      </Box>
      <Box sx={{ width: { xs: 240, sm: 280, md: 340, lg: 380, xl: 420 }, minWidth: 0, height: 350 }}>
        {children}
      </Box>
    </Paper>
  );
};

export default ChartCard;
