import React, { useState, useEffect, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import {
  geoCentroid,
  type ExtendedFeature,
  type GeoGeometryObjects,
} from "d3-geo";
import type { CitiesByCountry, CityRecord } from "./types";
import { loadCityData } from "./utils";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useToast } from "../../hooks/useToast";
import { Virtuoso } from "react-virtuoso";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const DEFAULT_MAP_CENTER: [number, number] = [15, 20];
const DEFAULT_ZOOM = 4;

type Selection = {
  country?: string;
  city?: CityRecord;
};

type MapControls = {
  center: [number, number];
  zoom: number;
};

type WorldMapProps = {
  ref: React.RefObject<HTMLDialogElement | null>;
};
export const WorldMap: React.FC<WorldMapProps> = ({ ref }) => {
  const [selected, setSelection] = useState<Selection>({
    city: undefined,
    country: undefined,
  });
  const [mapControls, setMapControls] = useState<MapControls>({
    center: DEFAULT_MAP_CENTER,
    zoom: DEFAULT_ZOOM,
  });
  const [hoverCity, setHoverCity] = useState<CityRecord>();
  const [search, setSearch] = useState<string>();
  const citiesByCountryRef = useRef<CitiesByCountry>({});
  const { setLocation } = useLocalStorage();
  const { ToastHolder, sendMessage } = useToast();

  useEffect(() => {
    (async () => {
      try {
        citiesByCountryRef.current = await loadCityData();
      } catch (err) {
        console.error("Failed to load worldcities.csv", err);
      }
    })();
  }, []);

  const handleResetWorld = () => {
    setSelection({ city: undefined, country: undefined });
    setMapControls({ center: DEFAULT_MAP_CENTER, zoom: DEFAULT_ZOOM });
    setHoverCity(undefined);
    setSearch(undefined);
  };

  const confirmSelection = () => {
    if (!selected.country || !selected.city) return;
    setLocation({ city: selected.city, country: selected.country });
    sendMessage(`Saved location to ${selected.city.name}`);
    ref.current?.close();
    handleResetWorld();
  };

  const handleCountryClick = async (
    geo: ExtendedFeature<GeoGeometryObjects>
  ) => {
    const countryName = geo.properties?.name as string | undefined;
    const [lng, lat] = geoCentroid(geo);

    setSelection({ country: countryName, city: undefined });
    setMapControls({
      center: [lng, lat],
      zoom: DEFAULT_ZOOM,
    });
    setHoverCity(undefined);
    setSearch(undefined);
  };

  const selectCity = (city: CityRecord) => {
    setSelection((prev) => ({ ...prev, city }));
    setMapControls({ center: city.coords, zoom: DEFAULT_ZOOM });
    setHoverCity(undefined);
  };

  const visibleCities = selected.country
    ? citiesByCountryRef.current[selected.country] || []
    : [];

  const filteredCities = visibleCities.filter((c) =>
    c.name.toLowerCase().includes(search?.toLowerCase() || "")
  );

  return (
    <div className="flex flex-col h-full">
      {ToastHolder}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex flex-col">
          <div className="text-xs uppercase tracking-wider">
            {selected.country ? "Select a city" : "Select a country"}
          </div>
          <div className="text-sm font-medium text-slate-100">
            {selected.city
              ? `${selected.city.name}, ${selected.country ?? ""}`
              : selected.country || "World"}
          </div>
        </div>
      </div>

      <ComposableMap projection="geoMercator">
        <ZoomableGroup center={mapControls.center} zoom={mapControls.zoom}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties?.name;
                const isSelected = !!name && name === selected.country;

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
            <Marker coordinates={hoverCity.coords}>
              <circle r={0.5} fill={"#FF875B"} strokeWidth={1} />
            </Marker>
          )}

          {selected.city && (
            <Marker coordinates={selected.city.coords}>
              <circle r={0.5} fill="#FF875B" />
            </Marker>
          )}
        </ZoomableGroup>
      </ComposableMap>

      <div className="flex flex-col cursor-pointer max-h-[60vh] backdrop-blur rounded-xl p-4 text-sm md:absolute md:top-24 md:right-4 md:w-64 md:bg-slate-900/90 md:border border-slate-700 md:shadow-xl">
        {!selected.country && (
          <div className="text-slate-400 text-sm">
            Click a country to zoom in 🌍
          </div>
        )}

        {selected.country && !selected.city && (
          <>
            <div className="flex-shrink-0 relative z-10">
              <div className="flex items-center text-[10px] justify-between text-slate-400 uppercase tracking-wider mb-2">
                Cities in {selected.country}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleResetWorld}
                >
                  Reset
                </button>
              </div>
              <label className="input flex items-center gap-2 mb-2 w-full">
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
                    testererer
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </g>
                </svg>
                <input
                  type="search"
                  onChange={(v) => setSearch(v.currentTarget.value)}
                  value={search}
                  placeholder="Search"
                  className="bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500"
                />
              </label>
            </div>

            {filteredCities.length === 0 && (
              <div className="text-slate-500 text-xs my-4">
                No cities found.
              </div>
            )}

            <Virtuoso
              style={{ height: 420 }}
              data={filteredCities}
              totalCount={filteredCities.length}
              itemContent={(_, city) => (
                <>
                  <div
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-700 transition text-slate-100 mt-2"
                    onClick={() => selectCity(city)}
                  >
                    <div className="text-sm font-medium">{city.name}</div>
                    <div className="text-sm text-slate-400">
                      lon {city.coords[0].toFixed(2)}, lat{" "}
                      {city.coords[1].toFixed(2)}
                    </div>
                  </div>
                  <div className="divider m-0 p-0" />
                </>
              )}
            />
          </>
        )}

        {selected.country && selected.city && (
          <div className="flex flex-col flex-1">
            <div className="text-xs uppercase tracking-wider mb-2">
              Selected city
            </div>

            <div className="text-lg font-semibold text-slate-100">
              {selected.city.name}
            </div>

            <div className="text-xs mb-4">{selected.country}</div>

            <div className="text-xs leading-relaxed mb-4">
              Lon/Lat:{" "}
              <span>
                {selected.city.coords[0].toFixed(2)},{" "}
                {selected.city.coords[1].toFixed(2)}
              </span>
            </div>

            <div className="space-y-2">
              <button
                className="btn btn-primary btn-sm w-full"
                onClick={confirmSelection}
              >
                Use {selected.city.name}
              </button>

              <button
                className="btn btn-ghost btn-sm w-full"
                onClick={() =>
                  setSelection((prev) => ({ ...prev, city: undefined }))
                }
              >
                Pick different city
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
