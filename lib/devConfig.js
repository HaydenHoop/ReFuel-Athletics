// ── Developer Access Control ──────────────────────────────────────────────────
// Add email addresses here to grant developer access.
// Developers get: user directory, review management, formula admin, test emails, red border.

export const DEV_EMAILS = [
  'haydenthooper@icloud.com',  
  // 'teammate@email.com',
];

export function isDeveloper(email) {
  if (!email) return false;
  return DEV_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
}
