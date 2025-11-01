import type { Params } from "../data/data.types";
import { LocalStorageKeys } from "./constants";
import type { Location } from "./types";

export const useLocalStorage = () => {
  const setParams = (params: Params) => {
    localStorage.setItem(LocalStorageKeys.Params, JSON.stringify(params));
  };

  const getParams = () => {
    const locationStorage = localStorage.getItem(LocalStorageKeys.Params);
    return locationStorage ? (JSON.parse(locationStorage) as Params) : null;
  };

  const setLocation = (locationStorage: Location) => {
    localStorage.setItem(
      LocalStorageKeys.Location,
      JSON.stringify(locationStorage)
    );
    window.dispatchEvent(new Event("storage"));
  };

  const getLocation = (): Location | null => {
    const locationStorage = localStorage.getItem(LocalStorageKeys.Location);
    return locationStorage ? (JSON.parse(locationStorage) as Location) : null;
  };

  return { setLocation, getLocation, getParams, setParams };
};
