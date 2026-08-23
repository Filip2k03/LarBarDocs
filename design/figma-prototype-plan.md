# LaBar Multi-App Figma Prototype Plan

This plan converts the legacy taxi flow into a testable product prototype with five distinct surfaces: Passenger, Driver, Guardian, DriverReg, and Admin Control Center. The source of truth is this document plus `design-system/figma_tokens.json`; the SVG canvases in `public/wireframes/` are import-ready for Figma.

## 1. Prototype objectives

1. Test the complete passenger-to-driver ride lifecycle without mixing onboarding and trip operations.
2. Let authorized staff register a driver with camera-assisted document capture, OCR autofill, face/liveness verification, and manual review.
3. Give LaBar administrators a permission-safe way to approve drivers and provision staff.
4. Make emergency controls discreet during ordinary use while remaining reachable within one deliberate action.
5. Preserve Myanmar-specific NRC, driving licence, commercial vehicle, language, and payment requirements.

## 2. Figma file structure

Use one team file named `LaBar Product Ecosystem — Prototype v2` with these pages:

| Page | Contents | Frame convention |
|---|---|---|
| `00 Cover & Read Me` | Product map, prototype links, owners, version history | Desktop 1440 |
| `01 Foundations` | Color, typography, grid, elevation, icon, motion, localization | Desktop 1440 |
| `02 Components` | Inputs, buttons, cards, steppers, status chips, scan masks, drawers | Component sets |
| `10 Passenger App` | Booking, dispatch, trip, chat, payment, rating, Safety Drawer | Mobile 390×844 |
| `20 Driver App` | Shift, offer, pickup, trip, payout, concealed Safety Drawer | Mobile 390×844 |
| `30 Guardian App` | Family pairing, live shield, alert escalation | Mobile 390×844 |
| `40 DriverReg App` | Staff login and complete driver KYC | Mobile 390×844 |
| `50 Admin Control Center` | Driver review, staff provisioning, audit | Desktop 1440×1024 |
| `60 Flows & States` | Happy paths, failure states, permissions, offline states | FigJam-style map |
| `90 Archive` | Legacy imported taxi flow and deprecated screens | Original size |

Naming: `APP / FLOW / NN Screen / State`, for example `DRIVERREG / Licence Scan / 03 Camera / OCR Success`.

## 3. Application inventory

### Passenger App

- Sign in/registration, profile, guardians, favorites, and order history.
- Pickup, destination, multiple stops, vehicle tier, fare estimate, and payment preference.
- 15-second cascading driver search, assigned-driver tracking, chat, and cancellation.
- In-trip navigation, permissioned route changes, fare meter, payment, receipt, and rating.
- Collapsed Safety Drawer available from the persistent shield icon.

### Driver App

- Account activation only after DriverReg approval.
- Shift state, ride offers, pickup navigation, chat, meter, payment collection, earnings, and payout.
- CCTV/GPS Protecting Mode status.
- Collapsed Safety Drawer plus covert hardware shortcut; responder alerts remain interruptive.

### Guardian App

- Family pairing, permission status, live trip/shift tracking, deviation alerts, and arrival confirmation.
- Driver/family contact actions and emergency escalation with clear consent boundaries.

### DriverReg App

- Staff-authenticated, session-bound registration; no anonymous KYC upload.
- Driver consent, personal details, NRC, driving licence OCR, face/liveness match, vehicle/commercial documents, review, submission, and case status.
- Draft/offline capture with encrypted local storage and explicit sync state.

### Admin Control Center

- Driver verification queue with SLA, risk flags, comparison view, approve/rework/reject decisions, and immutable audit entries.
- Staff directory, invitation, role assignment, suspension, session revocation, and audit log.
- System health summary without exposing raw identity documents to roles that do not need them.

## 4. DriverReg screen map

| # | Screen | Required content and interaction |
|---|---|---|
| 01 | Staff sign-in | Staff ID/phone, password or passkey, MFA, branch/device identity, privacy notice |
| 02 | Consent & case start | Driver consent, purpose, retention summary, assisted-registration staff identity, case ID |
| 03 | Personal details | Full legal name, DOB, computed age, phone, address, emergency contact, preferred language |
| 04 | NRC capture | Front/back camera capture, NRC number parser, state/township/type, masked display, quality checks |
| 05 | Driving licence scan | Camera mask using `/idscan/drivinglicencesample.jpeg`, front/back scan, OCR confidence per field |
| 06 | OCR review | Licence no., name, NRC, DOB, blood type, licence class, issued/expiry dates, address; low-confidence fields highlighted |
| 07 | Face & liveness | Guided selfie, blink/turn challenge, face-to-document score, retry and manual-review path |
| 08 | Vehicle details | Plate, vehicle type, make, model, year, color, seats, fuel, chassis/VIN, engine no., owner relationship |
| 09 | Commercial compliance | RTAD registration, inspection expiry, insurance, wheel tax, operating zone, CCTV capability |
| 10 | Review & submit | Section status, mismatches, declarations, staff attestation, driver signature/consent receipt |
| 11 | Case status | Draft, submitted, in review, needs correction, approved, rejected; reviewer notes and resubmit |
| 12 | Activation | Driver ID, account invite, temporary activation QR, training checklist, first-login handoff |

Age is calculated from DOB at display time and is not stored as a second authoritative field.

## 5. Driver data model

### Identity

- Legal name in English and Myanmar script
- Date of birth; calculated age; gender only when legally required
- Mobile number, email (optional), residential address, township, state/region
- NRC number and normalized components; front/back encrypted media references
- Profile image, liveness result, face-match score, match provider/version
- Emergency contact name, relationship, and phone

### Driving licence

- Licence number, class, issue date, expiry date, issuing office, status
- OCR raw result, normalized values, confidence per field, manual corrections, reviewer identity
- Front/back encrypted media references and duplicate-document fingerprint

### Vehicle

- Plate/car number, vehicle type, service tier, make, model, year, color, seat capacity
- Chassis/VIN, engine number, fuel/powertrain, owner name and relationship to driver
- RTAD commercial registration, inspection expiry, insurance policy/expiry, wheel-tax expiry
- Accessibility notes, air conditioning, child-seat option, CCTV/GPS hardware IDs and capability status

### Case and governance

- Case ID, source branch, registering staff ID, reviewer ID, status, risk flags, correction reasons
- Consent version/time, capture device ID, submission time, decision time, complete audit trail
- Media retention policy, deletion schedule, legal hold, and access history

## 6. OCR and face verification behavior

1. Detect document edges, glare, blur, cropping, and front/back side before upload.
2. OCR the licence and normalize Myanmar/English numerals and dates.
3. Autofill only high-confidence values (recommended threshold ≥ 0.90). Show 0.75–0.89 for confirmation and require manual entry below 0.75.
4. Cross-check name, NRC, DOB, licence class, and expiry against NRC and selfie inputs.
5. Run liveness before face comparison. Never treat face similarity as the sole approval decision.
6. Send mismatches, expired documents, duplicates, or low-confidence captures to manual review.
7. Encrypt images in transit and at rest, mask identity numbers in lists, and audit every full-document view.

## 7. Staff access model

| Role | Purpose | Driver cases | Staff accounts | System/security |
|---|---|---|---|---|
| `GOD_ADMIN` | Break-glass platform owner | All | Create/revoke executive superadmins | All; hardware MFA; no daily use |
| `EXEC_SUPERADMIN` (`CEO`, `CTO`, `PSO`) | Equal executive administrators | All + final override | Create all non-GOD roles | Configuration, audits, session revoke |
| `KYC_MANAGER` | Owns verification operation | Assign/approve/reject | None | KYC reports only |
| `KYC_REVIEWER` | Reviews submitted cases | Review/rework/approve within policy | None | No global config |
| `DRIVER_REGISTRAR` | Captures applications | Create/edit own branch drafts; submit | None | No approval |
| `STAFF_REGISTRAR` | Limited staff onboarding | No identity-document access | Invite only marketer/support/registrar roles | No role elevation |
| `MARKETER` | Driver acquisition and campaigns | Create leads; start consented draft | None by default | Aggregated reports only |
| `SUPPORT` | Driver/passenger support | Masked lookup; correction ticket | None | No document download |
| `AUDITOR` | Independent oversight | Read-only with reason prompt | Read-only | Export signed audit reports |

`CEO`, `CTO`, and `PSO` are labels on the same `EXEC_SUPERADMIN` permission set. A marketer may receive the separate `STAFF_REGISTRAR` scope, but that scope cannot create or promote any administrator, executive, auditor, or security role.

## 8. Discreet Safety Drawer

- Replace the large always-visible SOS button in normal passenger/driver screens with a persistent shield icon and a collapsed drawer.
- Open by tapping the shield or using the documented accessibility shortcut. Driver covert shortcuts may include a configured hardware-button sequence.
- Drawer actions: `Call emergency services`, `Alert LaBar Safety`, `Share live location`, `Record evidence`, and `Silent SOS` where supported.
- Trigger requires a two-second hold, then a short cancel countdown to reduce accidental activation. A silent/covert mode suppresses on-device confirmation.
- Active incidents cannot be hidden: show a persistent status strip, responder state, and safe cancel/resolve path.
- Keep the control reachable by screen readers and within one deliberate action; “hidden” means visually collapsed, not undiscoverable.

## 9. Prototype interactions to wire in Figma

- Use component variants for default, focus, filled, error, disabled, scanning, OCR success, and manual-review states.
- Use Smart Animate at 200–250 ms for drawers and steppers; no animation on emergency confirmation.
- Connect DriverReg happy path 01→12, plus branches for blurry scan, expired licence, face mismatch, offline draft, and reviewer correction.
- Connect Admin login→queue→case comparison→decision and login→staff directory→invite→role confirmation.
- Add one realistic usability-test scenario per app and a reset hotspot on every terminal screen.

## 10. Definition of done

- Every frame uses tokens/components, an 8-point spacing grid, and English/Myanmar-safe text styles.
- All interactive elements have labels, focus order, minimum 44×44 touch targets, and WCAG AA contrast.
- Sensitive values are masked outside detail views and demo records are clearly synthetic.
- Every approval, rejection, role change, and document view appears in the audit prototype.
- Product, KYC operations, security, and a Myanmar compliance reviewer sign off before implementation.

## 11. Native `.fig` handoff

Figma's native `.fig` container is proprietary and is not generated reliably outside Figma. Import `public/wireframes/labar_master_figma_canvas_v2.svg` and the individual SVG frames, load `design-system/figma_tokens.json` with Tokens Studio, convert repeated groups to components, then save/export from Figma as the authoritative `.fig` file.
