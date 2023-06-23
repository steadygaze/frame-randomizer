import { exec as execAsync } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { glob } from "glob";
import shellescape from "shell-escape";
import merge from "lodash.merge";
import pLimit from "p-limit";
import { seasonEpisodeTag } from "../utils/utils";
import { timecodeToSec } from "./utils";
import logger from "./logger";

const exec = promisify(execAsync);

// Input timecode, with number as seconds from the start, string as HH:MM:SS.
type InputTimecode = number | string;

interface TimeRange {
  start: number;
  length: number;
}

// Input time range, using either offset or end timecode.
interface InputTimeRange {
  start: InputTimecode;
  end?: InputTimecode;
  length?: InputTimecode;
}

export interface ServerEpisodeData {
  season_number: number;
  episode_number: number;
  filename: string; // Pre shell escaped and quoted.
  lengthSec: number;
  genLength: number;
  skipRanges: TimeRange[];
}

export interface ClientEpisodeData {
  season: number;
  episode: number;
  name: string;
  synopsis?: string;
}

export interface ClientShowData {
  name: string;
  synopsisAvailable: boolean;
  episodes: ClientEpisodeData[];
}

export interface ShowData {
  defaultLanguage?: string;
  episodes: ServerEpisodeData[];
  clientData: {
    [key: string]: ClientShowData;
  };
}

interface Timings {
  // Episode starts (from 0:00) with an intro sequence that should be skipped.
  openingIntro?: {
    end?: InputTimecode;
  };
  // Episode starts with a cold open that should not be skipped followed by an
  // intro sequence that should be skipped.
  coldOpen?: {
    introStart?: InputTimecode;
    introEnd?: InputTimecode;
    introLength?: InputTimecode;
  };
  // Episode ends (to the end of the video file) with a credits sequence that
  // should be skipped.
  endCredits?: {
    start?: InputTimecode;
    endOffset?: InputTimecode;
  };
  // Miscellaneous list of time ranges that should be skipped.
  skipRanges?: InputTimeRange[];
}

interface JoinedEpisodeData {
  season_number: number;
  episode_number: number;
  filename: string;
  timings?: Timings;
}

interface PerLanguageData {
  language: string;
  name: string;
  overview?: string;
}

interface ConfigEpisodeData {
  season_number: number;
  episode_number: number;
  perLanguage: PerLanguageData[];
  timings?: Timings;
}

interface FileEpisodeData {
  season_number: number;
  episode_number: number;
  filename: string;
}

interface PerLanguageName {
  language: string;
  name: string;
}

interface InputShowData {
  name: { name: string; perLanguage: PerLanguageName[] };
  defaultLanguage?: string;
  episodes: ConfigEpisodeData[];
  // Timings that are the same for every episode (e.g. credits always start at
  // MM:SS, intro is always MM:SS long, etc.).
  commonTimings?: Timings;
}

/**
 * Get the length of a video file in seconds using ffprobe.
 * @param ffprobe Path to ffprobe.
 * @param ffprobePersistentCache Cache used to store ffprobe results, for fast server restarts.
 * @param videoPath Path to video file.
 * @returns Length of the video in seconds.
 */
async function ffprobeLength(
  ffprobe: string,
  ffprobePersistentCache: ReturnType<typeof useStorage> | null,
  videoPath: string,
): Promise<number> {
  if (ffprobePersistentCache) {
    const cached = await ffprobePersistentCache.getItem(videoPath);
    if (
      cached &&
      typeof cached === "object" &&
      "length" in cached &&
      cached.length
    ) {
      return cached.length as number;
    }
  }
  const length = parseFloat(
    (
      await exec(
        `${ffprobe} -i ${videoPath} -show_entries format=duration -v quiet -of csv="p=0"`,
      )
    ).stdout,
  );
  if (ffprobePersistentCache) {
    ffprobePersistentCache.setItem(videoPath, { length });
  }
  return length;
}

/**
 * List video files in the configured search path.
 * @param config Nuxt runtime config.
 * @returns All video files that appear to have season and episode number.
 */
export async function lsAllFiles(
  config: ReturnType<typeof useRuntimeConfig>,
): Promise<FileEpisodeData[]> {
  const seasonEpisodeRegex = new RegExp(
    `^.*?([sS](eason)?)?(?<season_number>\\d+)(.|([eE](pisode)?)?)(?<episode_number>\\d+).*?\\.(${config.videoFileExtension
      .split(",")
      .join("|")})$`,
  );

  const globPattern = path.join(
    config.videoSourceDir,
    config.searchVideoDirRecursively
      ? `**/*.{${config.videoFileExtension}}`
      : `*.{${config.videoFileExtension}}`,
  );
  const globbed = await glob(globPattern);
  const fileData: FileEpisodeData[] = [];
  globbed.forEach((filename) => {
    const match = seasonEpisodeRegex.exec(path.basename(filename));
    if (match && match.length > 0 && match.groups) {
      fileData.push({
        season_number: parseInt(match.groups.season_number),
        episode_number: parseInt(match.groups.episode_number),
        filename: shellescape([filename]),
      });
    }
  });
  return fileData;
}

/**
 * Matches episode data from configs with files found.
 * @param config Nuxt runtime config.
 * @param episodeData Data for episodes present in configs.
 * @param fileData Data for episodes from files.
 * @returns Unified data structure matching episodes and files.
 */
function joinFileData(
  config: ReturnType<typeof useRuntimeConfig>,
  episodeData: ConfigEpisodeData[],
  fileData: FileEpisodeData[],
): JoinedEpisodeData[] {
  const filledData: JoinedEpisodeData[] = [];
  const missingEpisodes: string[] = [];
  episodeData.forEach((initialData) => {
    const found = fileData.find(
      (fileData) =>
        initialData.season_number === fileData.season_number &&
        initialData.episode_number === fileData.episode_number,
    );
    if (!found) {
      missingEpisodes.push(
        seasonEpisodeTag(initialData.season_number, initialData.episode_number),
      );
    } else {
      filledData.push({ ...found, timings: initialData.timings });
    }
  });
  if (missingEpisodes.length > 0) {
    const missingEpisodesStr = missingEpisodes.join(", ");
    if (config.allowMissingEpisodes) {
      logger.warn(
        `Couldn't find files for ${missingEpisodes.length} episodes: ${missingEpisodesStr}`,
      );
    } else {
      throw new Error(
        `Couldn't find files for ${missingEpisodes.length} episodes: ${missingEpisodesStr}`,
      );
    }
  }
  return filledData;
}

/**
 * Parses/normalizes a user-provided range from config.
 *
 * Timestamps can be given as either numbers (offset from the beginning in
 * seconds) or string timecodes ("HH:MM:SS").
 * @param range Input time range, before parsing.
 * @returns Parsed time range.
 */
function parseRange(range: InputTimeRange): TimeRange {
  const start = timecodeToSec(range?.start);
  if (range.end) {
    return { start, length: timecodeToSec(range?.end) - start };
  }
  if (range.length) {
    return { start, length: timecodeToSec(range?.length) };
  }
  throw new Error("One of length or end is required");
}

/**
 * Generates a list of skip ranges from the timing config.
 * @param episodeLength Length of the episode in seconds.
 * @param episodeTimings Timings config for the episode, if present.
 * @param commonTimings Common timings config for all episodes, if present.
 * @returns Sorted list of time ranges that should be skipped/not used.
 */
export function generateSkipRanges(
  episodeLength: number,
  episodeTimings: Timings | undefined,
  commonTimings: Timings | undefined,
): TimeRange[] {
  const skipRanges: TimeRange[] = [];
  if (!episodeTimings && !commonTimings) {
    return skipRanges;
  }

  const mergedTimings = merge({}, commonTimings, episodeTimings);

  if (mergedTimings.openingIntro && mergedTimings.openingIntro.end) {
    skipRanges.push({
      start: 0,
      length: timecodeToSec(mergedTimings.openingIntro.end),
    });
  }

  if (mergedTimings.coldOpen && mergedTimings.coldOpen.introStart) {
    const start = timecodeToSec(mergedTimings.coldOpen.introStart, true);
    const both =
      mergedTimings.coldOpen.introLength && mergedTimings.coldOpen.introEnd;
    if (
      (both && episodeTimings?.coldOpen?.introLength) ||
      (!both && mergedTimings.coldOpen.introLength)
    ) {
      skipRanges.push({
        start,
        length: timecodeToSec(mergedTimings.coldOpen.introLength),
      });
    } else if (
      (both && episodeTimings?.coldOpen?.introEnd) ||
      (!both && mergedTimings.coldOpen.introEnd)
    ) {
      skipRanges.push({
        start,
        length: timecodeToSec(mergedTimings.coldOpen.introEnd) - start,
      });
    } else {
      throw new Error(
        "One of coldOpen.introLength or introEnd is required if skipping cold open intro",
      );
    }
  }

  if (mergedTimings.endCredits) {
    if (mergedTimings.endCredits.start) {
      const start = timecodeToSec(mergedTimings.endCredits.start, true);
      skipRanges.push({ start, length: episodeLength - start });
    } else if (mergedTimings.endCredits.endOffset) {
      const endOffset = timecodeToSec(mergedTimings.endCredits.endOffset, true);
      skipRanges.push({ start: episodeLength - endOffset, length: endOffset });
    } else {
      throw new Error(
        "One of endCredits.start or endOffset is required if skipping end credits",
      );
    }
  }

  if (commonTimings?.skipRanges) {
    skipRanges.push(...commonTimings.skipRanges.map(parseRange));
  }
  if (episodeTimings?.skipRanges) {
    skipRanges.push(...episodeTimings.skipRanges.map(parseRange));
  }

  skipRanges.sort((rangeA, rangeB) => rangeA.start - rangeB.start);

  return skipRanges;
}

/**
 * Check if two sets are equal.
 * @param setA First set to check.
 * @param setB Second set to check.
 * @returns Whether the two sets are equal.
 */
function setEquals<Type>(setA: Set<Type>, setB: Set<Type>): boolean {
  if (setA.size !== setB.size) {
    return false;
  }
  for (const elem of setA) {
    if (!setB.has(elem)) {
      return false;
    }
  }
  return true;
}

/**
 * Check a show data config input for problems/misconfigurations.
 * @param showData Input show data to check.
 */
export function checkInputShowData(showData: InputShowData) {
  const languagesList = showData.name.perLanguage.map(
    ({ language }) => language,
  );
  if (languagesList.length <= 0) {
    throw new Error("At least one language/show name is required");
  }
  const languages = new Set(languagesList);
  if (languages.size !== languagesList.length) {
    throw new Error("Duplicate input languages " + languagesList);
  }
  showData.episodes.forEach((episode) => {
    const episodeLanguagesList = episode.perLanguage.map(
      ({ language }) => language,
    );
    if (episode.perLanguage.length !== languages.size) {
      throw new Error(
        "Missing/extra languages in " +
          seasonEpisodeTag(episode.season_number, episode.episode_number) +
          ` (${languages} != ${episodeLanguagesList}`,
      );
    }
    const episodeLanguages = new Set(episodeLanguagesList);
    if (episodeLanguages.size !== episodeLanguagesList.length) {
      throw new Error(
        "Duplicate languages in " +
          seasonEpisodeTag(episode.season_number, episode.episode_number) +
          `: ${episodeLanguagesList}`,
      );
    }
    if (!setEquals(episodeLanguages, languages)) {
      throw new Error(
        `Expected languages mismatch {expected: ${languagesList}, found: ${episodeLanguagesList}}`,
      );
    }
  });
}

/**
 * Generate per-language client-side data.
 * @param showData Input show data config.
 * @param serverEpisodes Server-side filtered episodes.
 * @returns Per-language data.
 */
export function extractPerLanguageData(
  showData: InputShowData,
  serverEpisodes?: ServerEpisodeData[],
): { [key: string]: ClientShowData } {
  const { name, episodes } = showData;
  return Object.fromEntries(
    name.perLanguage.map(({ language, name }) => {
      // Filtering using server episodes, in case there are missing episodes.
      const clientEpisodes = (
        serverEpisodes
          ? episodes.filter(
              ({ season_number: seasonN, episode_number: episodeN }) =>
                serverEpisodes.find(
                  ({ season_number: epSeasonN, episode_number: epEpisodeN }) =>
                    epSeasonN === seasonN && epEpisodeN === episodeN,
                ),
            )
          : episodes
      ).map(
        ({ season_number: seasonN, episode_number: episodeN, perLanguage }) => {
          const { name, overview } = perLanguage.find(
            ({ language: epLanguage }) => epLanguage === language,
          )!;
          return {
            season: seasonN,
            episode: episodeN,
            name,
            // Synopsis may be missing in some languages. Don't bother returning
            // it in the API if it's empty.
            ...(overview && { synopsis: overview }),
          };
        },
      );

      // Whether this language has any translated synopses.
      const synopsisAvailable = clientEpisodes.some(
        (episode) => episode.synopsis,
      );

      return [
        language,
        {
          name,
          synopsisAvailable,
          episodes: clientEpisodes,
        },
      ];
    }),
  );
}

/**
 * Load video file info based on configs, and sort data by language.
 * @param config Nuxt runtime config.
 * @param showData Parsed show/episode config.
 * @param fileData Results of globbing for files and parsing season/episode from filename.
 * @returns Fully loaded data structure used to generate frames.
 */
export async function findFiles(
  config: ReturnType<typeof useRuntimeConfig>,
  showData: InputShowData,
  fileData: FileEpisodeData[],
): Promise<ShowData> {
  checkInputShowData(showData);
  const { defaultLanguage, episodes, commonTimings } = showData;
  const limit = pLimit(config.ffprobeInitialLoadLimit || Infinity);

  // Generate server-side episode data.
  const serverEpisodes = (
    await Promise.all(
      joinFileData(config, episodes, fileData).map(
        // Generate server-side info about the video file.
        async (joinedEp: JoinedEpisodeData) => {
          const {
            season_number: seasonN,
            episode_number: episodeN,
            filename,
            timings,
          } = joinedEp;
          try {
            const lengthSec = await limit(() =>
              ffprobeLength(
                config.ffprobePath,
                config.useFfprobeCache
                  ? useStorage("ffprobePersistentCache")
                  : null,
                filename,
              ),
            );
            const skipRanges: TimeRange[] = generateSkipRanges(
              lengthSec,
              timings,
              commonTimings,
            );
            const genLength =
              lengthSec -
              skipRanges.reduce((sum, range) => sum + range.length, 0); // Sum of skipped lengths.
            return [
              {
                ...joinedEp,
                skipRanges,
                genLength,
                lengthSec,
              },
            ];
          } catch (error) {
            logger.error(
              `Failed to load ${seasonEpisodeTag(
                seasonN,
                episodeN,
              )} at ${filename}`,
            );
            return [];
          }
        },
      ),
    )
  ).flat();

  const clientData = extractPerLanguageData(showData, serverEpisodes);

  return {
    defaultLanguage,
    episodes: serverEpisodes,
    clientData,
  };
}

/**
 * Offsets a time in an episode by skipping all the given time ranges.
 *
 * For example, if an unoffset time 10 is passed in but the range 3-5 is
 * skipped, the result time will be 12. This is used to randomly generates a
 * time not in a skipped range, by generating a time [0, episode length minus
 * skipped time] then passing it to this.
 * @param unoffsetTime Initial time before offsetting.
 * @param skipRanges List of time ranges to skip.
 * @returns New time, offset by all the skip ranges before it.
 */
export function offsetTimeBySkipRanges(
  unoffsetTime: number,
  skipRanges: TimeRange[],
) {
  let offsetTime = unoffsetTime;
  for (
    let i = 0;
    i < skipRanges.length && skipRanges[i].start < offsetTime;
    ++i
  ) {
    offsetTime += skipRanges[i].length;
  }
  return offsetTime;
}

/**
 * Get the expected server-side path for an ID.
 * @param config Nuxt runtime config.
 * @param id Image ID.
 * @returns Expected image path.
 */
export function imagePathForId(
  config: ReturnType<typeof useRuntimeConfig>,
  id: string,
) {
  return path.join(
    config.frameOutputDir,
    `${id}.${config.public.imageOutputExtension}`,
  );
}
