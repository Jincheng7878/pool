# Pool Room Table Service PWA

## Project Overview

This project is a Progressive Web Application (PWA) designed for a billiard (pool) venue.  
It allows customers to access table services directly from their mobile device without needing to go to the front desk.

By scanning a QR code placed on a table or entering a table ID manually, users can start a session, order food and drinks, request service, and complete checkout.

The aim of this project is to improve efficiency and user experience within a real-world pool room environment.

---

## Key Features

- QR code-based table access (Camera API)
- Geolocation verification to ensure users are inside the venue
- Session management with real-time countdown timer
- Ability to extend or end sessions
- Food and drink ordering system
- Service request system (e.g. call staff, rack balls)
- Checkout system (table fee + food and drinks total)
- Installable PWA with offline capability

---

## Technologies Used

- React (Vite)
- React Router
- LocalStorage (for data persistence)
- Service Worker (for caching and offline support)
- Web App Manifest
- Geolocation API
- Camera API (QR code scanning)

---

## Project Structure

The project is structured using a component-based architecture:

src/
 ├── pages/
 │    ├── Home.jsx
 │    ├── Table.jsx
 │    ├── StartSession.jsx
 │    ├── Menu.jsx
 │    ├── Cart.jsx
 │    ├── Service.jsx
 │    ├── Wifi.jsx
 │    └── Staff.jsx
 │
 ├── components/
 │    ├── Layout.jsx
 │    └── NavBar.jsx
 │
 ├── lib/
 │    ├── session.js
 │    ├── storage.js
 │    ├── geo.js
 │    └── useAccess.js
 │
 └── main.jsx

---

## Installation Instructions

To run this project locally, follow the steps below:

1. Clone the repository:

git clone https://github.com/Jincheng7878/pool.git

2. Navigate to the project directory:

cd pool

3. Install dependencies:

npm install

4. Start the development server:

npm run dev

5. Open the application in your browser:

http://localhost:5173

---

## Deployment (Online Version)

This project is deployed using Vercel:

https://pool-k4lo1747c-jincheng-zhangs-projects.vercel.app/

The deployed version allows full testing of:
- PWA installation
- QR scanning
- Geolocation functionality

---

## How to Use the Application

1. Open the application in a browser or on a mobile device  
2. Enter a table ID or scan a QR code  
3. Navigate to the table dashboard  
4. Start a session and choose duration  
5. Order food and drinks from the menu  
6. Send service requests if needed  
7. End the session and view checkout summary  

---

## Device APIs Used

Geolocation API  
Used to verify that the user is physically inside the venue before allowing access to certain features such as ordering and service requests.

Camera API  
Used to scan QR codes placed on tables, allowing users to directly access their table without manually entering a table ID.

---

## Data Storage and CRUD Operations

The application uses browser localStorage for storing data.

Examples include:
- Active sessions
- Cart items
- Orders
- Service requests

CRUD operations are implemented as follows:

- Create: starting a session, placing orders, creating service requests  
- Read: retrieving session and order data  
- Update: modifying cart quantities, updating order or request status  
- Delete: ending sessions, clearing cart, cancelling requests  

---

## PWA Functionality

This application is built as a Progressive Web App (PWA), which means:

- It can be installed on mobile devices  
- It works similarly to a native application  
- It uses a service worker for caching resources  
- It supports limited offline functionality  

---

## Author

Jincheng Zhang