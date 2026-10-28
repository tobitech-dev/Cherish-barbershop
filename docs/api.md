# API overview
- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/services`, `GET /api/barbers`
- `GET /api/bookings/availability?date=YYYY-MM-DD&serviceId=...&barberId=...`
- `POST /api/bookings`, `GET /api/bookings/mine`, `PATCH /api/bookings/:id/cancel`
- `POST /api/payments/initialize`, `GET /api/payments/verify/:reference`, `POST /api/payments/webhook`
- `GET /api/content`, `GET /api/media`
- `/api/admin/*` owner-only routes for bookings, services, barbers, media and settings
