# AI Placement Predictor & Skill Gap Analyzer
### *Full-Stack AI Career Intelligence & Placement Readiness SaaS Platform*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Motor_Async-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-Compose_Ready-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Executive Overview

**PlacementIQ (AI Placement Predictor & Skill Gap Analyzer)** is an enterprise-grade AI career intelligence platform engineered for college students and academic institutions. Rather than relying on simple heuristics, the platform combines machine learning classification, natural language processing (NLP), semantic similarity scoring, and explainable AI (SHAP) to:

1. **Evaluate Placement Likelihood**: Multi-feature ML models trained on academics, coding scores, project breadth, and internships.
2. **Parse & Audit Resumes**: Section extraction, skill mining, and an objective application-generated ATS readiness score (without vendor misrepresentation).
3. **Analyze Role-Specific Skill Gaps**: Interactive comparison against 10+ standard tech roles (Data Analyst, ML Engineer, Backend Developer, etc.).
4. **Generate Personalized 8-Week Roadmaps**: Dynamic learning paths with milestones and progress tracking.
5. **Match Jobs Semantically**: Sentence-BERT embedding similarity to discover opportunities aligned with student skillsets.

---

## 🏗️ System Architecture

```
                       ┌──────────────────────────────────────────────┐
                       │          React + TypeScript Frontend         │
                       │           (Vite + Tailwind CSS v4)           │
                       └──────────────────────┬───────────────────────┘
                                              │ HTTP / JSON (REST)
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │           FastAPI Backend Gateway            │
                       │             (Pydantic v2 Core)               │
                       └──────┬───────────────┬────────────────┬──────┘
                              │               │                │
                              ▼               ▼                ▼
                     ┌────────────────┐ ┌───────────┐ ┌────────────────┐
                     │ Async Motor DB │ │ ML Engine │ │   NLP Engine   │
                     │   (MongoDB)    │ │(RF/XGBoost│ │ (spaCy/S-BERT) │
                     └────────────────┘ └───────────┘ └────────────────┘
```

---

## 📂 Project Directory Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── auth/             # Authentication & JWT security
│   │   ├── job_matching/     # Semantic job matching logic
│   │   ├── models/           # Data models (Database ODM)
│   │   ├── prediction/       # ML inference & XAI explanations
│   │   ├── resume/           # Resume extraction & parsing
│   │   ├── roadmap/          # Dynamic 8-week learning paths
│   │   ├── routes/           # FastAPI router controllers
│   │   │   └── health.py     # System telemetry & health check
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Core business logic services
│   │   ├── skill_gap/        # Skill gap analysis & taxonomy
│   │   ├── utils/            # Helper utilities
│   │   ├── config.py         # Pydantic BaseSettings configuration
│   │   ├── database.py       # Async Motor MongoDB connection manager
│   │   └── main.py           # Application entry point & middleware
│   ├── tests/                # Pytest automated test suites
│   ├── Dockerfile            # Production Python container
│   └── requirements.txt      # Backend Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── charts/           # Recharts visual analytics
│   │   ├── components/       # Reusable UI components
│   │   │   ├── FeatureGrid.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── PhaseTracker.tsx
│   │   │   └── SystemHealthBanner.tsx
│   │   ├── context/          # React Context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── layouts/          # Page layouts
│   │   ├── pages/            # View pages
│   │   ├── services/         # Axios API clients
│   │   ├── types/            # TypeScript interfaces
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx           # Main application entry
│   │   ├── index.css         # Tailwind CSS styling
│   │   └── main.tsx          # React DOM root
│   ├── Dockerfile            # Multi-stage production Nginx container
│   ├── nginx.conf            # Nginx reverse proxy configuration
│   ├── package.json          # Node dependencies & scripts
│   └── vite.config.ts        # Vite configuration & API proxy
│
├── ml/                       # Machine learning pipeline
│   ├── data/                 # Raw and processed datasets
│   ├── evaluation/           # Evaluation metrics & charts
│   ├── inference/            # Prediction wrappers
│   ├── models/               # Saved model artifacts (.joblib)
│   ├── notebooks/            # Jupyter exploration notebooks
│   ├── preprocessing/        # Feature transformers
│   └── training/             # Training scripts
│
├── docs/                     # Architectural documentation
├── scripts/                  # Seed scripts & operational tools
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore policies
├── docker-compose.yml        # Multi-container orchestration
└── README.md                 # Setup & documentation
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Python**: `3.10` to `3.14`
- **MongoDB**: Local MongoDB instance or Docker
- **Docker & Docker Compose** (Optional for containerized run)

---

### Option A: Running with Docker Compose (Recommended)

To start MongoDB, FastAPI backend, and React frontend in a single command:

```bash
# 1. Clone repository and navigate to root
cd "ai placement"

# 2. Copy environment template
cp .env.example .env

# 3. Build and launch all containers
docker compose up --build
```

Access the services:
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

### Option B: Running Locally (Development Mode)

#### 1. Backend Setup

```bash
# Navigate to project root
cd "ai placement"

# Create and activate Python virtual environment
python3 -m venv backend/.venv
source backend/.venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Copy environment variables
cp .env.example .env

# Run FastAPI backend with hot-reload
PYTHONPATH=. uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Setup

```bash
# In a new terminal window, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend will run on `http://127.0.0.1:5173` with automatic proxying of `/api` requests to `http://127.0.0.1:8000`.

---

## 🧪 Testing & Quality Assurance

### 1. Backend Unit Tests
Execute the automated test suite using `pytest`:

```bash
PYTHONPATH=. backend/.venv/bin/pytest -v backend/tests/test_health.py
```

Expected output:
```text
backend/tests/test_health.py::test_root_endpoint PASSED    [ 33%]
backend/tests/test_health.py::test_ping_endpoint PASSED    [ 66%]
backend/tests/test_health.py::test_health_endpoint PASSED  [100%]
```

### 2. Frontend TypeScript & Production Build Check
Verify compilation and strict TypeScript types:

```bash
cd frontend
npm run build
```

---

## 📡 API Reference (Phase 1 Baseline)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Service metadata, version, and documentation index |
| `GET` | `/api/ping` | Lightweight ping check returning status and timestamp |
| `GET` | `/api/health` | Deep health probe verifying DB connectivity, version, and module readiness |
| `GET` | `/docs` | OpenAPI Swagger interactive documentation interface |
| `GET` | `/redoc` | OpenAPI ReDoc comprehensive documentation |

---

## 🔒 Configuration & Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PROJECT_NAME` | `"AI Placement Predictor & Skill Gap Analyzer"` | Application title |
| `APP_ENV` | `development` | Environment mode (`development` / `production`) |
| `DEBUG` | `True` | Debug mode toggle |
| `SERVER_HOST` | `0.0.0.0` | API bind address |
| `SERVER_PORT` | `8000` | API port |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Whitelisted frontend origins |
| `MONGODB_URL` | `mongodb://localhost:27017` | MongoDB connection URI |
| `MONGODB_DB_NAME` | `placement_predictor_db` | Target MongoDB database name |
| `JWT_SECRET_KEY` | *(secret key)* | Cryptographic key for JWT tokens |
| `MAX_UPLOAD_SIZE_MB` | `10` | Maximum resume file size limit in MB |

---

## 📅 Phased Implementation Roadmap

- [x] **Phase 1: Project Architecture & Foundation** *(Complete)*
- [x] **Phase 2: Database Schemas & Authentication** *(Complete)*
- [x] **Phase 3: Student Profile Management** *(Complete)*
- [x] **Phase 4: Dataset Pipeline & ML Model Training** *(Complete)*
- [x] **Phase 5: Placement Prediction API & Explainable AI (SHAP)** *(Complete)*
- [x] **Phase 6: Resume Parser & NLP Pipeline (PyMuPDF + spaCy)** *(Complete)*
- [x] **Phase 7: Skill Gap Analysis Engine** *(Complete)*
- [x] **Phase 8: Semantic Job Matching Engine (Sentence-BERT)** *(Complete)*
- [x] **Phase 9: Personalized 8-Week Learning Roadmap** *(Complete)*
- [x] **Phase 10: Main Student & Analytics Dashboard** *(Complete)*
- [x] **Phase 11: Admin Control Panel** *(Complete)*
- [x] **Phase 12: Comprehensive E2E Testing & Hardening** *(Complete)*
- [x] **Phase 13: Docker Orchestration Verification** *(Complete)*
- [x] **Phase 14: Final Academic Project Report & Documentation** *(Complete)*
- [x] **Phase 15: AI Mock Interview Simulator & Speech Assessment** *(Complete)*

---

## 📄 License & Copyright

Copyright © 2026 Suzal Naudiyal. All rights reserved.

Licensed under the [MIT License](LICENSE).
