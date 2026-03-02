import {GoogleGenAI, Type} from '@google/genai';
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
const DEFAULT_CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const CORS_ORIGIN = process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGINS.join(',');
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || '';
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER || '';
const CONTACT_RATE_LIMIT_WINDOW_MS = Number.parseInt(
  process.env.CONTACT_RATE_LIMIT_WINDOW_MS || String(15 * 60 * 1000),
  10,
);
const CONTACT_RATE_LIMIT_MAX = Number.parseInt(process.env.CONTACT_RATE_LIMIT_MAX || '5', 10);
const AI_RATE_LIMIT_WINDOW_MS = Number.parseInt(
  process.env.AI_RATE_LIMIT_WINDOW_MS || String(15 * 60 * 1000),
  10,
);
const AI_RATE_LIMIT_MAX = Number.parseInt(process.env.AI_RATE_LIMIT_MAX || '20', 10);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const aiClient = GEMINI_API_KEY ? new GoogleGenAI({apiKey: GEMINI_API_KEY}) : null;

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
app.use(express.json({limit: '32kb'}));

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

const aiLimiter = rateLimit({
  windowMs: AI_RATE_LIMIT_WINDOW_MS,
  max: AI_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many AI requests. Please try again later.',
  },
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const IDEA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    constraintAnalysis: {
      type: Type.STRING,
      description: 'A 4-5 line analysis of the constraints and reasoning.',
    },
    ideas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          projectTitle: {type: Type.STRING},
          oneLinePitch: {type: Type.STRING},
          problemStatement: {type: Type.STRING},
          targetUsers: {type: Type.STRING},
          coreFeatures: {
            type: Type.ARRAY,
            items: {type: Type.STRING},
          },
          technicalArchitecture: {
            type: Type.OBJECT,
            properties: {
              frontend: {type: Type.STRING},
              backend: {type: Type.STRING},
              apis: {type: Type.STRING},
              database: {type: Type.STRING},
            },
            required: ['frontend', 'backend', 'apis', 'database'],
          },
          geminiUsage: {type: Type.STRING},
          developmentPlan: {
            type: Type.ARRAY,
            items: {type: Type.STRING},
          },
          monetizationPotential: {type: Type.STRING},
          futureExpansion: {type: Type.STRING},
          winningPotential: {
            type: Type.OBJECT,
            properties: {
              score: {type: Type.NUMBER},
              explanation: {
                type: Type.STRING,
                description:
                  "A highly specific analysis of how the features and architecture contribute to the idea's competitiveness and judge appeal.",
              },
            },
            required: ['score', 'explanation'],
          },
        },
        required: [
          'projectTitle',
          'oneLinePitch',
          'problemStatement',
          'targetUsers',
          'coreFeatures',
          'technicalArchitecture',
          'geminiUsage',
          'developmentPlan',
          'monetizationPotential',
          'futureExpansion',
          'winningPotential',
        ],
      },
    },
  },
  required: ['constraintAnalysis', 'ideas'],
};

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

if (!aiClient) {
  console.warn('Gemini AI is not configured. Set GEMINI_API_KEY for AI generation endpoints.');
}

const parseJsonText = (rawText) => {
  if (!rawText) return null;
  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
};

const validateUserInputs = (payload) => {
  const fieldErrors = {};
  const domain = typeof payload?.domain === 'string' ? payload.domain.trim() : '';
  const skillLevel = typeof payload?.skillLevel === 'string' ? payload.skillLevel.trim() : '';
  const timeLimit = typeof payload?.timeLimit === 'string' ? payload.timeLimit.trim() : '';
  const teamSize = Number.parseInt(String(payload?.teamSize ?? ''), 10);

  if (!domain) {
    fieldErrors.domain = 'Domain is required.';
  }

  if (!skillLevel) {
    fieldErrors.skillLevel = 'Skill level is required.';
  }

  if (!timeLimit) {
    fieldErrors.timeLimit = 'Time limit is required.';
  }

  if (Number.isNaN(teamSize) || teamSize < 1 || teamSize > 10) {
    fieldErrors.teamSize = 'Team size must be between 1 and 10.';
  }

  return {
    data: {
      domain,
      skillLevel,
      timeLimit,
      teamSize,
    },
    fieldErrors,
  };
};

const validateIdeaPayload = (payload) => {
  const idea = payload?.idea;
  const fieldErrors = {};

  if (!idea || typeof idea !== 'object') {
    fieldErrors.idea = 'Idea payload is required.';
    return {data: null, fieldErrors};
  }

  const projectTitle = typeof idea.projectTitle === 'string' ? idea.projectTitle.trim() : '';
  const problemStatement = typeof idea.problemStatement === 'string' ? idea.problemStatement.trim() : '';
  const coreFeatures = Array.isArray(idea.coreFeatures)
    ? idea.coreFeatures.filter((feature) => typeof feature === 'string' && feature.trim())
    : [];

  if (!projectTitle) {
    fieldErrors.projectTitle = 'projectTitle is required.';
  }

  if (!problemStatement) {
    fieldErrors.problemStatement = 'problemStatement is required.';
  }

  if (coreFeatures.length === 0) {
    fieldErrors.coreFeatures = 'At least one core feature is required.';
  }

  return {
    data: {
      projectTitle,
      problemStatement,
      coreFeatures,
    },
    fieldErrors,
  };
};

const buildIdeasPrompt = (inputs) => `
  You are an elite hackathon mentor, startup strategist, and product architect.
  Generate exactly 3 distinct, highly innovative, practical, and hackathon-winning project ideas based on these constraints:

  Domain: ${inputs.domain}
  Skill Level: ${inputs.skillLevel}
  Time Limit: ${inputs.timeLimit}
  Team Size: ${inputs.teamSize}

  Instructions:
  1. Avoid generic or overused ideas.
  2. Ensure feasibility within the given time limit.
  3. Match technical complexity to skill level.
  4. Prioritize creativity, real-world relevance, and innovation.
  5. CRITICAL: For the second idea, include 2-3 highly specific and innovative core features that align deeply with the problem statement and target users.
  6. For the winningPotential.explanation, provide a specific analysis for each idea.
  7. For the second idea, the winningPotential.explanation must be exceptionally detailed and reference how frontend, backend, APIs, and feature choices strengthen judge appeal.

  Before generating the ideas, provide a brief analysis of the constraints and explain your reasoning in 4-5 lines.
`;

const buildRefinePrompt = (idea) => `
  You are an elite hackathon mentor. I have a project idea:
  Title: ${idea.projectTitle}
  Problem: ${idea.problemStatement}
  Current Features: ${idea.coreFeatures.join(', ')}

  Add 2-3 highly specific, innovative, and game-changing core features.
  Ensure they align with the problem statement.
  Return ONLY a JSON array of strings.
`;

app.get('/api/health', (_req, res) => {
  res.status(200).json({success: true, message: 'Server is running'});
});

app.post('/api/generate-ideas', aiLimiter, async (req, res, next) => {
  try {
    const {data, fieldErrors} = validateUserInputs(req.body);

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed.',
        fieldErrors,
      });
    }

    if (!aiClient) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API is not configured on the server.',
      });
    }

    const response = await aiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{parts: [{text: buildIdeasPrompt(data)}]}],
      config: {
        responseMimeType: 'application/json',
        responseSchema: IDEA_SCHEMA,
      },
    });

    const parsed = parseJsonText(response.text);
    if (!parsed) {
      return res.status(502).json({
        success: false,
        error: 'AI returned an invalid response format.',
      });
    }

    return res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/refine-features', aiLimiter, async (req, res, next) => {
  try {
    const {data, fieldErrors} = validateIdeaPayload(req.body);

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed.',
        fieldErrors,
      });
    }

    if (!aiClient) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API is not configured on the server.',
      });
    }

    const response = await aiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{parts: [{text: buildRefinePrompt(data)}]}],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {type: Type.STRING},
        },
      },
    });

    const parsed = parseJsonText(response.text);
    if (!Array.isArray(parsed)) {
      return res.status(502).json({
        success: false,
        error: 'AI returned an invalid feature list.',
      });
    }

    return res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    return next(error);
  }
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
  if (req.path.startsWith('/api')) {
    return next();
  }

  const extension = path.extname(req.path).toLowerCase();

  // Let static middleware handle non-HTML assets (.js, .css, images, etc.).
  if (extension && extension !== '.html') {
    return next();
  }

  // Keep standalone static pages working when they exist in the project root.
  if (extension === '.html') {
    const requestedHtmlPath = path.join(__dirname, req.path.replace(/^\/+/, ''));
    if (fs.existsSync(requestedHtmlPath)) {
      return res.sendFile(requestedHtmlPath);
    }
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

const MAX_PORT_RETRIES = 10;

const startServer = (port, retries = 0) => {
  const server = app.listen(port, () => {
    const retryNote =
      port === PORT
        ? ''
        : ` (fallback from requested port ${PORT}; update VITE_API_PROXY_TARGET if needed)`;
    console.log(`Server listening on http://localhost:${port}${retryNote}`);
  });

  server.on('error', (error) => {
    if (error?.code === 'EADDRINUSE' && retries < MAX_PORT_RETRIES) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is already in use. Trying port ${nextPort}...`);
      startServer(nextPort, retries + 1);
      return;
    }

    if (error?.code === 'EADDRINUSE') {
      console.error(
        `Unable to start server. Ports ${PORT}-${port} are in use. Set PORT in .env to an available value.`,
      );
    } else {
      console.error('Server failed to start:', error);
    }

    process.exit(1);
  });
};

startServer(PORT);
