// Placeholder API function for getting nearby venues
export default async function getVenues(latitude: number, longitude: number, radius: number = 5) {
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 700));

  // Mock venues data
  const venues = [
    {
      id: '1',
      name: 'Blue Bottle Coffee',
      category: 'coffee',
      address: '66 Mint St, San Francisco, CA 94103',
      latitude: 37.7849,
      longitude: -122.4094,
      rating: 4.5,
      priceLevel: 2,
      isOpen: true,
    },
    {
      id: '2',
      name: 'Dolores Park',
      category: 'park',
      address: 'Dolores St & 19th St, San Francisco, CA 94110',
      latitude: 37.7596,
      longitude: -122.4269,
      rating: 4.7,
      priceLevel: 0,
      isOpen: true,
    },
    {
      id: '3',
      name: 'The Slanted Door',
      category: 'restaurant',
      address: '1 Ferry Bldg #3, San Francisco, CA 94111',
      latitude: 37.7955,
      longitude: -122.3933,
      rating: 4.3,
      priceLevel: 4,
      isOpen: true,
    },
    {
      id: '4',
      name: 'SFMOMA',
      category: 'museum',
      address: '151 3rd St, San Francisco, CA 94103',
      latitude: 37.7857,
      longitude: -122.4011,
      rating: 4.4,
      priceLevel: 3,
      isOpen: false,
    },
  ];

  // Filter venues by radius (simplified calculation)
  const filteredVenues = venues.filter(venue => {
    const distance = Math.sqrt(
      Math.pow(venue.latitude - latitude, 2) + 
      Math.pow(venue.longitude - longitude, 2)
    ) * 111; // Rough conversion to km
    
    return distance <= radius;
  });

  return {
    success: true,
    data: filteredVenues,
    total: filteredVenues.length,
    center: { latitude, longitude },
    radius,
  };
}