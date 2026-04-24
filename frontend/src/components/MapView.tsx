import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import type { LatLngExpression, Map } from 'leaflet';
import type { RoutePoint } from '../types';

const Wrap = styled.section`
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  overflow: hidden;
`;

const MapCanvas = styled.div`
  width: 100%;
  min-height: 360px;
`;

const Fallback = styled.div`
  padding: 18px;
  color: var(--text-secondary);
  background: var(--surface-muted);
`;

const PointsList = styled.ul`
  margin: 8px 0 0;
  padding-left: 18px;
`;

const OSRM_BASE_URL = import.meta.env.VITE_OSRM_API_URL || 'https://router.project-osrm.org';

const buildOsrmRoute = async (points: RoutePoint[]): Promise<LatLngExpression[] | null> => {
  if (points.length < 2) {
    return null;
  }

  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(';');
  const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('OSRM route request failed');
  }

  const data = (await response.json()) as {
    routes?: Array<{ geometry?: { coordinates?: [number, number][] } }>;
  };

  const rawCoordinates = data.routes?.[0]?.geometry?.coordinates;
  if (!rawCoordinates || rawCoordinates.length === 0) {
    return null;
  }

  return rawCoordinates.map(([lng, lat]) => [lat, lng]);
};

export const MapView = ({ points }: { points: RoutePoint[] }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;

    const initialize = async () => {
      if (points.length === 0) {
        setError('Нет точек маршрута');
        return;
      }

      try {
        const L = await import('leaflet');
        if (disposed || !mapContainerRef.current) {
          return;
        }

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
        });
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const pointLatLngs: LatLngExpression[] = points.map((point) => [point.lat, point.lng]);

        points.forEach((point, index) => {
          L.circleMarker([point.lat, point.lng], {
            radius: 6,
            weight: 2,
            color: '#6f9478',
            fillColor: '#9bb9a2',
            fillOpacity: 1,
          })
            .addTo(map)
            .bindTooltip(point.name || `Точка ${index + 1}`);
        });

        let routeLatLngs: LatLngExpression[] = pointLatLngs;
        try {
          const osrmRoute = await buildOsrmRoute(points);
          if (osrmRoute && osrmRoute.length > 1) {
            routeLatLngs = osrmRoute;
          }
        } catch {
          // fallback: draw a direct polyline between provided points
        }

        L.polyline(routeLatLngs, {
          color: '#6f9478',
          weight: 5,
          opacity: 0.9,
        }).addTo(map);

        map.fitBounds(L.latLngBounds(routeLatLngs), { padding: [24, 24] });
        setError(null);
      } catch (err) {
        setError((err as Error).message || 'Не удалось отобразить карту');
      }
    };

    void initialize();

    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [points]);

  if (error) {
    return (
      <Wrap>
        <Fallback>
          <div>{error}</div>
          <PointsList>
            {points.map((point, index) => (
              <li key={`${point.lat}-${point.lng}-${index}`}>
                {point.name || `Точка ${index + 1}`}: {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
              </li>
            ))}
          </PointsList>
        </Fallback>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <MapCanvas ref={mapContainerRef} />
    </Wrap>
  );
};
