const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();
const dns = require('dns');

const app = express();
const PORT = process.env.PORT || 3000;

// Разрешаем фронтенду слать запросы (CORS)
app.use(cors());
// Позволяем серверу читать JSON-данные
app.use(express.json());

// Настройка почтового сервера (SMTP)
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Маршрут для обработки формы
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Что придет тебе на почту
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Письмо придет тебе от самого себя
        replyTo: email, // Но ответить можно будет клиенту в один клик
        subject: `New Message from Portfolio: ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    // Отправка
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
