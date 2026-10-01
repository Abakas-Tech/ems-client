// Shared phone-number rule for every phone field in the app. Mirrors the
// backend's utils/validation/phone.util.js exactly, so a number accepted
// here is accepted by the API too (the backend still re-validates):
// - any country code: optional leading "+" followed by the number
// - spaces (and "-", "(", ")") allowed between digit groups,
//   e.g. "+966 50 123 4567" or "+1 (555) 123-4567"
// - 7–15 digits in total, at most 30 characters overall
export const PHONE_MIN_DIGITS = 7;
export const PHONE_MAX_DIGITS = 15;
export const PHONE_MAX_LENGTH = 30;

const PHONE_PATTERN = /^\+?[0-9\s\-()]+$/;

export const PHONE_ERROR_MESSAGE = `Enter a valid phone number (optional +country code, ${PHONE_MIN_DIGITS}-${PHONE_MAX_DIGITS} digits, spaces allowed).`;

export const isValidPhone = (value) => {
  if (typeof value !== "string") return false;
  const phone = value.trim().replace(/\s+/g, " ");
  if (!phone || phone.length > PHONE_MAX_LENGTH) return false;
  if (!PHONE_PATTERN.test(phone)) return false;
  const digitCount = phone.replace(/\D/g, "").length;
  return digitCount >= PHONE_MIN_DIGITS && digitCount <= PHONE_MAX_DIGITS;
};
