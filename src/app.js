const express = require('express');
require('dotenv').config(); //Loads environment variables from your .env file into process.env

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(express.json());

//Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'node-api-starter',
        version: '1.0.0'
    })
});

//Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!'
    });
});

//Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;