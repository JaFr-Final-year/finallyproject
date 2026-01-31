import React from 'react'

const About = () => {
    React.useEffect(() => {
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
    }, []);

    return (
        <div id="about-section" className="container" style={{ paddingTop: '100px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 className="welcome-text scroll-reveal" style={{ fontSize: '2.5rem', color: '#111827', marginBottom: '2rem' }}>About SpaceToAd</h1>

            <div className="scroll-reveal scroll-reveal-delay-1" style={{
                backgroundColor: '#fff',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                textAlign: 'justify',
                lineHeight: '1.8',
                color: '#334155',
                fontSize: '1.1rem'
            }}>
                <p>
                    The <strong>Advertisement Locator</strong> is a location-based application designed to help businesses and individuals to identify, manage, and track advertising opportunities in specific geographic areas.
                </p>
                <p className="scroll-reveal scroll-reveal-delay-2" style={{ marginTop: '1rem' }}>
                    This project provides a digital platform that integrates mapping services with a centralized database of advertisement spaces such as billboards, digital screens, posters, and transit ads. Users can search for available locations, compare visibility metrics, check cost details, and book advertisement slots directly through the system.
                </p>
                <p className="scroll-reveal scroll-reveal-delay-3" style={{ marginTop: '1rem' }}>
                    By combining geolocation technology, database management, and an intuitive interface, the Advertisement Locator offers a smart and efficient solution for maximizing the impact of outdoor and local advertising campaigns.
                </p>
            </div>
        </div>
    )
}

export default About
