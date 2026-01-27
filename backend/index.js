const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key. Check .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Routes
app.get('/', (req, res) => {
  res.send('AdHub Backend API is running');
});

// Example route to test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase.from('ads').select('*').limit(1);
    if (error) throw error;
    res.json({ message: 'Database connection successful', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all ads
app.get('/api/ads', async (req, res) => {
  try {
    const { data, error } = await supabase.from('ads').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new ad
app.post('/api/ads', async (req, res) => {
  try {
    const adData = req.body;
    // Basic validation could go here

    const { data, error } = await supabase
      .from('ads')
      .insert([adData])
      .select();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating ad:", error);
    res.status(500).json({ error: error.message });
  }
});


// Get ads by user ID
app.get('/api/ads/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase.from('ads').select('*').eq('owner_id', userId);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
