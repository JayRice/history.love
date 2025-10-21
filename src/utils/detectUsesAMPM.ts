import * as Localization from "expo-localization";

export function detectUsesAMPM(): boolean {
  try {
    const fmt = new Intl.DateTimeFormat(Localization.locale, { hour: "numeric" });
    const hc = (fmt.resolvedOptions().hourCycle || "") as string;
    if (hc.includes("h12") || hc.includes("h11")) return true;

    // Fallback: look for AM/PM in a formatted time string
    const sample = new Date(2020, 0, 1, 13, 0).toLocaleTimeString(Localization.locale, { hour: "numeric" });
    return /AM|PM/i.test(sample);
  } catch {
    return false; // safe default to 24h if detection fails
  }
}
