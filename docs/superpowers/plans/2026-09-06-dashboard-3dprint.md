# Dashboard 3D Print Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-hosted 3D printing dashboard for cost calculation, inventory, and quotes.

**Architecture:** FastAPI backend + SQLite DB, React/Vite frontend, single Docker container.

**Tech Stack:** Python 3.11, FastAPI, SQLAlchemy, React 18, Vite, TypeScript, Docker, rclone.

**Spec:** `docs/superpowers/specs/2026-09-06-dashboard-3dprint-design.md`

## Global Constraints
- Currency: COP (integer pesos), Locale: es-CO, IVA: 19%
- Database: SQLite (local file)
- Deployment: Docker Compose for OMV
- Inventory: Derived stock (Production - Sales)

---

## Tasks

### Task 1: Scaffolding
- [ ] Create folder structure (`api/`, `web/`, `data/`, `backups/`)
- [ ] Create `docker-compose.yml` and `.env.example`
- [ ] Setup `api/Dockerfile` and `web/Dockerfile`
- [ ] Verify `docker compose build` passes

### Task 2: Backend Core (Models & Formulas)
- [ ] Setup SQLAlchemy models in `api/app/models.py`
- [ ] Implement `api/app/services/cost_engine.py` with verified formulas
- [ ] Write unit tests for cost engine
- [ ] Commit

### Task 3: API & CRUD
- [ ] Implement FastAPI routers for Printers, Materials, Products, Lots, and Sales
- [ ] Implement Quote logic
- [ ] Verify with manual/auto tests

### Task 4: Frontend Foundation
- [ ] Init Vite + React + Tailwind
- [ ] Create API service client (Axios/Fetch)
- [ ] Implement basic layout and navigation

### Task 5: Feature Implementation
- [ ] Calculator & Catalogs pages
- [ ] Inventory & Product management
- [ ] Quotes module
- [ ] Dashboard stats charts

### Task 6: Final Polish & Deployment
- [ ] Setup rclone backup script
- [ ] Final verification on OMV-like environment
- [ ] Documentation (README)
