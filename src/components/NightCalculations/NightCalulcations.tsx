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
    {
      label: "1/3 of the night ends",
      helper: "2/3 of the night begins",
      img: HalfMoon,
      time: fmt(oneThird),
    },
    { label: "Midnight (Nisf al-layl)", img: FullMoon, time: fmt(midnight) },
    {
      label: "Last 1/3 begins",
      helper: "2/3 of the night ends",
      img: FullCloud,
      time: fmt(lastThirdStart),
    },
    { label: "Fajr (Next day)", img: Sunrise, time: fmt(fajrTime) },
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
              <div className="flex items-center">
                <p className="text-sm text-slate-300">{item.label}</p>
                <NightPeriodsHelper text={item.helper} />
              </div>
              <p className="font-bold text-lg">{item.time}</p>
              <div className="sm:hidden divider"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

type NightPeriodsHelperProps = {
  text?: string;
};
const NightPeriodsHelper: React.FC<NightPeriodsHelperProps> = ({ text }) => {
  if (!text) {
    return <></>;
  }

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-circle btn-ghost btn-xs text-info"
      >
        <svg
          tabIndex={0}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="h-4 w-4 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>
      <div
        tabIndex={0}
        className="card card-sm dropdown-content bg-base-100 rounded-box z-1 w-42 shadow-sm"
      >
        <div tabIndex={0} className="card-body">
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
};
