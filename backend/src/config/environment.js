import dotenv from 'dotenv';
dotenv.config();
const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
if (process.env.JWT_SECRET.length < 32 && process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET must be at least 32 characters in production');
export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  timezone: process.env.BUSINESS_TIMEZONE || 'Africa/Lagos',
  uploadDir: process.env.UPLOAD_DIR || './storage/uploads',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 30),
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || '',
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
  paystackCallbackUrl: process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:3000/payment-result.html'
};
