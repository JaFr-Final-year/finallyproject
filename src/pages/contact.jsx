
import React, { useEffect } from 'react'
import './contact.css'

const Contact = () => {
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
    }, []);

    return (
        <div className="contact-wrapper">
            <div className="contact-container scroll-reveal">
                <div className="contact-info-side">
                    <h1 className="contact-title">Get in Touch</h1>
                    <p className="contact-subtitle">
                        Have a question about a listing or want to partner with us? Our team is here to help you shine.
                    </p>

                    <div className="contact-details">
                        <div className="contact-item">
                            <div className="contact-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            </div>
                            <div className="contact-text">
                                <h4>Phone</h4>
                                <p>+91 ##########</p>
                            </div>
                        </div>

                        <div className="contact-item">
                            <div className="contact-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            </div>
                            <div className="contact-text">
                                <h4>Email</h4>
                                <p>spacetoad@gmail.com</p>
                            </div>
                        </div>

                        <div className="contact-item">
                            <div className="contact-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            </div>
                            <div className="contact-text">
                                <h4>Location</h4>
                                <p>Kerala</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="contact-form-side">
                    <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="text" placeholder="Your Name" required />
                        <input type="email" placeholder="Email Address" required />
                        <textarea placeholder="How can we help?" rows="5" required></textarea>
                        <button type="submit" className="contact-send-btn">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Contact
