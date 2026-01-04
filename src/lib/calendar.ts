import { format, parseISO, addDays } from "date-fns";
import { Holiday } from "@/types";

function formatDtstampUtc(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function sanitizeForFilename(input: string): string {
  const ascii = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return ascii
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function generateGoogleCalendarUrl(holiday: Holiday) {
  const date = parseISO(holiday.date);
  const startDate = format(date, "yyyyMMdd");
  const endDate = format(addDays(date, 1), "yyyyMMdd");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: holiday.name,
    dates: `${startDate}/${endDate}`,
    details: `Festa Zyrtare në ${
      holiday.country === "AL" ? "Shqipëri" : "Kosovë"
    }`,
    location: holiday.country === "AL" ? "Shqipëri" : "Kosovë",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateOutlookUrl(holiday: Holiday) {
  const date = parseISO(holiday.date);
  const startDate = format(date, "yyyy-MM-dd'T'HH:mm:ss");
  const endDate = format(addDays(date, 1), "yyyy-MM-dd'T'HH:mm:ss");

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: holiday.name,
    startdt: startDate,
    enddt: endDate,
    body: `Festa Zyrtare në ${
      holiday.country === "AL" ? "Shqipëri" : "Kosovë"
    }`,
    location: holiday.country === "AL" ? "Shqipëri" : "Kosovë",
    allday: "true",
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function isMuslimEidHoliday(holiday: Holiday): boolean {
  return holiday.name.toLowerCase().includes("bajrami");
}

function getHijriDateString(date: Date): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-SA-u-ca-islamic-umalqura", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const hijriDate = formatter.format(date);
    return hijriDate;
  } catch {
    return "";
  }
}

function getHijriDateParts(
  date: Date
): { year: number; month: number; day: number } | null {
  try {
    const formatter = new Intl.DateTimeFormat("en-SA-u-ca-islamic-umalqura", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    const parts = formatter.formatToParts(date);
    const year = parseInt(
      parts.find((p) => p.type === "year")?.value || "0",
      10
    );
    const month = parseInt(
      parts.find((p) => p.type === "month")?.value || "0",
      10
    );
    const day = parseInt(parts.find((p) => p.type === "day")?.value || "0", 10);

    if (year && month && day) {
      return { year, month, day };
    }
    return null;
  } catch {
    return null;
  }
}

function getGregorianDateForHijri(
  hijriYear: number,
  hijriMonth: number,
  hijriDay: number
): Date | null {
  try {
    const approximateGregorianYear = Math.floor(hijriYear / 0.97 + 622);

    for (let yearOffset = -2; yearOffset <= 2; yearOffset++) {
      const searchYear = approximateGregorianYear + yearOffset;

      const startMonth = hijriMonth - 1;
      const baseDate = new Date(searchYear, startMonth, hijriDay);

      for (let offset = -45; offset <= 45; offset++) {
        const testDate = new Date(baseDate);
        testDate.setDate(testDate.getDate() + offset);

        const hijriParts = getHijriDateParts(testDate);
        if (
          hijriParts &&
          hijriParts.year === hijriYear &&
          hijriParts.month === hijriMonth &&
          hijriParts.day === hijriDay
        ) {
          return testDate;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function foldIcsLine(line: string, maxLen = 70): string {
  if (line.length <= maxLen) return line;
  let out = "";
  let remaining = line;
  while (remaining.length > maxLen) {
    out += `${remaining.slice(0, maxLen)}\r\n `;
    remaining = remaining.slice(maxLen);
  }
  return out + remaining;
}

function buildIcs(lines: string[]): string {
  return lines.map((l) => foldIcsLine(l)).join("\r\n") + "\r\n";
}

export function generateIcsContent(holiday: Holiday) {
  const date = parseISO(holiday.date);
  const dtstamp = formatDtstampUtc(new Date());

  const summary = escapeIcsText(holiday.name);
  const location = escapeIcsText(
    holiday.country === "AL" ? "Shqipëri" : "Kosovë"
  );

  const safeName = holiday.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  const baseUid = `${holiday.date.replace(
    /-/g,
    ""
  )}-${safeName}@festat-zyrtare.local`;

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Festat Zyrtare//SQ",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  if (isMuslimEidHoliday(holiday)) {
    const hijriParts = getHijriDateParts(date);

    if (hijriParts) {
      for (let yearOffset = 0; yearOffset < 15; yearOffset++) {
        const targetHijriYear = hijriParts.year + yearOffset;

        const gregorianDate = getGregorianDateForHijri(
          targetHijriYear,
          hijriParts.month,
          hijriParts.day
        );

        if (gregorianDate) {
          const startDate = format(gregorianDate, "yyyyMMdd");
          const endDate = format(addDays(gregorianDate, 1), "yyyyMMdd");
          const uid = `${baseUid}-${yearOffset}`;

          let description = `Festa Zyrtare në ${
            holiday.country === "AL" ? "Shqipëri" : "Kosovë"
          }`;
          const hijriDateStr = getHijriDateString(gregorianDate);
          if (hijriDateStr) {
            description += `\\n\\nData në kalendarin Hijri (Umm al-Qura): ${hijriDateStr}`;
          }
          if (holiday.country === "AL" || holiday.country === "BOTH") {
            description += `\\n\\n* Kjo datë është tentativë dhe mund të ndryshojë.`;
          }

          icsLines.push(
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTAMP:${dtstamp}`,
            `DTSTART;VALUE=DATE:${startDate}`,
            `DTEND;VALUE=DATE:${endDate}`,
            `SUMMARY:${summary}`,
            `DESCRIPTION:${escapeIcsText(description)}`,
            `LOCATION:${location}`,
            "STATUS:CONFIRMED",
            "SEQUENCE:0",
            "END:VEVENT"
          );
        }
      }
    }
  } else {
    const startDate = format(date, "yyyyMMdd");
    const endDate = format(addDays(date, 1), "yyyyMMdd");
    const description = `Festa Zyrtare në ${
      holiday.country === "AL" ? "Shqipëri" : "Kosovë"
    }`;

    icsLines.push(
      "BEGIN:VEVENT",
      `UID:${baseUid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${startDate}`,
      `DTEND;VALUE=DATE:${endDate}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `LOCATION:${location}`,
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "RRULE:FREQ=YEARLY;INTERVAL=1;COUNT=15",
      "END:VEVENT"
    );
  }

  icsLines.push("END:VCALENDAR");

  return buildIcs(icsLines);
}

export function downloadIcsFile(holiday: Holiday) {
  const content = generateIcsContent(holiday);
  const blob = new Blob([content], { type: "text/calendar" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const filename = `${sanitizeForFilename(holiday.name)}.ics`;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function generateBulkIcsContent(
  holidays: Holiday[],
  countryName: string
) {
  const dtstamp = formatDtstampUtc(new Date());

  const eventArrays: string[] = [];

  holidays.forEach((holiday) => {
    const date = parseISO(holiday.date);
    const summary = escapeIcsText(holiday.name);
    const location = escapeIcsText(countryName);

    const safeName = holiday.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    const baseUid = `${holiday.date.replace(
      /-/g,
      ""
    )}-${safeName}@festat-zyrtare.local`;

    if (isMuslimEidHoliday(holiday)) {
      const hijriParts = getHijriDateParts(date);

      if (hijriParts) {
        for (let yearOffset = 0; yearOffset < 15; yearOffset++) {
          const targetHijriYear = hijriParts.year + yearOffset;

          const gregorianDate = getGregorianDateForHijri(
            targetHijriYear,
            hijriParts.month,
            hijriParts.day
          );

          if (gregorianDate) {
            const startDate = format(gregorianDate, "yyyyMMdd");
            const endDate = format(addDays(gregorianDate, 1), "yyyyMMdd");
            const uid = `${baseUid}-${yearOffset}`;

            let description = `Festa Zyrtare në ${countryName}`;
            const hijriDateStr = getHijriDateString(gregorianDate);
            if (hijriDateStr) {
              description += `\\n\\nData në kalendarin Hijri (Umm al-Qura): ${hijriDateStr}`;
            }
            if (holiday.country === "AL" || holiday.country === "BOTH") {
              description += `\\n\\n* Kjo datë është tentativë dhe mund të ndryshojë.`;
            }

            eventArrays.push(
              [
                "BEGIN:VEVENT",
                `UID:${uid}`,
                `DTSTAMP:${dtstamp}`,
                `DTSTART;VALUE=DATE:${startDate}`,
                `DTEND;VALUE=DATE:${endDate}`,
                `SUMMARY:${summary}`,
                `DESCRIPTION:${escapeIcsText(description)}`,
                `LOCATION:${location}`,
                "STATUS:CONFIRMED",
                "SEQUENCE:0",
                "END:VEVENT",
              ].join("\r\n")
            );
          }
        }
      }
    } else {
      const startDate = format(date, "yyyyMMdd");
      const endDate = format(addDays(date, 1), "yyyyMMdd");
      const description = `Festa Zyrtare në ${countryName}`;

      eventArrays.push(
        [
          "BEGIN:VEVENT",
          `UID:${baseUid}`,
          `DTSTAMP:${dtstamp}`,
          `DTSTART;VALUE=DATE:${startDate}`,
          `DTEND;VALUE=DATE:${endDate}`,
          `SUMMARY:${summary}`,
          `DESCRIPTION:${escapeIcsText(description)}`,
          `LOCATION:${location}`,
          "STATUS:CONFIRMED",
          "SEQUENCE:0",
          "RRULE:FREQ=YEARLY;INTERVAL=1;COUNT=15",
          "END:VEVENT",
        ].join("\r\n")
      );
    }
  });

  const events = eventArrays.join("\r\n");

  const calName = escapeIcsText(`Festat Zyrtare - ${countryName}`);
  const calDesc = escapeIcsText(`Lista e festave zyrtare për ${countryName}`);

  return buildIcs([
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Festat Zyrtare//SQ",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calName}`,
    `X-WR-CALDESC:${calDesc}`,
    "X-WR-TIMEZONE:Europe/Tirane", 
    "X-APPLE-CALENDAR-COLOR:#ef4444",
    events,
    "END:VCALENDAR",
  ]);
}

export function downloadBulkIcsFile(holidays: Holiday[], countryName: string) {
  const content = generateBulkIcsContent(holidays, countryName);
  const blob = new Blob([content], { type: "text/calendar" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const filename = `Festat_Zyrtare_${sanitizeForFilename(countryName)}.ics`;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
