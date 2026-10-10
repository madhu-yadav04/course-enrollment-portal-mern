# Course Enrollment Portal — MERN Stack

College-project starter using MongoDB, Express, React, and Node.js.

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas URI

## Run the backend
```bash
cd server
cp .env.example .env
# Set MONGODB_URI and a long random JWT_SECRET in .env
npm install
npm run dev
```

## Run the frontend (second terminal)
```bash
cd client
npm install
npm run dev
```
Open the Vite URL shown in the terminal.

## Included
- React + Vite responsive UI
- Express REST API
- Mongoose User, Course, and Enrollment models
- JWT authentication and role middleware
- Password hashing
- Course browsing/search
- Enrollment requests, duplicate-enrollment prevention, cancellation, and admin approval/rejection
- Admin course creation endpoint

## Important notes
This is an educational starter, not production-ready. Public registration always creates a student account. For local admin testing, update a user's `role` to `admin` directly in MongoDB. Do not expose admin self-registration. For production, add schema validation, rate limiting, tests, secure token storage, and transactional/atomic capacity control for concurrent approvals. Never commit `.env`.
