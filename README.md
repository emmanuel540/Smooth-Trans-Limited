# Smooth Trans Limited

Smooth Trans is a modern logistics and fleet management platform featuring dynamic dashboards for Customers, Drivers, Dispatchers, and Admins. It integrates Safaricom M-Pesa payment flows and provides AI-powered route optimization, demand forecasting, and vehicle predictive maintenance powered by Gemini 3.5 Flash.

---

## 🛠️ Tech Stack
- **Frontend:** React + Vite, Tailwind CSS, Leaflet/Mapbox Maps.
- **Backend:** Flask API (Python 3.10+), SQLAlchemy.
- **Database:** Supabase PostgreSQL.
- **AI Engine:** Gemini 3.5 Flash (via Gemini API).

---

## 🚀 Getting Started

### 1. Database Setup (Supabase)
Smooth Trans uses Supabase PostgreSQL for data durability, schema safety, and row-level security.

1. Go to your [Supabase Dashboard](https://supabase.com/).
2. Select your **Smooth Trans** project.
3. Open the **SQL Editor** from the left-hand sidebar.
4. Click **New query**, paste the contents of [supabase/migrations/20260720_init_schema.sql](file:///c:/Users/Emmanuel/Desktop/Development/Smooth-Trans-Limited/supabase/migrations/20260720_init_schema.sql), and click **Run**.
   *This initializes the `users`, `vehicles`, `bookings`, `payments`, `driver_profiles`, `maintenance_logs`, `trip_progress`, and `notifications` tables.*

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/` directory (template provided below).

#### Backend Environment Variables (`backend/.env`)
Create `backend/.env` and configure:
```env
SECRET_KEY=smooth-trans-super-secret-key-12345
JWT_SECRET_KEY=jwt-secret-token-key-98765

# Supabase PostgreSQL Connection URL
# Replace [YOUR_PASSWORD] with your actual Supabase DB password
DATABASE_URL=postgresql://postgres.ezjecxlodpuviqqgcjwx:[YOUR_PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require

# Gemini API Key (For AI route optimization commentary, maintenance reports & dispatcher insights)
GEMINI_API_KEY=your_gemini_api_key_here

# Safaricom M-Pesa Configuration (Optional for Sandbox/Testing)
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=Gf9ksFot0FmpXDz68Z4Ce9opWC0U9g88E8qgQiDLSj0avDue
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=http://your-ngrok-url-or-domain.com/api/payments/callback
```

---

### 3. Database Seeding
To populate your new Supabase database with sample users, vehicles, historical bookings, and maintenance logs:
1. Ensure your virtual environment is active in the `backend/` directory.
2. Ensure your `.env` contains your correct database password.
3. Run the database seeder:
   ```bash
   python database_seeder.py
   ```
   *Note: This drops existing tables in your database and seeds clean mock data.*

---

### 4. Running the Servers

#### Start Backend
From the `backend/` directory (with active venv):
```bash
python app.py
```
The server will start at `http://localhost:5000`.

#### Start Frontend
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
The app will open at `http://localhost:5173`.

---

## 🔑 Demo Account Credentials
After database seeding, use these credentials to log in to different dashboards:

| Dashboard | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@smooth.co.ke` | `password123` |
| **Dispatcher** | `dispatcher@smooth.co.ke` | `password123` |
| **Driver 1** | `driver1@smooth.co.ke` | `password123` |
| **Customer/Passenger** | `alex@gmail.com` | `password123` |