import Papa from 'papaparse';
import {
  DEFAULT_PROJECTS,
  DEFAULT_EXPERTISE,
  DEFAULT_SITE_INFO,
} from '../data/defaultContent';
import { SHEETS_CONFIG } from '../config/sheetsConfig';

/**
 * Normalizes an object's keys to lowercase without underscores or hyphens.
 * E.g., 'Demo_Config' -> 'democonfig', 'Year' -> 'year'
 */
function normalizeRow(row) {
  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    normalized[cleanKey] = typeof value === 'string' ? value.trim() : value;
  }
  return normalized;
}

/**
 * Fetch and parse a remote CSV URL using papaparse.
 */
async function fetchAndParseCsv(url) {
  if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
    return null;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const csvText = await response.text();

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data || []);
        },
        error: (err) => {
          console.warn('[SheetsService] CSV parse error:', err);
          resolve(null);
        },
      });
    });
  } catch (error) {
    console.warn('[SheetsService] Failed to fetch CSV from:', url, error);
    return null;
  }
}

/**
 * Fetches projects from published CSV, or falls back to default projects.
 */
export async function fetchProjects() {
  const rawData = await fetchAndParseCsv(SHEETS_CONFIG.projectsCsvUrl);
  if (!rawData || rawData.length === 0) {
    return DEFAULT_PROJECTS;
  }

  const projects = rawData
    .map((raw, idx) => {
      const row = normalizeRow(raw);
      if (!row.title && !row.id) return null;

      const rawId = row.id || String(idx + 1);
      const formattedId = String(rawId).padStart(2, '0');

      const tags = row.tags
        ? row.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      return {
        id: formattedId,
        title: row.title || `PROJECT ${formattedId}`,
        category: row.category || 'SYSTEM APPLICATION',
        year: row.year || String(new Date().getFullYear()),
        description: row.description || '',
        tags,
        metrics: row.metrics || '',
        link: row.link || '#',
        demoId: row.demoid || '',
        demoConfig: row.democonfig || '',
      };
    })
    .filter(Boolean);

  return projects.length > 0 ? projects : DEFAULT_PROJECTS;
}

/**
 * Fetches expertise/focus areas from published CSV, or falls back to default.
 */
export async function fetchExpertise() {
  const rawData = await fetchAndParseCsv(SHEETS_CONFIG.expertiseCsvUrl);
  if (!rawData || rawData.length === 0) {
    return DEFAULT_EXPERTISE;
  }

  const expertise = rawData
    .map((raw, idx) => {
      const row = normalizeRow(raw);
      if (!row.title && !row.area) return null;

      const area = row.area || `0${idx + 1} | COMPETENCY`;
      return {
        area,
        title: row.title || 'SPECIALIZATION',
        detail: row.detail || row.description || '',
      };
    })
    .filter(Boolean);

  return expertise.length > 0 ? expertise : DEFAULT_EXPERTISE;
}

/**
 * Fetches site info from published CSV, supporting both key-value and row schemas.
 */
export async function fetchSiteInfo() {
  const rawData = await fetchAndParseCsv(SHEETS_CONFIG.siteInfoCsvUrl);
  if (!rawData || rawData.length === 0) {
    return DEFAULT_SITE_INFO;
  }

  const result = { ...DEFAULT_SITE_INFO };

  // Check if it's a key-value pair sheet (Column 'key', Column 'value')
  const firstRow = normalizeRow(rawData[0]);
  if ('key' in firstRow && 'value' in firstRow) {
    for (const raw of rawData) {
      const row = normalizeRow(raw);
      const k = row.key;
      const v = row.value;
      if (!k || !v) continue;

      if (k === 'herosubtitle') result.heroSubtitle = v;
      else if (k === 'herotitle') result.heroTitleLines = v.split('|').map((s) => s.trim());
      else if (k === 'herodescription') result.heroDescription = v;
      else if (k === 'contacttag') result.contactTag = v;
      else if (k === 'contactheading1') result.contactHeadingLine1 = v;
      else if (k === 'contactheading2') result.contactHeadingLine2 = v;
      else if (k === 'footerleft') result.footerTextLeft = v;
      else if (k === 'footerright') result.footerTextRight = v;
      else if (k === 'email') {
        const found = result.socialLinks.find((l) => l.label.includes('EMAIL'));
        if (found) found.url = v.startsWith('mailto:') ? v : `mailto:${v}`;
      } else if (k === 'github') {
        const found = result.socialLinks.find((l) => l.label.includes('GITHUB'));
        if (found) found.url = v;
      } else if (k === 'twitter' || k === 'x') {
        const found = result.socialLinks.find((l) => l.label.includes('X') || l.label.includes('TWITTER'));
        if (found) found.url = v;
      } else if (k === 'linkedin') {
        const found = result.socialLinks.find((l) => l.label.includes('LINKEDIN'));
        if (found) found.url = v;
      }
    }
  }

  return result;
}

/**
 * Fetches all portfolio data in parallel.
 */
export async function fetchAllPortfolioData() {
  const [projects, expertise, siteInfo] = await Promise.all([
    fetchProjects(),
    fetchExpertise(),
    fetchSiteInfo(),
  ]);

  return { projects, expertise, siteInfo };
}
