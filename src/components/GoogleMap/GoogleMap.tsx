"use client";

import { useJsApiLoader, GoogleMap, Circle } from "@react-google-maps/api";
import { useCallback } from "react";

interface GoogleMapComponentProps {
  lat: number;
  lng: number;
  zoom?: number;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

export const GoogleMapComponent = ({ lat, lng, zoom = 13 }: GoogleMapComponentProps) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const onLoad = useCallback(function callback() {}, []);

  const onUnmount = useCallback(function callback() {}, []);

  const center = {
    lat,
    lng,
  };

  const circleOptions = {
    strokeColor: "#2D4C61", // brand-primary
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#2D4C61",
    fillOpacity: 0.35,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: 500,
    zIndex: 1
  };

  if (!isLoaded) return <div className="w-full h-full bg-accent/30 animate-pulse" />;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      <Circle
        center={center}
        options={circleOptions}
      />
    </GoogleMap>
  );
};
