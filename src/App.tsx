import { useEffect, useRef, useState } from "react";
import { Prayers } from "./components/PrayerPill/constants";
import { PrayerPill } from "./components/PrayerPill/PrayerPill";
import { WorldMapDialog } from "./components/WorldMap/WorldMapDialog";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { Location } from "./hooks/types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { NightCalculations } from "./components/NightCalculations/NightCalulcations";
import { SettingButton } from "./components/Settings/SettingButton";
import { fetchPrayerTimes } from "./data/fetchPrayerTimes";
import { DayPicker } from "react-day-picker";

function App() {
  const worldMapDialogRef = useRef<HTMLDialogElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<Location>();
  const [date, setDate] = useState<Date>(new Date());
  const [loadingLocation, setLoadingLocation] = useState(true); // to avoid flickering
  const { getLocation } = useLocalStorage();

  const { isLoading, data } = useQuery({
    queryKey: ["prayertimes", date, location?.city, location?.country],
    queryFn: () => fetchPrayerTimes(date, location),
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
      <SettingButton />
      <WorldMapDialog ref={worldMapDialogRef} />
      <div className="flex flex-col gap-6">
        <div className="flex space-x-8">
          <div className="flex flex-col font-bold text-xl">
            <span>{format(date, "d MMMM y")}</span>
            {isLoading ? (
              <span className="loading loading-infinity loading-xl"></span>
            ) : (
              <span>{hijriDate}</span>
            )}
          </div>
          <>
            <button
              popoverTarget="rdp-popover"
              style={{ anchorName: "--rdp" } as React.CSSProperties}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M8 2v4M16 2v4" />
                <rect x="3" y="4" width="18" height="18" rx="3" />
                <path d="M3 9h18" />
                <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01" />
              </svg>
            </button>
            <div
              popover="auto"
              ref={popoverRef}
              id="rdp-popover"
              className="dropdown flex flex-col"
              style={{ positionAnchor: "--rdp" } as React.CSSProperties}
            >
              <DayPicker
                className="react-day-picker"
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  if (newDate) {
                    setDate(newDate);
                    popoverRef.current?.hidePopover();
                  }
                }}
              />
            </div>
          </>
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
              <span className="font-bold">{location?.city?.name}, </span>
              {location?.country}
            </p>
          )}
          <button
            className="btn btn-link self-end 2xl:text-2xl justify-self-end"
            onClick={openModal}
          >
            {location ? "Want to change your location?" : "Select location"}
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
