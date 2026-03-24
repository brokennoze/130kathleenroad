require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // User suggested or standard
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // App Password if using Gmail
    }
});

// Routes
app.post('/api/request-viewing', (req, res) => {
    const { firstName, lastName, email, phone, date, time, message } = req.body;
    const fullName = `${firstName} ${lastName}`;

    console.log(`Received viewing request from ${fullName} (${email})`);

    // 1. Send email to the User with Questionnaire Link
    const questionnaireLink = `${req.protocol}://${req.get('host')}/questionnaire.html?email=${encodeURIComponent(email)}`;
    
    const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Viewing Request Received - 130 Kathleen Road',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color: #2c3e50;">Hello ${firstName},</h2>
                <p>Thank you for your interest in viewing <strong>130 Kathleen Road</strong>. We have received your request for <strong>${date}</strong> in the <strong>${time}</strong>.</p>
                <p>To ensure all viewers are in a position to proceed, we require a quick purchase eligibility questionnaire to be completed before confirming the appointment.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${questionnaireLink}" style="background-color: #2c3e50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Eligibility Questionnaire</a>
                </div>
                <p>Once completed, we will be in touch to finalize the viewing time.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.9em; color: #7f8c8d;">Best regards,<br>The 130 Kathleen Road Team</p>
            </div>
        `
    };

    // 2. Send notification to Admin
    const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: 'NEW VIEWING REQUEST: 130 Kathleen Road',
        text: `New viewing request from ${fullName}.\nEmail: ${email}\nPhone: ${phone}\nDate: ${date}\nTime: ${time}\nNotes: ${message || 'None'}`
    };

    // Execute sends
    Promise.all([
        transporter.sendMail(userMailOptions),
        transporter.sendMail(adminMailOptions)
    ])
    .then(() => {
        res.status(200).json({ success: true, message: 'Request received and email sent.' });
    })
    .catch(err => {
        console.error('Email Error:', err);
        res.status(500).json({ success: false, message: 'Failed to send email.' });
    });
});

app.post('/api/submit-questionnaire', (req, res) => {
    const data = req.body;
    console.log('Received questionnaire submission:', data);

    const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `QUESTIONNAIRE SUBMITTED: ${data.email}`,
        html: `
            <h3>Purchase Eligibility Results</h3>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Buyer Status:</strong> ${data.status}</p>
            <p><strong>Position:</strong> ${data.position}</p>
            <p><strong>Mortgage in Principle:</strong> ${data.mortgage}</p>
            <p><strong>Estimated Completion Time:</strong> ${data.timeline}</p>
            <p><strong>Additional Details:</strong> ${data.details || 'None'}</p>
        `
    };

    transporter.sendMail(adminMailOptions)
        .then(() => {
            res.status(200).json({ success: true, message: 'Questionnaire submitted.' });
        })
        .catch(err => {
            console.error('Email Error:', err);
            res.status(500).json({ success: false, message: 'Failed to send notification.' });
        });
});

// Serve the questionnaire page
app.get('/questionnaire', (req, res) => {
    res.sendFile(path.join(__dirname, 'questionnaire.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
