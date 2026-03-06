
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

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

const GlobalMap = ({ ads }) => {
    const navigate = useNavigate();
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const geocodeAds = async () => {
            setLoading(true);
            const markerData = [];

            // To avoid hitting OSM rate limits, we limit geocoding calls or cache them
            // For now, we'll geocode each ad location
            for (const ad of ads) {
                if (!ad.location) continue;

                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ad.location)}`);
                    const data = await response.json();

                    if (data && data.length > 0) {
                        markerData.push({
                            id: ad.id,
                            name: ad.name,
                            price: ad.price,
                            location: ad.location,
                            position: [parseFloat(data[0].lat), parseFloat(data[0].lon)]
                        });
                    }
                } catch (err) {
                    console.error(`Error geocoding ${ad.location}:`, err);
                }

                // Small delay to be nice to OSM
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            setMarkers(markerData);
            setLoading(false);
        };

        if (ads && ads.length > 0) {
            geocodeAds();
        } else {
            setLoading(false);
        }
    }, [ads]);

    if (loading) {
        return (
            <div style={{ height: '600px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.05)', borderRadius: '24px' }}>
                <div className="premium-loader"></div>
                <p style={{ marginLeft: '1rem', color: '#c5a059', fontWeight: 'bold' }}>Geocoding ad locations...</p>
            </div>
        );
    }

    return (
        <div className="map-embed-container" style={{ height: '600px', width: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(197, 160, 89, 0.2)', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map(marker => (
                    <Marker key={marker.id} position={marker.position}>
                        <Popup>
                            <div style={{ padding: '5px' }}>
                                <h4 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{marker.name}</h4>
                                <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#64748b' }}>📍 {marker.location}</p>
                                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c5a059' }}>₹{marker.price}/Month</p>
                                <button
                                    onClick={() => navigate(`/ad/${marker.id}`)}
                                    style={{
                                        width: '100%',
                                        padding: '5px 10px',
                                        backgroundColor: '#0f172a',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default GlobalMap;
