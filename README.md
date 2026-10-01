# 🏥 ArogyaBandhu (आरोग्य बंधु)
### Rural Healthcare, Community Health Worker Coordination & AI Clinical Decision Support Platform

ArogyaBandhu is a full-stack rural healthcare coordination platform developed for primary health networks in India (National Health Mission / Ayushman Bharat Digital Mission). It bridges citizens, village ASHA workers, Primary Health Centre (PHC) Medical Officers, Jan Aushadhi pharmacists, and District Health Officers through digital health records (EMR), real-time emergency SOS dispatch, essential drug inventory tracking, and localized AI clinical decision support.

---

## 🚀 Live Demo & Quick Launch

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **MongoDB**: Local MongoDB on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI.

### 2. Fast Startup (Windows)
Double-click `run-app.bat` or run:
```bash
# Terminal 1 - Backend API Server (Port 5000)
cd backend
npm install
npm run seed     # Populates realistic demo data for all 5 roles
npm start

# Terminal 2 - Frontend Web Client (Port 3000)
cd frontend
npm install
npm run dev
```

Open browser at: **`http://localhost:3000`**

---

## 👥 1-Click Demo Profiles (Password: `password123`)

| Role | Demo Account | Focus & Core Actions |
| :--- | :--- | :--- |
| **Citizen / Patient** | `patient@arogya.in` (Sunita Devi) | Ayushman ABHA Smart Card, High-Risk ANC tracker, Book Tele-OPD, Medication reminders, AI Triage |
| **ASHA Worker** | `asha@arogya.in` (Rekha Devi) | Rampur Village Registry, Doorstep non-invasive vitals screening, Flag High-Risk mothers, MCP immunization card |
| **PHC Medical Officer** | `doctor@arogya.in` (Dr. Arvind Mishra) | Live Tele-OPD queue, Triage severity filter, Digital Prescription writer, Patient EMR & Vitals timeline |
| **Jan Aushadhi Pharmacist** | `pharmacist@arogya.in` (Manoj Sharma) | Essential drugs catalog, Low-stock alerts (Anti-Venom/Antibiotics), Dispense medicines at counter |
| **Chief Medical Officer (Admin)** | `admin@arogya.in` (Dr. S. P. Verma) | District bed occupancy, 108 Emergency ambulance dispatch command, Disease surveillance |

*Tip: You can also use the **Demo Role Switcher bar** at the very top of the app to switch roles in 1 click without typing passwords.*

---

## 🌟 Core System Modules & Features

### 1. Ayushman Digital EMR & ABHA Smart Health Cards
- Full electronic medical records (EMR) storing blood pressure, random blood sugar, SpO2, hemoglobin, weight, doctor prescriptions, maternal ANC checkup data, and child immunization cards.
- Automatic risk detection: Flags systolic BP $\ge 140$ or diastolic $\ge 90$, $\text{SpO}_2 < 93\%$, or $\text{Hb} < 9\,\text{g/dL}$ as High Risk in the village cohort.

### 2. Location-Based Health Facility Locator
- Calculates true **Haversine geospatial distance (km)** and estimated travel times from citizen GPS coordinates.
- Filters by facility type (Sub-centre, PHC, CHC, Jan Aushadhi, District Hospital) with real-time bed availability and 24x7 ambulance status.

### 3. Real-time Emergency SOS & 108 Dispatch Command
- Instant 1-click distress trigger for snakebites, maternal labor complications, cardiac chest pain, and trauma.
- Auto-dispatches 108 ambulance with live status tracking (`REPORTED` $\rightarrow$ `DISPATCHED` $\rightarrow$ `EN_ROUTE` $\rightarrow$ `ARRIVED` $\rightarrow$ `RESOLVED`), driver contact, and action notes.

### 4. Jan Aushadhi & Essential Medicine Inventory
- Live stock balance with batch numbers, expiry dates, and government subsidized rates.
- Automatic low-stock triggers when medicines fall below threshold (e.g. Polyvalent Anti-Snake Venom serum).
- Real inventory dispensing that updates MongoDB records upon fulfillment.

### 5. Backend AI Rural Health Assistant & Clinical Decision Support (CDSS)
- **Symptom Triage**: Evaluates reported symptoms against National Health Mission / WHO rural protocols to categorize urgency (`CRITICAL`, `HIGH`, `MILD_TO_MODERATE`).
- **Red Flag Alerts & First Aid**: Gives safe, non-invasive home first-aid steps and questions to ask the doctor.
- **Prescription Simplifier**: Converts medical abbreviations (e.g., *PCM 500mg 1-0-1*, *IFA Red*) into plain language instructions with food/drug precautions.
- **Multilingual Support**: English, हिन्दी (Hindi), ಕನ್ನಡ (Kannada), తెలుగు (Telugu), বাংলা (Bengali).
- **Statutory Medical Disclaimer**: Visible throughout all AI decision support interfaces to maintain clear distinction between automated assistance and registered clinical practitioners.

---

## ⚙️ Backend AI Configuration (Google Gemini / Fallback)

The AI service layer (`backend/src/services/aiService.js`) provides zero-dependency fallback to an NHM rural clinical knowledge engine so the app always works smoothly offline/locally.

To connect live Google Gemini API:
1. Open `backend/.env`
2. Set your key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
3. Restart backend server.

---

## 📁 Modular Project Structure
```
RiskPredictor/
├── backend/
│   ├── src/
│   │   ├── config/db.js              # MongoDB Mongoose connection
│   │   ├── models/                   # User, Patient, Appointment, HealthRecord, Inventory, Facility, Emergency, Notification
│   │   ├── controllers/              # Business logic & RBAC handlers
│   │   ├── routes/                   # Modular REST routes (/api/auth, /api/patients, /api/ai, etc.)
│   │   ├── middleware/               # JWT Protect, Authorize RBAC, Error Handler
│   │   ├── services/aiService.js     # Gemini API integration & Clinical triage engine
│   │   ├── seed/seedData.js          # Realistic rural database seeder
│   │   └── server.js                 # Express server on port 5000
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.js             # Axios client with JWT interceptor
│   │   ├── context/                  # AuthContext (1-click role switcher) & NotificationContext
│   │   ├── locales/translations.js   # Multilingual dictionary (EN, HI, KN, TE, BN)
│   │   ├── components/               # Navbar, Sidebar, EmergencyModal, DisclaimerBanner, StatCard, RoleBadge
│   │   ├── pages/                    # PatientPortal, AshaPortal, DoctorPortal, PharmacyPortal, AdminPortal, AiHealthAssistant, FacilitiesMap, EmergencyCenter, HealthRecords, Appointments, Inventory, Login, Register
│   │   ├── App.jsx                   # Application routing & layout
│   │   └── index.css                 # Tailwind CSS & custom styling
│   ├── vite.config.js                # Vite port 3000 & /api proxy
│   └── package.json
└── README.md
```
