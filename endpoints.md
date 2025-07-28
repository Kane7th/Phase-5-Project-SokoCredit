# 🚀 **SokoCredit API Overview**

This doc outlines all available backend endpoints grouped by feature area. All routes are authenticated via JWT unless otherwise stated.

---

## 🔐 **Auth Routes** (`/auth`)

Handles login, registration, refresh, password reset, and verification.

| Method | Endpoint                | Description                      |
| ------ | ----------------------- | -------------------------------- |
| POST   | `/auth/login`           | Login and get tokens             |
| POST   | `/auth/register`        | Register a user                  |
| GET    | `/auth/me`              | Get current user                 |
| POST   | `/auth/refresh-token`   | Get new access token             |
| POST   | `/auth/logout`          | Logout current session           |
| POST   | `/auth/logout-all`      | Logout all sessions              |
| POST   | `/auth/forgot-password` | Simulated password reset request |
| POST   | `/auth/reset-password`  | Reset password with token        |
| POST   | `/auth/verify-email`    | Simulated email verification     |
| POST   | `/auth/verify-phone`    | Simulated phone verification     |

---

## 👤 **User Routes** (`/api/users`)

User profile, password changes, and notifications.

| Method | Endpoint                     | Description                           |
| ------ | ---------------------------- | ------------------------------------- |
| PUT    | `/change-password`           | Change password                       |
| GET    | `/notifications/`            | Fetch notifications                   |
| PUT    | `/notifications/:id/read`    | Mark notification as read             |
| DELETE | `/notifications/:id`         | Delete a notification                 |
| POST   | `/notifications/create-test` | Create a test notification (dev only) |

---

## 👥 **Customer Routes** (`/customers`)

Full customer CRUD, filtering, export, document upload.

| Method | Endpoint               | Description                                |
| ------ | ---------------------- | ------------------------------------------ |
| POST   | `/`                    | Create a customer                          |
| GET    | `/`                    | List customers (admin/lender only)         |
| GET    | `/my_customers`        | Get my customers (admin/lender)            |
| GET    | `/:customer_id`        | Get a single customer                      |
| PATCH  | `/:customer_id`        | Update customer info                       |
| DELETE | `/:customer_id`        | Delete a customer (admin only)             |
| POST   | `/:customer_id/upload` | Upload document (file + doc\_type)         |
| GET    | `/openapi`             | Get static schema for `/customers` listing |

📅 **Query Params Supported (GET /customers):**

* `page`, `per_page`
* `search`, `created_by`, `business_name`, `location`
* `has_documents=true|false`
* `format=csv|excel`

---

## 💸 **Loan Routes** (`/loans`)

Loan application, approval, disbursement.

| Method | Endpoint              | Description                         |
| ------ | --------------------- | ----------------------------------- |
| GET    | `/`                   | Status check                        |
| POST   | \`\`                  | Apply for a loan (mama\_mboga only) |
| GET    | \`\`                  | View all loans (based on role)      |
| PATCH  | `/:id/approve`        | Approve a loan                      |
| PATCH  | `/:id/reject`         | Reject a loan (with reason)         |
| PATCH  | `/loans/:id/disburse` | Disburse a loan                     |

---

## 🏦 **Loan Product Routes** (`/loan-products`)

Manage loan packages (admin/lender).

| Method | Endpoint | Description           |
| ------ | -------- | --------------------- |
| GET    | \`\`     | Get all loan products |
| GET    | `/:id`   | Get single product    |
| POST   | \`\`     | Create loan product   |
| PATCH  | `/:id`   | Update loan product   |
| DELETE | `/:id`   | Delete loan product   |

---

## 💰 **Repayment Routes**

Track repayment history and post payments via webhook.

### 📅 Repayment Schedules (`/repayment-schedules`)

| Method | Endpoint | Description                               |
| ------ | -------- | ----------------------------------------- |
| GET    | \`\`     | Get upcoming schedules (mama\_mboga only) |

### 📄 Repayments (`/repayments`)

| Method | Endpoint         | Description                        |
| ------ | ---------------- | ---------------------------------- |
| GET    | \`\`             | Get all repayments (based on role) |
| POST   | `/mpesa-webhook` | Simulate M-Pesa payment            |

Payload for webhook:

```json
{
  "phone_number": "0712345678",
  "amount_paid": 2000,
  "mpesa_code": "MPESA123ABC"
}
```

---

## 🔔 **Real-Time Notifications**

### Socket.IO Setup

* **Namespace**: `/notifications`
* **Event**: `notification:<user_id>`

Frontend Example:

```js
socket.on(`notification:${userId}`, (data) => {
  console.log("📢 New notification:", data);
});
```

---

## 🔐 **JWT Identity Format**

JWTs store identity as:
`user_<id>:<role>` → e.g. `"user_12:mama_mboga"`

Use `split(":")` to extract both values in frontend or backend.
