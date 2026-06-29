"use client";

import React from "react";
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import Box from "@mui/material/Box";

export interface MapPickerProps {
  apiKey?: string;
  height?: number | string;
  initialLat?: number;
  initialLng?: number;
  onSelect?: (lat: number, lng: number) => void;
}

const defaultCenter = { lat: 34.0522, lng: -118.2437 }; // fallback LA
const MAP_LIBRARIES: ("places")[] = ["places"];

const isValidCoord = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180;

export default function MapPicker({ apiKey, height = 400, initialLat, initialLng, onSelect }: MapPickerProps) {
  const isBrowser = typeof window !== 'undefined';
  const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded } = useJsApiLoader({
    id: key ? `google-map-script-${key.slice(-6)}` : "google-map-script",
    googleMapsApiKey: key,
    libraries: MAP_LIBRARIES,
  });

  const mapRef = React.useRef<google.maps.Map | null>(null);

  const [marker, setMarker] = React.useState<{ lat: number; lng: number } | null>(
    initialLat !== undefined && initialLng !== undefined ? { lat: initialLat, lng: initialLng } : null,
  );

  const [latInput, setLatInput] = React.useState(
    initialLat !== undefined ? String(initialLat) : "",
  );
  const [lngInput, setLngInput] = React.useState(
    initialLng !== undefined ? String(initialLng) : "",
  );
  const [coordError, setCoordError] = React.useState<string | null>(null);

  const [locating, setLocating] = React.useState(false);
  const [didTryLocate, setDidTryLocate] = React.useState(false);
  const [locateError, setLocateError] = React.useState<string | null>(null);

  const center = marker || { lat: initialLat ?? defaultCenter.lat, lng: initialLng ?? defaultCenter.lng };

  const applyCoordinates = React.useCallback(
    (lat: number, lng: number) => {
      if (!isValidCoord(lat, lng)) {
        setCoordError("Latitude must be -90 to 90, longitude -180 to 180");
        return false;
      }
      setCoordError(null);
      const pos = { lat, lng };
      setMarker(pos);
      setLatInput(lat.toFixed(6));
      setLngInput(lng.toFixed(6));
      mapRef.current?.panTo(pos);
      onSelect?.(lat, lng);
      return true;
    },
    [onSelect],
  );

  const applyManualCoordinates = React.useCallback(() => {
    const lat = parseFloat(latInput.trim());
    const lng = parseFloat(lngInput.trim());
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setCoordError("Enter valid latitude and longitude");
      return;
    }
    applyCoordinates(lat, lng);
  }, [latInput, lngInput, applyCoordinates]);

  const syncInputsFromMarker = React.useCallback((lat: number, lng: number) => {
    setLatInput(lat.toFixed(6));
    setLngInput(lng.toFixed(6));
    setCoordError(null);
  }, []);

  const autoRef = React.useRef<google.maps.places.Autocomplete | null>(null);
  const onAutoLoad = (auto: google.maps.places.Autocomplete) => {
    autoRef.current = auto;
  };
  const onPlaceChanged = () => {
    if (!autoRef.current) return;
    const place = autoRef.current.getPlace();
    const loc = place.geometry?.location;
    if (!loc) return;
    const lat = loc.lat();
    const lng = loc.lng();
    setMarker({ lat, lng });
    syncInputsFromMarker(lat, lng);
    mapRef.current?.panTo({ lat, lng });
    onSelect?.(lat, lng);
  };

  const useCurrentLocation = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!navigator.geolocation) {
      setLocateError('Geolocation not supported');
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMarker({ lat, lng });
        syncInputsFromMarker(lat, lng);
        mapRef.current?.panTo({ lat, lng });
        onSelect?.(lat, lng);
        setLocating(false);
      },
      (err) => {
        setLocateError(err?.message || 'Failed to get location');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10_000 }
    );
  }, [onSelect, syncInputsFromMarker]);

  // Auto-place marker on current location when opening with no initial marker
  React.useEffect(() => {
    if (!isBrowser) return;
    if (!isLoaded) return;
    if (marker) return;
    if (didTryLocate) return;
    if (initialLat !== undefined && initialLng !== undefined) return;
    setDidTryLocate(true);
    useCurrentLocation();
  }, [isBrowser, isLoaded, marker, didTryLocate, initialLat, initialLng, useCurrentLocation]);

  if (!isBrowser) return <Box sx={{ width: '100%', height }} />;

  return (
    <Box sx={{ width: "100%", height, position:'relative' }}>
      {!key ? (
        <Box sx={{ display: "grid", placeItems: "center", height: "100%", color: "#ef4444", fontWeight: 600 }}>
          Google Maps key missing
        </Box>
      ) : !isLoaded ? (
        <Box sx={{ display: "grid", placeItems: "center", height: "100%" }}>Loading map…</Box>
      ) : (
        <>
          <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={12}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          options={{
            clickableIcons: false,
            disableDefaultUI: true,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            gestureHandling: 'greedy',
            scrollwheel: true,
            keyboardShortcuts: false,
            tilt: 0,
          }}
          onClick={(e) => {
            const lat = e.latLng?.lat();
            const lng = e.latLng?.lng();
            if (lat === undefined || lng === undefined) return;
            setMarker({ lat, lng });
            syncInputsFromMarker(lat, lng);
            onSelect?.(lat, lng);
          }}
        >
          {marker && (
            <Marker
              position={marker}
              draggable
              onDragEnd={(e) => {
                const lat = e.latLng?.lat();
                const lng = e.latLng?.lng();
                if (lat === undefined || lng === undefined) return;
                setMarker({ lat, lng });
                syncInputsFromMarker(lat, lng);
                onSelect?.(lat, lng);
              }}
            />
          )}
          </GoogleMap>
          {/* Search input */}
          <Box sx={{ position:'absolute', top:10, left:10, zIndex:5, width:'calc(100% - 20px)', maxWidth:420, display:'grid', gap:1 }}>
            <Autocomplete onLoad={onAutoLoad} onPlaceChanged={onPlaceChanged}>
              <input type="text" placeholder="Search location" style={{ width:'100%', padding:'8px 12px', borderRadius:6, border:'1px solid #d1d5db', fontSize:14, background:'#fff' }} />
            </Autocomplete>
            <Box sx={{ display:'flex', gap:1 }}>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  fontSize: 13,
                  cursor: locating ? 'not-allowed' : 'pointer',
                }}
              >
                {locating ? 'Locating…' : 'Use current location'}
              </button>
              {locateError ? (
                <div style={{ alignSelf: 'center', fontSize: 12, color: '#ef4444', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: 6, border: '1px solid #fecaca' }}>
                  {locateError}
                </div>
              ) : null}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Latitude"
                value={latInput}
                onChange={(e) => {
                  setLatInput(e.target.value);
                  setCoordError(null);
                }}
                onBlur={applyManualCoordinates}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyManualCoordinates();
                }}
                style={{ flex: '1 1 120px', minWidth: 100, padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, background: '#fff' }}
              />
              <input
                type="text"
                inputMode="decimal"
                placeholder="Longitude"
                value={lngInput}
                onChange={(e) => {
                  setLngInput(e.target.value);
                  setCoordError(null);
                }}
                onBlur={applyManualCoordinates}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyManualCoordinates();
                }}
                style={{ flex: '1 1 120px', minWidth: 100, padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, background: '#fff' }}
              />
              <button
                type="button"
                onClick={applyManualCoordinates}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  fontSize: 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Apply coordinates
              </button>
            </Box>
            {coordError ? (
              <div style={{ fontSize: 12, color: '#ef4444', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: 6, border: '1px solid #fecaca' }}>
                {coordError}
              </div>
            ) : null}
          </Box>
        </>
      )}
    </Box>
  );
}
