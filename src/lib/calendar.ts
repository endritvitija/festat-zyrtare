import { format, parseISO, addDays } from 'date-fns';
import { Holiday } from '@/types';

function formatDtstampUtc(date: Date): string {
  // toISOString() is always UTC, e.g. 2026-01-03T12:34:56.789Z
  // We need: YYYYMMDDTHHMMSSZ
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function sanitizeForFilename(input: string): string {
  // Convert diacritics (ë, ç, etc) to ASCII where possible, then strip unsafe chars.
  const ascii = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return ascii
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function generateGoogleCalendarUrl(holiday: Holiday) {
  const date = parseISO(holiday.date);
  const startDate = format(date, "yyyyMMdd");
  const endDate = format(addDays(date, 1), "yyyyMMdd");
  
  // Google Calendar URL format for all-day events
  // URLSearchParams automatically handles encoding of special characters (Albanian characters like ë, ç)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: holiday.name,
    dates: `${startDate}/${endDate}`, // Format: YYYYMMDD/YYYYMMDD for all-day events
    details: `Festa Zyrtare në ${holiday.country === 'AL' ? 'Shqipëri' : 'Kosovë'}`,
    location: holiday.country === 'AL' ? 'Shqipëri' : 'Kosovë',
  });

  // Use calendar.google.com with /render endpoint (standard format)
  // This format works for both desktop and mobile Google Calendar
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateOutlookUrl(holiday: Holiday) {
  const date = parseISO(holiday.date);
  const startDate = format(date, "yyyy-MM-dd'T'HH:mm:ss");
  const endDate = format(addDays(date, 1), "yyyy-MM-dd'T'HH:mm:ss");

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: holiday.name,
    startdt: startDate,
    enddt: endDate,
    body: `Festa Zyrtare në ${holiday.country === 'AL' ? 'Shqipëri' : 'Kosovë'}`,
    location: holiday.country === 'AL' ? 'Shqipëri' : 'Kosovë',
    allday: 'true',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

// Helper function to escape special characters in ICS text fields
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function foldIcsLine(line: string, maxLen = 70): string {
  // RFC 5545 line folding is 75 octets; we use a conservative char limit.
  // Continuation lines must start with a single space.
  if (line.length <= maxLen) return line;
  let out = '';
  let remaining = line;
  while (remaining.length > maxLen) {
    out += `${remaining.slice(0, maxLen)}\r\n `;
    remaining = remaining.slice(maxLen);
  }
  return out + remaining;
}

function buildIcs(lines: string[]): string {
  // Ensure CRLF + proper folding + final newline for maximum compatibility
  return lines.map((l) => foldIcsLine(l)).join('\r\n') + '\r\n';
}

export function generateIcsContent(holiday: Holiday) {
  const date = parseISO(holiday.date);
  const startDate = format(date, "yyyyMMdd");
  const endDate = format(addDays(date, 1), "yyyyMMdd");
  // DTSTAMP must be in UTC format: YYYYMMDDTHHMMSSZ
  const dtstamp = formatDtstampUtc(new Date());

  const summary = escapeIcsText(holiday.name);
  const description = escapeIcsText(`Festa Zyrtare në ${holiday.country === 'AL' ? 'Shqipëri' : 'Kosovë'}`);
  const location = escapeIcsText(holiday.country === 'AL' ? 'Shqipëri' : 'Kosovë');
  
  // Generate a safe UID without special characters
  const safeName = holiday.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const uid = `${holiday.date.replace(/-/g, '')}-${safeName}@festat-zyrtare.local`;

  return buildIcs([
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Festat Zyrtare//SQ',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ]);
}

export function downloadIcsFile(holiday: Holiday) {
  const content = generateIcsContent(holiday);
  // Some mobile browsers/apps are picky about the MIME type; keep it simple.
  const blob = new Blob([content], { type: 'text/calendar' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const filename = `${sanitizeForFilename(holiday.name)}.ics`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function generateBulkIcsContent(holidays: Holiday[], countryName: string) {
  // DTSTAMP must be in UTC format: YYYYMMDDTHHMMSSZ
  const dtstamp = formatDtstampUtc(new Date());
  
  const events = holidays.map(holiday => {
    const date = parseISO(holiday.date);
    const startDate = format(date, "yyyyMMdd");
    const endDate = format(addDays(date, 1), "yyyyMMdd");
    
    const summary = escapeIcsText(holiday.name);
    const description = escapeIcsText(`Festa Zyrtare në ${countryName}`);
    const location = escapeIcsText(countryName);
    
    // Generate a safe UID without special characters
    const safeName = holiday.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const uid = `${holiday.date.replace(/-/g, '')}-${safeName}@festat-zyrtare.local`;
    
    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${startDate}`,
      `DTEND;VALUE=DATE:${endDate}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT'
    ].join('\r\n');
  }).join('\r\n');

  const calName = escapeIcsText(`Festat Zyrtare - ${countryName}`);
  const calDesc = escapeIcsText(`Lista e festave zyrtare për ${countryName} (2026)`);

  return buildIcs([
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Festat Zyrtare//SQ',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calName}`,
    `X-WR-CALDESC:${calDesc}`,
    'X-APPLE-CALENDAR-COLOR:#ef4444',
    events,
    'END:VCALENDAR'
  ]);
}

export function downloadBulkIcsFile(holidays: Holiday[], countryName: string) {
  const content = generateBulkIcsContent(holidays, countryName);
  const blob = new Blob([content], { type: 'text/calendar' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const filename = `Festat_Zyrtare_${sanitizeForFilename(countryName)}_2026.ics`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
