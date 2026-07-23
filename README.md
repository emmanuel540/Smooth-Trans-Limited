# Smooth Trans Limited

A modern logistics and fleet management platform with dynamic dashboards for Customers, Drivers, Dispatchers, and Admins. Features route optimization, demand forecasting, and vehicle predictive maintenance.

---

## Tech Stack

- **Frontend:** React 19 + Vite, React Router, Tailwind CSS, Leaflet Maps
- **UI Libraries:** Recharts (analytics), React Icons
- **Backend:** Flask API (Python 3.10+), SQLAlchemy
- **Database:** Supabase PostgreSQL

---

## Project Structure

```
Smooth-Trans-Limited/
├── frontend/              # React + Vite application
│   ├── src/
│   │   ├── features/
│   │   │   ├── shared/    # Navbar, Sidebar, MapTracker, ProtectedRoute
│   │   │   ├── home/      # Home, About, Services, Contact
│   │   │   ├── auth/      # Login, Register, ForgotPassword
│   │   │   ├── customer/  # CustomerDashboard
│   │   │   ├── driver/    # DriverDashboard
│   │   │   ├── dispatcher/# DispatcherDashboard
│   │   │   └── admin/     # AdminDashboard, FleetManagement, DriverProfiles, AnalyticsReports
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── backend/               # Flask API server
└── backend/migrations/    # Database migrations
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/emmanuel540/Smooth-Trans-Limited.git
cd Smooth-Trans-Limited

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Routes

### Public

| Path | Page |
| :--- | :--- |
| `/` | Home |
| `/about` | About |
| `/services` | Services |
| `/contact` | Contact |

### Auth

| Path | Page |
| :--- | :--- |
| `/login` | Login |
| `/register` | Register |
| `/forgot-password` | Forgot Password |

### Protected Dashboards

| Path | Role | Page |
| :--- | :--- | :--- |
| `/dashboard/customer/*` | Passenger | Customer Dashboard |
| `/dashboard/driver/*` | Driver | Driver Dashboard |
| `/dashboard/dispatcher/*` | Dispatcher | Dispatcher Dashboard |
| `/dashboard/admin` | Admin | Admin Dashboard |
| `/dashboard/admin/fleet` | Admin | Fleet Management |
| `/dashboard/admin/drivers` | Admin | Driver Profiles |
| `/dashboard/admin/reports` | Admin | Analytics & Reports |

---

## Demo Credentials

| Dashboard | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@smooth.co.ke` | `password123` |
| **Dispatcher** | `dispatcher@smooth.co.ke` | `password123` |
| **Driver** | `driver1@smooth.co.ke` | `password123` |
| **Customer** | `alex@gmail.com` | `password123` |
