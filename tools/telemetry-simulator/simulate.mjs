import { parseArgs } from 'node:util';

const ROUTES = [
  [
    [36.8065, 10.1815],
    [36.8528, 10.3233],
    [36.4561, 10.7376],
    [35.8256, 10.6084],
  ],
  [
    [36.8065, 10.1815],
    [36.7256, 9.1817],
    [36.5011, 8.7802],
  ],
  [
    [35.8256, 10.6084],
    [35.6781, 10.0963],
    [34.7406, 10.7603],
  ],
];

const EARTH_RADIUS_KM = 6371;
const SECONDS_PER_HOUR = 3600;

const { values } = parseArgs({
  options: {
    url: { type: 'string', default: 'http://localhost:8085/ingest/v1/positions' },
    device: { type: 'string', multiple: true },
    interval: { type: 'string', default: '5' },
    speed: { type: 'string', default: '70' },
  },
});

if (!values.device?.length) {
  console.error('Usage: node simulate.mjs --device <api-key> [--device <api-key>] [--url <ingest-url>]');
  process.exit(1);
}

const intervalSeconds = Number(values.interval);
const cruiseSpeedKph = Number(values.speed);

const toRadians = degrees => (degrees * Math.PI) / 180;

const distanceKm = ([lat1, lon1], [lat2, lon2]) => {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
};

const bearing = ([lat1, lon1], [lat2, lon2]) => {
  const y = Math.sin(toRadians(lon2 - lon1)) * Math.cos(toRadians(lat2));
  const x =
    Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
    Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(toRadians(lon2 - lon1));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

const vehicles = values.device.map((key, index) => ({
  key,
  route: ROUTES[index % ROUTES.length],
  leg: 0,
  progressKm: 0,
  odometerKm: 10000 + index * 2500,
  fuelLevelPercent: 90,
  direction: 1,
}));

const advance = vehicle => {
  const speedKph = Math.max(0, cruiseSpeedKph + (Math.random() - 0.5) * 30);
  const travelled = (speedKph * intervalSeconds) / SECONDS_PER_HOUR;
  let from = vehicle.route[vehicle.leg];
  let to = vehicle.route[vehicle.leg + vehicle.direction];
  vehicle.progressKm += travelled;
  while (vehicle.progressKm >= distanceKm(from, to)) {
    vehicle.progressKm -= distanceKm(from, to);
    vehicle.leg += vehicle.direction;
    if (vehicle.leg + vehicle.direction < 0 || vehicle.leg + vehicle.direction >= vehicle.route.length) {
      vehicle.direction *= -1;
    }
    from = vehicle.route[vehicle.leg];
    to = vehicle.route[vehicle.leg + vehicle.direction];
  }
  const ratio = vehicle.progressKm / distanceKm(from, to);
  vehicle.odometerKm += travelled;
  vehicle.fuelLevelPercent = Math.max(5, vehicle.fuelLevelPercent - travelled * 0.08);
  return {
    recordedAt: new Date().toISOString(),
    latitude: from[0] + (to[0] - from[0]) * ratio,
    longitude: from[1] + (to[1] - from[1]) * ratio,
    speedKph: Math.round(speedKph * 10) / 10,
    headingDegrees: Math.round(bearing(from, to) * 10) / 10,
    odometerKm: Math.round(vehicle.odometerKm * 10) / 10,
    fuelLevelPercent: Math.round(vehicle.fuelLevelPercent * 10) / 10,
    ignitionOn: true,
  };
};

const send = async vehicle => {
  const response = await fetch(values.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Device-Key': vehicle.key },
    body: JSON.stringify({ positions: [advance(vehicle)] }),
  });
  if (!response.ok) {
    console.error(`Device ${vehicle.key.slice(0, 8)}… rejected: ${response.status} ${await response.text()}`);
  }
};

const tick = () => Promise.allSettled(vehicles.map(send));

console.log(`Simulating ${vehicles.length} vehicle(s) every ${intervalSeconds}s against ${values.url}`);
await tick();
setInterval(tick, intervalSeconds * 1000);
