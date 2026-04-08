# Webhook Delivery Guarantee System 🚀

**Mini Project 2 (Team Project)**

A production-grade, reliable Webhook Delivery System built with **Node.js (Express)**, **MongoDB**, and **React (Vite/Tailwind)**. This system ensures that every webhook is delivered, or retried multiple times with exponential backoff until it succeeds.

---

## 🛠️ Key Features

- **✅ Guaranteed Delivery**: Automatic background retries if the receiving server is down.
- **📈 Exponential Backoff**: Intelligent retry intervals (1m, 2m, 5m) to avoid overwhelming failing systems.
- **🛡️ Idempotency**: Prevents duplicate webhook delivery using unique idempotency keys.
- **📊 Real-time Dashboard**: Monitor success rates, failure counts, and delivery trends.
- **🏗️ Decoupled Architecture**: Standalone Worker process separate from the API server for better scalability.
- **🎨 Glassmorphism UI**: A premium, "Emerald Dark" themed dashboard for a sleek monitoring experience.

---

## 📂 Project Structure

```text
WebHookLast/
├── backend/            # Express API & Background Worker
│   ├── config/         # MongoDB Connection
│   ├── controllers/    # API Business Logic (Webhook CRUD)
│   ├── models/         # Mongoose Webhook Schema
│   ├── routes/         # API Route Handlers
│   ├── workers/        # Delivery Logic & Backoff Scheduler
│   ├── server.js       # Main API Entry Point
│   └── worker-entry.js # Standalone Worker Entry Point
└── frontend/           # React + Vite + Tailwind CSS
    └── src/
        ├── components/ # Reusable UI Components
        ├── pages/      # Dashboard, Logs, & List pages
        └── services/   # Axios API Client
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v16.x or higher)
- **MongoDB** (Local or Atlas)

### 2. Installation
Install dependencies for both Backend and Frontend:

```bash
# In Root Directory
cd backend
npm install

# In Root Directory
cd frontend
npm install
```

### 3. Environment Setup
Create a `.env` file in the **backend** folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/webhook_delivery_system
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in the **frontend** folder:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## ⚡ Running the System

You will need **3 separate terminals** to run the full ecosystem:

### **Terminal 1: The API Server**
Handles incoming webhook creation and dashboard data requests.
```bash
cd backend
npm run dev:api
```

### **Terminal 2: The Delivery Worker**
Processes webhooks and handles retries in the background.
```bash
cd backend
npm run dev:worker
```

### **Terminal 3: The Frontend Dashboard**
The monitoring interface.
```bash
cd frontend
npm run dev
```

---

## 📡 API Endpoints

- `GET  /api/webhooks` - Fetch all webhooks & stats.
- `GET  /api/webhooks/:id` - Fetch details of a specific webhook.
- `POST /api/webhooks` - Create a new webhook (requires `url`, `payload`, and `idempotencyKey`).

---

## 📜 License
This project is for development and educational purposes. Feel free to use and extend!
