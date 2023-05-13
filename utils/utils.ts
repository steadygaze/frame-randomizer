import { RuntimeConfig } from "nuxt/schema";
import { v5 as uuidv5 } from "uuid";
import difference from "lodash.difference";

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
  const sPadded = String(season).padStart(2, "0");
  const ePadded = String(episode).padStart(2, "0");
  return `S${sPadded}E${ePadded} ${name}`;
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

const timecodeRegex =
  /^((?<hours>\d+)(:|h)(?=\d{2}(:|m)))?((?<minutes>\d+)(:|m))?(?<seconds>\d{2}(.\d+)?)s?$/;

export function timecodeToSec(
  timecode: number | string | undefined | null,
  required = false
): number {
  if (timecode === undefined || timecode === null) {
    if (required) {
      throw new Error("timecode is required but found undefined/null");
    }
    return 0;
  }
  if (typeof timecode === "number") {
    return timecode;
  }

  const match = timecodeRegex.exec(timecode);
  if (match && match.length > 0 && match.groups) {
    const hours = parseInt(match.groups.hours || "0");
    const minutes = parseInt(match.groups.minutes || "0");
    const seconds = parseFloat(match.groups.seconds || "0");
    return hours * 3600 + minutes * 60 + seconds;
  }

  throw new Error("Couldn't parse \"" + timecode + '" as timecode');
}

export function checkKeys(keys: string[], obj: any) {
  const missingKeys = difference(
    keys,
    Object.keys(obj).filter((k) => obj[k])
  );
  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required config options: ${missingKeys.join(", ")}`
    );
  }
}
