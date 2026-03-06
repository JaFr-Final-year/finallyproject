import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './AdBoard.css'
// import { supabase } from '../utils/supabase'
import { supabase } from '../utils/supabase'
import AdMap from '../components/Map'

const AdBoard = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)

    const handleBooking = async () => {
        if (!product) return;

        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert("Please login to book this ad.");
            navigate('/login');
            return;
        }

        // Navigate to the new booking page
        navigate(`/book/${id}`);
    }

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/ads/${id}`);
                const data = await response.json();

                if (response.ok) {
                    setProduct(data);
                } else {
                    throw new Error(data.error || 'API Error');
                }
            } catch (err) {
                console.warn("API fetch failed, falling back to Supabase:", err);
                try {
                    const { data, error } = await supabase
                        .from('ads')
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (error) {
                        console.error("Error fetching ad from Supabase:", error);
                    } else {
                        setProduct(data);
                    }
                } catch (supabaseErr) {
                    console.error("Supabase error:", supabaseErr);
                }
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchAd()
        }
    }, [id])

    if (loading) {
        return (
            <div className="ad-loading-container">
                <div className="premium-loader"></div>
            </div>
        )
    }

    if (!product) {
        return <div className="ad-loading">Ad Not Found</div>
    }

    if (!product) {
        return <div className="ad-loading">Ad Not Found</div>
    }

    const isEffectivelyBooked = product.is_booked && new Date(product.booked_until) > new Date();
    const isPending = product.status !== 'active';
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';

    const AdImage = ({ image }) => {
        if (!image) return null;

        let img = Array.isArray(image) ? image[0] : image;
        // Sometimes Supabase returns jsonb as a string like '["path"]'
        if (typeof img === 'string' && (img.startsWith('[') || img.startsWith('"'))) {
            try {
                const parsed = JSON.parse(img);
                img = Array.isArray(parsed) ? parsed[0] : parsed;
            } catch (e) {
                img = img.replace(/[\[\]"]/g, '');
            }
        }

        // Robust check: If it contains a slash, it's a storage path
        if (img && typeof img === 'string' && img.includes('/')) {
            const baseUrl = import.meta.env.VITE_SUPABASE_URL;
            const publicUrl = `${baseUrl}/storage/v1/object/public/ads-images/${img}`;
            return <img
                src={publicUrl}
                alt="AdBoard"
                className="real-ad-image"
                onError={(e) => {
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    if (parent) parent.innerHTML = '<span class="ad-emoji-placeholder">📢</span>';
                }}
            />;
        }

        // Fallback to emoji/icon
        return <span className="ad-emoji-placeholder">{img}</span>;
    };

    return (
        <div className="ad-board-wrapper">
            <div className="ad-board-container">
                <div className="ad-hero-section">
                    <div className="ad-hero-image">
                        <AdImage image={product.image} />
                    </div>
                </div>

                <div className="ad-content-section">
                    <div className="ad-header">
                        <div className="ad-title-block">
                            <h1 className="ad-title">{product.name}</h1>
                            <p className="ad-location">📍 {product.location}</p>
                            <div className={`status-badge ${isEffectivelyBooked ? 'booked' : (isPending ? 'pending' : 'available')}`}>
                                {isEffectivelyBooked ? '🔴 Booked' : (isPending ? '⏳ Pending Approval' : '🟢 Available')}
                            </div>
                        </div>
                        <div className="ad-price-tag">
                            {product.price}₹/Month
                        </div>
                    </div>

                    <div className="ad-details-grid">
                        <div className="ad-info-stack">
                            <div className="ad-info-card">
                                <h3>Run Details</h3>
                                <ul className="ad-specs-list">
                                    <li><span className="label">Category:</span> {product.category}</li>
                                    <li><span className="label">Size:</span> {product.size}</li>
                                    <li><span className="label">ID:</span> {product.id}</li>
                                    {isEffectivelyBooked && (
                                        <>
                                            <li>
                                                <span className="label">Booked Until:</span>
                                                <span className="value finish-date">
                                                    {new Date(product.booked_until).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </li>
                                            <li>
                                                <span className="label">Remaining:</span>
                                                <span className="value time-left">
                                                    {(() => {
                                                        const now = new Date();
                                                        const end = new Date(product.booked_until);
                                                        const diffTime = Math.abs(end - now);
                                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                        return `${diffDays} days left`;
                                                    })()}
                                                </span>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                            <div className="ad-info-card">
                                <h3>Description</h3>
                                <p className="ad-description">
                                    {product.description}
                                </p>
                            </div>
                        </div>
                        <div className="ad-info-card map-card">
                            <h3>Location Map</h3>
                            <div className="ad-board-map-container">
                                <AdMap locationName={product.location} height="100%" />
                            </div>
                        </div>
                    </div>

                    {isAdmin ? (
                        <button className="book-now-btn disabled" disabled>
                            Admin View (Booking Restricted)
                        </button>
                    ) : (
                        <button
                            className={`book-now-btn ${isEffectivelyBooked || isPending ? 'disabled' : ''}`}
                            disabled={isEffectivelyBooked || isPending}
                            onClick={handleBooking}
                        >
                            {isEffectivelyBooked ? 'Currently Unavailable' : (isPending ? 'Waiting for Approval' : 'Book Now')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdBoard
