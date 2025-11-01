import { useEffect, useRef, useState } from "react";
import { Prayers } from "./components/PrayerPill/constants";
import { PrayerPill } from "./components/PrayerPill/PrayerPill";
import { WorldMapDialog } from "./components/WorldMap/WorldMapDialog";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import type { Location } from "./hooks/types";
import type { PrayerTimesResponse } from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { NightCalculations } from "./components/NightCalculations/NightCalulcations";

const fetchPrayerTimes = async (location?: Location) => {
  if (!location) {
    return null;
  }

  const todayDate = format(new Date(), "dd-MM-yyyy");

  const prayerTimes = await axios.get<PrayerTimesResponse>(
    `https://api.aladhan.com/v1/timings/${todayDate}`,
    {
      params: {
        longitude: location.city.coords[0],
        latitude: location.city.coords[1],
        method: 15,
        latitudeAdjustmentMethod: 1,
      },
    }
  );

  const timings = prayerTimes.data.data.timings;

  return timings;
};

function App() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [location, setLocation] = useState<Location>();
  const { getLocation } = useLocalStorage();

  const { isLoading, data } = useQuery({
    queryKey: ["prayertimes", location?.city, location?.country],
    queryFn: () => fetchPrayerTimes(location),
  });

  useEffect(() => {
    const locationStorage = getLocation();
    if (locationStorage) {
      setLocation(locationStorage);
    }

    window.addEventListener("storage", () => {
      const location = getLocation();
      if (location) {
        setLocation(location);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = () => dialogRef.current?.showModal();

  return (
    <div className="h-full w-full flex flex-col sm:justify-center sm:items-center p-4">
      <WorldMapDialog ref={dialogRef} />
      <div className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-6 grid-cols-2 gap-4">
          {Object.values(Prayers).map((prayer) => (
            <PrayerPill
              key={prayer}
              type={prayer}
              time={data?.[prayer] || ""}
              isLoading={isLoading}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          {location && (
            <p>
              <span className="font-bold">{location?.city.name}, </span>
              {location?.country}
            </p>
          )}
          <button
            className="btn btn-link self-end 2xl:text-2xl"
            onClick={openModal}
          >
            {location ? "Want to change your timezone?" : "Select location"}
          </button>
        </div>
        <NightCalculations fajr={data?.Fajr} maghrib={data?.Maghrib} />
      </div>
    </div>
  );
}

export default App;
