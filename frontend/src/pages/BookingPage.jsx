import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import './BookingPage.css';

const BookingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingMonths, setBookingMonths] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentStep, setPaymentStep] = useState('details'); // 'details', 'payment', 'success'
    const [paymentMethod, setPaymentMethod] = useState('card');

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const { data, error } = await supabase
                    .from('ads')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setProduct(data);
            } catch (err) {
                console.error("Error fetching ad:", err);
                alert("Ad details could not be loaded.");
                navigate('/adlist');
            } finally {
                setLoading(false);
            }
        };

        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("Please login to proceed with booking.");
                navigate('/login');
            }
        };

        checkUser();
        fetchAd();
    }, [id, navigate]);

    const calculateTotal = () => {
        if (!product) return 0;
        return Math.round(product.price * bookingMonths);
    };

    const handleConfirmDetails = (e) => {
        e.preventDefault();
        if (bookingMonths < 1) {
            alert("Minimum booking duration is 1 month.");
            return;
        }
        setPaymentStep('payment');
    };

    const handlePayment = async () => {
        setIsSubmitting(true);
        // Simulate payment delay
        setTimeout(async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const bookedUntil = new Date();
                bookedUntil.setMonth(bookedUntil.getMonth() + parseInt(bookingMonths));

                const { error } = await supabase
                    .from('ads')
                    .update({
                        is_booked: true,
                        booked_until: bookedUntil.toISOString(),
                        booked_by_email: session.user.email
                    })
                    .eq('id', id);

                if (error) throw error;
                setPaymentStep('success');
            } catch (err) {
                console.error("Booking failed:", err);
                alert("Payment successful but booking record could not be updated. Please contact support.");
            } finally {
                setIsSubmitting(false);
            }
        }, 2000);
    };

    if (loading) {
        return (
            <div className="booking-loading-container">
                <div className="premium-loader"></div>
            </div>
        )
    }
    if (!product) return <div className="booking-loading">Ad not found.</div>;

    return (
        <div className="booking-page-wrapper">
            <div className="booking-container">
                <div className="booking-steps">
                    <div className={`step ${paymentStep === 'details' ? 'active' : ''}`}>1. Details</div>
                    <div className={`step ${paymentStep === 'payment' ? 'active' : ''}`}>2. Payment</div>
                    <div className={`step ${paymentStep === 'success' ? 'active' : ''}`}>3. Confirmation</div>
                </div>

                {paymentStep === 'details' && (
                    <div className="booking-card animate-fade-in">
                        <h2>Confirm Booking Details</h2>
                        <div className="product-summary-mini">
                            <div className="mini-info">
                                <h3>{product.name}</h3>
                                <p>📍 {product.location}</p>
                            </div>
                            <div className="mini-price">
                                {product.price}₹/Month
                            </div>
                        </div>

                        <form onSubmit={handleConfirmDetails} className="booking-form">
                            <div className="form-group">
                                <label>Duration (Months)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={bookingMonths}
                                    onChange={(e) => setBookingMonths(e.target.value)}
                                    required
                                />
                                <span className="input-hint">Minimum booking duration is 1 month.</span>
                            </div>

                            <div className="order-summary">
                                <div className="summary-row">
                                    <span>Monthly Rate</span>
                                    <span>{product.price}₹</span>
                                </div>
                                <div className="summary-row">
                                    <span>Duration</span>
                                    <span>{bookingMonths} Month{bookingMonths > 1 ? 's' : ''}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total Amount</span>
                                    <span>{calculateTotal()}₹</span>
                                </div>
                            </div>

                            <button type="submit" className="proceed-btn">Proceed to Payment</button>
                        </form>
                    </div>
                )}

                {paymentStep === 'payment' && (
                    <div className="booking-card animate-fade-in">
                        <h2>Select Payment Method</h2>
                        <p className="payment-total">Amount to pay: <strong>{calculateTotal()}₹</strong></p>

                        <div className="payment-methods">
                            <div
                                className={`method-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                                onClick={() => setPaymentMethod('card')}
                            >
                                <span className="method-icon">💳</span>
                                <span>Credit/Debit Card</span>
                            </div>
                            <div
                                className={`method-card ${paymentMethod === 'upi' ? 'selected' : ''}`}
                                onClick={() => setPaymentMethod('upi')}
                            >
                                <span className="method-icon">📱</span>
                                <span>UPI (GPay/PhonePe)</span>
                            </div>
                            <div
                                className={`method-card ${paymentMethod === 'netbanking' ? 'selected' : ''}`}
                                onClick={() => setPaymentMethod('netbanking')}
                            >
                                <span className="method-icon">🏦</span>
                                <span>Net Banking</span>
                            </div>
                        </div>

                        {paymentMethod === 'card' && (
                            <div className="card-details-mock animate-slide-up">
                                <div className="form-group">
                                    <label>Card Number</label>
                                    <input type="text" placeholder="**** **** **** 1234" disabled />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Expiry</label>
                                        <input type="text" placeholder="MM/YY" disabled />
                                    </div>
                                    <div className="form-group">
                                        <label>CVV</label>
                                        <input type="password" placeholder="***" disabled />
                                    </div>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'upi' && (
                            <div className="upi-details-mock animate-slide-up text-center">
                                <p>Pay using any UPI app</p>
                                <div className="qr-placeholder">
                                    <span className="qr-icon">⏹️</span>
                                    <p>Scan to Pay</p>
                                </div>
                                <p className="upi-id-mock">spacetoad@upi</p>
                            </div>
                        )}

                        <div className="payment-actions">
                            <button className="back-btn" onClick={() => setPaymentStep('details')}>Back</button>
                            <button
                                className="pay-btn"
                                onClick={handlePayment}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing Payment...' : `Pay ${calculateTotal()}₹`}
                            </button>
                        </div>
                    </div>
                )}

                {paymentStep === 'success' && (
                    <div className="booking-card success-card animate-scale-up">
                        <div className="success-icon">✅</div>
                        <h2>Booking Successful!</h2>
                        <p>Your advertisement space has been reserved.</p>
                        <div className="success-details">
                            <div className="detail-row">
                                <span>AdBoard:</span>
                                <span>{product.name}</span>
                            </div>
                            <div className="detail-row">
                                <span>Duration:</span>
                                <span>{bookingMonths} Month{bookingMonths > 1 ? 's' : ''}</span>
                            </div>
                            <div className="detail-row">
                                <span>Total Paid:</span>
                                <span>{calculateTotal()}₹</span>
                            </div>
                        </div>
                        <button className="home-btn" onClick={() => navigate('/adlist')}>View More Ads</button>
                        <button className="profile-btn" onClick={() => navigate('/profile')}>My Bookings</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingPage;
