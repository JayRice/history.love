
import Constants from "expo-constants";
import { getAuthUser } from '@/src/database/auth/getAuthUser';


import Toast from 'react-native-toast-message';

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

function joinUrl(base: string, ...parts: string[]) {
  const cleaned = [base, ...parts]
    .filter(Boolean)
    .map((p, i) => (i === 0 ? p.replace(/\/+$/,'') : p.replace(/^\/+|\/+$/g,'')));
  return cleaned.join("/");
}

export default async function fetchServer(
  route: string,
  payload?: any,
  method?: HttpMethod,
  errorMessage?: string
) {
  if (!Constants.expoConfig?.extra?.api_url) {
    throw new Error("Missing expo extra.api_url");
  }

  // Normalize route (allow caller to pass "/x" or "x")
  const url = joinUrl(Constants.expoConfig.extra.api_url, "api", route);

  const authUser = getAuthUser();
  if (!authUser) throw new Error("Not signed in");
  const token = await authUser.getIdToken();

  // Default method: GET if no payload, otherwise POST
  const finalMethod: HttpMethod = method ?? (payload ? "POST" : "GET");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  let body: string | undefined = undefined;

  if ( !(payload instanceof FormData) && finalMethod !== "GET" && finalMethod !== "HEAD") {
    headers["Content-Type"] = "application/json";
    body = payload != null ? JSON.stringify(payload) : "{}";
  }

  try {
    const res = await fetch(url, {
      method: finalMethod,
      headers,
      body: (payload instanceof FormData) ? payload:body,
    });

    // Try to detect non-JSON responses safely
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      const text = await res.text();
      console.warn("Non-JSON response", { status: res.status, url, text: text.slice(0, 300) });
      throw new Error(`Expected JSON but got ${contentType || "unknown"} (${res.status})`);
    }

    const json = await res.json();

    if (!res.ok) {
      // backend returned JSON error; never log the full payload
      console.warn("Server error", { status: res.status, url, error: json?.error });
      throw new Error(json?.error || `Request failed (${res.status})`);
    }

    if (json?.success) return json;

    throw new Error(json?.error || `Error while fetching server response (${route})`);
  } catch (e) {
    console.error("fetchServer error", e);
    Toast.show({
      type: "error",
      text1: "Error",
      text2: `${e}`,
    });

    return null;
  }
}