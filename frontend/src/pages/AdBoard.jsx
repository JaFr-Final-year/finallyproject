import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './AdBoard.css'
// import { supabase } from '../utils/supabase'
import { supabase } from '../utils/supabase'

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

        const period = prompt("Enter booking period in days:", "30");
        if (!period || isNaN(period)) return;

        const bookedUntil = new Date();
        bookedUntil.setDate(bookedUntil.getDate() + parseInt(period));

        try {
            // Use .select() to confirm the update actually happened (RLS might block it silently)
            const { data, error } = await supabase
                .from('ads')
                .update({
                    is_booked: true,
                    booked_until: bookedUntil.toISOString(),
                    booked_by_email: session.user.email // Track who booked it
                })
                .eq('id', id)
                .select();

            if (error) {
                console.error("Error booking ad:", error);
                alert("Failed to book ad: " + error.message);
            } else if (!data || data.length === 0) {
                // This happens if RLS blocks the update or the ID doesn't match
                alert("Booking failed. This might be because of database permissions (RLS) or the ad no longer exists. Please ensure you have permission to update this ad.");
                console.warn("No rows updated. Check RLS policies on 'ads' table.");
            } else {
                alert(`Successfully booked for ${period} days!`);
                setProduct(data[0]); // Update local state with the actual data from DB
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            alert("An unexpected error occurred.");
        }
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
        return <div className="ad-loading">Loading Ad Details...</div>
    }

    if (!product) {
        return <div className="ad-loading">Ad Not Found</div>
    }

    if (!product) {
        return <div className="ad-loading">Ad Not Found</div>
    }

    const isEffectivelyBooked = product.is_booked && new Date(product.booked_until) > new Date();

    return (
        <div className="ad-board-wrapper">
            <div className="ad-board-container">
                <div className="ad-hero-section">
                    <div className="ad-hero-image">
                        {product.image}
                    </div>
                </div>

                <div className="ad-content-section">
                    <div className="ad-header">
                        <div className="ad-title-block">
                            <h1 className="ad-title">{product.name}</h1>
                            <p className="ad-location">📍 {product.location}</p>
                            <div className={`status-badge ${isEffectivelyBooked ? 'booked' : 'available'}`}>
                                {isEffectivelyBooked ? '🔴 Booked' : '🟢 Available'}
                            </div>
                        </div>
                        <div className="ad-price-tag">
                            {product.price}₹/Month
                        </div>
                    </div>

                    <div className="ad-details-grid">
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

                    <button
                        className={`book-now-btn ${isEffectivelyBooked ? 'disabled' : ''}`}
                        disabled={isEffectivelyBooked}
                        onClick={handleBooking}
                    >
                        {isEffectivelyBooked ? 'Currently Unavailable' : 'Book Now'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AdBoard
