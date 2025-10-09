import fetchServer from "./fetchServer"
export default async function fetchLocations(query: string)  {

  const response  = await fetchServer("/utils/get_locations", {query: query }, "POST");

  if (response && response.success){
    return response.locations;
  }

  return null;

}