import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './AdBoard.css'
import { supabase } from '../utils/supabase'

const AdBoard = () => {
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAd = async () => {
            try {
                // Fetch from 'ads' table matching the id
                const { data, error } = await supabase
                    .from('ads')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error) {
                    console.error("Error fetching ad:", error)
                } else {
                    setProduct(data)
                }
            } catch (err) {
                console.error("Unexpected error:", err)
            } finally {
                setLoading(false)
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
                            </ul>
                        </div>
                        <div className="ad-info-card">
                            <h3>Description</h3>
                            <p className="ad-description">
                                {product.description}
                            </p>
                        </div>
                    </div>

                    <button className="book-now-btn">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AdBoard
