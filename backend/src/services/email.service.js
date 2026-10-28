// Email provider integration intentionally left configurable; no email credentials were supplied.
export async function sendBookingConfirmation() {
  return { sent: false, reason: 'Email delivery is not configured. Booking details are returned in the API response.' };
}
