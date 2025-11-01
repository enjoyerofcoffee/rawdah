import React, { useMemo } from "react";
import { parse, format, addMinutes } from "date-fns";
import HalfMoon from "./assets/Half_Moon.png";
import FullMoon from "./assets/Full.png";
import FullCloud from "./assets/Full_Cloud.png";
import Sunrise from "./assets/Sunrise.png";
import Sunset from "./assets/Sunset.png";

type NightCalculationsProps = {
  fajr?: string;
  maghrib?: string;
};

const TIME_FMT = "HH:mm";

const parseHHmm = (time?: string): Date | null => {
  if (!time) return null;
  const parsed = parse(time, TIME_FMT, new Date());
  return isNaN(parsed.getTime()) ? null : parsed;
};

const fmt = (d: Date | null): string => (d ? format(d, TIME_FMT) : "—");

export const NightCalculations: React.FC<NightCalculationsProps> = ({
  fajr,
  maghrib,
}) => {
  const { maghribTime, oneThird, midnight, lastThirdStart, fajrTime } =
    useMemo(() => {
      const magh = parseHHmm(maghrib);
      const fjr = parseHHmm(fajr);

      if (!magh || !fjr) {
        return {
          maghribTime: magh ?? null,
          oneThird: null,
          midnight: null,
          lastThirdStart: null,
          fajrTime: fjr ?? null,
        };
      }

      const maghMinutes = magh.getHours() * 60 + magh.getMinutes();
      const fajrMinutes = fjr.getHours() * 60 + fjr.getMinutes();

      const nightDuration =
        fajrMinutes > maghMinutes
          ? fajrMinutes - maghMinutes
          : 24 * 60 - maghMinutes + fajrMinutes;

      const addFromMaghrib = (mins: number) => addMinutes(magh, mins);
      const oneThird = addFromMaghrib(Math.round(nightDuration / 3));
      const midnight = addFromMaghrib(Math.round(nightDuration / 2));
      const lastThirdStart = addFromMaghrib(
        Math.round((2 * nightDuration) / 3)
      );

      return {
        maghribTime: magh,
        oneThird,
        midnight,
        lastThirdStart,
        fajrTime: fjr,
      };
    }, [fajr, maghrib]);

  const data = [
    { label: "Maghrib (Night starts)", img: Sunset, time: fmt(maghribTime) },
    { label: "1/3 of the night", img: HalfMoon, time: fmt(oneThird) },
    { label: "Midnight (Nisf al-layl)", img: FullMoon, time: fmt(midnight) },
    {
      label: "Last 1/3 begins (2/3)",
      img: FullCloud,
      time: fmt(lastThirdStart),
    },
    { label: "Fajr (next day)", img: Sunrise, time: fmt(fajrTime) },
  ];

  return (
    <div className="bg-gray-700 rounded-2xl shadow-xl p-8 sm:h-62 h-full  w-full max-w-5xl mx-auto mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end text-center">
        {data.map((item, index) => {
          const heights = [
            "sm:translate-y-12",
            "sm:translate-y-6",
            "sm:translate-y-0",
            "sm:translate-y-6",
            "sm:translate-y-12",
          ];
          return (
            <div
              key={index}
              className={`flex flex-col items-center transition-transform duration-500 ${heights[index]}`}
            >
              <img
                src={item.img}
                alt={item.label}
                className="w-16 h-16 object-contain mb-2"
              />
              <p className="text-sm text-slate-300">{item.label}</p>
              <p className="font-bold text-lg">{item.time}</p>
              <div className="sm:hidden divider"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
