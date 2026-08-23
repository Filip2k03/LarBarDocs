# Android Live Notifications

Android installations register an FCM token and app type through `/devices/register`. FCM HTTP v1 data categories allow the app to select a high-priority ride channel, foreground-service notification or ordinary notification.

The client owns foreground service lifecycle and channels. The backend owns real offer expiry, ride state and event data and never synthesizes client GPS.
