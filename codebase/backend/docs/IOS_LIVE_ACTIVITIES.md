# iOS Live Activities

Passenger and driver apps register ActivityKit push tokens through their `/live-activities/register` endpoint with ride, device, activity type and expiry. These are separate from ordinary APNs device tokens.

APNs uses topic `<bundle-id>.push-type.liveactivity`, push type `liveactivity`, priority 10, timestamp, event and content state. The client owns Activity attributes and Dynamic Island, Lock Screen and dismissal UI.
