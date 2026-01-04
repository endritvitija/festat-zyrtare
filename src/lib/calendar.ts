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
  const locales = [
    "en-SA-u-ca-islamic-umalqura",
    "en-u-ca-islamic-umalqura",
    "ar-SA-u-ca-islamic-umalqura",
    "en-GB-u-ca-islamic-umalqura",
    "en-US-u-ca-islamic-umalqura",
    "ar-u-ca-islamic-umalqura",
    "en-u-ca-islamic",
  ];

  for (const locale of locales) {
    try {
      const formatter = new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return formatter.format(date);
    } catch {
      // try next locale
    }
  }

  return "";
}

function getHijriDateParts(
  date: Date
): { year: number; month: number; day: number } | null {
  const locales = [
    "en-SA-u-ca-islamic-umalqura",
    "en-u-ca-islamic-umalqura",
    "ar-SA-u-ca-islamic-umalqura",
    "en-GB-u-ca-islamic-umalqura",
    "en-US-u-ca-islamic-umalqura",
    "ar-u-ca-islamic-umalqura",
    "en-u-ca-islamic",
  ];

  for (const locale of locales) {
    try {
      const formatter = new Intl.DateTimeFormat(locale, {
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
      const day = parseInt(
        parts.find((p) => p.type === "day")?.value || "0",
        10
      );

      if (year && month && day) {
        return { year, month, day };
      }
    } catch {
      // try next locale
    }
  }

  return null;
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

type EidType = "fitr" | "adha";

const PRECOMPUTED_EID_DATES: Record<EidType, string[]> = {
  fitr: [
    "2026-03-20",
    "2027-03-09",
    "2028-02-26",
    "2029-02-14",
    "2030-02-04",
    "2031-01-24",
    "2032-01-14",
    "2033-01-03",
    "2033-12-23",
    "2034-12-12",
    "2035-12-01",
    "2036-11-19",
    "2037-11-09",
    "2038-10-28",
    "2039-10-18",
    "2040-10-06",
  ],
  // Shifted by +1 day to align with the provided 2026-05-27 base date
  adha: [
    "2026-05-27",
    "2027-05-16",
    "2028-05-05",
    "2029-04-24",
    "2030-04-13",
    "2031-04-02",
    "2032-03-23",
    "2033-03-13",
    "2034-03-02",
    "2035-02-20",
    "2036-02-09",
    "2037-01-28",
    "2038-01-17",
    "2039-01-06",
    "2039-12-27",
    "2040-12-16",
  ],
};

function getEidType(holiday: Holiday): EidType {
  const name = holiday.name.toLowerCase();
  return name.includes("kurban") ? "adha" : "fitr";
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

  const calendarName =
    holiday.country === "AL"
      ? "Festat Zyrtare - Shqipëri"
      : holiday.country === "XK"
      ? "Festat Zyrtare - Kosovë"
      : "Festat Zyrtare - Shqipëri & Kosovë";
  const calendarDesc =
    holiday.country === "AL"
      ? "Lista e festave zyrtare për Shqipëri"
      : holiday.country === "XK"
      ? "Lista e festave zyrtare për Kosovë"
      : "Lista e festave zyrtare për Shqipëri dhe Kosovë";

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
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    `X-WR-CALDESC:${escapeIcsText(calendarDesc)}`,
    "X-WR-TIMEZONE:Europe/Tirane",
    "X-APPLE-CALENDAR-COLOR:#ef4444",
  ];

  if (isMuslimEidHoliday(holiday)) {
    const hijriParts = getHijriDateParts(date);
    const eidType = getEidType(holiday);
    let addedHijriEvents = false;
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
            description += `\n\nData në kalendarin Hijri (Umm al-Qura): ${hijriDateStr}`;
          }
          if (holiday.country === "AL" || holiday.country === "BOTH") {
            description += `\n\n* Kjo datë është tentativë dhe mund të ndryshojë.`;
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
            "TRANSP:TRANSPARENT",
            "END:VEVENT"
          );
          addedHijriEvents = true;
        }
      }
    }

    // Precomputed Umm al-Qura dates to avoid locale/device differences
    if (!addedHijriEvents) {
      const precomputedDates = PRECOMPUTED_EID_DATES[eidType];
      precomputedDates.forEach((gDate, idx) => {
        const startDate = gDate.replace(/-/g, "");
        const endDate = format(addDays(parseISO(gDate), 1), "yyyyMMdd");
        const uid = `${baseUid}-precomputed-${idx}`;

        let description = `Festa Zyrtare në ${
          holiday.country === "AL" ? "Shqipëri" : "Kosovë"
        }`;
        const hijriYear = (hijriParts?.year || 1447) + idx;
        description += `\n\nData në kalendarin Hijri (Umm al-Qura): ${
          eidType === "fitr" ? "1 Shawwal" : "10 Dhu al-Hijjah"
        } ${hijriYear}`;
        if (holiday.country === "AL" || holiday.country === "BOTH") {
          description += `\n\n* Kjo datë është tentativë dhe mund të ndryshojë.`;
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
          "TRANSP:TRANSPARENT",
          "END:VEVENT"
        );
      });
      addedHijriEvents = true;
    }

    // Fallback: if Hijri conversion fails, at least provide a yearly recurrence
    if (!addedHijriEvents) {
      const startDate = format(date, "yyyyMMdd");
      const endDate = format(addDays(date, 1), "yyyyMMdd");
      const description = `Festa Zyrtare në ${
        holiday.country === "AL" ? "Shqipëri" : "Kosovë"
      } (fallback pa konvertim Hijri)`;

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
        "TRANSP:TRANSPARENT",
        "RRULE:FREQ=YEARLY;INTERVAL=1;COUNT=15",
        "END:VEVENT"
      );
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
      "TRANSP:TRANSPARENT",
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

  // Fallback for mobile browsers that ignore the download attribute
  const downloadSupported = typeof link.download !== "undefined";
  document.body.appendChild(link);
  if (downloadSupported) {
    link.click();
  } else {
    window.location.href = url;
  }
  document.body.removeChild(link);
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

export function generateBulkIcsContent(
  holidays: Holiday[],
  countryName: string
) {
  const dtstamp = formatDtstampUtc(new Date());

  const icsLines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Festat Zyrtare//SQ",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(`Festat Zyrtare - ${countryName}`)}`,
    `X-WR-CALDESC:${escapeIcsText(
      `Lista e festave zyrtare për ${countryName}`
    )}`,
    "X-WR-TIMEZONE:Europe/Tirane",
    "X-APPLE-CALENDAR-COLOR:#ef4444",
  ];

  holidays.forEach((holiday) => {
    const date = parseISO(holiday.date);
    const summary = escapeIcsText(holiday.name);
    const location = escapeIcsText(countryName);
    const eidType = getEidType(holiday);

    const safeName = holiday.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    const baseUid = `${holiday.date.replace(
      /-/g,
      ""
    )}-${safeName}@festat-zyrtare.local`;

    if (isMuslimEidHoliday(holiday)) {
      const hijriParts = getHijriDateParts(date);
      let addedHijriEvents = false;

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
              description += `\n\nData në kalendarin Hijri (Umm al-Qura): ${hijriDateStr}`;
            }
            if (holiday.country === "AL" || holiday.country === "BOTH") {
              description += `\n\n* Kjo datë është tentativë dhe mund të ndryshojë.`;
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
              "TRANSP:TRANSPARENT",
              "END:VEVENT"
            );
            addedHijriEvents = true;
          }
        }
      }

      // Precomputed Umm al-Qura dates to avoid locale/device differences
      if (!addedHijriEvents) {
        const precomputedDates = PRECOMPUTED_EID_DATES[eidType];
        precomputedDates.forEach((gDate, idx) => {
          const startDate = gDate.replace(/-/g, "");
          const endDate = format(addDays(parseISO(gDate), 1), "yyyyMMdd");
          const uid = `${baseUid}-precomputed-${idx}`;

          let description = `Festa Zyrtare në ${countryName}`;
          const hijriYear = (hijriParts?.year || 1447) + idx;
          description += `\n\nData në kalendarin Hijri (Umm al-Qura): ${
            eidType === "fitr" ? "1 Shawwal" : "10 Dhu al-Hijjah"
          } ${hijriYear}`;
          if (holiday.country === "AL" || holiday.country === "BOTH") {
            description += `\n\n* Kjo datë është tentativë dhe mund të ndryshojë.`;
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
            "TRANSP:TRANSPARENT",
            "END:VEVENT"
          );
        });
        addedHijriEvents = true;
      }

      // Fallback: if Hijri conversion fails, provide a yearly recurrence on the base date
      if (!addedHijriEvents) {
        const startDate = format(date, "yyyyMMdd");
        const endDate = format(addDays(date, 1), "yyyyMMdd");
        const description = `Festa Zyrtare në ${countryName} (fallback pa konvertim Hijri)`;

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
          "TRANSP:TRANSPARENT",
          "RRULE:FREQ=YEARLY;INTERVAL=1;COUNT=15",
          "END:VEVENT"
        );
      }
    } else {
      const startDate = format(date, "yyyyMMdd");
      const endDate = format(addDays(date, 1), "yyyyMMdd");
      const description = `Festa Zyrtare në ${countryName}`;

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
      "TRANSP:TRANSPARENT",
      "RRULE:FREQ=YEARLY;INTERVAL=1;COUNT=15",
      "END:VEVENT"
    );
    }
  });

  icsLines.push("END:VCALENDAR");

  return buildIcs(icsLines);
}

export function downloadBulkIcsFile(holidays: Holiday[], countryName: string) {
  const content = generateBulkIcsContent(holidays, countryName);
  const blob = new Blob([content], { type: "text/calendar" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const filename = `Festat_Zyrtare_${sanitizeForFilename(countryName)}.ics`;
  link.setAttribute("download", filename);

  // Fallback for mobile browsers that ignore the download attribute
  const downloadSupported = typeof link.download !== "undefined";
  document.body.appendChild(link);
  if (downloadSupported) {
    link.click();
  } else {
    window.location.href = url;
  }
  document.body.removeChild(link);
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
