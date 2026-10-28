# CHERISH BARBERSHOP — Full-stack booking platform

A working starter implementation with responsive multi-page frontend, Express API, PostgreSQL schema, customer/admin authentication, appointment availability, double-booking protection, admin content management, secure media uploads and Paystack payment hooks.

## Requirements
- Node.js 20+
- PostgreSQL 14+
- Paystack account for online payments (optional until configured)

## Run locally
1. Create a PostgreSQL database named `cherish_barbershop`.
2. Copy `backend/.env.example` to `backend/.env` and configure it.
3. In a terminal:
   ```bash
   cd backend
   npm install
   npm run db:init
   npm run admin:create
   npm run dev
   ```
4. Visit http://localhost:3000

## First admin
Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` before running `npm run admin:create`. Use a strong unique password. The command creates an owner account if one does not already exist.

## Known business details
CHERISH BARBERSHOP  
Shop 3, Ogunyase St, adjacent CAC Church, Agbowo, off University of Ibadan, Ibadan 200284, Oyo, Nigeria  
Phone: +234 915 728 2762  
Hours: Monday–Saturday 9:00 AM–9:00 PM; Sunday 3:00 PM–8:00 PM  
Map: https://maps.google.com/?cid=9450189421701499693

Services, prices, staff profiles and social links are intentionally not invented. Add them through the admin dashboard after setup.

## Features and notes
- Booking slot availability is calculated on the server.
- PostgreSQL exclusion/unique protections plus a transaction protect against overlapping bookings.
- Owner can manage service records, booking statuses, site settings and upload images/videos.
- Paystack supports full payment or a deposit when configured; pay-at-shop is also supported.
- Local uploads are for development. Use persistent object storage for production deployments.
- Configure HTTPS, secure secrets, backups, email delivery and production storage before launch.
