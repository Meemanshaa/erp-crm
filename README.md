# Mini ERP + CRM Operations Portal

## Project Description

Mini ERP + CRM Operations Portal is a full-stack web application designed for wholesale and distribution businesses to manage their daily operations from a single platform.

The system provides modules for **Customer Management, Product & Inventory Management, and Sales Challan Management**. It includes JWT-based authentication and Role-Based Access Control (RBAC) for Admin, Sales, Warehouse, and Accounts users.

The inventory system maintains stock movement history and uses database transactions during stock adjustments and challan confirmation to prevent negative or inconsistent inventory.

### Key Features

- Customer management and CRM
- Customer follow-up notes
- Product and inventory management
- Stock IN/OUT adjustments
- Stock movement history
- Sales challan creation
- Draft and Confirmed challan workflow
- Automatic stock deduction after challan confirmation
- Negative stock protection
- JWT authentication
- Role-Based Access Control (RBAC)
- REST API using Express.js
- MySQL database with Prisma ORM

---

## Project Setup

### Prerequisites

- Node.js v18+
- npm
- MySQL
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd erp-crm
```

### 2. Database Setup
Create the MySQL database:

```bash
CREATE DATABASE erp_crm;
```

### 3. Backend Setup

```bash
cd backend
npm install
```
Generate Prisma Client and run the database migration-

```bash
npx prisma generate
npx prisma migrate dev
```

Seed the database-

```bash
npm run seed
```

Start the backend-

```bash
npm run dev
```

### 4. Frontend Setup

Open a new terminal-

```bash
cd frontend
npm install
```

Start the frontend-

```bash
npm run dev
```

### 5. Test Accounts
| Role      | Email                | Password    |
| --------- | -------------------- | ----------- |
| Admin     | `admin@erp.test`     | `Admin@123` |
| Sales     | `sales@erp.test`     | `Admin@123` |
| Warehouse | `warehouse@erp.test` | `Admin@123` |
| Accounts  | `accounts@erp.test`  | `Admin@123` |

### 6. Architecture Summary

Built with Express.js, TypeScript, React, Vite, Tailwind CSS, and MySQL using Prisma ORM. Role-Based Access Control (RBAC) is enforced across backend routes using JWT authentication. Core business logic wraps sales challan confirmation inside prisma.$transaction—checking stock availability before committing deductions to strictly prevent negative stock under concurrent requests. Historical product data (Name, SKU, Price) is snapshotted directly on line items at the time of sale.
