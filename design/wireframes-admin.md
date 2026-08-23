# Admin Control Center Wireframes & UX Flow

The Admin Control Center is the desktop surface for driver verification, staff provisioning, security controls, and audit evidence.

## Prototype

- [Launch interactive Admin Control Center prototype](/prototypes/admin-control-center.html)
- [Open Figma-importable master canvas](/wireframes/labar_master_figma_canvas_v2.svg)

## Core areas

1. Staff sign-in with passkey/password and mandatory MFA
2. Operations dashboard and driver-verification queue
3. Side-by-side document, OCR, liveness, and identity comparison
4. Approve, request correction, or reject with required reason
5. Staff directory and restricted account invitation
6. Role and permission review
7. Immutable audit log and session revocation

`GOD_ADMIN` is a break-glass role. `CEO`, `CTO`, and `PSO` share the same `EXEC_SUPERADMIN` permissions. Limited staff registrars cannot grant executive or administrative roles.
