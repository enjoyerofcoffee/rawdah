import { LocalStorageKeys } from "./constants";
import type { LocationStorage } from "./types";

export const useLocalStorage = () => {
  const setLocation = (locationStorage: LocationStorage) => {
    localStorage.setItem(
      LocalStorageKeys.Location,
      JSON.stringify(locationStorage)
    );
  };

  const getLocation = (): LocationStorage | null => {
    return (
      (localStorage.get(LocalStorageKeys.Location) as LocationStorage) || null
    );
  };

  return { setLocation, getLocation };
};
