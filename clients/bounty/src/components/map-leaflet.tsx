"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in react-leaflet in Next.js
const markerIcon2x = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png";
const markerIcon = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const markerShadow = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";

if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x,
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
    });
}

// Component to handle map clicks for placing a pin
function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MapLeaflet({ position, setPosition }: { position: any, setPosition: (p: any) => void }) {
    if (typeof window === 'undefined') return <div className="h-full w-full flex items-center justify-center bg-muted">Loading map...</div>;

    return (
        <MapContainer center={[43.6532, -79.3832]} zoom={11} scrollWheelZoom={true} className="h-full w-full" style={{ height: "100%", width: "100%", minHeight: "300px" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
    );
}
