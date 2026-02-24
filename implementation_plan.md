# Feature Implementation Plan

## Goal Description
This document outlines the plan to resolve the UI severity mapping bugs, fix the 422 PATCH API error for alert updates, integrate WhatsApp and Email notification functionality, and surface these alerts comprehensively on the Dashboard.

## Project Structure Context
This system is composed of two primary repositories located in the following directories:
1. **Frontend (Dashboard & UI)**: Located in `c:\Users\satwi\Downloads\DecoyVerse-v2\` (React/TypeScript project).
2. **Backend (API & ML Services)**: Located in `c:\Users\satwi\Downloads\ML-modle v0\` (FastAPI/Python project).

All proposed changes strictly map to their respective project directory as annotated in the paths below.

This project consists of two separate codebases/folders:
1. **Frontend**: `c:\Users\satwi\Downloads\DecoyVerse-v2`
2. **Backend**: `c:\Users\satwi\Downloads\ML-modle v0`

## Proposed Changes

### 1. UI Severity Mapping Mismatch Fix
The backend returns `risk_score: 9` but omits `severity`, causing the frontend to default to `low`. We will add a fallback mechanism based on `risk_score` and pass this raw score to the modal.

#### [MODIFY] [alerts.ts](file:///c:/Users/satwi/Downloads/DecoyVerse-v2/src/api/endpoints/alerts.ts)
- Update the `Alert` interface to include `risk_score?: number`.
- Modify `normalizeAlert` to map `severity` intelligently if it's missing by calculating it from `alert.risk_score` (e.g. `risk_score >= 8` is critical, `6-7` is high).

#### [MODIFY] [dashboard.ts](file:///c:/Users/satwi/Downloads/DecoyVerse-v2/src/api/endpoints/dashboard.ts)
- Ensure the `Alert` interface in dashboard API accurately includes `risk_score: number`. 

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/satwi/Downloads/DecoyVerse-v2/src/pages/Dashboard.tsx)
- Update the props passed to `ThreatModal` to map the actual backend string `selectedAlert.risk_score` rather than hardcoding it via `severity`.

---

### 2. PATCH API Error on Alert Update Fix
The frontend sends a JSON body (`{"status": "investigating"}`) but the FastAPI backend expects a query parameter.

#### [MODIFY] [alerts.py](file:///c:/Users/satwi/Downloads/ML-modle%20v0/backend/routes/alerts.py)
- Import `BaseModel` from `pydantic`.
- Create a simple Pydantic model (`class AlertUpdate(BaseModel): status: str`).
- Update the `@router.patch("/alerts/{alert_id}")` method signature to expect the body payload: `update_data: AlertUpdate`. 
- Use `update_data.status` for the db call.

---

### 3. WhatsApp Alert Integration
The backend `notification_service.py` is already wired up to send WhatsApp alerts if a `whatsappNumber` exists on the user's profile and Twilio credentials exist in the `.env`. We just need to collect it during onboarding.

#### [MODIFY] [Onboarding.tsx](file:///c:/Users/satwi/Downloads/DecoyVerse-v2/src/pages/Onboarding.tsx)
- Add a new "Notification Preferences" or "Contact Info" section during the onboarding sequence (likely Step 2 before obtaining the API token).
- Present an input field to collect the user's `whatsappNumber`.
- Upon submission, trigger an `authApi.updateProfile({ notifications: { whatsappNumber } })` call to store the number in the database.

---

### 4. Email Alert Configuration
The backend should use the specific email sender provided but must not be hardcoded in the repository.

#### [MODIFY] [.env.example](file:///c:/Users/satwi/Downloads/ML-modle%20v0/backend/.env.example) & Local Environment
- Update the `.env.example` file to clearly define the email environment variables required.
- Set the credentials explicitly via environment files so that `notification_service.py` functions correctly:
  ```env
  SMTP_SERVER=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=satwikbhavanari501@gmail.com
  SMTP_PASS=<app-specific-password>
  ALERT_EMAIL_TO=<receiver-email>
  ```

#### [MODIFY] [config.py](file:///c:/Users/satwi/Downloads/ML-modle%20v0/backend/config.py)
- Confirm that `SMTP_USER` reads from the environment properly (already verified it does). Let's just make sure there are no hardcoded fallbacks here related to sender email.

---

### 5. Dashboard & In-App Notifications
Enhancing the visual prominence of alerts across the platform.

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/satwi/Downloads/DecoyVerse-v2/src/pages/Dashboard.tsx)
- Ensure the toast popup for new threats triggers a sound if acceptable or has high visual contrast.

#### [MODIFY] [Navbar.tsx](file:///c:/Users/satwi/Downloads/DecoyVerse-v2/src/components/layout/Navbar.tsx)
- Add an `AlertNotificationBell` component to the `Navbar` to act as an in-app notification center.
- This bell will poll `alertsApi.getAlerts()` and show a red dot if unread critical/high alerts exist. Clicking it will reveal a dropdown of recent alerts.

## Verification Plan

### Automated/Unit Tests
- Testing `PATCH` alert status via automated cURL requests matching the new API signature `curl -X PATCH -H "Content-Type: application/json" -d '{"status":"resolved"}'` to ensure the 422 error is resolved.

### Manual Verification
1. **Frontend UI Severity:** Trigger the decoy modification test again. Intercept or view the network response in the browser. Verify that the UI displays Risk Score 9 as "Critical" properly.
2. **Onboarding WhatsApp:** Open an incognito browser, create a new user account, and proceed to Onboarding. Fill in a test WhatsApp phone number and verify via the Settings page or Database that it was successfully injected into `notifications.whatsappNumber`.
3. **Email Sending:** In the `.env`, set the correct `SMTP_PASS` for `satwikbhavanari501@gmail.com`. Trigger a manual honeypot log using `curl` and confirm that an email is dispatched successfully.
4. **Notification Center:** Trigger multiple mock alerts. Look at the `Navbar` across all pages. Verify the notification bell displays the unread count and properly opens a list of alerts.
