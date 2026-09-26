/**
 * Google Sheets Integration Configuration
 * 
 * Instructions to connect your Google Sheet:
 * 1. Create a Google Sheet with 3 worksheets (tabs):
 *    - "Projects"
 *    - "Expertise"
 *    - "SiteInfo"
 * 2. In Google Sheets, go to: File -> Share -> Publish to web
 * 3. Choose the tab, set type to "Comma-separated values (.csv)", and click Publish.
 * 4. Paste each generated CSV URL below (or define them in .env):
 */

export const SHEETS_CONFIG = {
  // Direct CSV URLs published from Google Sheets:
  projectsCsvUrl:
    import.meta.env.VITE_SHEETS_PROJECTS_CSV_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vR6FLVlvBWLd-Knv1AS6thRGKCgTBl4KKnWb0zdjKhYoFs-8UNh6DpdgreJD3tATXWQ1PSpBd_-myrm/pub?gid=0&single=true&output=csv',
  expertiseCsvUrl:
    import.meta.env.VITE_SHEETS_EXPERTISE_CSV_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vR6FLVlvBWLd-Knv1AS6thRGKCgTBl4KKnWb0zdjKhYoFs-8UNh6DpdgreJD3tATXWQ1PSpBd_-myrm/pub?gid=101&single=true&output=csv',
  siteInfoCsvUrl:
    import.meta.env.VITE_SHEETS_SITEINFO_CSV_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vR6FLVlvBWLd-Knv1AS6thRGKCgTBl4KKnWb0zdjKhYoFs-8UNh6DpdgreJD3tATXWQ1PSpBd_-myrm/pub?gid=102&single=true&output=csv',

  // Poll/revalidation interval in milliseconds (optional, 0 disables auto-polling):
  pollIntervalMs: 0,
};
