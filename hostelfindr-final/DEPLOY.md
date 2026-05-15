# HostelFindr — Deployment Guide

## Overview

```
React (Vercel) ──► Django (Render) ──► MongoDB Atlas
                        │
                        └──► Cloudinary (images)
```

---

## Step 1 — MongoDB Atlas (database)

1. Go to https://cloud.mongodb.com and create a free account
2. Create a new project → Build a Cluster → choose **M0 Free**
3. Set a database username and password (save these)
4. Under **Network Access** → Add IP Address → `0.0.0.0/0` (allow all — Render uses dynamic IPs)
5. Under **Database** → Connect → **Drivers** → copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/hostelfindr
   ```
   Replace `<user>` and `<password>` with your values.

---

## Step 2 — Cloudinary (image storage)

1. Go to https://cloudinary.com and create a free account
2. From your **Dashboard**, copy:
   - Cloud name
   - API Key
   - API Secret
3. Keep these — you'll paste them into Render environment variables next.

---

## Step 3 — Render (Django backend)

1. Push your backend code to a GitHub repository
2. Go to https://render.com → **New Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Runtime**: Python 3
   - **Build Command**: `bash build.sh`
   - **Start Command**: `gunicorn hostelfindr.wsgi:application --bind 0.0.0.0:$PORT --workers 2`

5. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | (click Generate — Render creates a secure one) |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `your-app-name.onrender.com` |
   | `MONGO_URI` | your Atlas connection string from Step 1 |
   | `CLOUDINARY_CLOUD_NAME` | from Step 2 |
   | `CLOUDINARY_API_KEY` | from Step 2 |
   | `CLOUDINARY_API_SECRET` | from Step 2 |
   | `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` (fill in after Step 4) |
   | `ACCESS_TOKEN_LIFETIME` | `900` |
   | `REFRESH_TOKEN_LIFETIME` | `604800` |

6. Click **Create Web Service** — Render will build and deploy
7. Copy your Render URL: `https://your-app-name.onrender.com`

> ⚠️ Free Render services spin down after 15 min of inactivity.
> The first request after sleep takes ~30s. Upgrade to Starter ($7/mo) to avoid this.

---

## Step 4 — Vercel (React frontend)

1. Push your frontend code to a GitHub repo
2. Go to https://vercel.com → **New Project** → Import your repo
3. Framework preset: **Create React App**
4. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://your-app-name.onrender.com/api` |

5. Click **Deploy**
6. Copy your Vercel URL: `https://your-app.vercel.app`

---

## Step 5 — Connect frontend ↔ backend

1. Go back to **Render → your service → Environment**
2. Update `CORS_ALLOWED_ORIGINS` to your actual Vercel URL:
   ```
   https://your-app.vercel.app
   ```
3. Render will auto-redeploy with the new setting

---

## Step 6 — Create your first admin user

Render doesn't give you a Django shell directly on free tier,
so use the **Shell** tab on your Render service dashboard:

```bash
python manage.py shell
```

```python
from accounts.models import User
User.objects.create_user(
    username="admin",
    email="admin@hostelfindr.gh",
    password="choose-a-strong-password",
    role="admin"
)
```

---

## Local development (both running together)

```bash
# Terminal 1 — Django
cd hostelfindr-backend
source venv/bin/activate
python manage.py runserver        # runs on :8000

# Terminal 2 — React
cd hostelfindr-frontend
npm start                         # runs on :3000, proxies API to :8000
```

The `"proxy": "http://localhost:8000"` in `package.json` means
all `/api/...` calls from React automatically forward to Django in dev.

---

## Environment summary

| Service | Free tier | Production-ready? |
|---------|-----------|-------------------|
| MongoDB Atlas M0 | 512 MB storage | Yes for small apps |
| Cloudinary | 25 credits/mo (~25k transforms) | Yes for small apps |
| Render Web Service | Spins down after 15 min | Upgrade to Starter for prod |
| Vercel Hobby | Unlimited deploys | Yes |

---

## Checklist before going live

- [ ] `DEBUG=False` on Render
- [ ] `SECRET_KEY` is long, random, and not shared
- [ ] `ALLOWED_HOSTS` contains your Render domain
- [ ] `CORS_ALLOWED_ORIGINS` contains your Vercel domain only
- [ ] MongoDB Atlas IP whitelist set (0.0.0.0/0 or Render static IPs)
- [ ] Admin user created via shell
- [ ] Test login for all 3 roles end-to-end
- [ ] Test image upload on a hostel listing
- [ ] Test approve/reject flow as admin
