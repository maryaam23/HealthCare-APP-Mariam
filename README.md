# Healthcare Management System

A full-stack healthcare application built with ReactJS, NodeJS, and MongoDB that supports multiple user roles (Patient, Doctor, Finance). The application allows patients to reserve visits, doctors to manage visits and add treatments, and finance personnel to review visit costs.

## Features

### Login Page
- Secure email and password login
- Receives JWT token and user role from the server
- Shows success or error messages
- Smooth transition to dashboard after login
- Responsive and clean UI with React and Framer Motion
- Includes:
  - Email and password inputs
  - Login button with hover effect
  - Notifications for success or errors
  - Motivational message: "Your Health Journey Starts Here!"

### Patient
- Register and login securely with JWT authentication
- View personal information and welcome message
- Browse available doctors and their schedules
- Select a doctor, date, and time to reserve a visit
- View which slots are already reserved, cancelled, or available
- Reserve a slot in real-time without refreshing the page
- Cancel a previously reserved visit
- Visual indicators for:
  - Reserved by the patient ✅
  - Reserved by others ❌
  - Cancelled visits ❌
  - Past time slots (disabled)
- Automatic UI updates for availability when reservations or cancellations occur
- Notifications for successful reservation, cancellation, or errors
- Responsive and animated interface for a smooth user experience


### Doctor

The **Doctor** interface allows medical professionals to efficiently manage their daily appointments, track patient progress, and record treatments. This module provides an intuitive and interactive UI built with React and Framer Motion.

- Login securely and view personal profile
- See all assigned visits with details
- Browse appointments by year, month, and day
- View daily appointment summary:
  - Completed ✅
  - Pending ⏳
  - Cancelled ❌
- Record patient problem / diagnosis during a visit
- Add multiple treatments with name and cost
- Remove treatments dynamically if needed
- Automatically calculates total treatment cost
- Real-time UI updates for added treatments
- Notifications for success or errors
- Smooth animations and responsive buttons
- Back navigation to switch between years, months, days, and appointments
- Motivational quote section for a better user experience


### Finance
- Login securely and view all visits
- Filter visits by:
  - Doctor name
  - Patient name
  - Visit ID
  - Status (Pending, Completed, Cancelled)
  - Sorting options (Date, Time, Date + Time)
- Reset filters with a single button
- Real-time data fetching with debounced input (prevents excessive API calls)
- View visit details:
  - Doctor and patient names
  - Date & time
  - Problem / diagnosis
  - Treatments with name and cost
  - Total amount
  - Status (Completed, Pending, Cancelled)
  - Paid status (toggle for completed visits)
- Automatic total calculations:
  - Total visits
  - Pending visits
  - Cancelled visits
  - Completed visits
  - Total completed amount
  - Total paid and unpaid amounts
- Notifications for success or errors
- Responsive table and dashboard cards
- Smooth animations and hover effects for interactive UI
- Horizontal scroll support for smaller screens


### General
- Role-based access control
- Dynamic schedule management
- User-friendly UI with real-time updates

## Tech Stack
- **Frontend:** ReactJS, Framer Motion, React Icons  
- **Backend:** NodeJS, ExpressJS  
- **Database:** MongoDB (Atlas or local)  
- **Authentication:** JWT-based login for secure access  

## Optional
- Simple dashboard showing visit statistics and summaries  

## RUN
- Run Backend By : node server.js
- Run ffrontend By: npm start
  
## Screenshots


