const nodemailer = require('nodemailer');

const MAX_REQUEST_LENGTH = 10000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sendJson(response, statusCode, payload) {
    return response.status(statusCode).json(payload);
}

function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    })[character]);
}

module.exports = async function handler(request, response) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Allow', 'POST');

    if (request.method !== 'POST') {
        return sendJson(response, 405, { error: 'Method not allowed.' });
    }

    const contentType = request.headers['content-type'] || '';
    if (!contentType.toLowerCase().includes('application/json')) {
        return sendJson(response, 415, { error: 'Content-Type must be application/json.' });
    }

    let body = request.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            return sendJson(response, 400, { error: 'Invalid request body.' });
        }
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return sendJson(response, 400, { error: 'Invalid request body.' });
    }

    if (JSON.stringify(body).length > MAX_REQUEST_LENGTH) {
        return sendJson(response, 413, { error: 'Message is too large.' });
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const website = typeof body.website === 'string' ? body.website.trim() : '';

    if (website) {
        return sendJson(response, 400, { error: 'Invalid submission.' });
    }

    if (!name || name.length > 120) {
        return sendJson(response, 400, { error: 'Enter a name of 1 to 120 characters.' });
    }
    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
        return sendJson(response, 400, { error: 'Enter a valid email address.' });
    }
    if (subject.length > 150) {
        return sendJson(response, 400, { error: 'Subject must be 150 characters or fewer.' });
    }
    if (!message || message.length > 5000) {
        return sendJson(response, 400, { error: 'Message must be between 1 and 5000 characters.' });
    }

    const { SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;
    if (!SMTP_USER || !SMTP_PASS || !CONTACT_TO) {
        console.error('Contact email service is missing required environment configuration.');
        return sendJson(response, 503, { error: 'Email is temporarily unavailable. Please use another contact option.' });
    }

    const safeSubject = subject.replace(/[\r\n]+/g, ' ').trim() || 'New Message';
    const html = [
        '<h3>New Message from Portfolio</h3>',
        `<p><b>Name:</b> ${escapeHtml(name)}</p>`,
        `<p><b>Email:</b> ${escapeHtml(email)}</p>`,
        `<p><b>Message:</b></p>`,
        `<p>${escapeHtml(message).replace(/\r?\n/g, '<br>')}</p>`
    ].join('');

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user: SMTP_USER, pass: SMTP_PASS }
        });

        await transporter.sendMail({
            from: SMTP_USER,
            to: CONTACT_TO,
            replyTo: email,
            subject: `Portfolio: ${safeSubject}`,
            text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
            html
        });

        return sendJson(response, 200, { message: 'Message sent!' });
    } catch (error) {
        console.error('Contact email delivery failed:', error.code || 'SMTP_ERROR');
        return sendJson(response, 502, { error: 'Unable to send your message right now. Please try again later.' });
    }
};
