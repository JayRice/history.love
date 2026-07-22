
// Placeholder API function for getting timeline data
export default async function getTimeline(scrollIndex: number) {
  // Mock delay to simulate API call


  // const response = await fetchServer("/timeline", {
  //   scrollIndex: scrollIndex,
  // }, "GET");


  // Sort events by date (most recent first)
  // events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    success: true,
    scrollIndex: scrollIndex,
    relationships: [],
    memories: [],
  };
}

export { getTimeline }