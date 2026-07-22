// The legacy location/venue search lived on the removed external backend.
// Manual entry still works: the search screen always offers the raw query
// as a selectable location. A geocoding provider decision is tracked in
// docs/migration-status.md (Questions for Morning Review).
export default async function fetchLocations(_query: string) {
  return [];
}
