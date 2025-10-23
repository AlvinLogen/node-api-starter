const express = require('express');
const sql = require('mssql');
const router = express.Router();

// Validation middleware
const validateContactForm = (req, res, next) => {
    const { name, email, message } = req.body;
    const errors = [];

    if(!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long.');
    }

    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        errors.push('Valid email address is required');
    }

    if(!message || message.trim().length < 10){
        errors.push('Message must be at least 10 characters long.');
    }

    if(message && message.length > 500) {
        errors.push('Message cannot exceed 500 characters.');
    }

    if (errors.length > 0){
        return res.status(400).json({
            success: false, 
            errors, 
            message: 'Validation failed'
        });
    }

    next();
};

// Contact form submission endpoint
router.post('/contact', validateContactForm, async(req, res) => {
    try {
        const { name, email, phone, subject, message} = req.body;

        //Sanitize Inputs
        const sanitizeData = {
            name: name.trim().substring(0,100),
            email: email.trim().toLowerCase().substring(0,255),
            phone: phone ? phone.trim().substring(0,20) : null,
            subject: subject ? subject.trim().substring(0,100) : null,
            message: message.trim().substring(0,500)
        };

        // Insert into database
        const pool = await sql.connect();
        const request = pool.request();

        request.input('name', sql.NVarChar(100), sanitizeData.name);
        request.input('email', sql.NVarChar(255), sanitizeData.email);
        request.input('phone', sql.NVarChar(20), sanitizeData.phone);
        request.input('subject', sql.NVarChar(100), sanitizeData.subject);
        request.input('message', sql.NText, sanitizeData.message);

        const result = await request.query(`
                INSERT INTO ContactSubmissions(Name, Email, Phone, Subject, Message)
                OUTPUT INSERTED.ID, INSERTED.SubmittedAt
                VALUES (@name, @email, @phone, @subject, @message)
            `);

        const isnertedRecord = result.recordset[0];

        res.status(201).json({
            success: true, 
            data: {
                id: isnertedRecord.ID,
                submittedAt: isnertedRecord.SubmittedAt
            },
            message: 'Contact form submitted successfully'
        });

        // Log successful submission
        console.log(`Contact form submitted: ID ${isnertedRecord.ID}, Email: ${sanitizeData.email}`);

    } catch (error) {
        console.error('Contact form submission error:', error);

        res.status(500).json({
            success: false, 
            message: 'Internal server error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get Contact submissions (admin endpoint)
router.get('/contact', async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page -1) * limit;

        const pool = await sql.connect();
        const request = pool.request();

        request.input('limit', sql.Int, limit);
        request.input('offset', sql.Int, offset);

        const result = await request.query(`
            SELECT
                ID, 
                Name, 
                Email,
                Phone,
                Subject,
                Message,
                SubmittedAt,
                IsRead
            FROM ContactSubmissions
            ORDER BY SubmittedAt DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
            `);

        // Get total count

        const countResult = await request.query('SELECT COUNT(*) as total FROM ContactSubmissions');
        const total = countResult.recordset[0].total;

        res.json({
            success: true, 
            data: result.recordset,
            pagination: {
                page, 
                limit, 
                total,
                pages: Math.ceil(total/limit)
            }
        });
    } catch (error) {
        console.error('Error fetching contact submissions: ', error);
        res.status(500).json({
            success: false, 
            message: 'Error fetching contact submissions'
        });        
    }
});

module.exports = router;