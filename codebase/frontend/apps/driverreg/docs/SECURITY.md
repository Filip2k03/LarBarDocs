# DriverReg Mobile Security

## Controls

- Access and refresh tokens use Keychain/Keystore-backed `react-native-keychain`; they never use AsyncStorage or MMKV.
- Android applies `FLAG_SECURE` to prevent screenshots and recents previews. iOS obscures the app window when inactive.
- Camera media remains in temporary application storage, is excluded from preferences/analytics, and must be deleted after confirmed upload or explicit cancellation.
- Evidence uploads use short-lived signed URLs and server-confirmed SHA-256 metadata. Base64 JSON uploads are prohibited.
- API requests use TLS outside local development, bounded timeouts, normalized errors, request IDs, refresh rotation, and one retry after `401`.
- Deep links accept only declared DriverReg routes. Activation uses a fixed configured Driver app scheme, never an arbitrary redirect from input.
- Push notifications contain identifiers and safe routing only. Opening a push fetches the current API application.
- Analytics events exclude phone, NRC, licence, address, names, OCR content, biometrics, document URLs, and coordinates.
- Root/jailbreak/debug signals may be forwarded as review signals only; the client never rejects a human.
- DriverReg fails closed until the backend authenticates registration staff and records applicant and actor separately with device, time, request ID, and source mode.

## Provider trust

OCR, liveness, storage, push, payout, support, and analytics are adapters. Missing configuration disables the capability. The UI never translates a provider timeout or capture failure into applicant rejection, approval, or verification.

## Release requirements

- Replace debug Android signing for release.
- Configure production TLS hosts and associated domains/App Links.
- Supply FCM/APNs application files through secure release infrastructure.
- Complete privacy manifest/data disclosure review for every native SDK.
- Verify temporary-file cleanup, log redaction, session revocation, and screenshot protections on physical devices.
