# DecoyVerse-v2

## Project Overview

DecoyVerse-v2 is a full-stack web application focused on security, threat monitoring, and decoy management (implied by its name and API routes such as `alerts`, `attacker-profiles`, `attacks`, `decoys`, and `vault`). 

The project is structured with a distinct frontend and backend:

**Frontend (Root Directory):**
- **Core:** React 19, TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (v4), supplemented by `clsx` and `tailwind-merge`
- **Routing:** React Router DOM
- **UI & Visualization:** Framer Motion (animations), Lucide React (icons), Recharts (charts/graphs)
- **State/Notifications:** `sonner` for toast notifications

**Backend (`/server` Directory):**
- **Core:** Node.js, Express, TypeScript
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JSON Web Tokens (JWT) and `bcryptjs` for password hashing
- **Mailing:** Nodemailer and SendGrid

---

## Building and Running

### Frontend
Commands should be run from the root directory (`C:\Users\satwi\Downloads\Major-project\DecoyVerse-v2\`).

- **Install dependencies:**
  ```bash
  npm install
  ```
- **Start the development server:**
  ```bash
  npm run dev
  ```
- **Build for production:**
  ```bash
  npm run build
  ```
- **Run linter:**
  ```bash
  npm run lint
  ```

### Backend
Commands should be run from the `server` directory (`C:\Users\satwi\Downloads\Major-project\DecoyVerse-v2\server\`).

- **Install dependencies:**
  ```bash
  npm install
  ```
- **Start the development server:**
  ```bash
  npm run dev
  ```
  *(Uses `ts-node-dev` for auto-restarting and TS execution)*
- **Build for production:**
  ```bash
  npm run build
  ```
- **Start the production server:**
  ```bash
  npm run start
  ```
  *(Runs the compiled `dist/index.js` file)*

---

## Development Conventions

- **Language:** The entire stack is written in **TypeScript**. Type definitions should be strictly followed.
- **Frontend Architecture:**
  - Components are separated into `components/` (further divided into `auth`, `common`, `landing`, `layout`).
  - Pages/Views are in `pages/`.
  - API calls are abstracted in the `api/` directory.
  - State management uses React Context (`context/`).
- **Backend Architecture:**
  - Standard MVC-like structure located in `server/src/`.
  - Data models are in `models/`.
  - Express routes are in `routes/`.
  - Custom middleware (e.g., authentication) is in `middleware/`.
- **Styling:** Tailwind CSS is the primary method for styling components on the frontend.
