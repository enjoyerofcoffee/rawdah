import { format } from "date-fns";
import type { Params, PrayerTimesResponse } from "./data.types";
import { type Location } from "../hooks/types";
import axios from "axios";
import { LocalStorageKeys } from "../hooks/constants";

export const DEFAULT_PARAMS = {
  method: 15,
  school: 0,
  latitudeAdjustmentMethod: 1,
  tune: "0,0,0,5,-2,4,4,1,0", // Comma Separated String of integers to offset timings returned by the API in minutes.
};

export const fetchPrayerTimes = async (date: Date, location?: Location) => {
  if (!location) {
    return null;
  }

  const paramStorage = localStorage.getItem(LocalStorageKeys.Params);
  const params = paramStorage
    ? { ...DEFAULT_PARAMS, ...(JSON.parse(paramStorage) as Params) }
    : DEFAULT_PARAMS;

  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const formatDate = format(date, "dd-MM-yyyy");
  const formatNextDay = format(nextDay, "dd-MM-yyyy");

  const buildParams = {
    longitude: location.city.coords[0],
    latitude: location.city.coords[1],
    ...params,
  };

  const prayerTimesPromise = axios.get<PrayerTimesResponse>(
    `https://api.aladhan.com/v1/timings/${formatDate}`,
    { params: buildParams }
  );

  const fajrNextDayPromise = axios.get<PrayerTimesResponse>(
    `https://api.aladhan.com/v1/timings/${formatNextDay}`,
    { params: buildParams }
  );

  const [prayerTimes, fajrNextDay] = await Promise.all([
    prayerTimesPromise,
    fajrNextDayPromise,
  ]);

  const response = prayerTimes.data.data;
  const fajrNextDayResponse = fajrNextDay.data.data.timings.Fajr;

  return { response, nextDayFajr: fajrNextDayResponse };
};
