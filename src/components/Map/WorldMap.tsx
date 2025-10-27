import React, { useState, useMemo, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { geoCentroid, geoPath } from "d3-geo";

import {
  buildCitiesByCountry,
  type CityRecord,
  type CitiesByCountry,
} from "./utils";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function CountryZoomCityList({
  onConfirm,
  onClose,
}: {
  onConfirm?: (payload: { countryName: string; city: CityRecord }) => void;
  onClose?: () => void;
}) {
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(
    null
  );
  const [selectedCity, setSelectedCity] = useState<CityRecord | null>(null);

  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 20]);
  const [mapZoom, setMapZoom] = useState<number>(1);

  // parsed CSV data
  const [citiesByCountry, setCitiesByCountry] = useState<CitiesByCountry>({});
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);

  // load + parse CSV once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("public/worldcities.csv");
        const text = await res.text();
        if (cancelled) return;
        const map = buildCitiesByCountry(text);
        setCitiesByCountry(map);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // visibleCities pulls from parsed data
  const visibleCities = useMemo(() => {
    if (!selectedCountryName) return [];
    return citiesByCountry[selectedCountryName] || [];
  }, [selectedCountryName, citiesByCountry]);

  function getZoomForFeature(feature: any) {
    const pathGen = geoPath();
    const area = pathGen.area(feature);
    if (area > 4000) return 2.5;
    if (area > 1500) return 3.5;
    if (area > 500) return 4.5;
    return 6;
  }

  function handleResetWorld() {
    setSelectedCountryName(null);
    setSelectedCity(null);
    setIsLoadingCities(false);
    setCityError(null);
    setMapCenter([0, 20]);
    setMapZoom(1);
  }

  function handleCityClick(city: CityRecord) {
    setSelectedCity(city);
    // If you ever want to zoom to city:
    // setMapCenter(city.coords);
    // setMapZoom(8);
  }

  function confirmSelection() {
    if (!selectedCountryName || !selectedCity) return;
    onConfirm?.({
      countryName: selectedCountryName,
      city: selectedCity,
    });
  }

  async function handleCountryClick(geo: any) {
    const countryName = geo.properties?.name as string | undefined;
    if (!countryName) return;

    const [lng, lat] = geoCentroid(geo);

    setSelectedCountryName(countryName);
    setSelectedCity(null);

    setMapCenter([lng, lat]);
    setMapZoom(getZoomForFeature(geo));

    // "loading" UX while we settle
    setIsLoadingCities(true);
    setCityError(null);

    Promise.resolve().then(() => {
      const citiesForCountry = citiesByCountry[countryName] || [];
      if (citiesForCountry.length === 0) {
        setCityError("No cities found.");
      }
      setIsLoadingCities(false);
    });
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 text-slate-100">
      {/* HEADER (top bar of the whole widget) */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex flex-col">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            {selectedCountryName ? "Select a city" : "Select a country"}
          </div>

          <div className="text-sm font-medium text-slate-100">
            {selectedCity
              ? `${selectedCity.name}, ${selectedCountryName ?? ""}`
              : selectedCountryName || "World"}
          </div>
        </div>

        <div className="flex gap-2">
          {selectedCountryName && (
            <button
              className="btn btn-xs btn-ghost text-slate-400"
              onClick={handleResetWorld}
            >
              ← World
            </button>
          )}

          {onClose && (
            <button
              className="btn btn-xs btn-circle btn-ghost text-slate-500"
              onClick={onClose}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* MAP AREA */}
      <div className="relative flex-1 min-h-0 min-w-0">
        <ComposableMap
          projection="geoMercator"
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#0f172a",
          }}
        >
          <ZoomableGroup center={mapCenter} zoom={mapZoom}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = geo.properties?.name;
                  const isSelected = !!name && name === selectedCountryName;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleCountryClick(geo)}
                      style={{
                        default: {
                          fill: isSelected ? "#475569" : "#1e293b",
                          outline: "none",
                          stroke: isSelected ? "#38bdf8" : "#334155",
                          strokeWidth: isSelected ? 1 : 0.4,
                          cursor: "pointer",
                        },
                        hover: {
                          fill: isSelected ? "#475569" : "#334155",
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: "#475569",
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* FLOATING PANEL */}
        <div className="absolute bottom-4 right-4 w-64 max-w-[80vw] max-h-[60vh] bg-slate-900/90 backdrop-blur rounded-xl border border-slate-700 p-4 text-sm shadow-xl flex flex-col">
          {/* Case 1: nothing chosen yet */}
          {!selectedCountryName && (
            <div className="text-slate-400 text-sm">
              Click a country to zoom in 🌍
            </div>
          )}

          {/* Case 2: country chosen, no city yet */}
          {selectedCountryName && !selectedCity && (
            <>
              {/* Top, non-scrolling section */}
              <div className="flex-shrink-0 relative z-10">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                  Cities in {selectedCountryName}
                </div>

                <label className="input flex items-center gap-2 mb-2">
                  <svg
                    className="h-[1em] opacity-50"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <g
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </g>
                  </svg>
                  <input
                    type="search"
                    required
                    placeholder="Search"
                    className="bg-transparent outline-none w-full text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </label>

                {isLoadingCities && (
                  <div className="text-slate-400 text-xs mb-2">
                    Loading cities…
                  </div>
                )}

                {!isLoadingCities && cityError && (
                  <div className="text-red-400 text-xs mb-2">{cityError}</div>
                )}

                {!isLoadingCities &&
                  !cityError &&
                  visibleCities.length === 0 && (
                    <div className="text-slate-500 text-xs mb-2">
                      No cities found.
                    </div>
                  )}
              </div>

              {/* Scrollable list area */}
              {!isLoadingCities && !cityError && visibleCities.length > 0 && (
                <ul className="flex-1 overflow-y-auto space-y-2 pr-1 pt-2 border-t border-slate-700">
                  {visibleCities.map((city) => (
                    <li
                      key={`${city.name}-${city.coords[0]}-${city.coords[1]}`}
                    >
                      <button
                        className="w-full text-left p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition text-slate-100"
                        onClick={() => handleCityClick(city)}
                      >
                        <div className="text-sm font-medium">{city.name}</div>
                        <div className="text-[11px] text-slate-400">
                          lon {city.coords[0].toFixed(2)}, lat{" "}
                          {city.coords[1].toFixed(2)}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {/* Case 3: city chosen */}
          {selectedCountryName && selectedCity && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-shrink-0">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                  Selected city
                </div>

                <div className="text-lg font-semibold text-slate-100">
                  {selectedCity.name}
                </div>

                <div className="text-slate-400 text-xs mb-4">
                  {selectedCountryName}
                </div>

                <div className="text-xs text-slate-500 leading-relaxed mb-4">
                  Lon/Lat:{" "}
                  <span className="text-slate-200">
                    {selectedCity.coords[0].toFixed(2)},{" "}
                    {selectedCity.coords[1].toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-auto flex-shrink-0 space-y-2">
                <button
                  className="btn btn-primary btn-sm w-full"
                  onClick={confirmSelection}
                >
                  Use {selectedCity.name}
                </button>

                <button
                  className="btn btn-ghost btn-sm w-full text-slate-400"
                  onClick={() => setSelectedCity(null)}
                >
                  Pick different city
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER BAR (bottom of full widget) */}
      <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
        <button className="btn btn-ghost btn-sm" onClick={handleResetWorld}>
          Reset
        </button>

        <button
          className="btn btn-primary btn-sm"
          disabled={!selectedCity}
          onClick={confirmSelection}
        >
          {selectedCity ? `Confirm ${selectedCity.name}` : "Select a city"}
        </button>
      </div>
    </div>
  );
}
