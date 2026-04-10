# V-Interview: AI-Powered Mock Interviews

V-Interview is a full-stack web application designed to help job seekers prepare for interviews using AI-driven question generation and automated performance evaluation. Users can simulate specialized interviews, receive real-time feedback, and track their progress over time.

### Why This Project?
This project is an excellent learning resource for developers interested in:
- **Full-Stack Development**: Integrating a **Next.js 15+** frontend with a **Django REST Framework** backend.
- **AI Integration**: Using **Google Gemini AI** to generate context-aware interview questions and provide detailed feedback.
- **Deployment & DevOps**: Hands-on experience with production deployments on **Render** (Backend/DB) and **Netlify** (Frontend).

---

## Branch Structure

- **`main`**: The "Production" branch. Use this for stable deployment to Render and Netlify.
- **`dev`**: The "Development" branch. Use this for local coding, testing new features, and debugging before merging to `main`.

---

## Deployment Guide

### Phase 1: Deploy Backend & Database (Render.com)

Render offers a Free Tier, but note that **PostgreSQL may require a credit card for verification** (you won't be charged on the free plan).

#### Step 1: Create a Render Account
Sign up at [render.com](https://render.com) using your GitHub account.

#### Step 2: Create the PostgreSQL Database
1. From the Render Dashboard, click **New +** → **PostgreSQL**.
2. **Name**: `v-interview-db`
3. **Plan**: Free
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL** (needed for the next step).

#### Step 3: Create the Web Service
1. Click **New +** → **Web Service**.
2. Connect this GitHub repository.
3. Configure the following:
   - **Name**: `v-interview-backend`
   - **Root Directory**: `V-Interview-Backend`
   - **Environment**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn vinterview_backend.wsgi.application --bind 0.0.0.0:$PORT`
   - **Instance Type**: Free

#### Step 4: Environment Variables
In your Render Web Service settings, go to the **Environment** tab and add:

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | *Paste Internal Database URL from Step 2* |
| `SECRET_KEY` | *Your unique Django secret key* |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `v-interview-backend.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend-link.netlify.app` |
| `GEMINI_API_KEY` | *Your Google Gemini API Key* |

Click **Save Changes** and wait for the service to deploy.

#### Step 5: Verify
Once live, visit:
- API Status: `https://v-interview-backend.onrender.com/api/`
- Documentation: `https://v-interview-backend.onrender.com/api/docs/`

---

### Phase 2: Deploy Frontend (Netlify)

Netlify is free and does not require a credit card for standard deployments.

#### Step 1: Import Project
1. Log in to [Netlify](https://www.netlify.com/) and click **Add New Site** → **Import an existing project**.
2. Connect your GitHub repository.

#### Step 2: Configure Build Settings
During the setup screen, ensure these fields are correct:
- **Base directory**: `V-Interview-Frontend`
- **Build command**: `npm run build`
- **Publish directory**: `V-Interview-Frontend/.next`

#### Step 3: Set Environment Variables
Scroll down to **Environment variables** and add:

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://v-interview-backend.onrender.com/api` |

> [!IMPORTANT]
> Ensure the URL ends with **`/api`**. Without this, the frontend will encounter 404 errors when trying to reach the backend.

#### Step 4: Deploy
Click **Deploy Site**. Once finished, Netlify will provide you with a `.netlify.app` URL.

---

## Local Development

1. **Clone the repo**: `git clone <repo-url>`
2. **Backend**:
   - `cd V-Interview-Backend`
   - Create a `.env` file with your local settings.
   - `pip install -r requirements.txt`
   - `python manage.py migrate`
   - `python manage.py runserver`
3. **Frontend**:
   - `cd V-Interview-Frontend`
   - Create a `.env.local` pointing to `http://localhost:8000/api`.
   - `npm install`
   - `npm run dev`
