// Minimal URL resolution that does not depend on the platform URL implementation,
// which is incomplete in React Native.
const ABSOLUTE = /^([a-z][a-z0-9+.-]*:)\/\/([^/?#]*)([^?#]*)(\?[^#]*)?(#.*)?$/i;

export type ParsedUrl = {
  protocol: string;
  host: string;
  pathname: string;
  search: string;
};

export function parseUrl(url: string): ParsedUrl | null {
  const m = ABSOLUTE.exec(url.trim());
  if (!m) return null;
  return {
    protocol: m[1].toLowerCase(),
    host: m[2].toLowerCase(),
    pathname: m[3] || '/',
    search: m[4] ?? '',
  };
}

function normalizePath(path: string): string {
  const out: string[] = [];
  const segments = path.split('/');
  segments.forEach((seg, i) => {
    if (seg === '..') {
      if (out.length > 1) out.pop();
      if (i === segments.length - 1) out.push('');
    } else if (seg === '.') {
      if (i === segments.length - 1) out.push('');
    } else {
      out.push(seg);
    }
  });
  const joined = out.join('/');
  return joined.startsWith('/') ? joined : `/${joined}`;
}

/** Resolves `href` against `base`. Returns null for non-http(s) or unparseable URLs. */
export function resolveUrl(href: string, base: string): string | null {
  const raw = href.trim();
  if (!raw) return null;
  const baseUrl = parseUrl(base);
  if (!baseUrl) return null;

  let resolved: string;
  if (ABSOLUTE.test(raw)) {
    resolved = raw;
  } else if (raw.startsWith('//')) {
    resolved = `${baseUrl.protocol}${raw}`;
  } else if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    return null;
  } else if (raw.startsWith('/')) {
    resolved = `${baseUrl.protocol}//${baseUrl.host}${raw}`;
  } else if (raw.startsWith('?') || raw.startsWith('#')) {
    resolved = `${baseUrl.protocol}//${baseUrl.host}${baseUrl.pathname}${raw}`;
  } else {
    const dir = baseUrl.pathname.replace(/[^/]*$/, '');
    resolved = `${baseUrl.protocol}//${baseUrl.host}${dir}${raw}`;
  }

  const parsed = parseUrl(resolved);
  if (!parsed || (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')) return null;
  return `${parsed.protocol}//${parsed.host}${normalizePath(parsed.pathname)}${parsed.search}`;
}

export function sameSite(a: string, b: string): boolean {
  const strip = (h: string) => h.replace(/^www\./, '');
  const pa = parseUrl(a);
  const pb = parseUrl(b);
  return !!pa && !!pb && strip(pa.host) === strip(pb.host);
}
