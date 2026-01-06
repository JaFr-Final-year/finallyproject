import React from 'react'
import Navbar from '../components/navbar'

/**
 * Vendor page component where users can list and manage their advertising spaces.
 */
const Vendor = () => {
    return (
        <div>
            <Navbar />
            <div style={{ padding: '2rem' }}>
                <h1>Vendor Page</h1>
                <p>Manage your advertising listings here.</p>
            </div>
        </div>
    )
}

export default Vendor