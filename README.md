# 🌾 ANNAPURNA+ — Smart Food Rescue Platform

> **"Not just donating food — intelligently saving it."**

A full-stack final year project connecting food donors, volunteers, NGOs, and admins using intelligent AI matching, real-time tracking, and location-based services.

---

## 📦 Tech Stack

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| Frontend       | React.js (Vite) + Tailwind CSS          |
| Backend        | Spring Boot 3 (Java 17)                 |
| Authentication | Firebase Auth (Email/Password)          |
| Database       | MySQL 8                                 |
| Maps           | Leaflet.js (OpenStreetMap)              |
| Charts         | Recharts                                |
| HTTP Client    | Axios                                   |
| AI Matching    | Custom Haversine + Priority Score algo  |

---

## 🗂 Folder Structure

```
annapurna-plus/
├── backend/                    ← Spring Boot project
│   ├── pom.xml
│   └── src/main/java/com/annapurna/
│       ├── config/             ← Security, Firebase config
│       ├── controller/         ← REST API controllers
│       ├── model/              ← JPA entities
│       ├── repository/         ← Spring Data JPA repos
│       ├── service/            ← Business logic
│       └── exception/          ← Global error handler
├── frontend/                   ← React + Vite project
│   ├── src/
│   │   ├── api/                ← Firebase, Axios, endpoints
│   │   ├── context/            ← AuthContext (React Context)
│   │   ├── pages/              ← All page components
│   │   └── components/         ← Shared components (Navbar)
│   └── package.json
└── database/
    ├── schema.sql              ← Create tables
    └── sample_data.sql         ← Test data
```

---

## 🚀 STEP-BY-STEP SETUP GUIDE

### ─────────────────────────────
### STEP 1 — Prerequisites
### ─────────────────────────────

Install these tools before starting:

| Tool          | Version   | Download                           |
|---------------|-----------|------------------------------------|
| Java JDK      | 17+       | https://adoptium.net               |
| Maven         | 3.8+      | https://maven.apache.org           |
| Node.js       | 18+       | https://nodejs.org                 |
| MySQL Server  | 8+        | https://dev.mysql.com/downloads    |
| VS Code       | Latest    | https://code.visualstudio.com      |

VS Code Extensions to install:
- Extension Pack for Java
- Spring Boot Extension Pack
- ES7+ React/Redux/React-Native Snippets
- Tailwind CSS IntelliSense

---

### ─────────────────────────────
### STEP 2 — Open in VS Code
### ─────────────────────────────

1. **Extract** the ZIP file to any folder (e.g., `C:/Projects/annapurna-plus`)
2. **Open VS Code**
3. Click **File → Open Folder**
4. Select the `annapurna-plus` folder
5. You'll see both `backend/` and `frontend/` in the explorer

---

### ─────────────────────────────
### STEP 3 — Firebase Setup
### ─────────────────────────────

**A. Create Firebase Project:**
1. Go to https://console.firebase.google.com
2. Click "Add Project" → name it `annapurna-plus`
3. Disable Google Analytics (optional) → Create

**B. Enable Email/Password Auth:**
1. In Firebase Console → Authentication → Sign-in method
2. Enable **Email/Password**
3. Also enable **Email Verification** (it's automatic)

**C. Get Frontend Config:**
1. Firebase Console → Project Settings → Your apps → Web app (</> icon)
2. Register app with name "annapurna-web"
3. Copy the `firebaseConfig` object
4. **Paste it** into: `frontend/src/api/firebase.js` (replace placeholder values)

**D. Get Backend Service Account:**
1. Firebase Console → Project Settings → Service Accounts
2. Click **"Generate new private key"** → Download JSON
3. **Rename** it to `firebase-service-account.json`
4. **Replace** the file at: `backend/src/main/resources/firebase-service-account.json`

---

### ─────────────────────────────
### STEP 4 — MySQL Setup
### ─────────────────────────────

1. Open MySQL Workbench or any MySQL client
2. Login with root user
3. Run the schema file:
   ```sql
   SOURCE /path/to/annapurna-plus/database/schema.sql;
   ```
4. (Optional) Load sample data:
   ```sql
   SOURCE /path/to/annapurna-plus/database/sample_data.sql;
   ```

5. Update `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```

---

### ─────────────────────────────
### STEP 5 — Run the Backend
### ─────────────────────────────

**Option A: VS Code Terminal**
```bash
cd backend
mvn spring-boot:run
```

**Option B: VS Code Spring Boot Dashboard**
- Open the Spring Boot Dashboard in the left sidebar
- Click ▶ to run `AnnapurnaApplication`

**Expected output:**
```
ANNAPURNA+ Backend Started on port 8080
✅ Firebase Admin SDK initialized successfully
```

Test the backend is running: http://localhost:8080/api/admin/stats

---

### ─────────────────────────────
### STEP 6 — Run the Frontend
### ─────────────────────────────

Open a **new terminal** in VS Code (Terminal → New Terminal):

```bash
cd frontend
npm install
npm run dev
```

**Expected output:**
```
  VITE v5.x  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

Open your browser: **http://localhost:5173**

---

## 🔌 API Endpoints Reference

| Method | Endpoint                             | Description                    |
|--------|--------------------------------------|--------------------------------|
| POST   | /api/users/register                  | Register user after Firebase   |
| GET    | /api/users/firebase/{uid}            | Get user by Firebase UID       |
| PUT    | /api/users/{id}                      | Update profile                 |
| GET    | /api/users/leaderboard               | Volunteer leaderboard          |
| POST   | /api/donations/donor/{id}            | Post new donation              |
| GET    | /api/donations/available             | Get available donations        |
| GET    | /api/requests/{id}/matches           | AI-matched donations for req   |
| POST   | /api/deliveries/accept               | Volunteer accepts delivery     |
| PATCH  | /api/deliveries/{id}/status          | Update delivery stage          |
| GET    | /api/notifications/user/{id}         | Get user notifications         |
| GET    | /api/admin/stats                     | Admin analytics dashboard      |

---

## 🤖 AI Matching Algorithm

```
Priority Score = (1 / distance_km) + (1 / hours_until_expiry)
```

- **Higher score = matched first**
- Donations expiring soon get higher priority → reduces waste
- Closer donations get higher priority → faster delivery
- Implemented in: `backend/.../service/MatchingService.java`

---

## 🏅 Gamification Badges

| Badge          | Threshold     |
|----------------|---------------|
| 👋 New Member  | 0 deliveries  |
| 🌱 Beginner   | 1+ deliveries |
| 🥉 Active      | 5+ deliveries |
| 🥈 Expert      | 10+ deliveries|
| 🌟 Champion    | 20+ deliveries|

---

## 🐛 Troubleshooting

| Problem                           | Fix                                                        |
|-----------------------------------|------------------------------------------------------------|
| `Port 8080 already in use`        | Kill process: `npx kill-port 8080`                         |
| `Firebase config not found`       | Replace `firebase-service-account.json` with real one     |
| `Database connection failed`      | Check MySQL is running + username/password in properties   |
| `CORS error in browser`           | Backend CORS is set to allow localhost:5173 — check it    |
| `npm install fails`               | Delete `node_modules/` and run `npm install` again         |
| `Cannot find module firebase`     | Run `npm install` inside the `frontend/` folder            |

---

