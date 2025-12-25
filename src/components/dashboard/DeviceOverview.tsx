import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import GallonsBarChart from './GallonsBarChart';
import FocusMainPressureAreaChart from './FocusMainPressureAreaChart';
import LiquidLevelAreaChart from './LiquidLevelAreaChart';
import TemperatureLineChart from './TemperatureLineChart';
import HistoryTable from './HistoryTable';
import PumpSettingsTable from './PumpSettingsTable';

const DeviceOverview: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <GallonsBarChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <LiquidLevelAreaChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <TemperatureLineChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <FocusMainPressureAreaChart />
        </Grid>
        <Grid item xs={12}>
          <HistoryTable />
        </Grid>
        <Grid item xs={12}>
          <PumpSettingsTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeviceOverview;
