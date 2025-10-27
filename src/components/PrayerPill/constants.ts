export const Prayers = {
  Fajr: "Fajr",
  Dhur: "Dhur",
  Asr: "Asr",
  Magrib: "Magrib",
  Isha: "Isha",
} as const;

export type PrayerType = (typeof Prayers)[keyof typeof Prayers];
