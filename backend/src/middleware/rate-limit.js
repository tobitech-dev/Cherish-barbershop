// Lightweight process-local limiter for development. Use a shared store/edge limiter in production.
const buckets = new Map();
export function rateLimit({ windowMs = 60000, max = 30 } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const item = buckets.get(key);
    if (!item || now - item.start > windowMs) buckets.set(key, { start: now, count: 1 });
    else if (++item.count > max) return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    next();
  };
}
