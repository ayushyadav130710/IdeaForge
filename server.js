import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number.parseInt(process.env.PORT || '5000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || '';
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER || '';
const CONTACT_RATE_LIMIT_WINDOW_MS = Number.parseInt(
  process.env.CONTACT_RATE_LIMIT_WINDOW_MS || String(15 * 60 * 1000),
  10,
);
const CONTACT_RATE_LIMIT_MAX = Number.parseInt(process.env.CONTACT_RATE_LIMIT_MAX || '5', 10);

const allowedOrigins = CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  }),
);
app.use(express.json({limit: '20kb'}));

const contactLimiter = rateLimit({
  windowMs: CONTACT_RATE_LIMIT_WINDOW_MS,
  max: CONTACT_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many contact requests. Please try again later.',
  },
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const createTransporter = () => {
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = process.env.SMTP_PASS || '';
  const smtpService = process.env.SMTP_SERVICE || '';
  const smtpHost = process.env.SMTP_HOST || '';
  const smtpPort = Number.parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpSecure = (process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';

  if (!smtpUser || !smtpPass || (!smtpService && !smtpHost)) {
    return null;
  }

  if (smtpService) {
    return nodemailer.createTransport({
      service: smtpService,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

const transporter = createTransporter();

if (!transporter || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
  console.warn(
    'Contact email is not fully configured. Set CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL, SMTP_USER, SMTP_PASS, and SMTP_HOST (or SMTP_SERVICE).',
  );
} else {
  transporter.verify().then(
    () => {
      console.log('SMTP transporter verified.');
    },
    (error) => {
      console.error('SMTP verification failed:', error.message);
    },
  );
}

app.get('/api/health', (_req, res) => {
  res.status(200).json({success: true, message: 'Server is running'});
});

app.post('/api/contact', contactLimiter, async (req, res, next) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    const fieldErrors = {};

    if (!name) {
      fieldErrors.name = 'Name is required.';
    } else if (name.length > 100) {
      fieldErrors.name = 'Name must be 100 characters or less.';
    }

    if (!email) {
      fieldErrors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(email)) {
      fieldErrors.email = 'Email format is invalid.';
    } else if (email.length > 254) {
      fieldErrors.email = 'Email is too long.';
    }

    if (!message) {
      fieldErrors.message = 'Message is required.';
    } else if (message.length > 5000) {
      fieldErrors.message = 'Message must be 5000 characters or less.';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed.',
        fieldErrors,
      });
    }

    if (!transporter || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
      return res.status(500).json({
        success: false,
        error: 'Contact email service is not configured.',
      });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replaceAll('\n', '<br/>');

    await transporter.sendMail({
      from: `"IdeaForge Contact" <${CONTACT_FROM_EMAIL}>`,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully.',
    });
  } catch (error) {
    return next(error);
  }
});

const distPath = path.join(__dirname, 'dist');
const distIndexPath = path.join(distPath, 'index.html');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.use(express.static(__dirname));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || path.extname(req.path)) {
    return next();
  }

  if (fs.existsSync(distIndexPath)) {
    return res.sendFile(distIndexPath);
  }

  return res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON body.',
    });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS blocked this request origin.',
    });
  }

  console.error('Unhandled server error:', err);
  return res.status(500).json({
    success: false,
    error: 'Internal server error.',
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
