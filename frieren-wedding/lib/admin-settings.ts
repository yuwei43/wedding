export function adminCookieSecure(env: { NODE_ENV?: string; ADMIN_COOKIE_SECURE?: string }) {
  // Explicit deployment opt-in is needed for temporary HTTP administration.
  return env.NODE_ENV === 'production' && env.ADMIN_COOKIE_SECURE !== 'false';
}

export function adminRedirect(error = false) {
  // A relative Location preserves the browser's public host, protocol and port.
  return new Response(null, { status: 303, headers: {
    Location: error ? '/admin?error=1' : '/admin', 'Cache-Control': 'no-store',
  } });
}
