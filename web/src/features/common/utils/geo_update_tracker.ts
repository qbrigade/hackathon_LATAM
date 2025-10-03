// Utility to track geolocation updates in localStorage
// Maintains timestamps per user ID to enforce 6-month update restrictions

export const canUpdateGeoLocation = (lastUpdate: number): boolean => {
  const sixMonthsInMs = 6 * 30.44 * 24 * 60 * 60 * 1000; // 6 months approximation
  const now = Date.now();

  return (now - lastUpdate) >= sixMonthsInMs;
};

export const getDaysUntilNextGeoUpdate = (lastUpdate: number): number => {
  const sixMonthsInMs = 6 * 30.44 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const nextAllowedUpdate = lastUpdate + sixMonthsInMs;

  if (now >= nextAllowedUpdate) return 0;

  const msUntilNext = nextAllowedUpdate - now;
  return Math.ceil(msUntilNext / (24 * 60 * 60 * 1000));
};

export const getNextGeoUpdateDate = (lastUpdate: number): Date | null => {
  const sixMonthsInMs = 6 * 30.44 * 24 * 60 * 60 * 1000;
  return new Date(lastUpdate + sixMonthsInMs);
};
