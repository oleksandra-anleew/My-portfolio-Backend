const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Настройка SMTP (Brevo)
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 2525,               // ← более надёжный порт на Render
    secure: false,
    auth: {
        user: process.env.BREVO_USER,   // логин вида ...@smtp-brevo.com
        pass: process.env.BREVO_PASS    // мастер-пароль
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 20000,  // 20 секунд на подключение
    greetingTimeout: 15000,
    socketTimeout: 20000
});

// Маршрут для формы
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,   // твой Gmail (на который придёт ответ)
        to: process.env.EMAIL_USER,     // туда же
        replyTo: email,
        subject: `New Message from Portfolio: ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send message.' });
        }
        console.log('Email sent: ' + info.response);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});