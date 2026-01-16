# Setup Guide

## Quick Start

### 1. Backend Service
The backend service provides the API and connects to the database.

```bash
cd backend
npm install
npm run dev
```
> **Note**: The backend runs on Port `4000` by default.

### 2. Frontend Application
The frontend application provides the user interface.

```bash
cd frontend
npm install
npm run dev
```
> **Note**: The frontend runs on Port `3000`.

## Configuration
There is no additional configuration required if you are using the defaults.

- **Backend Port**: 4000
- **Frontend Port**: 3000
- **API URL**: Frontend is configured in `.env.local` to point to `http://localhost:4000/api`.

## Verification
1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. You should see the login/dashboard.
