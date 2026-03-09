---
title: PiperSmart Backend
emoji: 🚀
colorFrom: green
colorTo: blue
sdk: docker
app_port: 4001
---

## PiperSmart Backend (Docker Space)

This Space runs the PiperSmart backend API.

### Health Check

`/api/v1/health`

### Required Secrets (Space Settings → Secrets)

Set these environment variables in the Space:

- `DB_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `COOKIE_EXPIRES_TIME`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`
- `GMAIL_HOST`
- `GMAIL_PORT`
- `GMAIL_USER`
- `GMAIL_PASS`
- `GMAIL_FROM_EMAIL`
- `GMAIL_FROM_NAME`
- `RESEND_API_KEY`
- `EMAIL_FROM`

Optional:
- `NODE_ENV` (set to `production`)
- `PORT` (defaults to `4001`)
- `EMAIL_REPLY_TO`
- `RESEND_FROM_EMAIL`
