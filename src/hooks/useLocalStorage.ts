import { LocalStorageKeys } from "./constants";
import type { Location } from "./types";

export const useLocalStorage = () => {
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

  return { setLocation, getLocation };
};
