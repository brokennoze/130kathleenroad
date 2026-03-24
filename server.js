require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Setup multer for memory storage (file upload)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: (process.env.EMAIL_PASS || '').replace(/\s+/g, '') // Clean spaces
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
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <style>
                    body { margin: 0; padding: 0; background-color: #1a1a1a; font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #242424; color: #fff; text-align: center; border-radius: 8px; overflow: hidden; }
                    .header { background-image: url('https://www.130kathleenroad.co.uk/images/hero-bg.jpg'); background-size: cover; padding: 40px 20px; border-bottom: 4px solid #cda434; }
                    .content { padding: 30px; }
                    h1 { margin: 0; color: #fff; text-shadow: 2px 2px 8px #000; font-size: 28px; }
                    h2 { color: #cda434; margin-top: 0; }
                    p { color: #e0e0e0; font-size: 16px; line-height: 1.6; }
                    .info-box { background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 3px solid #cda434; text-align: left; }
                    .btn { display: inline-block; padding: 14px 28px; background-color: #cda434; color: #1a1a1a !important; font-weight: bold; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                    .footer { background-color: #111; padding: 20px; border-top: 2px solid #cda434; font-size: 12px; color: #888; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>130 KATHLEEN ROAD</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${firstName},</h2>
                        <p>Thank you for your interest in viewing our property. We have received your request for <strong>${date}</strong>.</p>
                        
                        <div class="info-box">
                            <h3 style="color:#fff; margin-top:0;">Pre-Viewing Requirement</h3>
                            <p style="margin-bottom:0;">To ensure all viewers are in a position to proceed, we require a quick purchase eligibility questionnaire to be completed before confirming the appointment.</p>
                        </div>

                        <a href="${questionnaireLink}" class="btn">Complete Eligibility Questionnaire</a>
                        
                        <p>Once submitted, our team will review your details and be in touch to finalize the viewing time.</p>
                    </div>
                    <div class="footer">
                        <p>130 Kathleen Road, Southampton | <a href="mailto:admin@openmover.co.uk" style="color: #cda434; text-decoration:none;">admin@openmover.co.uk</a></p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    // 2. Send notification to Admin
    const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: 'NEW VIEWING REQUEST: 130 Kathleen Road',
        html: `
            <div style="background-color: #f4f4f4; padding: 20px; font-family: sans-serif;">
                <div style="background: white; padding: 20px; border-radius: 10px; border-top: 5px solid #cda434;">
                    <h2 style="color: #333;">New Viewing Request</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${fullName}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${phone}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${date}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Time:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${time}</td></tr>
                    </table>
                    <p><strong>Notes:</strong><br>${message || 'None'}</p>
                </div>
            </div>
        `
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

app.post('/api/submit-questionnaire', upload.single('proofOfFunds'), (req, res) => {
    const data = req.body;
    const file = req.file;
    console.log('Received questionnaire submission for:', data.email);

    // Build the email body with all fields
    let infoHtml = `
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Status:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.status}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Living Situation:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.livingSituation || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Deposit %:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.deposit || '0'}%</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Position:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.position}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Mortgage:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.mortgage}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Solicitor Instructed:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.solicitor || 'No'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Timeline:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.timeline}</td></tr>
        </table>
    `;

    // Add seller-specific info if present
    if (data.status === 'upsizing' || data.status === 'downsizing') {
        infoHtml += `
            <div style="margin-top: 20px; border-top: 2px solid #cda434; padding-top: 10px;">
                <h4 style="color: #cda434; margin: 0 0 10px 0;">Seller Property Status</h4>
                <p style="margin: 5px 0;"><strong>Buyer Lined Up:</strong> ${data.hasBuyer || 'No'}</p>
                <p style="margin: 5px 0;"><strong>Buyer Position:</strong> ${data.buyerPosition || 'N/A'}</p>
            </div>
        `;
    }

    const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `QUESTIONNAIRE SUBMITTED: ${data.email}`,
        html: `
            <div style="background-color: #f4f4f4; padding: 20px; font-family: sans-serif;">
                <div style="background: white; padding: 20px; border-radius: 10px; border-top: 5px solid #cda434;">
                    <h2 style="color: #333;">Purchase Eligibility Result</h2>
                    <p>Submission from: <strong>${data.email}</strong></p>
                    ${infoHtml}
                    <p style="margin-top: 20px;"><strong>Additional Details:</strong><br>${data.details || 'None'}</p>
                    ${file ? `<p style="color: #27ae60;"><strong>Note:</strong> Proof of Funds document is attached (${file.originalname}).</p>` : '<p style="color: #888;">No Proof of Funds document provided.</p>'}
                </div>
            </div>
        `
    };

    // Add attachment if file exists
    if (file) {
        adminMailOptions.attachments = [{
            filename: file.originalname,
            content: file.buffer
        }];
    }

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
