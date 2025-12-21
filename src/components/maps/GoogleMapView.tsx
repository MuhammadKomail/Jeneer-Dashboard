"use client";

import React from "react";
import Box from "@mui/material/Box";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";

// Map container should stretch to parent; parent must set explicit height
const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: 12,
  overflow: "hidden",
};

const defaultCenter = { lat: 34.0522, lng: -118.2437 }; // Los Angeles fallback

const defaultZoom = 11;

export type MapMarker = {
  id: string;
  position: { lat: number; lng: number };
  label?: string;
  color?: "red" | "orange" | "green";
  info?: React.ReactNode;
};

interface GoogleMapViewProps {
  apiKey?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
}

const pinColors: Record<NonNullable<MapMarker["color"]>, string> = {
  red: "#ef4444",
  orange: "#f59e0b",
  green: "#22c55e",
};

export default function GoogleMapView({
  apiKey,
  center = defaultCenter,
  zoom = defaultZoom,
  markers = [],
}: GoogleMapViewProps) {
  const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: key,
  });

  const [activeMarker, setActiveMarker] = React.useState<string | null>(null);

  return (
    <Box sx={{ width: "100%", height: "100%", minHeight: 300, backgroundColor: "#eef2f7", borderRadius: 2 }}>
      {loadError ? (
        <Box sx={{ display: "grid", placeItems: "center", height: "100%", color: "#ef4444", fontWeight: 600 }}>
          Failed to load Google Maps. Check API key and network.
        </Box>
      ) : isLoaded ? (
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={zoom} options={{
          mapTypeId: "satellite",
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
        }}>
          {markers.map((m) => (
            <Marker
              key={m.id}
              position={m.position}
              label={{ text: m.label || m.id, color: "#ffffff", fontSize: "12px", fontWeight: "700" }}
              icon={{
                // access google safely at runtime
                path: (typeof window !== "undefined" && (window as any).google)
                  ? (window as any).google.maps.SymbolPath.BACKWARD_CLOSED_ARROW
                  : 0,
                scale: 6,
                fillColor: m.color ? pinColors[m.color] : "#3b82f6",
                fillOpacity: 1,
                strokeWeight: 0,
              }}
              onClick={() => setActiveMarker(m.id)}
            />
          ))}

          {markers.map((m) => (
            activeMarker === m.id ? (
              <InfoWindow key={`info-${m.id}`} position={m.position} onCloseClick={() => setActiveMarker(null)}>
                <div style={{ minWidth: 200 }}>
                  {m.info || (
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{m.label || m.id}</div>
                      <div style={{ fontSize: 12, color: "#4b5563" }}>No details</div>
                    </div>
                  )}
                </div>
              </InfoWindow>
            ) : null
          ))}
        </GoogleMap>
      ) : (
        <Box sx={{ display: "grid", placeItems: "center", height: "100%", color: "#475569", fontWeight: 600 }}>Loading map…</Box>
      )}
    </Box>
  );
}
