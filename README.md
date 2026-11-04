# ELVORA — Premium Social Voice App Starter

ELVORA is an original premium social-community app starter with a dark violet, plum and gold visual identity. It uses circular profile-photo seats in voice rooms; **there are no 3D characters or 3D avatar models**.

## Included in this starter

- Responsive React mobile interface with Home, Discover, Voice Rooms, Messages, Profile and Communities.
- Circular profile-photo placeholders, online indicators and an 8-seat room stage.
- Room discovery and local room preview interactions.
- Gift catalogue, demo credits wallet and VIP membership preview.
- Local demo chat, community join toggles, settings and safety-preview screens.
- Vite build setup, Capacitor Android configuration and GitHub Actions debug-APK workflow.

## Important: what is and is not live

This is a front-end starter/demo. It does **not** yet include production authentication, real-time voice transport, cross-device chat, synced presence, paid diamonds, payment processing, real gift delivery, or a production admin backend. Buttons that depend on those services are marked or behave as previews. Do not represent this as a finished live social network.

## Build

Requires Node.js 20+.

```bash
npm install
npm run build
```

## Android

The GitHub Actions workflow builds a **debug APK** for testing. It is not a signed production release.

## Before inviting users

Configure a backend for authentication, profiles, chat, room membership and server-side moderation. Integrate a voice provider such as LiveKit through a secure server-side token endpoint; never expose provider API secrets in client code. Add database access policies, abuse reporting, blocking, rate limits, privacy/data deletion, and appropriate age protections. Test voice, reconnects, moderation and account controls with multiple test accounts and devices. Do not enable real-money purchases until compliant payment, refund, age and platform requirements are reviewed.
