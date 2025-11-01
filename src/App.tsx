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

const fetchPrayerTimes = async (date: Date, location?: Location) => {
  if (!location) {
    return null;
  }

  const formatTodayDate = format(date, "dd-MM-yyyy");

  const prayerTimes = await axios.get<PrayerTimesResponse>(
    `https://api.aladhan.com/v1/timings/${formatTodayDate}`,
    {
      params: {
        longitude: location.city.coords[0],
        latitude: location.city.coords[1],
        method: 15,
        latitudeAdjustmentMethod: 1,
      },
    }
  );

  const response = prayerTimes.data.data;

  return response;
};

function App() {
  const worldMapDialogRef = useRef<HTMLDialogElement>(null);
  const [location, setLocation] = useState<Location>();
  const [loadingLocation, setLoadingLocation] = useState(true); // to avoid flickering
  const { getLocation } = useLocalStorage();

  const todayDate = new Date();

  const { isLoading, data } = useQuery({
    queryKey: ["prayertimes", location?.city, location?.country],
    queryFn: () => fetchPrayerTimes(todayDate, location),
  });

  useEffect(() => {
    const locationStorage = getLocation();
    if (locationStorage) {
      setLocation(locationStorage);
      setLoadingLocation(false);
    }

    window.addEventListener("storage", () => {
      const location = getLocation();
      if (location) {
        setLocation(location);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = () => worldMapDialogRef.current?.showModal();

  const hijriDate = `${data?.date.hijri.day} ${data?.date.hijri.month.en} ${data?.date.hijri.year}`;

  // Stops flickering
  if (loadingLocation) {
    return <></>;
  }

  if (!location) {
    return (
      <div className="hero bg-base-200 min-h-screen">
        <div className="hero-content flex-col flex-row-reverse max-w-4xl">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/0d/The_Green_Dome%2C_Masjid_Nabawi%2C_Madina.jpg"
            className="hidden md:block max-w-sm rounded-lg shadow-2xl h-96"
          />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              Assalamu’alaikum warahmatullahi wabarakatuh
            </h1>
            <h1 className="text-3xl font-bold">
              السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ{" "}
            </h1>
            <h1 className="text-3xl font-bold">
              May the peace, mercy, and blessings of Allah be with you
            </h1>
            <p className="py-6">
              In order to get the accurate prayer timings and night period
              calculations, please provide a location!
            </p>
            <button className="btn btn-primary" onClick={openModal}>
              Get Started
            </button>
          </div>
        </div>
        <WorldMapDialog ref={worldMapDialogRef} />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col sm:justify-center sm:items-center p-4">
      <WorldMapDialog ref={worldMapDialogRef} />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col font-bold text-xl">
          <span>{format(todayDate, "d MMM y")}</span>
          {isLoading ? (
            <span className="loading loading-infinity loading-xl"></span>
          ) : (
            <span>{hijriDate}</span>
          )}
        </div>
        <div className="grid sm:grid-cols-6 grid-cols-2 gap-4">
          {Object.values(Prayers).map((prayer) => (
            <PrayerPill
              key={prayer}
              type={prayer}
              time={data?.timings[prayer] || ""}
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
            className="btn btn-link self-end 2xl:text-2xl justify-self-end"
            onClick={openModal}
          >
            {location ? "Want to change your timezone?" : "Select location"}
          </button>
        </div>
        <NightCalculations
          fajr={data?.timings.Fajr}
          maghrib={data?.timings.Maghrib}
        />
      </div>
    </div>
  );
}

export default App;
