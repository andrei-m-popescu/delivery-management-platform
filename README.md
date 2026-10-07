# AutoDrop — Vehicle Delivery Management Platform

Web platform for managing vehicle delivery workflows, connecting Clients, Deliverers and Administrators in a transparent and documented process.

## Features

* Role-based authentication (Client, Deliverer, Admin) with JWT & bcrypt
* Client catalog with real-time availability status and delivery request flow
* Admin dashboard with KPI tracking, request approval, deliverer assignment and cost management
* Automated email notifications via Nodemailer on every status change
* Deliverer interface with Google Maps integration, photo upload at pickup & delivery and damage reporting
* Google Gemini AI integration for natural-language business reports on platform activity
* Responsive design for mobile and desktop

## How to Run

1. Clone the repository
2. Install server dependencies: `cd server && npm install`
3. Install client dependencies: `cd client && npm install`
4. Configure `server/.env` with your database credentials, JWT secret, email and Gemini API key
5. Start the backend: `cd server && npm run dev`
6. Start the frontend: `cd client && npm run dev`
7. Open `http://localhost:5173`

## Tech Stack

React · Vite · Node.js · Express · MySQL · JWT · Multer · Nodemailer · Google Gemini AI
