import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/navbar'
import { supabase } from '../utils/supabase'


const Vendor = () => {
    // Hooks
    const navigate = useNavigate()

    // Form state
    const [formData, setFormData] = useState({
        name: '', 
        category: 'billboard', 
        location: '',
        contactNumber: '',
        price: '',
        size: '',
        description: ''
    })

    const [loading, setLoading] = useState(false)

    // File state
    const [images, setImages] = useState([])
    const [proofFile, setProofFile] = useState(null)
    const [dragActive, setDragActive] = useState(false)

    // Refs for hidden file inputs
    const imageInputRef = useRef(null)
    const proofInputRef = useRef(null)

    // Handle text input changes
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    // Handle drop event for images
    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files)
        }
    }

    // Handle manual file selection for images
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files)
        }
    }

    // Process selected files
    const handleFiles = (files) => {
        const newFiles = Array.from(files).map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }))
        setImages(prev => [...prev, ...newFiles])
    }

    // Remove an image from the list
    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    // Handle proof of ownership file selection
    const handleProofChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile(e.target.files[0])
        }
    }

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Basic validation
        if (!formData.location || !formData.price || !formData.name) {
            alert("Please fill in all required fields.")
            setLoading(false)
            return
        }

        try {
            // Get current user
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                console.error("Auth Error:", authError)
                alert("Please login")
                alert("You must be logged in to submit a listing.")
                setLoading(false)
                return
            }

            // Prepare data using FormData to support file uploads
            const data = new FormData()
            data.append('title', formData.name)
            data.append('name', formData.name)
            data.append('location', formData.location)
            data.append('price', formData.price)
            data.append('size', formData.size)
            data.append('description', `${formData.description}\n\nContact Number: ${formData.contactNumber}`)
            data.append('category', formData.category)
            data.append('owner_id', user.id)

            // Append the first image if available
            if (images.length > 0) {
                data.append('image', images[0].file)
            }

            const response = await fetch("http://localhost:5000/api/ads", {
                method: "POST",
                body: data // FormData automatically sets the correct Content-Type header
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error("Backend Insert Error:", errorData)
                throw new Error(errorData.error || "Failed to create ad")
            }

            alert("Listing submitted successfully! Redirecting to Ad List...")

            // Redirect to AdList
            // Redirect to AdList to see the new item
            navigate('/adlist')

        } catch (error) {
            console.error("Error submitting listing (Full):", error)
            alert(`Error submitting listing: ${error.message || "Unknown error"}`)
        } finally {
            setLoading(false)
        }
    }

    // Trigger file input click
    const onButtonClick = () => {
        imageInputRef.current.click()
    }

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
        <div>
            <div className="container">
                <div className="vendor-container scroll-reveal">
                    <h1 className="vendor-title">List Your Ad Space</h1>

                    <form className="vendor-form" onSubmit={handleSubmit}>

                        {/* Ad Title/Name */}
                        <div className="form-group full-width centered-group scroll-reveal scroll-reveal-delay-1">
                            <label>Ad Title</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="e.g. Prime Billboard near City Center"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Category */}
                        <div className="form-group scroll-reveal scroll-reveal-delay-2">
                            <label>Category</label>
                            <select
                                name="category"
                                className="form-input"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="billboard">Billboard</option>
                                <option value="digital">Digital Screen</option>
                                <option value="transit">Transit Ad</option>
                                <option value="mural">Wall Mural</option>
                            </select>
                        </div>

                        {/* Location */}
                        <div className="form-group scroll-reveal scroll-reveal-delay-3">
                            <label>Location</label>
                            <input
                                type="text"
                                name="location"
                                className="form-input"
                                placeholder="e.g. 123 Main St, New York, NY"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Size and Price */}
                        <div className="form-row-container" style={{ display: 'flex', gap: '1rem', gridColumn: 'span 1' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Size (Dimensions)</label>
                                <input
                                    type="text"
                                    name="size"
                                    className="form-input"
                                    placeholder="e.g. 14x48 ft"
                                    value={formData.size}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Price per Month</label>
                                <input
                                    type="text"
                                    name="price"
                                    className="form-input"
                                    placeholder="e.g. ₹500"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Contact Number */}
                        <div className="form-group scroll-reveal">
                            <label>Contact Number</label>
                            <input
                                type="tel"
                                name="contactNumber"
                                className="form-input"
                                placeholder="Your contact number"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="form-group full-width scroll-reveal">
                            <label>Description</label>
                            <textarea
                                name="description"
                                className="form-input"
                                placeholder="Describe your ad space (visibility, traffic, etc.)"
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                style={{ resize: 'vertical' }}
                            ></textarea>
                        </div>

                        {/* Drag & Drop Image Upload */}
                        <div className="form-group full-width scroll-reveal">
                            <label>Upload Images</label>
                            <div
                                className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={onButtonClick}
                            >
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    className="file-input-hidden"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <div className="drop-zone-icon">📷</div>
                                <p className="drop-zone-text">Drag & drop images here, or click to select</p>
                            </div>

                            {/* Image Previews */}
                            {images.length > 0 && (
                                <div className="file-list">
                                    {images.map((img, index) => (
                                        <div key={index} className="file-preview">
                                            <img src={img.preview} alt={`preview ${index}`} />
                                            <button
                                                type="button"
                                                className="remove-file-btn"
                                                onClick={() => removeImage(index)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Proof of Ownership */}
                        <div className="form-group full-width scroll-reveal">
                            <label>Proof of Ownership (Document)</label>
                            <div
                                className="form-input"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                                onClick={() => proofInputRef.current.click()}
                            >
                                <span>{proofFile ? proofFile.name : "Click to upload document..."}</span>
                                <span>📄</span>
                            </div>
                            <input
                                ref={proofInputRef}
                                type="file"
                                className="file-input-hidden"
                                accept=".pdf,.doc,.docx,.jpg,.png"
                                onChange={handleProofChange}
                            />
                        </div>

                        <div className="full-width scroll-reveal centered-group">
                            <button type="submit" className="submit-btn" style={{ width: '100%', maxWidth: '400px' }} disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Listing'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Vendor