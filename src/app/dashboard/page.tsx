"use client";

import React from "react";
import { useTranslation } from 'react-i18next';
import Box from "@mui/material/Box";
import GoogleMapView from "@/components/maps/GoogleMapView";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();


  return (
    <>
        {/* Map fills the content area under the compact header provided by AppLayout */}
        <Box sx={{ width: '100%', height: 'calc(100vh - 140px)' }}>
          <GoogleMapView
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyA71Kqzpa_3vfeFJdaKleqLmnDhKc4a6EI"}
            center={{ lat: 34.0522, lng: -118.2437 }}
            zoom={11}
            markers={[]}
          />
        </Box>
    </>
  );
};

export default Dashboard;
