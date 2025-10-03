import { Layout } from '@common/components/layout';
import { Sidebar } from '@common/components/sidebar';
import { Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import flameSmall from '@assets/images/icons/flame_small.gif';
import outputStatic from '@assets/images/output_2.png';
import outputGif from '@assets/images/output.gif';
import firewallIcon from '@assets/images/firewall.png';
import logo from '@assets/images/logo_v3.png';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WILDFIRE_DETECTED_PERIMETER, FIREWALLS_LOCATIONS } from '@common/constants';

export type MapConfig = {
  id: string;
  label: string;
  mapId?: string;
  mapTypeId?: string;
  styles?: google.maps.MapTypeStyle[];
};

const MapTypeId = {
  HYBRID: 'hybrid',
  ROADMAP: 'roadmap',
  SATELLITE: 'satellite',
  TERRAIN: 'terrain'
};

// Start far from the fire area to nudge users to engage (e.g., Denver)
// const FAR_START_COORDS: google.maps.LatLngLiteral = { lat: 46.837235, lng: -109.477070 };
const FAR_START_COORDS: google.maps.LatLngLiteral = { lat: 47.163741, lng: -109.559723 };

const MAP_CONFIGS: MapConfig[] = [
  {
    id: 'light',
    label: 'Light',
    mapId: '49ae42fed52588c3',
    mapTypeId: MapTypeId.ROADMAP
  },
  {
    id: 'dark',
    label: 'Dark',
    mapId: '739af084373f96fe',
    mapTypeId: MapTypeId.ROADMAP
  },
  {
    id: 'satellite',
    label: 'Satellite (no mapId)',
    mapTypeId: MapTypeId.SATELLITE
  },
  {
    id: 'hybrid',
    label: 'Hybrid (no mapId)',
    mapTypeId: MapTypeId.HYBRID
  },
  {
    id: 'terrain',
    label: 'Terrain (no mapId)',
    mapTypeId: MapTypeId.TERRAIN
  },
  {
    id: 'satellite2',
    label: 'Satellite ("light" mapId)',
    mapId: '49ae42fed52588c3',
    mapTypeId: MapTypeId.SATELLITE
  },
  {
    id: 'hybrid2',
    label: 'Hybrid ("light" mapId)',
    mapId: '49ae42fed52588c3',
    mapTypeId: MapTypeId.HYBRID
  },
  {
    id: 'terrain2',
    label: 'Terrain ("light" mapId)',
    mapId: '49ae42fed52588c3',
    mapTypeId: MapTypeId.TERRAIN
  }
];

export function MapPage() {
  const [mapConfig, ] = useState<MapConfig>(MAP_CONFIGS[3]);
  const [center, setCenter] = useState<google.maps.LatLngLiteral>(FAR_START_COORDS);
  const [zoom, setZoom] = useState<number>(10);
  const [bounds, setBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [gridSize, setGridSize] = useState<number>(500);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [autoWeather, setAutoWeather] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [windSpeed, setWindSpeed] = useState<number>(10);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [windDirection, setWindDirection] = useState<number>(90);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [temperature, setTemperature] = useState<number>(20);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [humidity, setHumidity] = useState<number>(50);
  const [selectedPoints, setSelectedPoints] = useState<Array<google.maps.LatLngLiteral>>([]);
  const [cameraVersion, setCameraVersion] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [hoverPoint, setHoverPoint] = useState<google.maps.LatLngLiteral | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [fireVectors, setFireVectors] = useState<Array<{ start: google.maps.LatLngLiteral; end: google.maps.LatLngLiteral }>>([]);
  const [actionPlans, setActionPlans] = useState<Array<{ at: google.maps.LatLngLiteral; summary: string }>>([]);
  const [firewalls, setFirewalls] = useState<google.maps.LatLngLiteral[]>([]);
  const [spreadPredictions, setSpreadPredictions] = useState<Array<{ start: google.maps.LatLngLiteral; end: google.maps.LatLngLiteral }>>([]);
  const cameraControllerRef = useRef<CameraControllerHandle | null>(null);
  const [selectedFireId, setSelectedFireId] = useState<string | null>('wf-1');
  const [activeTab, setActiveTab] = useState<'controls' | 'results'>('controls');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const perimeterDays = useMemo(() => {
    const dict = WILDFIRE_DETECTED_PERIMETER as unknown as Record<string, Array<[number, number]>>;
    return Object.entries(dict)
      .filter(([, coords]) => Array.isArray(coords) && coords.length > 0)
      .map(([k]) => k)
      .sort();
  }, []);
  const [perimeterIdx, setPerimeterIdx] = useState<number>(0);
  const perimeterCoords = useMemo<google.maps.LatLngLiteral[]>(() => {
    const key = perimeterDays[perimeterIdx];
    const dict = WILDFIRE_DETECTED_PERIMETER as unknown as Record<string, Array<[number, number]>>;
    const arr = dict[key] || [];
    return arr.map(([lat, lng]) => ({ lat, lng }));
  }, [perimeterDays, perimeterIdx]);

  const perimeterCentroid = useMemo<google.maps.LatLngLiteral | null>(() => {
    if (perimeterCoords.length === 0) return null;
    let sumLat = 0;
    let sumLng = 0;
    for (const p of perimeterCoords) { sumLat += p.lat; sumLng += p.lng; }
    return { lat: sumLat / perimeterCoords.length, lng: sumLng / perimeterCoords.length };
  }, [perimeterCoords]);

  const radarRadius = useMemo(() => {
    if (perimeterCoords.length === 0) return 0;
    if (!perimeterCentroid) return 0;
    let maxDist = 0;
    for (const p of perimeterCoords) {
      const dLat = p.lat - perimeterCentroid.lat;
      const dLng = p.lng - perimeterCentroid.lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist > maxDist) maxDist = dist;
    }
    // Convert degree distance to approximate meters (rough estimate)
    const radiusMeters = maxDist * 111320;
    return radiusMeters;
  }, [perimeterCoords, perimeterCentroid]);

  const handleCameraChanged = useCallback((ev: unknown) => {
    const e = ev as { detail?: { center?: google.maps.LatLng | google.maps.LatLngLiteral | null; zoom?: number } };
    const ll = e?.detail?.center as unknown;
    if (ll) {
      // @ts-expect-error runtime type guard for google.maps.LatLng vs LatLngLiteral
      const lat = typeof ll.lat === 'function' ? ll.lat() : ll.lat;
      // @ts-expect-error runtime type guard for google.maps.LatLng vs LatLngLiteral
      const lng = typeof ll.lng === 'function' ? ll.lng() : ll.lng;
      if (typeof lat === 'number' && typeof lng === 'number') setCenter({ lat, lng });
    }
    if (typeof e?.detail?.zoom === 'number') setZoom(e.detail.zoom);
    setCameraVersion((v) => v + 1);
  }, []);

  const formattedCoords = useMemo(() => `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`,[center]);

  // Convert gridSize in meters to degree steps using local latitude
  const gridSteps = useMemo(() => {
    const METERS_PER_DEG_LAT = 111320; // approx
    const latRad = (center.lat * Math.PI) / 180;
    const metersPerDegLng = Math.max(111320 * Math.cos(latRad), 1); // avoid divide by ~0 near poles
    const latStepDeg = gridSize / METERS_PER_DEG_LAT;
    const lngStepDeg = gridSize / metersPerDegLng;
    return { latStepDeg, lngStepDeg };
  }, [gridSize, center.lat]);

  const gridLinesAndVertices = useMemo(() => {
    if (!bounds) return { hLines: [] as google.maps.LatLngLiteral[][], vLines: [] as google.maps.LatLngLiteral[][], vertices: [] as google.maps.LatLngLiteral[] };
    const { north, south, east, west } = bounds;
    const { latStepDeg, lngStepDeg } = gridSteps;

    // Find the first grid line <= bound start
    const startLat = Math.floor(south / latStepDeg) * latStepDeg;
    const startLng = Math.floor(west / lngStepDeg) * lngStepDeg;

    const hLines: google.maps.LatLngLiteral[][] = [];
    const vLines: google.maps.LatLngLiteral[][] = [];
    const vertices: google.maps.LatLngLiteral[] = [];

    // Safety limits
    const maxLines = 2000;
    const maxVertices = 12000;

    // Horizontal lines (constant lat)
    let lat = startLat;
    let hCount = 0;
    while (lat <= north && hCount < maxLines) {
      hLines.push([
        { lat, lng: west },
        { lat, lng: east },
      ]);
      // Add vertices along this line
      let lng = startLng;
      let vPerLine = 0;
      while (lng <= east && vertices.length < maxVertices && vPerLine < maxLines) {
        if (lng >= west) vertices.push({ lat, lng });
        lng += lngStepDeg;
        vPerLine++;
      }
      lat += latStepDeg;
      hCount++;
    }

    // Vertical lines (constant lng)
    let lng = startLng;
    let vCount = 0;
    while (lng <= east && vCount < maxLines) {
      vLines.push([
        { lat: south, lng },
        { lat: north, lng },
      ]);
      lng += lngStepDeg;
      vCount++;
    }

    return { hLines, vLines, vertices };
  }, [bounds, gridSteps]);

  const gridStrokeWeight = useMemo(() => {
    // Thicker when zoomed in; minimum stroke when zoomed out
    if (zoom >= 21) return 2;
    if (zoom >= 20) return 1.5;
    return 1;
  }, [zoom]);

  // Load fire vectors from localStorage on mount
  useEffect(() => {
    try {
      const savedVectors = localStorage.getItem('fire-vectors');
      const savedPlans = localStorage.getItem('action-plans');
      if (savedVectors) {
        const vectors = JSON.parse(savedVectors);
        setFireVectors(vectors);
      }
      if (savedPlans) {
        const plans = JSON.parse(savedPlans);
        setActionPlans(plans);
      }
    } catch (error) {
      console.warn('Failed to load fire data from localStorage:', error);
    }
  }, []);

  // Save fire vectors to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('fire-vectors', JSON.stringify(fireVectors));
      localStorage.setItem('action-plans', JSON.stringify(actionPlans));
    } catch (error) {
      console.warn('Failed to save fire data to localStorage:', error);
    }
  }, [fireVectors, actionPlans]);

  const processImagesMapAsync = useCallback(async () => {
    if (processing) return;
    setProcessing(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 3000));
      // Base direction: use current wind direction, with small random jitter to simulate spread
      const baseBearing = typeof windDirection === 'number' ? windDirection : 60;
      const jitterRangeDeg = 25; // +/- degrees
      // Shorter arrows; lightly scale with wind speed
      const distanceMetersBase = 80;
      const distanceMeters = distanceMetersBase + Math.max(0, Math.min(60, windSpeed)) * 2;
      const R = 6371000; // Earth radius in meters
      function projectMeters(from: google.maps.LatLngLiteral, distance: number, bearing: number): google.maps.LatLngLiteral {
        const lat1 = (from.lat * Math.PI) / 180;
        const lng1 = (from.lng * Math.PI) / 180;
        const brng = (bearing * Math.PI) / 180;
        const angDist = distance / R;
        const lat2 = Math.asin(
          Math.sin(lat1) * Math.cos(angDist) + Math.cos(lat1) * Math.sin(angDist) * Math.cos(brng),
        );
        const lng2 =
          lng1 +
          Math.atan2(
            Math.sin(brng) * Math.sin(angDist) * Math.cos(lat1),
            Math.cos(angDist) - Math.sin(lat1) * Math.sin(lat2),
          );
        return { lat: (lat2 * 180) / Math.PI, lng: ((lng2 * 180) / Math.PI) };
      }

      const vectors: Array<{ start: google.maps.LatLngLiteral; end: google.maps.LatLngLiteral }> = selectedPoints.map((p) => {
        const jitter = (Math.random() * 2 - 1) * jitterRangeDeg;
        const bearingDeg = baseBearing + jitter;
        return {
          start: p,
          end: projectMeters(p, distanceMeters, bearingDeg),
        };
      });
      setFireVectors(vectors);

      const plans = vectors.map((v, idx) => ({
        at: v.end,
        summary: `Plan ${idx + 1}: Establish 30m firewall ahead of projected spread; stage crew downwind.`,
      }));
      setActionPlans(plans);

      // Convert FIREWALLS_LOCATIONS to LatLngLiteral format
      const firewallLocations = (FIREWALLS_LOCATIONS as Array<[number, number]>).map(([lat, lng]) => ({ lat, lng }));
      setFirewalls(firewallLocations);

      // Calculate fire spread prediction arrows from perimeter
      if (perimeterCoords.length > 0 && perimeterCentroid) {
        // Sample points from perimeter to create spread predictions
        const sampleInterval = Math.max(1, Math.floor(perimeterCoords.length / 25)); // Take ~25 sample points
        const predictions: Array<{ start: google.maps.LatLngLiteral; end: google.maps.LatLngLiteral }> = [];

        for (let i = 0; i < perimeterCoords.length; i += sampleInterval) {
          const point = perimeterCoords[i];

          // Calculate direction away from centroid (outward)
          const dLat = point.lat - perimeterCentroid.lat;
          const dLng = point.lng - perimeterCentroid.lng;
          const distance = Math.sqrt(dLat * dLat + dLng * dLng);

          if (distance > 0) {
            // Normalize direction
            const normLat = dLat / distance;
            const normLng = dLng / distance;

            // Add some random variation to make it look more natural (±20 degrees)
            const angle = Math.atan2(normLng, normLat);
            const jitterAngle = angle + (Math.random() - 0.5) * (Math.PI / 4.5); // ±20 degrees

            // Project outward by a MUCH longer distance (in degrees, roughly 800-1200 meters)
            const spreadDistance = 0.007 + Math.random() * 0.004; // 0.007-0.011 degrees (much longer arrows)
            const endLat = point.lat + Math.cos(jitterAngle) * spreadDistance;
            const endLng = point.lng + Math.sin(jitterAngle) * spreadDistance;

            predictions.push({
              start: point,
              end: { lat: endLat, lng: endLng }
            });
          }
        }

        setSpreadPredictions(predictions);
      }

      // Switch to results tab after processing
      setActiveTab('results');
    } finally {
      setProcessing(false);
    }
  }, [processing, selectedPoints, windDirection, windSpeed, perimeterCoords, perimeterCentroid]);

  const toggleVertex = useCallback((pt: google.maps.LatLngLiteral) => {
    setSelectedPoints((prev) => {
      const idx = prev.findIndex(p => Math.abs(p.lat - pt.lat) < 1e-9 && Math.abs(p.lng - pt.lng) < 1e-9);
      if (idx >= 0) {
        const copy = prev.slice();
        copy.splice(idx, 1);
        return copy;
      }
      return [...prev, pt];
    });
  }, []);

  useEffect(() => {
    if (showGrid) {
      setCameraVersion((v) => v + 1);
    }
  }, [showGrid]);

  useEffect(() => {
    // When grid size changes, refresh bounds so grid is regenerated for current viewport
    setCameraVersion((v) => v + 1);
  }, [gridSize]);

  const getNearestVertex = useCallback((p: google.maps.LatLngLiteral, candidates: google.maps.LatLngLiteral[]) => {
    if (candidates.length === 0) return null;
    let best = candidates[0];
    let bestD = Number.POSITIVE_INFINITY;
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      const d = (c.lat - p.lat) * (c.lat - p.lat) + (c.lng - p.lng) * (c.lng - p.lng);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    return best;
  }, []);

  // Center map to perimeter centroid when day changes
  useEffect(() => {
    if (perimeterCoords.length === 0) return;
    let sumLat = 0;
    let sumLng = 0;
    for (const p of perimeterCoords) { sumLat += p.lat; sumLng += p.lng; }
    const centroid = { lat: sumLat / perimeterCoords.length, lng: sumLng / perimeterCoords.length } as google.maps.LatLngLiteral;
    cameraControllerRef.current?.animateTo(centroid);
  }, [perimeterIdx, perimeterCoords]);

  // When grid changes (size or bounds), re-snap selected points and hover to nearest current vertices
  useEffect(() => {
    if (!bounds) return;
    const vertices = gridLinesAndVertices.vertices;
    if (vertices.length === 0) return;

    if (hoverPoint) {
      const snapped = getNearestVertex(hoverPoint, vertices);
      if (snapped) setHoverPoint(snapped);
    }

    if (selectedPoints.length > 0) {
      const snappedPoints: google.maps.LatLngLiteral[] = selectedPoints
        .map((p) => getNearestVertex(p, vertices))
        .filter((p): p is google.maps.LatLngLiteral => !!p);

      // Deduplicate very close points
      const uniq = new globalThis.Map<string, google.maps.LatLngLiteral>();
      for (const p of snappedPoints) {
        const key = `${p.lat.toFixed(9)},${p.lng.toFixed(9)}`;
        if (!uniq.has(key)) uniq.set(key, p);
      }

      const next: google.maps.LatLngLiteral[] = Array.from(uniq.values());
      // Only set if changed in size or any coord differs
      if (
        next.length !== selectedPoints.length ||
        next.some((np, i) =>
          Math.abs(np.lat - selectedPoints[i].lat) > 1e-12 ||
          Math.abs(np.lng - selectedPoints[i].lng) > 1e-12
        )
      ) {
        setSelectedPoints(next);
      }
    }
  }, [bounds, gridLinesAndVertices.vertices, hoverPoint, selectedPoints, getNearestVertex]);

  const makeCircleDataUrl = (color: string) => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><circle cx='6' cy='6' r='5' fill='${color}'/></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };


  // Safe constructors for Google Maps objects that may not be available at first render
  const makeGPoint = useCallback((x: number, y: number): google.maps.Point | undefined => {
    try {
      if (typeof google !== 'undefined' && google?.maps?.Point) return new google.maps.Point(x, y);
    } catch {
      // ignore until API is ready
    }
    return undefined;
  }, []);

  const makeGSize = useCallback((w: number, h: number): google.maps.Size | undefined => {
    try {
      if (typeof google !== 'undefined' && google?.maps?.Size) return new google.maps.Size(w, h);
    } catch {
      // ignore until API is ready
    }
    return undefined;
  }, []);

  return (
    <Layout>
      <div className='flex flex-col md:flex-row' style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <Sidebar />
        <main className='flex-1 text-gray-900 overflow-hidden relative'>
          {/* Mobile menu toggle button */}
          <button
            className='md:hidden fixed top-18 right-4 z-50 p-3 rounded-lg shadow-lg cursor-pointer'
            style={{ backgroundColor: '#111827', color: '#ffffff' }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              {isSidebarOpen ? (
                <>
                  <line x1='18' y1='6' x2='6' y2='18'></line>
                  <line x1='6' y1='6' x2='18' y2='18'></line>
                </>
              ) : (
                <>
                  <line x1='3' y1='12' x2='21' y2='12'></line>
                  <line x1='3' y1='6' x2='21' y2='6'></line>
                  <line x1='3' y1='18' x2='21' y2='18'></line>
                </>
              )}
            </svg>
          </button>

          {/* Mobile backdrop overlay - only covers the left portion */}
          {/* {isSidebarOpen && (
            <div
              className='md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 pointer-events-auto'
              style={{ left: 0, right: '15vw' }}
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )} */}

          <div className='h-full w-full flex'>
             <div className='flex-1 relative h-screen md:h-auto'>
               {!showAnalysis ? (
               <Map
                cameraControl={false}
                zoomControl={false}
                fullscreenControl={false}
                streetViewControl={false}
                mapTypeControl={false}
                keyboardShortcuts={false}
                disableDoubleClickZoom={false}
                defaultCenter={FAR_START_COORDS}
                defaultZoom={13}
                minZoom={4}
                // minZoom={18.5}
                mapId={mapConfig.mapId || null}
                mapTypeId={mapConfig.mapTypeId}
                styles={mapConfig.styles}
                gestureHandling={'greedy'}
                onCameraChanged={handleCameraChanged}
                onMousemove={(event: { detail?: { latLng?: google.maps.LatLng | google.maps.LatLngLiteral | null } }) => {
                  if (!showGrid) return;
                  const ll = event.detail?.latLng as unknown;
                  if (!ll) return;
                  // Support LatLng or LatLngLiteral
                  // @ts-expect-error - runtime type guard
                  const lat = typeof ll.lat === 'function' ? ll.lat() : ll.lat;
                  // @ts-expect-error - runtime type guard
                  const lng = typeof ll.lng === 'function' ? ll.lng() : ll.lng;
                  if (typeof lat !== 'number' || typeof lng !== 'number') return;
                  const nearest = getNearestVertex({ lat, lng }, gridLinesAndVertices.vertices);
                  setHoverPoint(nearest);
                }}
                onClick={() => {
                  if (!showGrid || !hoverPoint) return;
                  toggleVertex(hoverPoint);
                }}
              >
                <CameraController ref={cameraControllerRef} />
                <BoundsUpdater onBounds={setBounds} cameraVersion={cameraVersion} />
                {perimeterCoords.length > 0 && (
                  <FireDateMarkers coords={perimeterCoords} makeGPoint={makeGPoint} makeGSize={makeGSize} />
                )}
                {showGrid && (
                  <>
                    {gridLinesAndVertices.hLines.map((line, idx) => (
                      <GPolyline key={`h-${idx}`} path={line} strokeColor="#e5e7eb" strokeOpacity={1} strokeWeight={gridStrokeWeight} />
                    ))}
                    {gridLinesAndVertices.vLines.map((line, idx) => (
                      <GPolyline key={`v-${idx}`} path={line} strokeColor="#e5e7eb" strokeOpacity={1} strokeWeight={gridStrokeWeight} />
                    ))}
                    {selectedPoints.map((pt, i) => (
                      <Marker
                        key={`sel-${i}`}
                        position={pt}
                        clickable={false}
                        optimized={false}
                        icon={{
                          url: flameSmall,
                          anchor: makeGPoint(16, 32),
                          scaledSize: makeGSize(46, 46),
                        }}
                      />
                    ))}
                    {hoverPoint && (
                      <Marker
                        position={hoverPoint as google.maps.LatLngLiteral}
                        clickable={false}
                        zIndex={9999}
                        icon={{
                          url: makeCircleDataUrl('#ff2929'),
                          anchor: makeGPoint(8, 8),
                          scaledSize: makeGSize(15, 15),
                        }}
                      />
                    )}
                  </>
                )}
                {/* Fire spread prediction arrows */}
                {spreadPredictions.map((pred, i) => (
                  <GPolyline
                    key={`spread-${i}`}
                    path={[pred.start, pred.end]}
                    strokeColor="#ef4444"
                    strokeOpacity={0.9}
                    strokeWeight={3}
                    icons={[
                      { icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 4, strokeColor: '#dc2626', fillColor: '#dc2626', fillOpacity: 1, strokeOpacity: 1 }, offset: '100%' },
                    ]}
                  />
                ))}
                {/* Fire propagation arrows */}
                {fireVectors.map((vec, i) => (
                  <GPolyline
                    key={`vec-${i}`}
                    path={[vec.start, vec.end]}
                    strokeColor="#dc2626"
                    strokeOpacity={1}
                    strokeWeight={3}
                    icons={[
                      { icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5, strokeColor: '#dc2626', strokeOpacity: 1 }, offset: '50%' },
                      { icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5, strokeColor: '#dc2626', strokeOpacity: 1 }, offset: '100%' },
                    ]}
                  />
                ))}
                {actionPlans.map((plan, i) => (
                  <Marker
                    key={`plan-${i}`}
                    position={plan.at}
                    label={{ text: 'Action plan', color: '#064e3b', fontSize: '12px', fontWeight: 'bold' } as unknown as string}
                    icon={{
                      url: makeCircleDataUrl('#10b981'),
                      anchor: makeGPoint(10, 10),
                      scaledSize: makeGSize(20, 20),
                    }}
                  />
                ))}
                {/* Firewall locations */}
                {firewalls.map((fw, i) => (
                  <Marker
                    key={`firewall-${i}`}
                    position={fw}
                    clickable={false}
                    optimized={false}
                    icon={{
                      url: firewallIcon,
                      anchor: makeGPoint(16, 16),
                      scaledSize: makeGSize(32, 32),
                    }}
                  />
                ))}
                {/* Wildfire detection radar at perimeter centroid - geographic circle */}
                {perimeterCentroid && radarRadius > 0 && (
                  <GCircle
                    center={perimeterCentroid}
                    radius={radarRadius * 1.2}
                    strokeColor="#ef4444"
                    strokeOpacity={0.6}
                    strokeWeight={2}
                    fillColor="#ef4444"
                    fillOpacity={0.15}
                  />
                )}
               </Map>
               ) : (
                 <AnalysisView onBack={() => setShowAnalysis(false)} />
               )}
            </div>

            {/* Fullscreen Processing Overlay */}
            {processing && (
              <div className='pointer-events-none fixed inset-0 z-[10000] flex items-center justify-center'>
                <div className='absolute inset-0 bg-black/80'></div>
                <div className='relative flex flex-col items-center gap-4 rounded-xl px-6 py-5 shadow-2xl' style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)' }}>
                  <img src={logo} alt='Processing' className='h-28 w-28 rounded-full shadow' />
                  <div className='flex items-center gap-3'>
                    <span className='relative inline-flex h-5 w-5'>
                      <span className='animate-ping absolute inline-flex h-full w-full rounded-full' style={{ backgroundColor: '#60a5fa', opacity: 0.7 }}></span>
                      <span className='relative inline-flex rounded-full h-5 w-5' style={{ backgroundColor: '#3b82f6' }}></span>
                    </span>
                    <div className='text-base font-semibold' style={{ color: '#e5e7eb' }}>Processing wildfire analysis...</div>
                  </div>
                  <div className='mt-1.5 h-1.5 w-48 overflow-hidden rounded-full' style={{ backgroundColor: '#111827' }}>
                    <div className='h-full w-1/3 rounded-full' style={{ background: 'linear-gradient(90deg, rgba(96,165,250,0) 0%, rgba(96,165,250,0.9) 50%, rgba(96,165,250,0) 100%)', animation: 'shimmer 1.1s infinite' }}></div>
                  </div>
                  <div className='text-sm text-center mt-2' style={{ color: 'rgba(229,231,235,0.7)' }}>
                    Running quantum optimization algorithms...
                  </div>
                </div>
              </div>
            )}

            {/* Mobile sidebar - slides in from right */}
            <aside
              className={`
                md:relative md:block
                fixed inset-y-0 right-0 z-40
                w-[85vw] max-w-sm
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                md:translate-x-0 md:w-[340px]
                border-l
              `}
              style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
            >
              {/* Mobile close button inside sidebar */}
              <button
                className='md:hidden absolute top-4 right-4 z-10 p-2 rounded-md cursor-pointer'
                style={{ color: '#111827' }}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <line x1='18' y1='6' x2='6' y2='18'></line>
                  <line x1='6' y1='6' x2='18' y2='18'></line>
                </svg>
              </button>
              <div className='absolute inset-0 flex flex-col'>
                <div className='flex-1 overflow-y-auto p-3 md:p-4 pb-24 md:pb-28'>
                  <div className='mb-4 md:mb-5 flex items-center justify-between rounded-lg border px-2 md:px-3 py-2 shadow-sm' style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f0f9ff 100%)', borderColor: '#e5e7eb' }}>
                    <div className='flex items-center gap-2 md:gap-3'>
                      <img src={logo} alt='QBrigade' className='h-7 w-7 md:h-9 md:w-9 rounded-full shadow' />
                      <span className='text-lg md:text-xl font-semibold font-serif' style={{ color: '#0f172a' }}>QBrigade</span>
                    </div>
                    <a
                      href={'https://github.com/qbrigade/hackathon_LATAM'}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1 md:gap-1.5 rounded-md px-1.5 md:px-2 py-1 hover:bg-white cursor-pointer'
                      title='Open QBrigade on GitHub'
                      aria-label='Open QBrigade on GitHub'
                      style={{ color: '#111827', borderColor: '#e5e7eb' }}
                    >
                      <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' className='md:w-[18px] md:h-[18px]'>
                        <path d='M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.11.82-.26.82-.58 0-.29-.01-1.06-.015-2.08-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.334-1.757-1.334-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.805 1.305 3.49.998.108-.775.42-1.305.763-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.47-2.38 1.236-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.403c1.02.005 2.047.137 3.004.403 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.806 5.624-5.48 5.92.43.37.814 1.096.814 2.21 0 1.595-.014 2.88-.014 3.27 0 .32.216.697.825.578C20.565 21.797 24 17.297 24 12 24 5.37 18.63 0 12 0z'/>
                      </svg>
                      <span className='text-[9px] md:text-[10.5px] font-medium hidden sm:inline'>View on GitHub</span>
                    </a>
                  </div>

                  {/* Tab content - conditional rendering */}
                  {activeTab === 'controls' && (
                    <>

                  {/* LIVE urgency section */}
                  <div className='mb-4 md:mb-5 rounded-md border px-2 md:px-3 py-2' style={{ backgroundColor: '#b91c1c', borderColor: '#7f1d1d' }}>
                    <div className='flex items-center gap-2'>
                      <span className='relative inline-flex h-3 w-3 md:h-3.5 md:w-3.5'>
                        <span className='animate-ping absolute inline-flex h-full w-full rounded-full' style={{ backgroundColor: '#ffffff', opacity: 0.7 }}></span>
                        <span className='relative inline-flex rounded-full h-3 w-3 md:h-3.5 md:w-3.5' style={{ backgroundColor: '#ffffff' }}></span>
                      </span>
                      <span className='text-xs md:text-sm font-bold' style={{ color: '#ffffff' }}>LIVE</span>
                    </div>
                    <div className='mt-0.5 md:mt-1 text-[10px] md:text-xs' style={{ color: '#fee2e2' }}>Active wildfire detections updating. Click a fire to focus the map.</div>
                  </div>

                  {/* Active wildfires - prioritized to top */}
                  <div className='mb-4 md:mb-5'>
                    <div className='text-xs md:text-sm font-semibold' style={{ color: '#7f1d1d' }}>Active wildfires</div>
                    <div className='mt-2 space-y-1.5 md:space-y-2 relative'>
                      {[{
                        id: 'wf-1',
                        name: 'Bear Creek Fire',
                        coords: { lat: 47.163741, lng: -109.559723 },
                        location: 'Lewis and Clark County, Montana',
                        hue: '#dc2626'
                      }].map((f, idx) => {
                        const isSelected = selectedFireId === f.id;
                        const isFirstAndNotSelected = idx === 0 && !isSelected;
                        return (
                          <button
                            key={f.id}
                            className='w-full text-left rounded-md border px-2 md:px-3 py-1.5 md:py-2 hover:shadow-md transition-all cursor-pointer'
                            style={{
                              borderColor: isSelected ? '#dc2626' : '#fecaca',
                              background: isSelected ? 'linear-gradient(180deg, #fee2e2 0%, #fef2f2 100%)' : 'linear-gradient(180deg, #fff1f2 0%, #ffffff 100%)',
                              boxShadow: isSelected ? '0 0 0 3px rgba(220,38,38,0.4) inset' : '0 0 0 2px rgba(239,68,68,0.25) inset',
                              animation: isFirstAndNotSelected ? 'pulse-card 2s ease-in-out infinite' : undefined,
                              transform: isFirstAndNotSelected ? 'scale(1.02)' : undefined
                            }}
                            onClick={() => { setSelectedFireId(f.id); cameraControllerRef.current?.animateTo(f.coords); }}
                          >
                            <div className='flex items-start gap-1.5 md:gap-2'>
                              <span className='mt-0.5 md:mt-1 inline-flex h-2 w-2 md:h-2.5 md:w-2.5 rounded-full animate-pulse' style={{ backgroundColor: f.hue }}></span>
                              <div className='min-w-0 flex-1'>
                                <div className='flex items-center justify-between'>
                                  <span className='truncate text-xs md:text-sm font-semibold' style={{ color: '#7f1d1d' }}>{f.name}</span>
                                  <span className='text-[9px] md:text-[10px]' style={{ color: '#ef4444' }}>{isSelected ? 'selected' : 'view'}</span>
                                </div>
                                <div className='text-[10px] md:text-xs' style={{ color: '#374151' }}>{f.coords.lat.toFixed(5)}, {f.coords.lng.toFixed(5)}</div>
                                <div className='text-[10px] md:text-xs' style={{ color: '#6b7280' }}>{f.location}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Perimeter stepper - only show if a fire is selected */}
                  {selectedFireId && (
                    <div className='mb-3 md:mb-4 rounded-md border p-2 md:p-3' style={{ borderColor: '#e5e7eb' }}>
                      <div className='mb-1.5 md:mb-2 flex items-center justify-between'>
                        <span className='text-xs md:text-sm font-semibold text-gray-800'>Perimeter (5-day)</span>
                        <span className='text-[10px] md:text-xs text-gray-500'>{perimeterDays[perimeterIdx]}</span>
                      </div>
                      <div className='flex items-center gap-1.5 md:gap-2'>
                        <button
                          className='rounded border px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs disabled:opacity-50 cursor-pointer'
                          style={{ borderColor: '#e5e7eb' }}
                          disabled={perimeterIdx <= 0}
                          onClick={() => setPerimeterIdx((i) => Math.max(0, i - 1))}
                        >
                          Prev
                        </button>
                        <input
                          type='range'
                          className='flex-1 cursor-pointer'
                          min={0}
                          max={Math.max(0, perimeterDays.length - 1)}
                          step={1}
                          value={perimeterIdx}
                          onChange={(e) => setPerimeterIdx(Number(e.target.value))}
                        />
                        <button
                          className='rounded border px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs disabled:opacity-50 transition-all cursor-pointer'
                          style={{
                            borderColor: '#e5e7eb',
                            animation: perimeterIdx < Math.max(0, perimeterDays.length - 1) ? 'pulse-button 1.5s ease-in-out infinite' : undefined
                          }}
                          disabled={perimeterIdx >= Math.max(0, perimeterDays.length - 1)}
                          onClick={() => setPerimeterIdx((i) => Math.min(perimeterDays.length - 1, i + 1))}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}

                  <div className='mb-4'>
                    <div className='text-sm font-semibold text-gray-800'>Parameters</div>
                  </div>

                <div className='mb-4'>
                  <label className='block text-xs text-gray-500 mb-1'>Coords (center)</label>
                  <div className='text-sm text-gray-800 select-text'>{formattedCoords}</div>
                </div>

                {/* <div className='mb-6'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='text-sm font-semibold text-gray-800'>Grid</div>
                    <label className='inline-flex items-center gap-2 text-sm text-gray-700'>
                      <input
                        type='checkbox'
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                      />
                      <span>Show</span>
                    </label>
                  </div>
                  <div className='flex items-center justify-between mb-1'>
                    <label className='text-xs text-gray-500'>Grid size (m)</label>
                    <span className='text-xs text-gray-600'>{gridSize} m</span>
                  </div>
                  <input
                    type='range'
                    className='w-full cursor-pointer'
                    min={500}
                    max={2000}
                    step={100}
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                  />
                </div> */}

                {/* <div className='mb-6'>
                  <div className='text-sm font-semibold text-gray-800 mb-2'>Marked points</div>
                  {selectedPoints.length === 0 && (
                    <div className='text-xs text-gray-500'>No points selected. Click grid vertices to mark.</div>
                  )}
                  <div className='space-y-2 max-h-48 overflow-auto pr-1'>
                    {selectedPoints.map((p, idx) => (
                      <div key={`p-${idx}`} className='flex items-center justify-between text-xs text-gray-700'>
                        <span>{p.lat.toFixed(6)}, {p.lng.toFixed(6)}</span>
                        <button
                          className='text-red-600 hover:underline cursor-pointer'
                          onClick={() => toggleVertex(p)}
                        >
                          remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div> */}

                {/* Active wildfires moved to top */}

                {/* <div className='mt-6 border-t pt-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-sm font-semibold text-gray-800'>Weather</div>
                      <div className='text-xs text-gray-500'>Auto fetch from real data</div>
                    </div>
                    <label className='inline-flex items-center gap-2 text-sm text-gray-700'>
                      <input
                        type='checkbox'
                        checked={autoWeather}
                        onChange={(e) => setAutoWeather(e.target.checked)}
                      />
                      <span>Auto</span>
                    </label>
                  </div>

                  {!autoWeather && (
                    <div className='mt-3 space-y-5'>
                      <div>
                        <div className='flex items-center justify-between mb-1'>
                          <label className='text-xs text-gray-500'>Wind speed</label>
                          <span className='text-xs text-gray-600'>{windSpeed} m/s</span>
                        </div>
                        <input
                          type='range'
                          className='w-full cursor-pointer'
                          min={0}
                          max={60}
                          step={1}
                          value={windSpeed}
                          onChange={(e) => setWindSpeed(Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <div className='flex items-center justify-between mb-1'>
                          <label className='text-xs text-gray-500'>Wind direction</label>
                          <span className='text-xs text-gray-600'>{windDirection}°</span>
                        </div>
                        <input
                          type='range'
                          className='w-full cursor-pointer'
                          min={0}
                          max={360}
                          step={1}
                          value={windDirection}
                          onChange={(e) => setWindDirection(Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <div className='flex items-center justify-between mb-1'>
                          <label className='text-xs text-gray-500'>Temperature</label>
                          <span className='text-xs text-gray-600'>{temperature}°C</span>
                        </div>
                        <input
                          type='range'
                          className='w-full cursor-pointer'
                          min={-50}
                          max={50}
                          step={1}
                          value={temperature}
                          onChange={(e) => setTemperature(Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <div className='flex items-center justify-between mb-1'>
                          <label className='text-xs text-gray-500'>Humidity</label>
                          <span className='text-xs text-gray-600'>{humidity}%</span>
                        </div>
                        <input
                          type='range'
                          className='w-full cursor-pointer'
                          min={0}
                          max={100}
                          step={1}
                          value={humidity}
                          onChange={(e) => setHumidity(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  )}
                </div> */}
                  </>
                  )}

                  {/* Processing results tab */}
                  {activeTab === 'results' && (
                    <div className='py-4 px-3 md:px-4'>
                      <div className='mb-4'>
                        <h3 className='text-lg font-bold mb-2' style={{ color: '#0f172a' }}>Analysis Results</h3>
                        <p className='text-sm' style={{ color: '#6b7280' }}>Quantum-optimized wildfire containment strategy</p>
                      </div>

                      {/* Summary Cards */}
                      <div className='grid grid-cols-2 gap-3 mb-4'>
                        <div className='rounded-lg border p-3' style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                          <div className='text-xs font-medium mb-1' style={{ color: '#991b1b' }}>Fire Spread Risk</div>
                          <div className='text-2xl font-bold' style={{ color: '#dc2626' }}>High</div>
                        </div>
                        <div className='rounded-lg border p-3' style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                          <div className='text-xs font-medium mb-1' style={{ color: '#1e3a8a' }}>Firewalls</div>
                          <div className='text-2xl font-bold' style={{ color: '#2563eb' }}>{firewalls.length}</div>
                        </div>
                      </div>

                      {/* Fire Spread Prediction */}
                      <div className='mb-4 rounded-lg border p-3' style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
                        <div className='text-sm font-semibold mb-2' style={{ color: '#111827' }}>Fire Spread Prediction</div>
                        <div className='text-xs mb-2' style={{ color: '#6b7280' }}>{spreadPredictions.length} predicted spread vectors</div>
                        <div className='p-2 rounded text-xs' style={{ backgroundColor: '#fef2f2', borderLeft: '3px solid #dc2626' }}>
                          <div className='font-medium mb-1' style={{ color: '#991b1b' }}>Outward Expansion Analysis</div>
                          <div style={{ color: '#374151' }}>
                            Red arrows on the map indicate predicted fire spread directions from the current perimeter.
                            The model projects expansion based on topography, weather patterns, and fuel availability.
                          </div>
                          <div className='mt-2 flex items-center gap-2'>
                            <span className='inline-flex h-2 w-2 rounded-full animate-pulse' style={{ backgroundColor: '#dc2626' }}></span>
                            <span className='text-[10px]' style={{ color: '#6b7280' }}>
                              High-risk expansion zones marked on map
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Firewall Deployment */}
                      <div className='mb-4 rounded-lg border p-3' style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
                        <div className='text-sm font-semibold mb-2' style={{ color: '#111827' }}>Firewall Deployment</div>
                        <div className='text-xs mb-2' style={{ color: '#6b7280' }}>{firewalls.length} firewall locations strategically placed</div>
                        <div className='p-2 rounded text-xs' style={{ backgroundColor: '#eff6ff', borderLeft: '3px solid #2563eb' }}>
                          <div className='font-medium mb-1' style={{ color: '#1e3a8a' }}>Strategic Positioning</div>
                          <div style={{ color: '#374151' }}>
                            Firewalls have been optimally positioned to create containment barriers and prevent fire spread to critical areas.
                          </div>
                          <div className='mt-2 text-[10px]' style={{ color: '#6b7280' }}>
                            View map markers for exact locations
                          </div>
                        </div>
                      </div>

                      {/* Action Plans
                      <div className='mb-4 rounded-lg border p-3' style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
                        <div className='text-sm font-semibold mb-2' style={{ color: '#111827' }}>Recommended Actions</div>
                        <div className='space-y-2'>
                          {actionPlans.slice(0, 3).map((plan, idx) => (
                            <div key={idx} className='p-2 rounded text-xs' style={{ backgroundColor: '#f0fdf4', borderLeft: '3px solid #16a34a' }}>
                              <div className='font-medium mb-1' style={{ color: '#14532d' }}>Action Point {idx + 1}</div>
                              <div style={{ color: '#374151' }}>{plan.summary}</div>
                              <div className='mt-1 text-[10px]' style={{ color: '#6b7280' }}>
                                Location: {plan.at.lat.toFixed(5)}, {plan.at.lng.toFixed(5)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div> */}

                      {/* Back to Map Button */}
                       <button
                        className='w-full rounded-lg border px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors'
                        style={{ borderColor: '#e5e7eb', color: '#374151' }}
                        onClick={() => setActiveTab('controls')}
                      >
                        ← Back to Controls
                      </button>
                       <div className='mt-2'>
                         <button
                           className='w-full rounded-lg border px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors'
                           style={{ borderColor: '#e5e7eb', color: '#111827' }}
                           onClick={() => setShowAnalysis(true)}
                         >
                           View analysis
                         </button>
                       </div>
                    </div>
                  )}
                </div>

                {/* Process button - always visible at bottom */}
                <div className='border-t p-3 md:p-4' style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
                  <button
                    className='w-full inline-flex items-center justify-center gap-2 md:gap-3 rounded-md px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer'
                    style={{
                      backgroundColor: '#111827',
                      color: '#ffffff',
                      animation: selectedFireId && perimeterIdx >= Math.max(0, perimeterDays.length - 1) && !processing ? 'pulse-process 1.8s ease-in-out infinite' : undefined
                    }}
                    onClick={processImagesMapAsync}
                    disabled={processing}
                  >
                    <span className='relative inline-flex h-2.5 w-2.5 md:h-3 md:w-3'>
                      <span className={`absolute inline-flex h-full w-full rounded-full ${processing ? 'animate-ping' : ''}`} style={{ backgroundColor: '#f59e0b', opacity: 0.7 }}></span>
                      <span className='relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3' style={{ backgroundColor: '#f59e0b' }}></span>
                    </span>
                    {processing ? 'Processing…' : 'Process'}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </Layout>
  );
}

function AnalysisView({ onBack }: { onBack: () => void }) {
  return (
    <div className='w-full h-full overflow-auto' style={{ backgroundColor: '#ffffff' }}>
      <div className='max-w-5xl mx-auto p-4 md:p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl md:text-2xl font-bold' style={{ color: '#0f172a' }}>Analysis</h2>
          <button
            className='rounded-md border px-3 py-1.5 text-sm font-medium cursor-pointer hover:bg-gray-50'
            style={{ borderColor: '#e5e7eb', color: '#374151' }}
            onClick={onBack}
          >
            ← Back to Map
          </button>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='rounded-lg border p-3' style={{ borderColor: '#e5e7eb' }}>
            <div className='text-sm font-semibold mb-2' style={{ color: '#111827' }}>Heatmap</div>
            <img src={outputStatic} alt='Heatmap' className='w-full h-auto rounded-md' />
          </div>
          <div className='rounded-lg border p-3' style={{ borderColor: '#e5e7eb' }}>
            <div className='text-sm font-semibold mb-2' style={{ color: '#111827' }}>Time-lapse</div>
            <img src={outputGif} alt='Time-lapse' className='w-full h-auto rounded-md' />
          </div>
        </div>
        <div className='mt-4 text-xs' style={{ color: '#6b7280' }}>
          This page will host detailed analysis, charts, and reports.
        </div>
      </div>
    </div>
  );
}

type CameraControllerHandle = {
  moveTo: (target: google.maps.LatLngLiteral, opts?: { zoom?: number }) => void;
  animateTo: (target: google.maps.LatLngLiteral, opts?: { durationMs?: number; zoom?: number }) => void;
};

type CameraControllerProps = object;

const CameraController = forwardRef<CameraControllerHandle | null, CameraControllerProps>(function CameraController(_props, ref) {
  const map = useMap();

  useImperativeHandle(ref, () => ({
    moveTo: (target: google.maps.LatLngLiteral, opts?: { zoom?: number }) => {
      if (!map) return;
      map.setCenter(target);
      if (typeof opts?.zoom === 'number') {
        map.setZoom(opts.zoom as number);
      }
    },
    animateTo: (target: google.maps.LatLngLiteral, opts?: { durationMs?: number; zoom?: number }) => {
      if (!map) return;
      const start = map.getCenter();
      if (!start) return;
      const durationMs = Math.max(200, Math.min(6000, opts?.durationMs ?? 1800));
      const startLat = start.lat();
      const startLng = start.lng();
      const dLat = target.lat - startLat;
      const dLng = target.lng - startLng;
      const t0 = performance.now();
      const step = () => {
        const p = Math.min(1, (performance.now() - t0) / durationMs);
        const e = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p; // easeInOut
        map.setCenter({ lat: startLat + dLat * e, lng: startLng + dLng * e });
        if (p < 1) requestAnimationFrame(step); else if (typeof opts?.zoom === 'number') map.setZoom(opts.zoom as number);
      };
      requestAnimationFrame(step);
    }
  }), [map]);

  return null;
});

function BoundsUpdater({ onBounds, cameraVersion }: { onBounds: (b: { north: number; south: number; east: number; west: number } | null) => void; cameraVersion: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const updateFromMap = () => {
      const b = map.getBounds();
      if (!b) return;
      const ne = b.getNorthEast();
      const sw = b.getSouthWest();
      onBounds({ north: ne.lat(), south: sw.lat(), east: ne.lng(), west: sw.lng() });
    };

    // Prefer waiting for idle so zoom/pan settles before reading bounds
    const onceIdle = google.maps.event.addListenerOnce(map, 'idle', updateFromMap);
    // Fallback immediate read in case idle already fired
    updateFromMap();

    return () => {
      onceIdle.remove();
    };
  }, [map, cameraVersion, onBounds]);

  useEffect(() => {
    if (!map) return;
    let resizeTimer: number | undefined;
    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const b = map.getBounds();
        if (!b) return;
        const ne = b.getNorthEast();
        const sw = b.getSouthWest();
        onBounds({ north: ne.lat(), south: sw.lat(), east: ne.lng(), west: sw.lng() });
      }, 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (resizeTimer) window.clearTimeout(resizeTimer);
    };
  }, [map, onBounds]);
  return null;
}

type PolylineEventProps = {
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onDrag?: (e: google.maps.MapMouseEvent) => void;
  onDragStart?: (e: google.maps.MapMouseEvent) => void;
  onDragEnd?: (e: google.maps.MapMouseEvent) => void;
  onMouseOver?: (e: google.maps.MapMouseEvent) => void;
  onMouseOut?: (e: google.maps.MapMouseEvent) => void;
};

type GPolylineProps = google.maps.PolylineOptions & PolylineEventProps & {
  path: google.maps.LatLngLiteral[];
};

function useGPolyline(props: GPolylineProps) {
  const { path, ...polylineOptions } = props;
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const callbacks = useRef<Partial<Record<keyof PolylineEventProps, (e: google.maps.MapMouseEvent) => void>>>({});

  Object.assign(callbacks.current, {
    onClick: props.onClick,
    onDrag: props.onDrag,
    onDragStart: props.onDragStart,
    onDragEnd: props.onDragEnd,
    onMouseOver: props.onMouseOver,
    onMouseOut: props.onMouseOut,
  });

  useEffect(() => {
    if (!map) return;
    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline();
    }
    const poly = polylineRef.current;
    poly.setMap(map);
    return () => {
      poly.setMap(null);
    };
  }, [map]);

  useMemo(() => {
    if (!polylineRef.current) return;
    polylineRef.current.setOptions({ ...polylineOptions, path });
  }, [path, polylineOptions]);

  useEffect(() => {
    const poly = polylineRef.current;
    if (!poly) return;
    const gme = google.maps.event;
    const listeners: google.maps.MapsEventListener[] = [];
    const add = (evt: string, cb?: (e: google.maps.MapMouseEvent) => void) => {
      if (cb) listeners.push(gme.addListener(poly, evt, cb));
    };
    add('click', callbacks.current.onClick);
    add('drag', callbacks.current.onDrag);
    add('dragstart', callbacks.current.onDragStart);
    add('dragend', callbacks.current.onDragEnd);
    add('mouseover', callbacks.current.onMouseOver);
    add('mouseout', callbacks.current.onMouseOut);
    return () => listeners.forEach(l => l.remove());
  }, []);

  return polylineRef.current;
}

const GPolyline = forwardRef<google.maps.Polyline | undefined, GPolylineProps>(function GPolyline(props, ref) {
  const polyline = useGPolyline(props);
  useImperativeHandle(ref, () => polyline ?? undefined, [polyline]);
  return null;
});


const FireDateMarkers = ({ coords, makeGPoint, makeGSize }: { coords: google.maps.LatLngLiteral[]; makeGPoint: (x: number, y: number) => google.maps.Point | undefined; makeGSize: (w: number, h: number) => google.maps.Size | undefined }) => {
  return (
    <>
      {coords.map((pt, i) => (
        <Marker
          key={`fdm-${i}-${pt.lat}-${pt.lng}`}
          position={pt}
          clickable={false}
          optimized={false}
          icon={{
            url: flameSmall,
            anchor: makeGPoint(16, 32),
            scaledSize: makeGSize(28, 28),
          }}
        />
      ))}
    </>
  );
};

type GCircleProps = {
  center: google.maps.LatLngLiteral;
  radius: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  fillColor?: string;
  fillOpacity?: number;
};

function GCircle(props: GCircleProps) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle();
    }
    const circle = circleRef.current;
    circle.setMap(map);
    return () => {
      circle.setMap(null);
    };
  }, [map]);

  useMemo(() => {
    if (!circleRef.current) return;
    circleRef.current.setOptions(props);
  }, [props]);

  return null;
}


