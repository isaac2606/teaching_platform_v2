<div align="center">
  <h1>🎓 Praxis</h1>
  <p><strong>A modern, real-time educational platform bridging the gap between Learning Management Systems and tutoring marketplaces.</strong></p>
  
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
  ![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
  ![Socket.io](https://img.shields.io/badge/Socket.io-ffffff?style=for-the-badge&logo=socket.io&logoColor=black)
  ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
</div>

---

## 🌟 Overview

Praxis is a full-stack educational platform designed to empower teachers and students with dedicated "Hubs". It features strict role-based access control, real-time communication, and secure authentication to create a safe, seamless remote learning environment.

## ✨ Key Features

- **🔐 Enterprise-Grade Security:**
  - JWT Authentication using highly secure **HttpOnly cookies** (XSS protection).
  - Silent token refresh flow with cryptographically hashed refresh tokens in the database.
  - Granular **Role-Based Access Control (RBAC)** middleware preventing IDOR vulnerabilities.
  
- **💬 Real-Time Collaboration:**
  - Live messaging across public hub channels and private direct messages via **Socket.io**.
  - Secure server-side room joins preventing socket impersonation.
  - Live user presence (Online/Offline status) tracked via **Redis**.

- **📚 Educational Hubs:**
  - Create and manage Hubs (classrooms) as an Owner/Teacher.
  - Manage classes, assignments, and announcements.
  - Roster management for Students and Co-Teachers.

- **⚡ Blazing Fast UX:**
  - Advanced client-side state and caching using **TanStack Query**.
  - Global UI state managed flawlessly via **Zustand**.
  - Type-safe form validation using **React Hook Form + Zod**.

---

## 🛠️ Tech Stack

### Frontend
* **React 18** (Vite)
* **TypeScript**
* **Tailwind CSS**
* **TanStack Query v5** (Data fetching & caching)
* **Zustand** (Global state management)
* **React Router v6**
* **React Hook Form + Zod**

### Backend
* **Node.js + Express**
* **TypeScript**
* **Socket.io** (WebSockets)
* **MongoDB & Mongoose** (Database & ODM)
* **Upstash Redis** (Caching & Presence)
* **Bcrypt & JWT** (Cryptography & Auth)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and MongoDB installed on your machine. You will also need an Upstash Redis database.

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/praxis.git
cd praxis
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```
Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```
Start the Vite development server:
```bash
npm run dev
```

---
<p align="center">
  <i>Built with ❤️ for better education.</i>
</p>
