import React, { useState, useEffect } from 'react'
import Adlist from './adlist'
import heroImage from '../assets/hero-image.png'
import { supabase } from '../utils/supabase'
import About from './about'

const Home = () => {
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

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    entry.target.classList.remove('active');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.scroll-reveal');
        elements.forEach((el) => observer.observe(el));

        return () => elements.forEach((el) => observer.unobserve(el));
    }, [loading]); // Re-run when loading finishes so elements are in DOM

    return (
        <>
            <div className="home-container scroll-reveal" style={{ paddingBottom: 0 }}>
                {/* Personalized welcome message */}
                {!loading && user && (
                    <h1 className="welcome-text" style={{ marginTop: '2rem' }}>Welcome, {user.user_metadata?.name || user.email}</h1>
                )}
                {!loading && !user && (
                    <h1 className="welcome-text" style={{ marginTop: '2rem' }}>Explore Ad Spaces</h1>
                )}
            </div>

            <div className="hero-section scroll-reveal scroll-reveal-delay-1">
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
                <div
                    className="hero-image-container"
                    onMouseMove={(e) => {
                        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - left) / width) * 100;
                        const y = ((e.clientY - top) / height) * 100;
                        e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                        e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                    }}
                    style={{ '--mouse-x': '50%', '--mouse-y': '50%' }}
                >
                    <div className="corner-bracket top-left"></div>
                    <div className="corner-bracket top-right"></div>
                    <div className="corner-bracket bottom-left"></div>
                    <div className="corner-bracket bottom-right"></div>
                    <img src={heroImage} alt="AdBoard Illustration" className="hero-image" />
                </div>
            </div>

            <div className="scroll-reveal scroll-reveal-delay-2">
                <Adlist />
            </div>
            <div className="scroll-reveal scroll-reveal-delay-3">
                <About />
            </div>
        </>
    )
}

export default Home