#  Cinema Hub

 Cinema Hub is a full-stack movie ticket booking platform with separate frontend and backend applications. The project includes public movie browsing, authentication, hall and showtime management, booking and payment flows, admin and hall-admin dashboards, live chat, and Swagger API docs.

## Project Structure

```text
SYP/
  backend/     Express + Sequelize + MySQL API + Socket.IO
  frontend/    React + Vite client application
```

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS, MUI, React Router, Axios
- Backend: Node.js, Express 5, Sequelize, MySQL, Socket.IO, Swagger
- Auth: JWT + cookies/local storage token handling
- Media: Multer and Cloudinary support

## Features

- User registration and login
- Movie listing and detail pages
- Ticket booking and payment flow
- Hall application and hall-admin workflow
- Admin and hall-admin dashboards
- Seat and showtime management
- Live chat support
- Swagger-based API documentation

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- MySQL database

### 1. Install Dependencies

Run installs in both apps:

```bash
cd frontend
npm install
```

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env`:

```env
PORT=3000
DB_URL=mysql://root:password@localhost:3306/syp_cinema
JWT_SECRET=your_jwt_secret
seed_admin=admin@example.com
seed_admin_pass=admin_password

# Optional Cloudinary config if you use hosted uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create `frontend/.env` if you want local API overrides:

```env
VITE_API_SERVER_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3000/api
```

Note: the backend currently reads `DB_SYNC_FORCE` in a way that can trigger a force sync when set to `false`. Leave it unset unless you intentionally want to test that behavior.

### 3. Start the Apps

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`
- Swagger docs: `http://localhost:3000/api-docs`

## Available Scripts

### Frontend

- `npm run dev` starts the Vite dev server
- `npm run build` creates a production build
- `npm run lint` runs ESLint
- `npm run preview` previews the production build

### Backend

- `npm run dev` starts the backend with Nodemon

## Architecture Notes

- The frontend follows a feature-first structure under `frontend/src/features`.
- Shared UI, hooks, config, and layout code live under `frontend/src/shared`.
- The backend is organized around `routes`, `controllers`, `model`, `middlewares`, and `sockets`.
- Static uploads are served from `backend/uploads`.

## Additional Documentation

- Frontend structure guide: [frontend/README.md](/d:/SYP/frontend/README.md)
- API overview: [backend/API.md](/d:/SYP/backend/API.md)
- API docs app: [backend/apiDocs/README.md](/d:/SYP/backend/apiDocs/README.md)

## Current Deployment References

- Frontend code includes a hosted API fallback: `https://cinemahub-backend.onrender.com`
- Backend CORS currently allows:
  - `http://localhost:5173`
  - `https://cinemahub-frontend.vercel.app`

## Status

This README is intended as the overall project starting point. As the project grows, this file should stay focused on setup, architecture, and where to find deeper docs.
