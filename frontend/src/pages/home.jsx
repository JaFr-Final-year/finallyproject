import React, { useState, useEffect } from 'react'
import Navbar from '../components/navbar'
import Adlist from './adlist'
import heroImage from '../assets/hero-image.png'
import { supabase } from '../utils/supabase'
import About from './about'

const home = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data, error } = await supabase.auth.getSession()
                if (error) throw error
                setUser(data.session?.user ?? null)
            } catch (error) {
                console.error('Error fetching session:', error.message)
            } finally {
                setLoading(false)
            }
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <>
            <Navbar />

            <div className="home-container" style={{ paddingBottom: 0 }}>
                {/* Personalized welcome message */}
                {!loading && user && (
                    <h1 className="welcome-text" style={{ marginTop: '2rem' }}>Welcome, {user.user_metadata?.name || user.email}</h1>
                )}
                {!loading && !user && (
                    <h1 className="welcome-text" style={{ marginTop: '2rem' }}>Explore Ad Spaces</h1>
                )}
            </div>

            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Search, Plan & Book <br />
                        AdBoards <br />
                        <span className="hero-highlight">All in one place.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Plan campaigns, view pricing, explore locations, and see who'll see your ads — all on one convenient platform.
                    </p>

                </div>
                <div className="hero-image-container">
                    <img src={heroImage} alt="AdBoard Illustration" className="hero-image" />
                </div>
            </div>

            <Adlist />
            <About />
        </>
    )
}

export default home