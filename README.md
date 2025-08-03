# 💸 SokoCredit – Microfinance Loan Management System

SokoCredit is a full-stack microfinance management platform built to empower small-scale traders and lenders. It features robust loan processing, customer onboarding, real-time notifications, repayment tracking, analytics, and more.

---

## 🚀 Tech Stack

### 🧠 Backend – Python (Flask)
- Flask + Flask-JWT-Extended (Auth)
- SQLAlchemy (ORM)
- PostgreSQL (DB)
- SocketIO (Real-time notifications)
- Africa's Talking (SMS)
- Pytest (Testing)

### 🌐 Frontend – React
- React + Redux Toolkit
- Axios (API requests)
- React Router
- TailwindCSS (UI styling)
- Vite (Build tool)

---

## 🏗️ Project Structure

```bash
.
├── backend/                # Flask backend
│   ├── app/                # Core app logic
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routes/         # All API blueprints
│   │   ├── sockets/        # WebSocket logic
│   ├── config/             # Config files
│   ├── scripts/            # Data scripts
│   ├── tests/              # Pytest tests + Postman
│   └── utils/              # Helpers (SMS, decorators, logic)
├── frontend/               # React frontend
│   ├── src/                # Components, store, services, styles
│   └── public/             # Static files
└── README.md
```

---

## ⚙️ Setup Instructions

### 🐍 Backend (Flask API)

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create DB + seed data
python seed.py

# Run server
python run.py
```

> ℹ️ Default port: `http://localhost:5000`

### ⚛️ Frontend (React)

```bash
cd frontend

# Install frontend deps
npm install

# Start dev server
npm run dev
```

> ℹ️ Default port: `http://localhost:5173`

---

## 🛡️ Authentication Flow

- JWT-based login/registration
- Role-based route protection (`admin`, `lender`, `customer`)
- Refresh tokens supported
- Password reset + email/phone OTP verification

---

## 📊 Key Features

✅ Customer onboarding (with document uploads)  
✅ Loan application, approval, rejection, disbursement  
✅ Repayment scheduling + tracking  
✅ Real-time in-app + SMS notifications  
✅ Analytics dashboard (performance, risk, growth)  
✅ Role-based API protection  
✅ SocketIO support for live updates

---

## 📬 Notifications

- In-app (via WebSockets)
- SMS (via Africa’s Talking)
- Auto-alerts: repayments, approvals, rejections, overdue notices

---

## 🧪 Testing

```bash
# Run Pytest unit tests
cd backend
pytest tests/
```

Also includes a Postman collection:
- `tests/sokocredit_customer_api.postman_collection.json`

---

## 📌 Environment Variables

Set these in a `.env` or export manually:

```bash
AFRICASTALKING_USERNAME=your_username # login and retrieve from Africa's Talking 
AFRICASTALKING_API_KEY=your_api_key # login and retrieve from Africa's Talking 
DATABASE_URL=postgresql://postgres:password@localhost/sokocredit_db
JWT_SECRET_KEY=supersecret
```

---

## 📎 Docs & API Reference

- API docs: `endpoints.md`
- Postman collection: `tests/sokocredit_customer_api.postman_collection.json`
- Route map: WIP (to be auto-generated from Flask)

---

## 👥 Contributors

- **Agnes Wanjiru** – Scrum Master
- **Kane Kabena** – Back-end Developer / Project Tracker
- **Ali Abdi** – Front-end Developer
- **Denis Maiyo** – Front-end Developer
