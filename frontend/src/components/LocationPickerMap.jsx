import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  LayersControl,
  ScaleControl,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "../context/ThemeContext.jsx";

const DEFAULT_CENTER = [27.7172, 85.324];

const parseCoordinatePair = (value) => {
  if (!value || typeof value !== "string") return null;
  const match = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);

  if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  ) {
    return [latitude, longitude];
  }

  return null;
};

const MapClickHandler = ({ onPick }) => {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
};

const MapViewportUpdater = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (Array.isArray(center) && center.length === 2) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

const LocationPickerMap = ({ locationValue, onLocationSelect }) => {
  const { isDark } = useTheme();
  const initialCoordinatePair = useMemo(
    () => parseCoordinatePair(locationValue),
    [locationValue],
  );
  const [selected, setSelected] = useState(initialCoordinatePair);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [mapCenter, setMapCenter] = useState(initialCoordinatePair || DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(initialCoordinatePair ? 15 : 12);

  useEffect(() => {
    if (!locationValue?.trim()) {
      setSelected(null);
      return;
    }

    const parsed = parseCoordinatePair(locationValue);
    if (parsed) {
      setSelected(parsed);
      setMapCenter(parsed);
      setMapZoom(15);
    }
  }, [locationValue]);

  useEffect(() => {
    if (!locationValue?.trim()) {
      setMapCenter(DEFAULT_CENTER);
      setMapZoom(12);
    }
  }, [locationValue]);

  const center = mapCenter || selected || initialCoordinatePair || DEFAULT_CENTER;

  const resolveAddress = async (lat, lng) => {
    try {
      setIsLoadingAddress(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { Accept: "application/json" } },
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const result = await response.json();
      const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onLocationSelect(result?.display_name || fallback);
    } catch (error) {
      console.error("Failed to reverse geocode location", error);
      onLocationSelect(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleMapPick = (lat, lng) => {
    setSelected([lat, lng]);
    setMapCenter([lat, lng]);
    setMapZoom(16);
    resolveAddress(lat, lng);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setSearchResults([]);
      setSearchError("");
      return;
    }

    try {
      setIsSearching(true);
      setSearchError("");
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(trimmedQuery)}`,
        { headers: { Accept: "application/json" } },
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const results = await response.json();
      setSearchResults(Array.isArray(results) ? results : []);

      if (!results?.length) {
        setSearchError("No locations found.");
      }
    } catch (error) {
      console.error("Failed to search locations", error);
      setSearchResults([]);
      setSearchError("Unable to search location right now.");
    } finally {
      setIsSearching(false);
    }
  };

  const chooseSearchResult = (result) => {
    const latitude = Number(result?.lat);
    const longitude = Number(result?.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    setSelected([latitude, longitude]);
    setMapCenter([latitude, longitude]);
    setMapZoom(16);
    onLocationSelect(result?.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    setSearchResults([]);
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search location on map"
          className="w-full rounded-lg border border-white/15 bg-secondary px-3 py-2 text-sm text-text-primary focus:border-[#D72626] focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="rounded-lg bg-[#D72626] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSearching ? "..." : "Search"}
        </button>
      </form>
      {searchResults.length > 0 && (
        <div className="max-h-40 overflow-y-auto rounded-lg border border-white/15 bg-secondary">
          {searchResults.map((result) => (
            <button
              key={`${result.place_id}`}
              type="button"
              onClick={() => chooseSearchResult(result)}
              className="block w-full border-b border-white/10 px-3 py-2 text-left text-xs text-text-primary hover:bg-white/10 last:border-b-0"
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}
      {searchError && <p className="text-xs text-amber-300">{searchError}</p>}
      <div className="h-72 w-full overflow-hidden rounded-xl border border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.35)] md:h-80">
        <MapContainer
          center={center}
          zoom={mapZoom}
          scrollWheelZoom
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked={!isDark} name="Detailed Streets">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={isDark} name="Dark Streets">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Classic OSM">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          <MapViewportUpdater center={center} zoom={mapZoom} />
          <ZoomControl position="bottomright" />
          <ScaleControl position="bottomleft" imperial={false} />
          <MapClickHandler onPick={handleMapPick} />
          {selected && (
            <CircleMarker
              center={selected}
              radius={10}
              pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#D72626", fillOpacity: 0.95 }}
            />
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-slate-400">
        Click on map to choose location. {isLoadingAddress ? "Resolving address..." : ""}
      </p>
    </div>
  );
};

export default LocationPickerMap;
