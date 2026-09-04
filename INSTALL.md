# SAHAYATA — Comprehensive Clone & Installation Manual

This guide provides end-to-end instructions for setting up, running, and testing **SAHAYATA** on any fresh machine (Windows, macOS, or Linux) cloned directly from GitHub.

---

## 1. System Requirements & Prerequisites

Before cloning, verify that you have the following software installed:

| Prerequisite | Minimum Required Version | Recommended Version | Verification Command |
|---|---|---|---|
| **Node.js** | `v18.17.0` | `v20.x` or `v22.x` (LTS) | `node -v` |
| **npm** | `v9.0.0` | `v10.x` | `npm -v` |
| **Git** | `v2.20.0` | Latest | `git -v` |
| **Browser** | Any modern browser | Google Chrome or Microsoft Edge | Edge / Chrome |

> **Note on OS**: SAHAYATA is cross-platform and runs natively on Windows 10/11, macOS (Intel & Apple Silicon M1/M2/M3), and Linux (Ubuntu, Debian, Fedora, Arch).

---

## 2. Step-by-Step Installation

### Step 1: Clone the Repository
Open your terminal (PowerShell / Command Prompt on Windows, Terminal on macOS / Linux) and run:

```bash
git clone https://github.com/AryanSingh2k4/sahayata.git
```

### Step 2: Navigate into the Project Directory
```bash
cd sahayata
```

### Step 3: Install Node Dependencies
Install all required packages:

```bash
npm install
```

*(Optional: If using `pnpm` or `yarn`, you can run `pnpm install` or `yarn install`.)*

> **No Mandatory Configuration Required**: SAHAYATA is architected to run **100% locally out-of-the-box** with pre-seeded incident data, local IndexedDB (Dexie.js), and client-side AI heuristics. You do **not** need to create accounts or configure third-party API keys to run, demo, or test the platform.

### Step 4: (Optional) Environment Configuration
If you plan to connect external services (such as a live Supabase PostgreSQL database or Upstash QStash message broker in production), copy the example configuration file:

```bash
# On Linux / macOS:
cp .env.example .env.local

# On Windows (PowerShell):
Copy-Item .env.example .env.local
```

---

## 3. Running the Application

### Option A: Development Mode (Recommended for testing & editing)
To launch the local development server with hot-reloading:

```bash
npm run dev
```

You should see output similar to:
```
   ▲ Next.js 14.2.23
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.x:3000

 ✓ Ready in 1.8s
```

Open your web browser and visit:  
👉 **[http://localhost:3000](http://localhost:3000)**

---

### Option B: Production Build Mode (Recommended for benchmarks & evaluations)
To create an optimized production build and serve it:

```bash
# 1. Compile the production bundle
npm run build

# 2. Start the optimized production server
npm start
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 4. Testing on Mobile Phones (Local Wi-Fi)

To test the mobile-first viewport and responsive touch controls on a physical phone:

1. Ensure your computer and smartphone are connected to the **same Wi-Fi network**.
2. Start the development server binding to all network interfaces:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```
3. Find your computer's local IP address:
   - **Windows**: Run `ipconfig` (look for `IPv4 Address`, e.g. `192.168.1.45`)
   - **macOS / Linux**: Run `ifconfig` or `ip a` (look for `inet`, e.g. `192.168.1.45`)
4. On your mobile phone's browser, navigate to:
   ```
   http://YOUR_LOCAL_IP:3000
   ```
   *(e.g., `http://192.168.1.45:3000`)*

---

## 5. Running the Automated E2E Browser Test Suite

SAHAYATA includes a 24-point automated Puppeteer test suite that exercises all 4 AI engines, document OCR intake, bilingual switching, and offline Dexie.js persistence in headless Microsoft Edge or Google Chrome.

### Prerequisites for E2E Tests:
1. Make sure the development server is running in another terminal:
   ```bash
   npm run dev
   ```
2. In a second terminal window, run:
   ```bash
   node scratch/test-e2e.mjs
   ```

### Expected Output:
```
========================================
       TEST EXECUTION SUMMARY
========================================
[PASS] Citizen Landing Page Load
[PASS] Active Incident & Stats Banner
[PASS] Bilingual Switch to Hindi
[PASS] AI Relative Document OCR: Bus Ticket
[PASS] AI Relative Document OCR: Govt Aadhaar ID
[PASS] AI Use Case 1: Emotional NLP Extraction
[PASS] Intake Wizard Step 2 Navigation
[PASS] Intake Wizard Step 3 Navigation
[PASS] AI Use Case 3: OCR Manifest Scanner
[PASS] Intake Wizard Step 4: Verified Doc Review
[PASS] Instant Sub-200ms Case ID Generation
[PASS] Report Submission with Attached Document
[PASS] Public Case Tracking & Timeline
[PASS] Tracker Verified Document Display
[PASS] Pre-Disaster Route Registration & QR Card
[PASS] NDRF Pre-Disaster Reconciliation Banner
[PASS] Leaflet GIS Map Rendering
[PASS] AI Use Case 4: Deterministic Urgency Triage
[PASS] AI Group Reconstruction View
[PASS] NDRF Dashboard: Verified Document Badge in Registry
[PASS] AI Use Case 2: Hospital Face Matcher
[PASS] Field Mode: Dexie.js Offline Persistence
[PASS] Field Mode: Network Simulation Toggle
[PASS] Field Mode: Background Sync Queue

TOTAL: 24 | PASS: 24 | FAIL: 0 | CONSOLE ERRORS: 0
```
Screenshots of all 24 verified steps will be generated in `scratch/screenshots/`.

---

## 6. Quick Verification Checklist

Once the application is running, click through this 3-minute tour to verify all features:

1. **Language Switching**: Click **`हिन्दी`** in the top-right header to switch to Hindi; click **`EN`** to switch back.
2. **Document OCR & Intake**:
   - Go to [http://localhost:3000/en/report](http://localhost:3000/en/report)
   - Click `Bus Ticket (Kailash Safaris)` or `Govt. Aadhaar Card`. Form fields and co-passengers will auto-populate immediately.
   - Click `Paste Sample Distress Note` and `Extract Fields with AI` to verify NLP extraction.
   - Click `Next Step` through to Step 4 and submit to receive a sub-200ms Case ID (`SAH-2026-XXXXXX`).
3. **Public Case Tracker**:
   - Go to [http://localhost:3000/en/track?caseId=SAH-2026-001458](http://localhost:3000/en/track?caseId=SAH-2026-001458)
   - Inspect the 5-stage verification lifecycle timeline and the verified document badge.
4. **NDRF Incident Command**:
   - Go to [http://localhost:3000/en/dashboard](http://localhost:3000/en/dashboard)
   - Inspect the Leaflet GIS Map with hazard flood polygons.
   - Click the **`Urgency Triage (P0-P3)`** tab to see P0 life-threatening cases and test the **Dispatch Team** modal.
   - Click the **`Hospital Face Matcher`** tab and click **Analyze & Match Patient Photo** to verify the ArcFace cosine similarity matching.
5. **Offline Field Mode**:
   - Go to [http://localhost:3000/en/field](http://localhost:3000/en/field)
   - Click the network toggle to simulate "Offline (No Signal)".
   - Click `Scan Victim Card: Dr. Milind Chitley` to log an offline sighting into Dexie.js IndexedDB.
   - Toggle back to "Online" and click `Sync Queue Now` to flush the background queue.

---

## 7. Troubleshooting & FAQ

### Issue 1: "Port 3000 is already in use"
**Cause**: Another process or background terminal is occupying port 3000.  
**Solution**:
- **Option A**: Kill whatever is on port 3000:
  - Windows: `npx kill-port 3000`
  - macOS/Linux: `lsof -ti:3000 | xargs kill -9`
- **Option B**: Run on a different port:
  ```bash
  npm run dev -- -p 3001
  ```
  Then access at `http://localhost:3001`.

---

### Issue 2: "Node version incompatible"
**Cause**: Running Node.js v16 or earlier.  
**Solution**: Next.js 14 requires Node.js v18.17.0 or higher.
- Check version: `node -v`
- Upgrade Node via [nodejs.org](https://nodejs.org/) or using `nvm`:
  ```bash
  nvm install 20
  nvm use 20
  ```

---

### Issue 3: "Puppeteer cannot find Edge / Chrome executable" (when running tests)
**Cause**: The automated test script looks for Microsoft Edge or Chrome in default OS installation paths.  
**Solution**:
- On Windows, Edge is installed by default at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`.
- On Linux/macOS, if Chrome or Chromium is installed in a custom location, specify the executable in `scratch/test-e2e.mjs`:
  ```javascript
  const executablePath = '/usr/bin/google-chrome'; // or '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ```

---

### Issue 4: "Hydration mismatch or stale data in browser"
**Cause**: Stale mock entries cached in your browser's `localStorage` or `IndexedDB`.  
**Solution**:
- Open your browser's Developer Tools (`F12` or `Ctrl+Shift+I` / `Cmd+Option+I`).
- Go to the **Application** tab.
- Click **Clear storage** -> **Clear site data**.
- Hard refresh the page (`Ctrl+F5` or `Cmd+Shift+R`).

---

## 8. Summary of Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start development server accessible on local network (for mobile testing)
npm run dev -- -H 0.0.0.0

# Type-check and build production bundle
npm run build

# Start production server
npm start

# Run linting check
npm run lint

# Run full 24-point headless browser E2E test suite
node scratch/test-e2e.mjs
```
