const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const financialRoutes = require('./routes/financials');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/financials', financialRoutes);

// Root route for Vercel visibility
app.get('/', (req, res) => {
    res.json({ message: 'IntelliFin API is online', docs: '/api/health' });
});

// Test route
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Server is running',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
