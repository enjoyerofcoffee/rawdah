import React, { useState, useMemo, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import {
  geoCentroid,
  geoPath,
  type ExtendedFeature,
  type GeoGeometryObjects,
  type GeoPermissibleObjects,
} from "d3-geo";

import {
  buildCitiesByCountry,
  type CityRecord,
  type CitiesByCountry,
} from "./utils";
import { CityLabel } from "./CityLabel";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function WorldMap({
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
  const [hoverCity, setHoverCity] = useState<CityRecord | null>(null);
  const [search, setSearch] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 20]);
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [citiesByCountry, setCitiesByCountry] = useState<CitiesByCountry>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/worldcities.csv");
        const text = await res.text();

        const map = buildCitiesByCountry(text);
        setCitiesByCountry(map);
      } catch (err) {
        console.error("Failed to load worldcities.csv", err);
      }
    })();
  }, []);

  const visibleCities = useMemo(() => {
    if (!selectedCountryName) return [];
    return citiesByCountry[selectedCountryName] || [];
  }, [selectedCountryName, citiesByCountry]);

  const filteredCities = useMemo(() => {
    const lower = search.toLowerCase();
    return visibleCities.filter((c) => c.name.toLowerCase().includes(lower));
  }, [search, visibleCities]);

  const getZoomForFeature = (feature: GeoPermissibleObjects) => {
    const pathGen = geoPath();
    const area = pathGen.area(feature);
    if (area > 4000) return 2.5;
    if (area > 1500) return 3.5;
    if (area > 500) return 4.5;
    return 6;
  };

  const handleResetWorld = () => {
    setSelectedCountryName(null);
    setSelectedCity(null);
    setHoverCity(null);
    setMapCenter([0, 20]);
    setMapZoom(1);
    setSearch("");
  };

  const confirmSelection = () => {
    if (!selectedCountryName || !selectedCity) return;
    onConfirm?.({
      countryName: selectedCountryName,
      city: selectedCity,
    });
  };

  const handleCountryClick = async (
    geo: ExtendedFeature<GeoGeometryObjects>
  ) => {
    const countryName = geo.properties?.name as string | undefined;
    if (!countryName) return;

    const [lng, lat] = geoCentroid(geo);

    setSelectedCountryName(countryName);
    setSelectedCity(null);
    setHoverCity(null);
    setSearch("");

    setMapCenter([lng, lat]);
    setMapZoom(getZoomForFeature(geo));
  };

  const selectCity = (city: CityRecord) => {
    setSelectedCity(city);
    setHoverCity(null);

    setMapCenter(city.coords);
    setMapZoom(8);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex flex-col">
          <div className="text-xs uppercase tracking-wider">
            {selectedCountryName ? "Select a city" : "Select a country"}
          </div>

          <div className="text-sm font-medium text-slate-100">
            {selectedCity
              ? `${selectedCity.name}, ${selectedCountryName ?? ""}`
              : selectedCountryName || "World"}
          </div>
        </div>
      </div>

      <div className="relative h-full">
        <ComposableMap projection="geoMercator" className="h-full w-full">
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

            {hoverCity && (
              <Marker
                key={hoverCity.name}
                coordinates={hoverCity.coords}
                onClick={() => setSelectedCity(hoverCity)}
                style={{
                  default: { cursor: "pointer" },
                  hover: { cursor: "pointer" },
                  pressed: { cursor: "pointer" },
                }}
              >
                <circle r={0.5} fill={"#38bdf8"} strokeWidth={1} />
                <CityLabel name={hoverCity.name} fill={"#f98501ff"} />
              </Marker>
            )}

            {selectedCity && (
              <Marker coordinates={selectedCity.coords}>
                <circle r={0.5} fill="#FF875B" />
                <CityLabel name={selectedCity.name} fill={"#f98501ff"} />
              </Marker>
            )}
          </ZoomableGroup>
        </ComposableMap>

        <div className="absolute bottom-4 right-4 w-64 max-w-[80vw] max-h-[60vh] bg-slate-900/90 backdrop-blur rounded-xl border border-slate-700 p-4 text-sm shadow-xl flex flex-col">
          {!selectedCountryName && (
            <div className="text-slate-400 text-sm">
              Click a country to zoom in 🌍
            </div>
          )}

          {selectedCountryName && !selectedCity && (
            <>
              <div className="flex-shrink-0 relative z-10">
                <div className="flex items-center text-[10px] justify-between text-slate-400 uppercase tracking-wider mb-2">
                  Cities in {selectedCountryName}
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleResetWorld}
                  >
                    Reset
                  </button>
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
                    onChange={(v) => setSearch(v.currentTarget.value)}
                    value={search}
                    placeholder="Search"
                    className="bg-transparent outline-none w-full text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </label>
              </div>

              {filteredCities.length === 0 && (
                <div className="text-slate-500 text-xs my-4">
                  No cities found.
                </div>
              )}

              <ul className="flex-1 overflow-y-auto space-y-2 pr-1 pt-2 border-t border-slate-700">
                {filteredCities.map((city) => (
                  <li
                    key={`${city.name}-${city.coords[0]}-${city.coords[1]}`}
                    onMouseEnter={() => setHoverCity(city)}
                    onMouseLeave={() => setHoverCity(null)}
                  >
                    <button
                      className="w-full text-left p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition text-slate-100"
                      onClick={() => selectCity(city)}
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
            </>
          )}

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
    </div>
  );
}
