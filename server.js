const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Функция отправки письма через Brevo API
async function sendEmailViaAPI(name, email, message) {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sender: { email: process.env.EMAIL_USER },   // твой Gmail
            to: [{ email: process.env.EMAIL_USER }],     // твой Gmail
            replyTo: { email: email },
            subject: `New Message from Portfolio: ${name}`,
            textContent: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }
    return response.json();
}

// Маршрут для формы
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        await sendEmailViaAPI(name, email, message);
        console.log('Email sent successfully via Brevo API');
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send message.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});