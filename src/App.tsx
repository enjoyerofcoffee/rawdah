import { Suspense, useRef } from "react";
import { Prayers } from "./components/PrayerPill/constants";
import { PrayerPill } from "./components/PrayerPill/PrayerPill";
import { WorldMapDialog } from "./components/WorldMap/WorldMapDialog";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { LocationStorage } from "./hooks/types";
import type { PrayerTimesResponse } from "./types";

const fetchPrayerTimes = async (location: LocationStorage | null) => {
  if (!location) {
    return;
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
  const { getLocation } = useLocalStorage();

  const location = getLocation();

  const { isLoading, data } = useQuery({
    queryKey: ["prayertimes"],
    queryFn: () => fetchPrayerTimes(location),
  });

  const openModal = () => dialogRef.current?.showModal();

  return (
    <div className="h-full w-full flex flex-col sm:justify-center sm:items-center">
      <WorldMapDialog ref={dialogRef} />
      <div className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-5 grid-cols-1 gap-4">
          {Object.values(Prayers).map((prayer) => (
            <PrayerPill
              key={prayer}
              type={prayer}
              time={data?.[prayer] || ""}
              isLoading={isLoading}
            />
          ))}
        </div>
        <button
          className="btn btn-link self-end 2xl:text-2xl"
          onClick={openModal}
        >
          Want to change your timezone?
        </button>
        <div className="bg-gray-700 h-12 rounded-2xl"></div>
      </div>
    </div>
  );
}

export default App;
