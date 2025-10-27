import { Prayers, type PrayerType } from "./constants";

const PrayerIconsMap = {
  [Prayers.Fajr]: "🌄",
  [Prayers.Dhur]: "🌤️",
  [Prayers.Asr]: "⛅️",
  [Prayers.Magrib]: "🌅",
  [Prayers.Isha]: "🌙",
};

type PrayerPillProps = {
  type: PrayerType;
  time: string;
};
export const PrayerPill: React.FC<PrayerPillProps> = ({ type, time }) => {
  return (
    <div className="p-6 font-bold flex flex-col rounded-[12vw] bg-gray-700">
      <div className="2xl:text-6xl xl:text-5xl lg:text-4xl md:text-3xl sm:text-2xl flex-1 self-center 2xl:py-14 xl:py-10 lg:py-8 md:py-4 sm:py-2">
        {PrayerIconsMap[type]}
      </div>
      <div className="flex flex-col justify-end items-center pb-6">
        <p className="2xl:text-4xl xl:text-3xl lg:text-xl md:text-lg sm:text-base">
          {time}
        </p>
        <p className="2xl:text-2xl xl:text-xl lg:text-lg md:text-base sm:text-sm">
          {type}
        </p>
      </div>
    </div>
  );
};
