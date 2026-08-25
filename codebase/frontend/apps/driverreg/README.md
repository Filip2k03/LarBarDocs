# LaBar DriverReg

LaBar DriverReg is the dedicated React Native application used by authorized marketers and registration-center staff to register and verify prospective LaBar drivers on Android and iOS. Prospective drivers do not authenticate to this app or complete self-service registration. Staff-assisted cases use the authoritative Go backend, preserve separate actor and applicant identities, follow backend evidence rules, and remain subject to independent Admin review.

This document is the implementation source of truth for the DriverReg mobile product. UI work must follow the privacy, workflow, API, and state rules below.

## Product boundary

DriverReg collects an application. It does not create an active operational driver by itself.

```text
Authorized marketer/staff sign-in
        ↓
Applicant identity + consent
        ↓
Personal details → NRC → driving licence → face/liveness
        ↓
Vehicle → vehicle evidence → payment details → agreement
        ↓
Review and submit
        ↓
Independent Admin verification
        ├── documents requested → applicant corrects and resubmits
        ├── rejected → reason and support path
        └── approved → activation handoff to LaBar Driver App
```

The operational Driver app must reject login until approval and activation are complete. OCR, face similarity, document quality, and device risk signals assist review; none may silently approve or reject a person.

## Identity model and assisted registration

DriverReg has two distinct people in an assisted case:

- `applicant_user_id`: the prospective driver, established with their own verified phone number.
- `actor_user_id`: the authenticated registrar who captured or edited the record.

These identities must never be merged. Every change records actor, device, timestamp, request ID, and `source_mode=staff_assisted`. A registrar cannot approve a case they created or edited.

DriverReg is exclusively for authorized LaBar marketers and registration-center staff. Prospective drivers never authenticate to this app. The operational Driver app uses phone OTP only after a center-created application is independently approved; it cannot create or edit a registration application. The backend must provide scoped staff-case endpoints that identify the applicant separately from the staff actor. The mobile client never stores applicant data under the marketer's identity.

### Registration authorization invariant

A driver application can be created or changed only when every condition below is true:

1. The request carries a valid, non-expired staff session issued by `/auth/staff/login`.
2. The authenticated account has `driver.registration.create` or `driver.registration.edit` for its assigned branch.
3. The backend derives `actor_user_id` from the session; the client cannot submit or replace it.
4. The backend creates or resolves a separate `applicant_user_id` and scopes the case to that applicant.
5. The staff actor is assigned to the case or has an explicitly audited supervisory permission.
6. Every mutation records actor, applicant, branch, device, source mode, request ID, and timestamp.

The legacy applicant-owned `/driver-registration/application` flow must not be exposed to DriverReg. Merely adding a staff role check to that route is unsafe because it would attach the prospective driver's application to the marketer's user record. Review and approval remain separate admin permissions, and a staff member who created or edited a case cannot approve it.

## Application states

The API is authoritative for application status.

| State | Meaning | Allowed applicant action |
|---|---|---|
| `draft` | Application is editable | Complete or revise steps |
| `submitted` | Snapshot is locked and queued | View status |
| `under_review` | Reviewer is checking evidence | View status and support |
| `documents_requested` | Specific evidence needs correction | Edit requested steps only |
| `verification` | External/manual checks are running | View status |
| `approved` | Registration accepted | Activate/open Driver app |
| `rejected` | Application declined with a reason | View reason and support path |
| `withdrawn` | Applicant withdrew the case | View record; start again only if API permits |

The app must never jump between states locally. Submission is idempotent, and an API response is required before success UI appears.

## Information collected

### Personal identity

- Legal name in English
- Legal name in Myanmar, when applicable
- Preferred display name
- Verified mobile number
- Email, optional
- Date of birth; age is derived and never stored as an independent editable value
- NRC type, state/region, township code, citizenship type, and serial number
- Current address, city, township, and postal context
- Emergency contact name, relationship, and phone
- Profile photograph produced by the guided face flow
- Preferred language: English or Myanmar

### Driving licence

- Licence number
- Licence class
- Issue date
- Expiry date
- Issuing authority
- Front and back images when required
- OCR value, normalized value, confidence, and manual correction reason per field
- Quality flags such as blur, glare, crop, obstruction, and unreadable text

The local reference image at `/idscan/drivinglicencesample.jpeg` is only for camera-mask and OCR-layout development. It must not become runtime applicant data or a production fallback.

### Vehicle

- Vehicle type from backend configuration
- Make, model, year, and color
- Car/plate number and plate jurisdiction
- Passenger capacity
- Chassis/VIN and engine number where policy requires them
- Vehicle registration and expiry
- Insurance provider, policy number, and expiry
- Commercial permits, wheel tax, and inspection expiry where applicable
- Front, rear, left, right, interior, and plate photographs
- Ownership type: applicant, leased, fleet, or authorized third party
- Owner information and authorization evidence when the applicant is not the owner
- Accessibility, child-seat, luggage, EV, delivery, and airport-service capabilities

### Payment and agreement

- Payout method and verified account name
- Provider reference/token only; raw banking secrets are never stored by the app
- Driver agreement version
- Privacy and biometric consent versions
- Applicant declaration
- Registrar attestation in staff-assisted mode

## Screen architecture

### Entry and security

1. **Launch and environment check** — logo, connectivity, maintenance status, minimum-version enforcement.
2. **Staff authentication** — marketer/staff ID, password, optional MFA, device binding, branch, and permission verification.
3. **Select or create applicant case** — the marketer enters applicant identity and phone without applicant OTP; the API creates separate actor and applicant records.
4. **Staff authentication** — organization sign-in, MFA, branch, device binding, and permission summary for assisted mode.
5. **Consent and privacy** — plain-language purpose, document use, biometrics, retention, and signed consent receipt.

### Applicant workflow

6. **Application home** — status, completion percentage calculated from API steps, requested corrections, and one clear next action.
7. **Personal details** — name, DOB with derived age, language, address, and emergency contact.
8. **NRC details** — structured fields followed by front/back capture.
9. **Driving licence capture** — live camera guide, edge framing, glare/blur feedback, front/back capture.
10. **OCR review** — extracted fields grouped by confidence; low-confidence values require explicit human review.
11. **Profile and liveness** — guided face positioning, accessibility alternatives, liveness result, and profile photo selection.
12. **Vehicle details** — backend-provided type, make/model/year/color, plate, capacity, ownership.
13. **Vehicle evidence** — guided shot list with visual angle guides and document expiry fields.
14. **Payout details** — provider choice and tokenized/verified account flow when enabled by remote config.
15. **Agreement** — agreement version, declarations, and downloadable consent receipt.
16. **Review application** — grouped completeness, warnings, editable sections, and immutable evidence summary.
17. **Submit confirmation** — explains locking and review; biometric confirmation may be required by policy.
18. **Status timeline** — submitted, reviewing, correction, verification, approved, or rejected.
19. **Correction request** — reviewer message, required evidence, due date if provided, and resubmission.
20. **Approval handoff** — one-time activation path into LaBar Driver App; never display a reusable activation secret.

### Supporting screens

- Notifications
- Saved drafts and sync state
- Help and support ticket
- Privacy controls and data request
- Device/session management
- Language and accessibility settings
- Secure sign-out

## Navigation model

- Authentication stack: launch, marketer/staff login, optional staff MFA, branch and permission verification.
- Registration stack: home plus step screens.
- Capture stack: full-screen modal camera and review screens.
- Status stack: timeline, correction request, approval handoff.
- Utility stack: notifications, support, settings, legal.

The application home is the only workflow hub. Do not use a consumer-style bottom tab bar during registration. A persistent bottom action area may show `Save and continue`, `Retake`, or `Submit`, but never two competing primary actions.

Back behavior must be predictable:

- Android hardware Back and iOS navigation Back return to the previous safe step.
- Leaving a dirty form opens a save/discard confirmation.
- Back is disabled during a final upload checksum or submission transaction, with a visible cancellable progress state where safe.
- A camera screen returns to its originating document slot.

## Visual direction

The experience should feel official, calm, modern, and human—not like an administrative database form.

### Brand tokens

- Primary red: `#E53935`
- Deep red: `#C62828`
- Safety yellow: `#FFD23F`
- Background: `#F7F7F5`
- Surface: `#FFFFFF`
- Primary text: `#171717`
- Secondary text: `#6B6B6B`
- Success: `#22A447`
- Warning: `#B7791F`
- Error: `#C62828`
- Border: neutral gray with sufficient contrast

Use Poppins for Latin content and a tested Myanmar-capable companion font for Myanmar text. Never force Myanmar glyphs through a font without complete glyph coverage.

### Layout

- Mobile-first portrait layout for 360–430 dp widths.
- Tablet/landscape capture mode may use a centered 600–720 dp content column.
- 8-point spacing grid with 4-point fine adjustments.
- Minimum 44×44 pt on iOS and 48×48 dp on Android for primary touch controls.
- Large rounded cards are reserved for grouping; avoid wrapping every field in a card.
- Sticky progress header and safe-area-aware bottom action bar.
- Keyboard-aware forms with the active field kept visible.

### Icon system

Use a small, original SVG icon set owned by LaBar for registration concepts: identity, NRC, licence, face, vehicle, document, camera, review, correction, approval, and support. Icons use a 24×24 view box, 2 px rounded strokes, no embedded text, and `currentColor` so state is conveyed by icon, label, and color together. Do not use emoji as UI icons.

Platform system icons may be used for native camera, back, share, and accessibility actions where user familiarity is more important than brand expression.

### Dynamic behavior

- Progress changes animate with short 160–220 ms transitions.
- Completed steps resolve into a restrained check state; do not use celebratory animation for identity verification.
- Camera guidance reacts to document position, blur, glare, and crop in real time.
- OCR fields reveal confidence and source without flashing or auto-submitting.
- Upload cards show preparing, uploading, verifying checksum, complete, failed, and retry states.
- Status timeline animates only newly received transitions.
- Respect Reduce Motion on iOS and Remove Animations on Android.
- No 3D scene, decorative WebGL, or motion that obscures document capture.

## Form behavior and validation

- Validate format locally for immediate guidance; the API makes the final decision.
- Show errors beside the field and summarize them above the primary action after submit.
- Preserve entered values when an API call fails.
- Normalize phone, NRC, licence, and plate formats without silently changing meaning.
- Derive age from date of birth using the current date and local timezone. Eligibility rules come from backend configuration.
- Expired documents are visible as blocked requirements, not silently accepted.
- Dates use an accessible native picker with an editable formatted value.
- Required/optional labels remain visible; placeholders are examples, never labels.
- Fields populated by OCR keep their source and confidence metadata after manual correction.
- Applicant corrections record the previous API value through backend audit; the mobile app must not retain its own shadow history.

## Camera, OCR, and face flow

Use `react-native-vision-camera` or the repository-approved equivalent with explicit permission education.

1. Explain why camera access is needed.
2. Request permission only when the applicant starts capture.
3. Display a document-specific guide and quality feedback.
4. Capture at an adequate resolution without applying beauty filters.
5. Strip unnecessary EXIF metadata.
6. Create a checksum and request a presigned upload.
7. Upload directly to configured object storage.
8. Confirm upload with the API.
9. Start OCR/verification only through a real configured service.
10. Show extracted values for human confirmation.

If camera permission is denied, show platform settings guidance and an allowed document-upload alternative only when policy permits it. The app must never claim OCR, liveness, or face matching succeeded without a provider/API result.

## Upload lifecycle

Large images are never embedded as JSON base64.

```text
POST /api/v1/driver-registration/uploads/presign
        ↓
direct PUT to S3, R2, or MinIO signed URL
        ↓
POST /api/v1/driver-registration/uploads/{id}/complete
        ↓
document slot references verified upload metadata
```

Validate MIME type, byte size, pixel dimensions, checksum, ownership, and document type. Retry an interrupted object upload safely without duplicating the application step. Temporary camera files are deleted after confirmed upload or explicit cancellation.

## API integration

Base URLs are environment-controlled:

```env
API_BASE_URL=http://localhost:8080/api/v1
APP_ENV=local
```

Production example:

```env
API_BASE_URL=https://api.labar.com.mm/api/v1
APP_ENV=production
```

### Required DriverReg API contract

| Method | Endpoint | Client use |
|---|---|---|
| `POST` | `/auth/staff/login` | Authenticate an authorized marketer/registrar |
| `POST` | `/auth/refresh` | Rotate refresh token |
| `POST` | `/auth/logout` | Revoke session |
| `GET` | `/auth/me` | Restore current identity and roles |
| `POST` | `/devices/register` | Register Android/iOS push device as `driverreg` |
| `GET` | `/driver-registration/staff/cases` | List cases assigned to the authenticated staff actor |
| `POST` | `/driver-registration/staff/cases` | Create a case with separate applicant and actor identities |
| `GET` | `/driver-registration/staff/cases/{id}` | Load an assigned application |
| `PUT` | `/driver-registration/staff/cases/{id}/steps/{step}` | Save one validated applicant step |
| `POST` | `/driver-registration/uploads/presign` | Create a signed evidence upload |
| `POST` | `/driver-registration/uploads/{id}/complete` | Confirm uploaded object |
| `POST` | `/driver-registration/staff/cases/{id}/submit` | Lock and submit the applicant snapshot |

All calls use the standard `{ success, data, meta }` response and stable error codes. Authentication, refresh rotation, request IDs, timeouts, and error normalization belong in the shared API client—not in screens.

### Backend contracts required before full production

- Optional staff MFA and device-binding challenge policy beyond the implemented password, role, registration-center, lockout, session, and audit controls.
- OCR job creation and result retrieval.
- Liveness and face-evidence result APIs.
- Application correction-request detail suitable for applicant display.
- Notification inbox endpoint for DriverReg.
- Remote registration requirements by city and vehicle type.
- Driver activation invitation/handoff endpoint.

Until these endpoints exist and real providers are configured, the corresponding production action must be disabled or hidden. Runtime fake success is prohibited.

## Step data contract

Recommended stable step keys:

```text
consent
personal
nrc
driving_licence
face_liveness
vehicle
vehicle_documents
payout
agreement
```

Each save sends:

```json
{
  "data": {},
  "complete": false
}
```

`complete` means the client believes local requirements are satisfied. The backend revalidates completeness during submission. Unknown step keys and unknown document types must be rejected.

## Offline and synchronization behavior

- Non-sensitive form drafts may be stored in encrypted device storage.
- Raw NRC, licence, face, and vehicle images must not be copied into general app storage, photo backup, logs, analytics, or crash reports.
- A draft has a server revision/ETag. Sync detects conflicts instead of last-write-wins overwriting.
- The app displays `Saved on device`, `Syncing`, `Saved securely`, or `Needs attention` with a timestamp.
- Staff login, submission, OCR, liveness verification, approval status, and activation always require network confirmation.
- Staff-assisted offline capture is disabled until the backend provides short-lived case credentials and an auditable encrypted sync protocol.

## State and code architecture

Recommended React Native structure:

```text
apps/driverreg/
├── android/
├── ios/
├── src/
│   ├── app/                 # bootstrap, providers, navigation
│   ├── assets/              # logo and local non-PII artwork
│   ├── components/          # reusable form, status, capture UI
│   ├── design-system/       # tokens and original SVG icon components
│   ├── features/
│   │   ├── auth/
│   │   ├── application/
│   │   ├── documents/
│   │   ├── licence-scan/
│   │   ├── biometrics/
│   │   ├── vehicle/
│   │   ├── submission/
│   │   ├── status/
│   │   └── support/
│   ├── lib/                 # API, secure storage, telemetry, dates
│   ├── services/            # endpoint-specific services
│   ├── store/               # serializable workflow state only
│   ├── types/               # API and domain contracts
│   └── utils/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── package.json
└── README.md
```

Use an explicit application workflow/state machine. Screens render states and dispatch commands; they do not decide server transitions. Server data is cached with TanStack Query or the repository-standard equivalent. Local form state uses React Hook Form plus Zod or an equivalent typed validation layer. Sensitive tokens use Keychain on iOS and Keystore-backed encrypted storage on Android.

## Platform behavior

### iOS

- Keychain-backed sessions.
- Camera and photo-library purpose strings written in plain language.
- Safe-area support on all capture and bottom-action screens.
- Dynamic Type, VoiceOver labels, and Reduce Motion.
- Push registration through APNs/FCM device registration after consent.
- Universal Link or custom-scheme approval handoff to Driver app.

### Android

- Keystore-backed sessions and encrypted preferences.
- Runtime camera and notification permission education.
- TalkBack semantics, font scaling, and system back handling.
- Edge-to-edge layout with gesture/navigation-bar insets.
- FCM registration and deep link/App Link approval handoff.
- Prevent sensitive capture screens from appearing in recents/screenshots where policy requires `FLAG_SECURE`.
- Disable Vision Camera frame processors and code scanning until a reviewed OCR provider actually requires them; still-image evidence capture does not ship unused worklets.

## Accessibility and localization

- Target WCAG 2.2 AA principles adapted to native mobile.
- Every icon-only action has an accessible name and hint.
- Status is never communicated by color alone.
- Camera instructions are spoken and available as text.
- Focus moves to the first invalid field and returns predictably from modals.
- Support 200% font scaling without clipped primary actions.
- English and Myanmar are equal product locales; avoid concatenating translated fragments.
- NRC, licence, phone, plate, and dates may remain Latin-script values while surrounding labels localize.

## Security and privacy

- TLS only outside local development.
- No PII, OCR values, document URLs, tokens, or coordinates in analytics/logs.
- Redact request and crash metadata before reporting.
- Certificate pinning may be enabled only with a safe rotation strategy.
- Detect rooted/jailbroken or mock-camera risk as a review signal, not an automatic rejection.
- Clear sensitive clipboard values and temporary files.
- Screenshot blocking is applied to document, NRC, licence, face, and payout screens where platform policy supports it.
- Sessions support remote revocation and device naming.
- Object URLs expire and must never be persisted as public URLs.
- Staff document access requires purpose logging and least-privilege permissions.

## Notifications

Register devices with `app_type=driverreg`. Supported notification events include:

- application submitted
- under review
- documents requested
- document verified or rejected
- application approved or rejected
- activation available
- support reply

Push payloads contain identifiers and routing data, not NRC, licence values, decision details, or other sensitive content. The app fetches the current application from the API after opening a notification.

## Error and recovery design

- `401`: attempt one safe refresh; otherwise return to authentication without deleting a server draft.
- `403`: explain missing staff/applicant permission and provide sign-out/support.
- `409`: refresh application state and show the conflicting change.
- `422`: map field errors to the corresponding input or document slot.
- `429`: show API-provided retry timing; disable repeated staff-login, case-creation, and upload actions.
- `5xx` or network: preserve local edits, show retry, and never display success.
- Upload failure: keep the slot pending and retry the same upload identity when allowed.
- Submission ambiguity: retrieve the application before offering another submission.

## Testing strategy

### Unit

- Application transition guards
- DOB-to-age calculation at timezone/date boundaries
- Phone, NRC, licence, plate, and expiry validation
- OCR confidence presentation
- Required-step calculation
- API error mapping and redaction

### Integration

- Staff login, role enforcement, optional MFA, and refresh rotation
- Create/resume application
- Save and restore each step
- Presign, upload, checksum, and complete
- Quote-free idempotent application submission
- Correction request and resubmission
- Device registration and notification routing

### Native end to end

- Android and iOS fresh install
- Permission allow/deny/retry
- Camera capture and retake
- Keyboard and font scaling
- Process death and secure restore
- Offline draft recovery
- Deep-link approval handoff
- Screen-reader navigation

Test fixtures use synthetic identities and exist only in automated tests. The former static `src/RegistrationFlow.tsx` prototype and its fake alert submission have been removed from the production entry point.

## Local setup

Requirements are Node.js 22.11 or later, npm, JDK 17, Android Studio with Android SDK 37, and—on macOS for iOS—full Xcode plus CocoaPods.

```bash
cd codebase/frontend/apps/driverreg
cp .env.example .env
npm install
npm start
```

In a second terminal, run Android with `npm run android`. For iOS, install pods with `cd ios && bundle exec pod install && cd ..`, then run `npm run ios`. A physical Android device should use a reachable LAN API URL rather than the emulator-only `10.0.2.2` host. Do not commit `.env`, Firebase service files, APNs configuration, or signing credentials.

Before a release, run:

```bash
npm run check
npm run build:android
```

Production Android builds require a private release keystore and Play App Signing configuration. Release builds never fall back to the checked-in debug key and enable R8 code and resource shrinking. Supply signing values through the build environment:

```bash
export LABAR_ANDROID_KEYSTORE_FILE=/secure/path/labar-driverreg-release.keystore
export LABAR_ANDROID_KEYSTORE_PASSWORD='managed-secret'
export LABAR_ANDROID_KEY_ALIAS=labar-driverreg
export LABAR_ANDROID_KEY_PASSWORD='managed-secret'
```

Production iOS builds require an Apple team, an explicit App ID, APNs entitlement, associated domains, and release provisioning profiles.

## Implementation phases

1. **Foundation** — React Native Android/iOS projects, environment config, design tokens, original SVG icons, navigation, error boundary, API client, secure session storage.
2. **Identity** — staff authentication, applicant profile, actor/applicant separation, consent, and device registration.
3. **Application forms** — typed step schemas, autosave, revision handling, personal/NRC/vehicle/payout/agreement screens.
4. **Evidence** — camera, presigned upload, checksum confirmation, guided document slots, secure temporary-file cleanup.
5. **Verification** — real OCR and face/liveness provider integration, confidence review, correction reasons.
6. **Submission and status** — review, idempotent submit, timeline, correction workflow, push routing, Driver app handoff.
7. **Hardening** — accessibility, localization, native E2E, privacy review, threat model, performance and release pipelines.

## Definition of done

- Android and iOS builds succeed from clean checkouts.
- No runtime mock API, fake OCR, fake face result, fake upload, or fake submission exists.
- Applicant and staff identities remain distinct and auditable.
- Every required field and document maps to a typed API contract.
- Draft recovery survives app restart without leaking sensitive media.
- Submission and approval UI appear only from authoritative API states.
- Camera, permission, offline, error, correction, and accessibility paths are tested.
- English and Myanmar layouts work at supported font scales.
- Production behavior changes only through environment variables and remote configuration.
