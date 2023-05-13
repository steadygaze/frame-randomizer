import { RuntimeConfig } from "nuxt/schema";
import { v5 as uuidv5 } from "uuid";
import difference from "lodash.difference";

const timecodeRegex =
  /^((?<hours>\d+)(:|h)(?=\d{2}(:|m)))?((?<minutes>\d+)(:|m))?(?<seconds>\d{2}(.\d+)?)s?$/;

/**
 * Generates a UUID using uuidv5 and information about the instance.
 * @param config Has information used to generate UUID.
 * @param purpose What the UUID will be used for, to differentiate it from other UUIDs generated.
 * @returns Standard UUID.
 */
export function myUuid(config: RuntimeConfig, purpose = "image_generation") {
  return uuidv5(
    [config.instanceName, config.imageOutputDir, purpose, Date.now()].join(
      "___"
    ),
    config.uuidNamespace
  );
}

/**
 * Converts a timecode to a number of seconds.
 * @param timecode String like "XX:XX.XXX", "1h10m34s", or similar.
 * @param required Whether to throw an error if timecode is absent.
 * @returns Equivalent in seconds.
 */
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

/**
 * Checks whether an object has the given keys. If not, throw an error.
 * @param keys Keys to check for.
 * @param obj Object to check.
 */
export function checkKeys(keys: string[], obj: any): void {
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
