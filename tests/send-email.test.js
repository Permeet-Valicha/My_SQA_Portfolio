const assert = require('node:assert/strict');
const test = require('node:test');
const nodemailer = require('nodemailer');
const handler = require('../api/send-email');

function createResponse() {
    return {
        headers: {},
        statusCode: null,
        payload: null,
        setHeader(name, value) {
            this.headers[name] = value;
        },
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.payload = payload;
            return this;
        }
    };
}

function createRequest(body, method = 'POST') {
    return {
        method,
        headers: { 'content-type': 'application/json' },
        body
    };
}

test('rejects methods other than POST', async () => {
    const response = createResponse();
    await handler(createRequest({}, 'GET'), response);

    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.Allow, 'POST');
});

test('validates input before attempting to send email', async () => {
    const response = createResponse();
    await handler(createRequest({ name: 'Test', email: 'invalid', message: 'Hello' }), response);

    assert.equal(response.statusCode, 400);
    assert.match(response.payload.error, /valid email/i);
});

test('sends validated, escaped message using server-side SMTP settings', async t => {
    const previousEnvironment = {
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        CONTACT_TO: process.env.CONTACT_TO
    };
    process.env.SMTP_USER = 'sender@example.com';
    process.env.SMTP_PASS = 'test-password';
    process.env.CONTACT_TO = 'inbox@example.com';

    let sentOptions;
    const originalCreateTransport = nodemailer.createTransport;
    nodemailer.createTransport = options => ({
        sendMail: async mail => {
            sentOptions = { transport: options, mail };
        }
    });

    t.after(() => {
        nodemailer.createTransport = originalCreateTransport;
        for (const [key, value] of Object.entries(previousEnvironment)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    });

    const response = createResponse();
    await handler(createRequest({
        name: '<Visitor>',
        email: 'visitor@example.com',
        subject: 'Project inquiry',
        message: 'Line one\n<script>alert(1)</script>'
    }), response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.payload.message, 'Message sent!');
    assert.equal(sentOptions.transport.auth.pass, 'test-password');
    assert.equal(sentOptions.mail.to, 'inbox@example.com');
    assert.equal(sentOptions.mail.replyTo, 'visitor@example.com');
    assert.match(sentOptions.mail.html, /&lt;Visitor&gt;/);
    assert.doesNotMatch(sentOptions.mail.html, /<script>/);
});

test('does not attempt to send when SMTP environment settings are missing', async () => {
    const previousEnvironment = {
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        CONTACT_TO: process.env.CONTACT_TO
    };
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.CONTACT_TO;

    const response = createResponse();
    await handler(createRequest({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Hello'
    }), response);

    for (const [key, value] of Object.entries(previousEnvironment)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
    }

    assert.equal(response.statusCode, 503);
    assert.match(response.payload.error, /temporarily unavailable/i);
});
