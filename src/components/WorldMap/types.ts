export type CityRecord = {
  name: string;
  coords: [number, number]; // [lng, lat]
};

export type CitiesByCountry = Record<string, CityRecord[]>; // countryName, city record
