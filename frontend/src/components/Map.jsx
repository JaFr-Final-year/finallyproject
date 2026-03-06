
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper to update map view when coordinates change
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

const AdMap = ({ locationName, height = '300px' }) => {
    const [position, setPosition] = useState([20.5937, 78.9629]); // Default to central India
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!locationName) return;

        const geocodeLocation = async () => {
            setLoading(true);
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`);
                const data = await response.json();

                if (data && data.length > 0) {
                    const { lat, lon } = data[0];
                    setPosition([parseFloat(lat), parseFloat(lon)]);
                    setError(null);
                } else {
                    setError("Location not found on map");
                }
            } catch (err) {
                console.error("Geocoding error:", err);
                setError("Could not load map location");
            } finally {
                setLoading(false);
            }
        };

        geocodeLocation();
    }, [locationName]);

    return (
        <div className="map-embed-container" style={{ height: height, width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(197, 160, 89, 0.2)', position: 'relative' }}>
            {loading && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="premium-loader"></div>
                </div>
            )}
            {error ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', color: '#666' }}>
                    <p>{error}</p>
                </div>
            ) : (
                <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position}>
                        <Popup>
                            {locationName}
                        </Popup>
                    </Marker>
                    <ChangeView center={position} />
                </MapContainer>
            )}
        </div>
    );
};

export default AdMap;
