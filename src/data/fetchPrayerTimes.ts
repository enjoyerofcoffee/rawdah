import { format } from "date-fns";
import type { Params, PrayerTimesResponse } from "./data.types";
import { type Location } from "../hooks/types";
import axios from "axios";
import { LocalStorageKeys } from "../hooks/constants";

export const DEFAULT_PARAMS = {
  method: 15,
  school: 0,
  latitudeAdjustmentMethod: 1,
};

export const fetchPrayerTimes = async (date: Date, location?: Location) => {
  if (!location) {
    return null;
  }

  const paramStorage = localStorage.getItem(LocalStorageKeys.Params);
  const params = paramStorage
    ? (JSON.parse(paramStorage) as Params)
    : DEFAULT_PARAMS;

  console.log(params);

  const formatTodayDate = format(date, "dd-MM-yyyy");

  const prayerTimes = await axios.get<PrayerTimesResponse>(
    `https://api.aladhan.com/v1/timings/${formatTodayDate}`,
    {
      params: {
        longitude: location.city.coords[0],
        latitude: location.city.coords[1],
        ...params,
      },
    }
  );

  const response = prayerTimes.data.data;

  return response;
};
