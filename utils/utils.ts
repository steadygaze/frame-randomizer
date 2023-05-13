import { RuntimeConfig } from "nuxt/schema";
import { v5 as uuidv5 } from "uuid";

export function seasonEpisodeTag(
  season: string | number,
  episode: string | number
) {
  const sPadded = String(season).padStart(2, "0");
  const ePadded = String(episode).padStart(2, "0");
  return `S${sPadded}E${ePadded}`;
}

export function episodeName(
  season: string | number,
  episode: string | number,
  name: string
): string {
  return `${seasonEpisodeTag(season, episode)} ${name}`;
}

export function myUuid(config: RuntimeConfig, purpose = "image_generation") {
  return uuidv5(
    [config.instanceName, config.imageOutputDir, purpose, Date.now()].join(
      "___"
    ),
    config.uuidNamespace
  );
}

export function floatIntPartPad(
  myNumber: number | string,
  iPartPlaces = 2,
  fPartPlaces = 3
) {
  const initialStrNumber = String(myNumber);
  const decimalIndex = initialStrNumber.indexOf(".");
  if (decimalIndex < 0) {
    return fPartPlaces > 0
      ? `${initialStrNumber.padStart(2, "0")}.${"0".repeat(fPartPlaces)}`
      : initialStrNumber.padStart(2, "0");
  }
  const numIPartDigits = decimalIndex;
  const numFPartDigits = initialStrNumber.length - (decimalIndex + 1);
  return `${"0".repeat(
    Math.max(iPartPlaces - numIPartDigits, 0)
  )}${initialStrNumber}${"0".repeat(
    Math.max(fPartPlaces - numFPartDigits, 0)
  )}`;
}
