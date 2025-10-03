import { Layout } from '@common/components/layout';
import { Sidebar } from '@common/components/sidebar';
import { Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import flameSmall from '@assets/images/icons/flame_small.gif';
import logo from '@assets/images/logo_v2.png';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({ lat: -15.000883, lng: -62.000051 });
  const [zoom, setZoom] = useState<number>(20);
  const [bounds, setBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [gridSize, setGridSize] = useState<number>(10);
  const [autoWeather, setAutoWeather] = useState<boolean>(true);
  const [windSpeed, setWindSpeed] = useState<number>(10);
  const [windDirection, setWindDirection] = useState<number>(90);
  const [temperature, setTemperature] = useState<number>(20);
  const [humidity, setHumidity] = useState<number>(50);
  const [selectedPoints, setSelectedPoints] = useState<Array<google.maps.LatLngLiteral>>([]);
  const [cameraVersion, setCameraVersion] = useState<number>(0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [hoverPoint, setHoverPoint] = useState<google.maps.LatLngLiteral | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [fireVectors, setFireVectors] = useState<Array<{ start: google.maps.LatLngLiteral; end: google.maps.LatLngLiteral }>>([]);
  const [actionPlans, setActionPlans] = useState<Array<{ at: google.maps.LatLngLiteral; summary: string }>>([]);

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
    } finally {
      setProcessing(false);
    }
  }, [processing, selectedPoints, windDirection, windSpeed]);

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

  return (
    <Layout>
      <div className='flex' style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <Sidebar />
        <main className='flex-1 text-gray-900'>
          <div className='h-full w-full flex'>
            <div className='flex-1 relative'>
              <Map
                cameraControl={false}
                zoomControl={false}
                fullscreenControl={false}
                streetViewControl={false}
                mapTypeControl={false}
                keyboardShortcuts={false}
                disableDoubleClickZoom={false}
                defaultCenter={{lat: -15.000883, lng: -62.000051}}
                defaultZoom={20}
                minZoom={13}
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
                <BoundsUpdater onBounds={setBounds} cameraVersion={cameraVersion} />
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
                        icon={{
                          url: flameSmall,
                          anchor: new google.maps.Point(16, 32),
                          scaledSize: new google.maps.Size(46, 46),
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
                          anchor: new google.maps.Point(8, 8),
                          scaledSize: new google.maps.Size(15, 15),
                        }}
                      />
                    )}
                  </>
                )}
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
                      anchor: new google.maps.Point(10, 10),
                      scaledSize: new google.maps.Size(20, 20),
                    }}
                  />
                ))}
              </Map>
              {processing && (
                <div className='pointer-events-none absolute inset-0 z-[10000] flex items-center justify-center'>
                  <div className='absolute inset-0 bg-black/35'></div>
                  <div className='relative flex flex-col items-center gap-4 rounded-xl px-6 py-5 shadow-2xl' style={{ backgroundColor: 'rgba(17, 24, 39, 0.92)' }}>
                    <img src={logo} alt='Processing' className='h-28 w-28 rounded-full shadow' />
                    <div className='flex items-center gap-3'>
                      <span className='relative inline-flex h-5 w-5'>
                        <span className='animate-ping absolute inline-flex h-full w-full rounded-full' style={{ backgroundColor: '#60a5fa', opacity: 0.7 }}></span>
                        <span className='relative inline-flex rounded-full h-5 w-5' style={{ backgroundColor: '#3b82f6' }}></span>
                      </span>
                      <div className='text-base font-semibold' style={{ color: '#e5e7eb' }}>Processing wildfire map...</div>
                    </div>
                    <div className='mt-1.5 h-1.5 w-48 overflow-hidden rounded-full' style={{ backgroundColor: '#111827' }}>
                      <div className='h-full w-1/3 rounded-full' style={{ background: 'linear-gradient(90deg, rgba(96,165,250,0) 0%, rgba(96,165,250,0.9) 50%, rgba(96,165,250,0) 100%)', animation: 'shimmer 1.1s infinite' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <aside
              className='border-l relative'
              style={{ width: 340, borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
            >
              <div className='p-4'>
                <div className='mb-5 flex items-center gap-3 rounded-lg border px-3 py-2 shadow-sm' style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f0f9ff 100%)', borderColor: '#e5e7eb' }}>
                  <img src={logo} alt='QBrigade' className='h-9 w-9 rounded-full shadow' />
                  <span className='text-xl font-semibold font-serif' style={{ color: '#0f172a' }}>QBrigade</span>
                </div>
                <div className='mb-4'>
                  <div className='text-sm font-semibold text-gray-800'>Parameters</div>
                </div>

                <div className='mb-4'>
                  <label className='block text-xs text-gray-500 mb-1'>Coords (center)</label>
                  <div className='text-sm text-gray-800 select-text'>{formattedCoords}</div>
                </div>

                <div className='mb-6'>
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
                    min={5}
                    max={50}
                    step={1}
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                  />
                </div>

                <div className='mb-6'>
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
                </div>

                <div className='mt-6 border-t pt-4'>
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
                </div>
              </div>
              <div className='absolute left-0 right-0 bottom-0 border-t p-4' style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
                <button
                  className='w-full inline-flex items-center justify-center gap-3 rounded-md px-4 py-3 text-base font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed'
                  style={{ backgroundColor: '#111827', color: '#ffffff' }}
                  onClick={processImagesMapAsync}
                  disabled={processing}
                >
                  <span className='relative inline-flex h-3 w-3'>
                    <span className={`absolute inline-flex h-full w-full rounded-full ${processing ? 'animate-ping' : ''}`} style={{ backgroundColor: '#f59e0b', opacity: 0.7 }}></span>
                    <span className='relative inline-flex rounded-full h-3 w-3' style={{ backgroundColor: '#f59e0b' }}></span>
                  </span>
                  {processing ? 'Processing…' : 'Process'}
                </button>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </Layout>
  );
}

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


