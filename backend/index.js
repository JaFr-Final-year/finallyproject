


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // Must be loaded before other local imports that use env vars

const adsRouter = require('./routes/ads');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('AdHub Backend API is running');
});

// Ad Routes
app.use('/api/ads', adsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
