// Explicit public entry points for this invitation, not arbitrary Host headers.
export const invitationOrigins = ['http://124.220.19.31', 'http://124.220.19.31:3000'];

function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch { return null; }
}

export function validRequestOrigin(request: Request, siteOrigin: string | undefined, publicRsvp = false): boolean {
  const origin = normalizeOrigin(request.headers.get('origin'));
  if (!origin) return false;
  const expected = siteOrigin ? normalizeOrigin(siteOrigin) : new URL(request.url).origin;
  return origin === expected || (publicRsvp && invitationOrigins.includes(origin));
}
