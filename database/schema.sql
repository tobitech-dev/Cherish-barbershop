CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE IF NOT EXISTS users (
 id BIGSERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(254) NOT NULL UNIQUE,
 password_hash TEXT NOT NULL, phone VARCHAR(30), role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK(role IN ('customer','owner')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS services (
 id BIGSERIAL PRIMARY KEY, name VARCHAR(120) NOT NULL, description TEXT NOT NULL DEFAULT '',
 price_kobo INTEGER NOT NULL CHECK(price_kobo>=0), duration_minutes INTEGER NOT NULL CHECK(duration_minutes BETWEEN 10 AND 360),
 active BOOLEAN NOT NULL DEFAULT TRUE, sort_order INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS barbers (
 id BIGSERIAL PRIMARY KEY, name VARCHAR(120) NOT NULL, bio TEXT NOT NULL DEFAULT '', photo_url TEXT NOT NULL DEFAULT '',
 active BOOLEAN NOT NULL DEFAULT TRUE, sort_order INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS bookings (
 id BIGSERIAL PRIMARY KEY, customer_id BIGINT NOT NULL REFERENCES users(id), service_id BIGINT NOT NULL REFERENCES services(id),
 barber_id BIGINT REFERENCES barbers(id), booking_date DATE NOT NULL, start_at TIMESTAMPTZ NOT NULL, end_at TIMESTAMPTZ NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK(status IN ('pending','confirmed','cancelled','rejected','completed')),
 payment_choice VARCHAR(20) NOT NULL DEFAULT 'shop' CHECK(payment_choice IN ('shop','full','deposit')),
 payment_status VARCHAR(20) NOT NULL DEFAULT 'pay_at_shop' CHECK(payment_status IN ('pay_at_shop','pending','deposit_paid','paid','failed','refunded')),
 amount_kobo INTEGER NOT NULL CHECK(amount_kobo>=0), notes VARCHAR(500),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(end_at > start_at)
);
-- Prevent overlaps for the same assigned barber. Unassigned appointments are guarded by transaction logic in the service.
DO $$ BEGIN
 ALTER TABLE bookings ADD CONSTRAINT booking_no_overlap_per_barber EXCLUDE USING gist
 (barber_id WITH =, tstzrange(start_at,end_at,'[)') WITH &&)
 WHERE (barber_id IS NOT NULL AND status NOT IN ('cancelled','rejected'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS bookings_customer_idx ON bookings(customer_id,start_at DESC);
CREATE INDEX IF NOT EXISTS bookings_date_idx ON bookings(booking_date,status);
CREATE TABLE IF NOT EXISTS payment_transactions (
 id BIGSERIAL PRIMARY KEY, booking_id BIGINT NOT NULL REFERENCES bookings(id), reference VARCHAR(150) NOT NULL UNIQUE,
 amount_kobo INTEGER NOT NULL, status VARCHAR(30) NOT NULL, mode VARCHAR(20) NOT NULL,
 provider_transaction_id VARCHAR(100), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS media (
 id BIGSERIAL PRIMARY KEY, kind VARCHAR(10) NOT NULL CHECK(kind IN ('image','video')), url TEXT NOT NULL,
 alt_text VARCHAR(250) NOT NULL DEFAULT '', section VARCHAR(50) NOT NULL DEFAULT 'gallery',
 uploaded_by BIGINT REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS reviews (
 id BIGSERIAL PRIMARY KEY, display_name VARCHAR(100) NOT NULL, rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
 body TEXT NOT NULL, published BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS site_settings (
 key VARCHAR(100) PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO site_settings(key,value) VALUES
 ('business_name','CHERISH BARBERSHOP'),
 ('address','Shop 3, Ogunyase St, adjacent CAC Church, Agbowo, off University of Ibadan, Ibadan 200284, Oyo, Nigeria'),
 ('phone','+234 915 728 2762'),
 ('hours_weekdays','Monday–Saturday: 9:00 AM–9:00 PM'),
 ('hours_sunday','Sunday: 3:00 PM–8:00 PM'),
 ('map_url','https://maps.google.com/?cid=9450189421701499693')
ON CONFLICT(key) DO NOTHING;
