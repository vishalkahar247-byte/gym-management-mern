# 🏋️ ApexIron Gym Management System (MERN Stack)

A full-stack Gym Management application built with **MongoDB**, **Express.js**, **React 19**, and **Node.js**.

🌐 **Live Application URL**: [https://ais-pre-l75q3q3a7rz7muytbvrumz-455308836990.asia-southeast1.run.app](https://ais-pre-l75q3q3a7rz7muytbvrumz-455308836990.asia-southeast1.run.app)

---

## 🚀 Key Features

* **Operations Dashboard**:
  * Real-time floor occupancy counter with live member headcounts.
  * KPI summary cards: Active Members, Today's Check-ins, Expiring Memberships, Gross Revenue.
  * Inline barcode/ID quick check-in terminal.
  * Expiring membership priority renewal alerts.

* **Member Directory & Profiles**:
  * Full athlete profiles with sequential member codes (`APX-1001`), contact info, emergency contacts, and assigned lockers.
  * Status filtering: Active, Expiring Soon, Expired, All.
  * Comprehensive profile drawer with attendance logs and billing history.
  * 1-click subscription renewals and plan upgrades.

* **Turnstile Attendance & Workout Tracking**:
  * Barcode scanner and member code check-in with duplicate entry prevention.
  * Session duration calculator (e.g., `1h 30m`).
  * 1-click checkout with completed workout status.
  * Filter attendance logs by date and floor presence.

* **Membership Plans & Pricing**:
  * Customizable tiers (Monthly Standard, Quarterly Strength, Annual VIP, Student Special).
  * Feature checklists, facility access hours, and enrolled subscriber counts.
  * Create, edit, and configure custom pricing.

* **Certified Coaching Staff**:
  * Coach roster with specialties (Powerlifting, Functional Mobility, Body Recomposition, Olympic Lifting).
  * Direct athlete assignments, experience ratings, and contact info.

* **Billing, Payments & Receipts**:
  * Revenue ledger tracking transactions across Cash, Credit Card, Debit Card, UPI, and Bank Transfers.
  * Itemized digital gym invoices with official tax receipt print format (`window.print()`).

* **MERN Architecture Visualizer**:
  * Live system inspector displaying collection doc counts and REST API latency in milliseconds.

---

## 🛠️ Tech Stack (MERN)

* **M — MongoDB**: Structured document collection store with `_id`, schemas, and persistence.
* **E — Express.js**: RESTful API routing (`/api/members`, `/api/attendance`, `/api/plans`, `/api/payments`, `/api/dashboard`, `/api/health`).
* **R — React 19**: Modern SPA interface with Tailwind CSS, Lucide icons, tabular numerals, and zero-pill design.
* **N — Node.js & Vite**: Full-stack server running Express with Vite middleware.

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/vishalkahar247-byte/gym-management-mern.git
cd gym-management-mern
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Build for production
```bash
npm run build
npm start
```

---

## 📄 License
MIT License.
