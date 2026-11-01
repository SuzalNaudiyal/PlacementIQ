#!/usr/bin/env bash

# ==============================================================================
# AI Placement Predictor & Skill Gap Analyzer - Launcher Script
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================================="
echo " Starting AI Placement Predictor & Skill Gap Analyzer"
echo "=========================================================="

# 1. Activate Python virtual environment and start Backend
echo "[1/2] Launching FastAPI Backend on http://127.0.0.1:8000..."
source backend/.venv/bin/activate
export PYTHONPATH="$PROJECT_ROOT"

# Kill existing uvicorn on port 8000 if running
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# 2. Start Frontend
echo "[2/2] Launching React Vite Frontend on http://127.0.0.1:5173..."
cd "$PROJECT_ROOT/frontend"

# Kill existing vite on port 5173 if running
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

npm run dev -- --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

trap "echo 'Shutting down services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0" INT TERM

echo ""
echo "=========================================================="
echo " Project is running successfully!"
echo " 👉 Web Application:  http://127.0.0.1:5173"
echo " 👉 Swagger API Docs: http://127.0.0.1:8000/docs"
echo " 👉 Health Telemetry: http://127.0.0.1:8000/api/health"
echo "=========================================================="
echo " Press Ctrl+C to stop both servers."
echo ""

wait
