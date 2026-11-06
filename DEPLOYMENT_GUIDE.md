# HireMatrix AI — Production Deployment & Cloud Orchestration Guide

This guide details how to launch and deploy HireMatrix AI in production using **Docker Compose**, **Render**, or **Railway**.

---

## 1. Quickstart via Docker Compose (Local & VPS)

HireMatrix AI provides a pre-configured multi-container stack (`mongo`, `backend`, `frontend`):

```bash
# Clone and enter the repository
git clone https://github.com/suzal777/ai_placement_predictor.git
cd ai_placement_predictor

# Spin up all services with health checks
docker compose up -d --build
```

### Verified Endpoints:
- **Frontend Web UI**: [http://localhost:5173](http://localhost:5173) (Served via Nginx)
- **FastAPI REST API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/ping](http://localhost:8000/api/ping)
- **MongoDB**: `mongodb://localhost:27017`

To view logs or stop:
```bash
docker compose logs -f backend
docker compose down
```

---

## 2. One-Click Cloud Deployment on Render

HireMatrix AI includes a native `render.yaml` Blueprint:

1. Push your repository to GitHub.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** ➔ **Blueprint**.
4. Connect this GitHub repository. Render automatically discovers `render.yaml` and deploys:
   - **`hirematrix-backend`**: FastAPI Python Web Service with health check `/api/ping`.
   - **`hirematrix-frontend`**: React Vite Static Site with SPA client-side routing rewrites.
5. Provide your MongoDB Atlas URI under `MONGODB_URL`.

---

## 3. One-Click Cloud Deployment on Railway

1. Install the Railway CLI or connect via GitHub on [railway.app](https://railway.app).
2. Provision a **MongoDB Database** plugin on your Railway project canvas.
3. Add a new service from your GitHub repo using `railway.json`.
4. Set environment variables:
   - `MONGODB_URL`: `${{MongoDB.MONGO_URL}}`
   - `JWT_SECRET_KEY`: `<your-random-production-key>`
   - `APP_ENV`: `production`

---

## 4. Key Platform Features

1. **AI Placement Predictor**: XGBoost + TreeSHAP explainable odds with positive and risk attribution.
2. **SVAR Spoken English & Voice AI**: Speech clarity, cadence, grammar, and lexical fluency scoring.
3. **Downloadable Official PDF Placement Dossier**: 1-Click A4 PDF report generation via PyMuPDF with candidate metrics and SHA-256 institutional verification token.
4. **Student Application Lifecycle Tracker**: 4-stage Kanban/Timeline (`Applied` ➔ `Shortlisted for Round 1` ➔ `Technical Interview` ➔ `Offer Extended`).
5. **Administrative Broadcast Dispatcher**: High-throughput automated candidate alerts via WhatsApp Cloud API & Institutional SMTP.
