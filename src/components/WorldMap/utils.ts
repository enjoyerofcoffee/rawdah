export type CityRecord = {
  name: string;
  coords: [number, number]; // [lng, lat]
};

export type CitiesByCountry = Record<string, CityRecord[]>;

/**
 * Given CSV text from worldcities.csv, return { [countryName]: CityRecord[] }
 *
 * Notes about expected columns in worldcities.csv:
 * - city          string  (e.g. "Tokyo")
 * - country       string  (e.g. "Japan")
 * - lat           number  (e.g. 35.6870)
 * - lng           number  (e.g. 139.7495)
 * - population    number  (may be empty)
 *
 * We'll:
 *  - skip rows missing required fields
 *  - coerce lat/lng/population to numbers
 *  - group by country
 *  - sort each country's list by population (desc), then by city name
 */
export function buildCitiesByCountry(csvText: string): CitiesByCountry {
  // naive CSV parsing that can still handle quoted values with commas
  // We'll do a small state machine instead of split(',') to stay safe.
  // But since worldcities.csv is well-behaved, you *could* use a simpler split.
  // This version aims to be robust without needing a library.

  function parseCSV(text: string): Record<string, string>[] {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (lines.length === 0) return [];

    const header = splitCSVLine(lines[0]);
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const rawLine = lines[i];
      const cols = splitCSVLine(rawLine);

      if (cols.length === 1 && cols[0].trim() === "") continue;

      const row: Record<string, string> = {};
      for (let c = 0; c < header.length; c++) {
        row[header[c]] = cols[c] ?? "";
      }
      rows.push(row);
    }

    return rows;
  }

  function splitCSVLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if (inQuotes) {
        if (ch === `"`) {
          if (line[i + 1] === `"`) {
            cur += `"`;
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          cur += ch;
        }
      } else {
        if (ch === `"`) {
          inQuotes = true;
        } else if (ch === ",") {
          result.push(cur);
          cur = "";
        } else {
          cur += ch;
        }
      }
    }
    result.push(cur);
    return result;
  }

  const rawRows = parseCSV(csvText);

  const map: Record<
    string,
    { name: string; coords: [number, number]; population: number }[]
  > = {};

  for (const row of rawRows) {
    const country = row["country"]?.trim();
    const cityName = (row["city"] ?? row["city_ascii"] ?? "").trim();

    const latStr = row["lat"];
    const lngStr = row["lng"];
    const popStr = row["population"];

    if (!country || !cityName || latStr === undefined || lngStr === undefined)
      continue;

    const lat = Number(latStr);
    const lng = Number(lngStr);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const population = Number(popStr);
    const safePop = Number.isFinite(population) ? population : 0;

    if (!map[country]) {
      map[country] = [];
    }

    map[country].push({
      name: cityName,
      coords: [lng, lat],
      population: safePop,
    });
  }

  const finalMap: CitiesByCountry = {};

  for (const countryName of Object.keys(map)) {
    const sorted = map[countryName]
      .sort((a, b) => {
        if (b.population !== a.population) {
          return b.population - a.population;
        }
        return a.name.localeCompare(b.name);
      })
      .map((c) => ({
        name: c.name,
        coords: c.coords,
      }));

    finalMap[countryName] = sorted;
  }

  return finalMap;
}

export const loadCityData = async () => {
  try {
    const res = await fetch("/worldcities.csv");
    const text = await res.text();

    return buildCitiesByCountry(text);
  } catch (err) {
    console.error("Failed to load worldcities.csv", err);
    return {} as CitiesByCountry;
  }
};
