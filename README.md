AutoDrop — Vehicle Delivery Management Platform

Web platform for managing vehicle delivery workflows, connecting Clients, Deliverers and Administrators in a transparent and documented process.

Features

Role-based authentication (Client, Deliverer, Admin) with JWT & bcrypt
Client catalog with real-time availability status and delivery request flow
Admin dashboard with KPI tracking, request approval, deliverer assignment and cost management
Automated email notifications via Nodemailer on every status change
Deliverer interface with Google Maps integration, photo upload at pickup & delivery and damage reporting
Google Gemini AI integration for natural-language business reports on platform activity
Responsive design for mobile and desktop

How to Run

Clone the repository
Install server dependencies: cd server && npm install
Install client dependencies: cd client && npm install
Configure server/.env with your database credentials, JWT secret, email and Gemini API key
Start the backend: cd server && npm run dev
Start the frontend: cd client && npm run dev
Open http://localhost:5173

Tech Stack

React · Vite · Node.js · Express · MySQL · JWT · Multer · Nodemailer · Google Gemini AI
