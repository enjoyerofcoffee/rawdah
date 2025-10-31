import { Prayers, type PrayerType } from "./constants";

const PrayerIconsMap = {
  [Prayers.Fajr]: "🌄",
  [Prayers.Sunrise]: "🌅",
  [Prayers.Dhur]: "🌤️",
  [Prayers.Asr]: "⛅️",
  [Prayers.Maghrib]: "🌇",
  [Prayers.Isha]: "🌙",
};

type PrayerPillProps = {
  type: PrayerType;
  time: string;
  isLoading?: boolean;
};

export const PrayerPill: React.FC<PrayerPillProps> = ({
  type,
  time,
  isLoading,
}) => {
  return (
    <div className="p-3 sm:p-5 font-bold flex flex-col rounded-[1.5rem] bg-gray-700 text-center">
      <div
        className="
          text-2xl
          sm:text-3xl
          md:text-4xl
          lg:text-5xl
          xl:text-6xl
          2xl:text-7xl
          py-2 sm:py-3
        "
      >
        {PrayerIconsMap[type]}
      </div>

      <div className="flex flex-col items-center gap-1 pb-2">
        {isLoading && (
          <span className="loading loading-infinity loading-xl"></span>
        )}
        <p
          className="
            text-sm
            sm:text-base
            md:text-lg
            lg:text-xl
            xl:text-2xl
            2xl:text-3xl
            font-semibold
          "
        >
          {time}
        </p>
        <p
          className="
            text-xs
            sm:text-sm
            md:text-base
            lg:text-lg
            xl:text-xl
            2xl:text-2xl
            text-gray-300
          "
        >
          {type}
        </p>
      </div>
    </div>
  );
};
