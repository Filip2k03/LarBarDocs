# 🪪 LaBar DriverReg Staff-Assisted Application

`DriverReg` is a dedicated, staff-bound mobile application designed for branch registrars and authorized field agents to capture, verify, and submit driver identity and vehicle compliance records.

---

## 🔒 Security & Trust Boundaries
1. **No Operational Driver Login**: Prospective drivers cannot log in to the operational **LaBar Driver App** until their `DriverReg` KYC case is independently reviewed and approved by a central KYC Manager.
2. **Device Short-Lived Case Tokens**: Capture sessions are cryptographically bound to the authenticated staff member's device.
3. **Assistive OCR**: On-device camera scans extract licence number, full name, NRC, date of birth, class, and expiry date as an assistive pre-fill. A human KYC reviewer makes the final authoritative decision.
4. **Separation of Duties**: The registrar who registers a driver cannot approve the same case.

---

## 📱 10-Step Registration Flow
1. **Staff Sign-in (MFA Protected)**
2. **Consent & Case Initialization**
3. **Personal Details & Mobile Verification**
4. **NRC Smartcard Capture (Front & Back)**
5. **Myanmar Driving Licence Camera Scan**
6. **Assistive OCR Review & Confidence Verification**
7. **Active 3D Liveness & Face Similarity Selfie**
8. **Vehicle & Commercial Compliance Records**
9. **Review & Case Snapshot Submission**
10. **Case Status Tracking & Handoff**
