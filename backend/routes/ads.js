const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const multer = require('multer');
const crypto = require('crypto');

// Configure multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// Get all ads
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase.from('ads').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get ads by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { data, error } = await supabase.from('ads').select('*').eq('owner_id', userId);

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single ad
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('ads').select('*').eq('id', id).single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Ad not found' });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new ad
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const hasFile = !!req.file;
        const adId = hasFile ? crypto.randomUUID() : (req.body.id || crypto.randomUUID());
        let imagePath = null;

        if (hasFile) {
            const file = req.file;
            const filePath = `ads/${adId}/${file.originalname}`;
            const { error: uploadError } = await supabase.storage
                .from('ads-images')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (uploadError) throw uploadError;
            imagePath = filePath;
        }

        // Construct ad object
        // Use uploaded image path if available, otherwise fallback to body's image or default
        const imageValue = imagePath ? [imagePath] : (req.body.image || '📢');

        const adData = {
            ...req.body,
            id: adId,
            price: Number(req.body.price), // IMPORTANT: Ensure price is a number
            status: req.body.status || 'pending',
            image: imageValue
        };

        const { data, error } = await supabase
            .from('ads')
            .insert([adData])
            .select();

        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error("Error creating ad:", error);
        res.status(500).json({ error: error.message });
    }
});

// Delete an ad (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('ads')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Ad not found or deletion failed (check permissions)' });
        }

        res.json({ message: 'Ad deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update ad status (Admin - Accept request)
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('ads')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update ad general details (Edit)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const adUpdateData = { ...req.body };

        // Ensure price is handled as number if present
        if (adUpdateData.price) {
            adUpdateData.price = Number(adUpdateData.price);
        }

        const { data, error } = await supabase
            .from('ads')
            .update(adUpdateData)
            .eq('id', id)
            .select();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error("Error updating ad:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
