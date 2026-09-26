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

  const projectMap = new Map();

  rawData.forEach((raw, idx) => {
    const row = normalizeRow(raw);
    if (!row.title && !row.id && !row.description) return;

    const rawId = row.id || String(idx + 1);
    const formattedId = String(rawId).padStart(2, '0');

    const tags = row.tags
      ? row.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const pageData = {
      pageTitle: row.pagetitle || row.pagesubtitle || '',
      description: row.description || '',
      tags,
      metrics: row.metrics || '',
      link: row.link || '#',
      demoId: row.demoid || '',
      demoConfig: row.democonfig || '',
    };

    if (!projectMap.has(formattedId)) {
      projectMap.set(formattedId, {
        id: formattedId,
        title: row.title || `PROJECT ${formattedId}`,
        category: row.category || 'SYSTEM APPLICATION',
        year: row.year || String(new Date().getFullYear()),
        pages: [pageData],
      });
    } else {
      const existing = projectMap.get(formattedId);
      if (!existing.title && row.title) existing.title = row.title;
      if (!existing.category && row.category) existing.category = row.category;
      if (!existing.year && row.year) existing.year = row.year;
      existing.pages.push(pageData);
    }
  });

  const projects = Array.from(projectMap.values());
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

  // Deep clone socialLinks to prevent mutating the global fallback object
  const result = {
    ...DEFAULT_SITE_INFO,
    socialLinks: DEFAULT_SITE_INFO.socialLinks.map((link) => ({ ...link })),
  };

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
        if (result.socialLinks[0]) {
          result.socialLinks[0].label = 'EMAIL →';
          result.socialLinks[0].url = v.startsWith('mailto:') ? v : `mailto:${v}`;
        }
      } else if (k === 'github') {
        if (result.socialLinks[1]) {
          result.socialLinks[1].label = 'GITHUB →';
          result.socialLinks[1].url = v;
        }
      } else if (k === 'twitter' || k === 'x') {
        if (result.socialLinks[2]) {
          result.socialLinks[2].label = 'X | TWITTER →';
          result.socialLinks[2].url = v;
        }
      } else if (k === 'linkedin') {
        if (result.socialLinks[3]) {
          result.socialLinks[3].label = 'LINKEDIN →';
          result.socialLinks[3].url = v;
        }
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
