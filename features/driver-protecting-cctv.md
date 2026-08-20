# 📹 Driver Protecting Mode & CCTV Pipeline

**Driver Protecting Mode** provides hardware-level recording, telemetry logging, and cryptographic cloud archival to protect drivers against false claims, accidents, and security incidents.

---

## 🎥 Video Recording & Streaming Pipeline

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             IN-CAR CCTV HARDWARE & UPLOAD PIPELINE                               │
│                                                                                                  │
│  [CameraX / AVFoundation] ──► [H.264 1080p Chunk (60s)] ──► [SHA-256 Digest] ──► [S3 Encrypted]   │
│                                                                        │                         │
│  [GPS Foreground Service] ──► [Speed / Heading / G-Force] ─────────────┴──► [PostgreSQL Log]    │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Partitioned Rolling Video Chunks**:
   - Video is recorded in **60-second MP4 chunks** (1080p @ 30fps, H.264 / AAC).
   - Each chunk is written to a ring buffer in app sandboxed storage.
2. **Cryptographic SHA-256 Verification**:
   - Before uploading, the client computes the SHA-256 hash of the video chunk.
   - The backend verifies the hash upon receiving the file in S3 to guarantee video footage integrity against tampering.
3. **Turn-by-Turn Digital Fare Meter**:
   - Real-time synchronization between GPS distance traveled, elapsed wait time, and calculated fare shown on the driver HUD.
