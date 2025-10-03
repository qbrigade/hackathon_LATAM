import { useQuery } from '@tanstack/react-query';
import ContentLoader from 'react-content-loader';

// OpenWeatherMap API response type (partial)
type WeatherData = {
  name: string;
  dt: number;
  timezone: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
};


const WEATHER_API_URL = (lat: string, lng: string) => `https://blnqgjxcgdyaeutdeomf.supabase.co/functions/v1/fetch_weather?lat=${lat}&lng=${lng}`;

type LocationData = {
  latitude: string;
  longitude: string;
  city?: string;
  country?: string;
  region?: string;
};

function getDayString(dt: number, timezone: number) {
  // dt is unix UTC seconds, timezone is offset in seconds
  const date = new Date((dt + timezone) * 1000);
  return date.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}


export function WeatherFeedCard() {
  // 1. Get user location from Cloudflare endpoint, with localStorage cache (4h)
  function getCachedLocation(): LocationData | null {
    try {
      const raw = localStorage.getItem('weather_location_cache');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.data || !parsed.expireAt) return null;
      if (Date.now() > parsed.expireAt) return null;
      return parsed.data;
    } catch {
      return null;
    }
  }

  async function fetchAndCacheLocation(): Promise<LocationData> {
    const res = await fetch('https://ip-check-perf.radar.cloudflare.com/api/info');
    if (!res.ok) throw new Error('Location fetch failed');
    const data = await res.json();
    const expireAt = Date.now() + 4 * 60 * 60 * 1000; // 4 hours
    try {
      localStorage.setItem('weather_location_cache', JSON.stringify({ data, expireAt }));
    } catch {
      // Ignore localStorage errors (e.g., quota exceeded, private mode)
    }
    return data;
  }

  const { data: location, isLoading: loadingLocation, isError: errorLocation } = useQuery<LocationData>({
    queryKey: ['user-location'],
    queryFn: async () => {
      const cached = getCachedLocation();
      if (cached) return cached;
      return fetchAndCacheLocation();
    },
    staleTime: 1000 * 60 * 60, // 1 hour (react-query cache, not localStorage)
  });

  // 2. Get weather for that location
  const lat = location?.latitude;
  const lng = location?.longitude;
  const cityName = location?.city;
  const country = location?.country;
  const region = location?.region;

  const {
    data: weather,
    isLoading: loadingWeather,
    isError: errorWeather,
  } = useQuery<WeatherData>({
    queryKey: ['weather', lat, lng],
    queryFn: async () => {
      if (!lat || !lng) throw new Error('No coordinates');
      const res = await fetch(WEATHER_API_URL(lat, lng), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_KEY}`,
        },
      });
      if (!res.ok) throw new Error('Weather fetch failed');
      return res.json();
    },
    enabled: !!lat && !!lng,
  });

  if (loadingLocation || loadingWeather) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex flex-1 flex-col rounded-lg w-full max-w-xs overflow-hidden border-gray-300 border">
          {/* Header section */}
          <div className="bg-gradient-to-r px-4 pt-4 pb-2">
            <ContentLoader speed={2} width={220} height={40} viewBox="0 0 220 40" backgroundColor="#f3f3f3" foregroundColor="#ecebeb">
              <rect x="0" y="0" rx="6" ry="6" width="120" height="18" />
              <rect x="0" y="24" rx="4" ry="4" width="80" height="12" />
              <rect x="130" y="24" rx="4" ry="4" width="60" height="10" />
            </ContentLoader>
          </div>
          {/* Icon section */}
          <div className="bg-gray-400 flex items-center justify-center py-3">
            <ContentLoader speed={2} width={96} height={96} viewBox="0 0 96 96" backgroundColor="#e0e0e0" foregroundColor="#ecebeb">

            </ContentLoader>
          </div>
          {/* Temperature section */}
          <div className="bg-white flex flex-row items-center justify-center py-4 border-t border-gray-100">
            <ContentLoader speed={2} width={220} height={60} viewBox="0 0 220 60" backgroundColor="#f3f3f3" foregroundColor="#ecebeb">
              <rect x="0" y="10" rx="8" ry="8" width="60" height="40" />
              <rect x="70" y="10" rx="6" ry="6" width="80" height="16" />
              <rect x="70" y="32" rx="4" ry="4" width="40" height="12" />
              <rect x="120" y="32" rx="4" ry="4" width="40" height="12" />
            </ContentLoader>
          </div>
          {/* Details section */}
          <div className="flex flex-row justify-between bg-gray-50 px-4 py-3 border-t border-gray-200">
            <ContentLoader speed={2} width={220} height={36} viewBox="0 0 220 36" backgroundColor="#f3f3f3" foregroundColor="#ecebeb">
              <rect x="0" y="0" rx="4" ry="4" width="60" height="14" />
              <rect x="0" y="20" rx="4" ry="4" width="40" height="10" />
              <rect x="80" y="0" rx="4" ry="4" width="60" height="14" />
              <rect x="80" y="20" rx="4" ry="4" width="40" height="10" />
              <rect x="160" y="0" rx="4" ry="4" width="60" height="14" />
              <rect x="160" y="20" rx="4" ry="4" width="40" height="10" />
            </ContentLoader>
          </div>
        </div>
      </div>
    );
  }
  if (errorLocation || errorWeather || !weather) {
    return null;
  }

  const city = weather.name || cityName || 'Lima';
  const dateStr = getDayString(weather.dt, weather.timezone);
  const temp = Math.round(weather.main.temp);
  const tempMax = Math.round(weather.main.temp_max);
  const tempMin = Math.round(weather.main.temp_min);
  const weatherDesc = weather.weather[0]?.description || '';
  const icon = weather.weather[0]?.icon;
  const wind = weather.wind?.speed;
  const humidity = weather.main?.humidity;
  const visibility = weather.visibility ? Math.round(weather.visibility / 1000) : null;

  return (
    <a target='_blank' href={'https://www.windy.com/'}>
      <div className="flex flex-1 flex-col rounded-lg w-full overflow-hidden border-gray-300 border">
        {/* Header section */}
        <div className="bg-gradient-to-r px-4 pt-4 pb-2">
          <div className="font-bold text-xl">{city}</div>
          <div className="text-sm text-gray-600">{dateStr}</div>
          {region && country && (
            <div className="text-xs text-gray-500 mt-1">{region}, {country}</div>
          )}
        </div>
        {/* Icon section */}
        <div className="bg-gray-400 flex items-center justify-center py-3">
          <div className="inline-flex items-center justify-center rounded-lg text-indigo-400 h-24 w-24">
            {icon ? (
              <img src={`https://openweathermap.org/img/wn/${icon}@4x.png`} alt={weatherDesc} className="w-24 h-24" />
            ) : (
              <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
            )}
          </div>
        </div>
        {/* Temperature section */}
        <div className="bg-white flex flex-row items-center justify-center py-4 border-t border-gray-100">
          <div className="font-medium text-6xl">{temp}°</div>
          <div className="flex flex-col items-center ml-6">
            <div className="capitalize text-base font-semibold text-gray-700">{weatherDesc}</div>
            <div className="mt-1">
              <span className="text-sm">↑</span>
              <span className="text-sm font-light text-gray-500">{tempMax}°C</span>
            </div>
            <div>
              <span className="text-sm">↓</span>
              <span className="text-sm font-light text-gray-500">{tempMin}°C</span>
            </div>
          </div>
        </div>
        {/* Details section */}
        <div className="flex flex-row justify-between bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex flex-col items-center">
            <div className="font-medium text-sm">Viento</div>
            <div className="text-sm text-gray-500">{wind ? `${wind} km/h` : '--'}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="font-medium text-sm">Humedad</div>
            <div className="text-sm text-gray-500">{humidity ? `${humidity}%` : '--'}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="font-medium text-sm">Visibilidad</div>
            <div className="text-sm text-gray-500">{visibility !== null ? `${visibility} km` : '--'}</div>
          </div>
        </div>
      </div>
    </a>
  );
}
