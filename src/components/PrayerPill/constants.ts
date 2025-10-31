export const Prayers = {
  Fajr: "Fajr",
  Sunrise: "Sunrise",
  Dhur: "Dhuhr",
  Asr: "Asr",
  Maghrib: "Maghrib",
  Isha: "Isha",
} as const;

export type PrayerType = (typeof Prayers)[keyof typeof Prayers];
