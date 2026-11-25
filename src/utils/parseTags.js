const EXTERNAL_URL_RE = /^https?:\/\/\S+$/i;
const MAILTO_URL_RE = /^mailto:\S+$/i;
const EXPLICIT_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;
const BARE_DOMAIN_RE =
  /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d+)?(?:[/?#]\S*)?$/i;
const MARKDOWN_LINK_RE = /^\[([^\]]+)\]\((.+)\)$/;

/**
 * Validates and normalizes an optional tag URL against a safe protocol allowlist.
 * Returns a normalized URL string, or null if invalid or unsafe.
 */
export function normalizeTagUrl(rawTarget) {
  if (typeof rawTarget !== 'string') return null;
  const trimmed = rawTarget.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;

  if (EXTERNAL_URL_RE.test(trimmed) || MAILTO_URL_RE.test(trimmed)) {
    return trimmed;
  }

  // Relative path (excluding protocol-relative //) or non-empty fragment anchor
  if (
    (trimmed.startsWith('/') && !trimmed.startsWith('//')) ||
    (trimmed.startsWith('#') && trimmed.length > 1)
  ) {
    return trimmed;
  }

  // Reject all other explicit schemes (e.g., javascript:, data:, vbscript:)
  if (EXPLICIT_SCHEME_RE.test(trimmed)) {
    return null;
  }

  // Normalize bare domains like github.com/user/repo -> https://github.com/user/repo
  if (BARE_DOMAIN_RE.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return null;
}

/**
 * Returns true if the URL is an external http(s) link.
 */
export function isExternalTagUrl(url) {
  return typeof url === 'string' && EXTERNAL_URL_RE.test(url);
}

/**
 * Splits a comma-separated tag string while ignoring commas nested inside [...] or (...).
 */
function splitTagTokens(rawString) {
  const tokens = [];
  let current = '';
  let bracketDepth = 0;
  let parenDepth = 0;

  for (let i = 0; i < rawString.length; i++) {
    const ch = rawString[i];

    if (ch === '[') {
      bracketDepth++;
      current += ch;
    } else if (ch === ']') {
      bracketDepth = Math.max(0, bracketDepth - 1);
      current += ch;
    } else if (ch === '(') {
      parenDepth++;
      current += ch;
    } else if (ch === ')') {
      parenDepth = Math.max(0, parenDepth - 1);
      current += ch;
    } else if (ch === ',' && bracketDepth === 0 && parenDepth === 0) {
      const trimmed = current.trim();
      if (trimmed) tokens.push(trimmed);
      current = '';
    } else {
      current += ch;
    }
  }

  const tail = current.trim();
  if (tail) tokens.push(tail);

  return tokens;
}

/**
 * Parses a single tag token (string or pre-normalized object) into { label, url }.
 */
function parseSingleTag(token) {
  if (token && typeof token === 'object') {
    const label = typeof token.label === 'string' ? token.label.trim() : '';
    if (!label) return null;
    return {
      label,
      url: normalizeTagUrl(token.url),
    };
  }

  if (typeof token !== 'string') return null;
  const trimmed = token.trim();
  if (!trimmed) return null;

  // 1. Markdown-style link: [LABEL](URL)
  const mdMatch = trimmed.match(MARKDOWN_LINK_RE);
  if (mdMatch) {
    const label = mdMatch[1].trim();
    if (!label) return null;
    return {
      label,
      url: normalizeTagUrl(mdMatch[2]),
    };
  }

  // 2. Pipe shorthand: LABEL | URL (only treated as link when right side is a valid URL)
  const pipeIdx = trimmed.lastIndexOf('|');
  if (pipeIdx !== -1) {
    const label = trimmed.slice(0, pipeIdx).trim();
    const target = trimmed.slice(pipeIdx + 1).trim();
    const url = normalizeTagUrl(target);
    if (label && url) {
      return { label, url };
    }
  }

  // 3. Plain non-link tag
  return { label: trimmed, url: null };
}

/**
 * Normalizes a CSV string, array of strings, or array of tag objects
 * into an array of { label: string, url: string | null }.
 */
export function parseTags(rawTags) {
  if (Array.isArray(rawTags)) {
    return rawTags.map(parseSingleTag).filter(Boolean);
  }

  if (typeof rawTags === 'string') {
    return splitTagTokens(rawTags).map(parseSingleTag).filter(Boolean);
  }

  return [];
}
