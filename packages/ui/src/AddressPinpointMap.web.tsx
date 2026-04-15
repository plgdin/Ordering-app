import React, { useEffect, useMemo, useRef, useState } from "react";

declare const process:
  | {
    env?: Record<string, string | undefined>;
  }
  | undefined;

type AddressShape = {
  houseNo: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  landmark?: string;
  lat?: number;
  lng?: number;
};

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const GOOGLE_MAPS_API_KEY = process?.env?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

let googleMapsPromise: Promise<any> | null = null;

export function AddressPinpointMap({
  address,
  onChange
}: {
  address: AddressShape;
  onChange: (patch: Partial<AddressShape>) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const syncTokenRef = useRef(0);
  const initializedRef = useRef(false);
  const latestAddressRef = useRef(address);
  const [status, setStatus] = useState<"loading" | "ready" | "missing-key" | "error">(
    GOOGLE_MAPS_API_KEY ? "loading" : "missing-key"
  );
  const [caption, setCaption] = useState("");
  const addressLabel = useMemo(() => composeAddress(address), [address]);

  useEffect(() => {
    latestAddressRef.current = address;
  }, [address]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setStatus("missing-key");
      return;
    }

    let cancelled = false;

    const initializeMap = async () => {
      try {
        const google = await loadGoogleMaps(GOOGLE_MAPS_API_KEY);
        if (cancelled || !containerRef.current) return;

        const startCenter =
          typeof address.lat === "number" && typeof address.lng === "number"
            ? { lat: address.lat, lng: address.lng }
            : DEFAULT_CENTER;

        const map = new google.maps.Map(containerRef.current, {
          center: startCenter,
          zoom:
            typeof address.lat === "number" && typeof address.lng === "number" ? 17 : 5,
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: "greedy",
          mapId: "DEMO_MAP_ID"
        });

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: startCenter,
          title: "Delivery location",
          gmpDraggable: true
        });

        const geocoder = new google.maps.Geocoder();

        mapRef.current = map;
        markerRef.current = marker;
        geocoderRef.current = geocoder;
        initializedRef.current = true;
        setStatus("ready");

        map.addListener("click", (event: any) => {
          const next = readLatLng(event?.latLng);
          if (next) {
            void applyMarkerPosition(next.lat, next.lng, true);
          }
        });

        marker.addListener("dragend", () => {
          const next = readLatLng(marker.position);
          if (next) {
            void applyMarkerPosition(next.lat, next.lng, true);
          }
        });

        if (typeof address.lat === "number" && typeof address.lng === "number") {
          void applyMarkerPosition(address.lat, address.lng, true);
          return;
        }

        if (addressLabel) {
          const initialLocation = await geocodeAddress(geocoder, addressLabel);
          if (initialLocation && !cancelled) {
            void applyMarkerPosition(initialLocation.lat, initialLocation.lng, true);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setCaption("Google Maps could not be loaded.");
        }
      }
    };

    const applyMarkerPosition = async (
      lat: number,
      lng: number,
      shouldReverseGeocode: boolean
    ) => {
      const map = mapRef.current;
      const marker = markerRef.current;
      const geocoder = geocoderRef.current;

      if (!map || !marker) return;

      const nextPosition = { lat, lng };
      marker.position = nextPosition;
      map.panTo(nextPosition);
      if (map.getZoom() < 16) {
        map.setZoom(17);
      }

      onChange({ lat, lng });

      if (!shouldReverseGeocode || !geocoder) {
        setCaption(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        return;
      }

      const token = ++syncTokenRef.current;

      try {
        const result = await reverseGeocode(geocoder, lat, lng);
        if (!result || token !== syncTokenRef.current || cancelled) return;

        setCaption(result.formatted_address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        onChange({
          lat,
          lng,
          ...extractAddressPatch(result, latestAddressRef.current)
        });
      } catch {
        if (token === syncTokenRef.current && !cancelled) {
          setCaption(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      }
    };

    void initializeMap();

    return () => {
      cancelled = true;
      initializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!initializedRef.current) return;
    if (typeof address.lat !== "number" || typeof address.lng !== "number") return;

    const nextPosition = { lat: address.lat, lng: address.lng };
    const marker = markerRef.current;
    const map = mapRef.current;

    if (!marker || !map) return;

    const currentPosition = readLatLng(marker.position);
    if (
      currentPosition &&
      Math.abs(currentPosition.lat - nextPosition.lat) < 0.000001 &&
      Math.abs(currentPosition.lng - nextPosition.lng) < 0.000001
    ) {
      return;
    }

    marker.position = nextPosition;
    map.panTo(nextPosition);
  }, [address.lat, address.lng]);

  if (status === "missing-key") {
    return (
      <div style={shellStyle}>
        <div style={messageCardStyle}>
          <div style={messageTitleStyle}>Google Maps API key needed</div>
          <div style={messageBodyStyle}>
            Set <code>EXPO_PUBLIC_GOOGLE_MAPS_API_KEY</code> and enable Maps
            JavaScript API plus Geocoding API in Google Cloud.
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={shellStyle}>
        <div style={messageCardStyle}>
          <div style={messageTitleStyle}>Google Maps failed to load</div>
          <div style={messageBodyStyle}>
            Check the API key, allowed referrers, and that billing is enabled.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <div ref={containerRef} style={mapSurfaceStyle} />
      <div style={overlayStyle}>
        <div style={overlayTitleStyle}>Tap or drag to pinpoint your location</div>
        <div style={overlayBodyStyle}>
          {caption || addressLabel || "Loading your map..."}
        </div>
      </div>
      {status === "loading" ? <div style={loadingBadgeStyle}>Loading Google Maps...</div> : null}
    </div>
  );
}

async function loadGoogleMaps(apiKey: string) {
  if ((window as any).google?.maps) {
    return (window as any).google;
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("google-maps-script") as
      | HTMLScriptElement
      | null;

    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).google), {
        once: true
      });
      existing.addEventListener("error", () => reject(new Error("load-error")), {
        once: true
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.async = true;
    script.defer = true;
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}` +
      "&v=weekly&loading=async&libraries=marker";
    script.onload = () => resolve((window as any).google);
    script.onerror = () => reject(new Error("load-error"));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

async function geocodeAddress(geocoder: any, address: string) {
  const response = await geocoder.geocode({ address });
  return readLatLng(response?.results?.[0]?.geometry?.location);
}

async function reverseGeocode(geocoder: any, lat: number, lng: number) {
  const response = await geocoder.geocode({ location: { lat, lng } });
  return response?.results?.[0] ?? null;
}

function extractAddressPatch(result: any, current: AddressShape): Partial<AddressShape> {
  const components = result?.address_components ?? [];
  const route = readComponent(components, "route");
  const sublocality =
    readComponent(components, "sublocality_level_1") ||
    readComponent(components, "sublocality") ||
    readComponent(components, "neighborhood");
  const locality =
    readComponent(components, "locality") ||
    readComponent(components, "administrative_area_level_2");
  const postalCode = readComponent(components, "postal_code");

  return {
    street: route || current.street,
    area: sublocality || current.area,
    city: locality || current.city,
    pincode: postalCode || current.pincode
  };
}

function readComponent(components: any[], type: string) {
  return components.find((component) => component.types?.includes(type))?.long_name ?? "";
}

function readLatLng(value: any) {
  if (!value) return null;

  if (typeof value.lat === "function" && typeof value.lng === "function") {
    return { lat: value.lat(), lng: value.lng() };
  }

  if (typeof value.lat === "number" && typeof value.lng === "number") {
    return { lat: value.lat, lng: value.lng };
  }

  if (typeof value.toJSON === "function") {
    return value.toJSON();
  }

  return null;
}

function composeAddress(address: AddressShape) {
  return [address.houseNo, address.street, address.area, address.city, address.pincode]
    .filter(Boolean)
    .join(", ");
}

const shellStyle: React.CSSProperties = {
  position: "relative",
  height: 180,
  marginTop: 20,
  marginBottom: 16,
  overflow: "hidden",
  borderRadius: 18,
  border: "1px solid #D1E3D6",
  background: "#EAF5ED"
};

const mapSurfaceStyle: React.CSSProperties = {
  width: "100%",
  height: "100%"
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  left: 12,
  right: 12,
  bottom: 12,
  padding: "12px 14px",
  borderRadius: 16,
  background: "rgba(255, 255, 255, 0.88)",
  backdropFilter: "blur(8px)"
};

const overlayTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: "#1A2A1E",
  marginBottom: 4
};

const overlayBodyStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 18,
  color: "#5A6B5E"
};

const loadingBadgeStyle: React.CSSProperties = {
  position: "absolute",
  top: 12,
  left: 12,
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(17, 17, 17, 0.76)",
  color: "#FFFFFF",
  fontSize: 12,
  fontWeight: 700
};

const messageCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  padding: 20,
  textAlign: "center",
  background: "linear-gradient(135deg, #EDF4EE 0%, #E3F1E6 100%)"
};

const messageTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  color: "#1A2A1E",
  marginBottom: 8
};

const messageBodyStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 20,
  color: "#5A6B5E",
  maxWidth: 360
};
