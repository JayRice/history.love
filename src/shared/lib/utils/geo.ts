// Geolocation utility functions

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formatted?: string;
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

// Convert degrees to radians
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Format distance for display
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
}

// Mock function to get current location (replace with real geolocation API)
export async function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    // Mock location - San Francisco
    setTimeout(() => {
      resolve({
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
      });
    }, 1000);
  });
}

// Mock function to reverse geocode coordinates to address
export async function reverseGeocode(coordinates: Coordinates): Promise<LocationAddress> {
  // Mock delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock address data
  return {
    street: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    postalCode: '94102',
    formatted: '123 Main Street, San Francisco, CA 94102, United States',
  };
}

// Check if coordinates are within a certain radius of a center point
export function isWithinRadius(
  center: Coordinates,
  point: Coordinates,
  radiusKm: number
): boolean {
  const distance = calculateDistance(center, point);
  return distance <= radiusKm;
}