/**
 * Real GPS Location Service using Browser Geolocation API
 * Works on mobile devices with GPS hardware
 */

let watchId = null;
let batteryLevel = 1.0;

// Get battery level if available
async function getBatteryLevel() {
  try {
    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();
      batteryLevel = battery.level;
      battery.addEventListener('levelchange', () => {
        batteryLevel = battery.level;
      });
    }
  } catch (e) {
    batteryLevel = 1.0;
  }
}

getBatteryLevel();

/**
 * Get current position once
 * @returns {Promise<{lat, lng, accuracy, speed, heading}>}
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(parsePosition(pos)),
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
  });
}

/**
 * Start watching position with live updates
 * @param {function} onUpdate - called with {lat, lng, accuracy, speed, heading}
 * @param {function} onError - called with error
 * @returns {function} stopTracking - call to stop
 */
export function startTracking(onUpdate, onError) {
  if (!navigator.geolocation) {
    onError?.(new Error('Geolocation not supported by this browser'));
    return () => {};
  }

  // Battery saver: reduce accuracy when low battery
  const lowBattery = batteryLevel < 0.2;

  const options = {
    enableHighAccuracy: !lowBattery,   // full accuracy unless low battery
    timeout: 10000,
    maximumAge: lowBattery ? 30000 : 3000,  // 30s cache on low battery, 3s normally
  };

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const location = parsePosition(pos);
      onUpdate(location);
    },
    (err) => {
      let message = 'Location error';
      switch (err.code) {
        case err.PERMISSION_DENIED:
          message = 'Location permission denied. Please allow location access.';
          break;
        case err.POSITION_UNAVAILABLE:
          message = 'Location unavailable. Check GPS settings.';
          break;
        case err.TIMEOUT:
          message = 'Location request timed out.';
          break;
      }
      onError?.({ code: err.code, message });
    },
    options
  );

  return () => stopTracking();
}

/**
 * Stop watching position
 */
export function stopTracking() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

/**
 * Parse GeolocationPosition into our format
 */
function parsePosition(pos) {
  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy,           // meters
    altitude: pos.coords.altitude,           // meters (null if unavailable)
    speed: pos.coords.speed                  // m/s (null if unavailable)
      ? Math.round(pos.coords.speed * 3.6)   // convert to km/h
      : 0,
    heading: pos.coords.heading,             // degrees (null if unavailable)
    timestamp: pos.timestamp,
  };
}

/**
 * Calculate distance between two coordinates in km
 */
export function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculate ETA in minutes
 * @param {number} distanceKm - distance in km
 * @param {number} speedKmh - speed in km/h (default 30 if stopped)
 */
export function calcETA(distanceKm, speedKmh) {
  const effectiveSpeed = speedKmh > 2 ? speedKmh : 30; // assume 30 km/h if stopped/walking
  return Math.round((distanceKm / effectiveSpeed) * 60);
}

/**
 * Detect movement status from speed
 */
export function detectStatus(speedKmh, prevLat, prevLng, currLat, currLng, lastMovedAt) {
  if (speedKmh > 25) return 'moving';
  if (speedKmh > 5) return 'slow';
  
  // Check if location actually changed
  const dist = calcDistance(prevLat, prevLng, currLat, currLng);
  if (dist < 0.01) { // < 10 meters
    const stoppedFor = Date.now() - lastMovedAt;
    if (stoppedFor > 10 * 60 * 1000) return 'stopped'; // 10+ minutes
    return 'slow';
  }
  return 'moving';
}

/**
 * Check if user is at destination
 */
export function isAtDestination(userLat, userLng, destLat, destLng, thresholdMeters = 100) {
  const distKm = calcDistance(userLat, userLng, destLat, destLng);
  return distKm * 1000 <= thresholdMeters;
}

/**
 * Check if GPS is available
 */
export function isGeolocationSupported() {
  return 'geolocation' in navigator;
}

/**
 * Request location permission explicitly
 */
export async function requestLocationPermission() {
  if (!navigator.permissions) {
    // Fallback: just try to get position
    return getCurrentPosition()
      .then(() => 'granted')
      .catch(() => 'denied');
  }
  const result = await navigator.permissions.query({ name: 'geolocation' });
  return result.state; // 'granted' | 'denied' | 'prompt'
}
