import { exec as execAsync } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { glob } from "glob";
import shellescape from "shell-escape";
import { RuntimeConfig } from "nuxt/schema";
import merge from "lodash.merge";
import { episodeName } from "../utils/utils";
import { timecodeToSec } from "./utils";

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

export interface EpisodeDatum {
  season: number;
  episode: number;
  name: string;
  overview: string;
  filename: string; // Pre shell escaped and quoted.
  lengthSec: number;
  genLength: number;
  skipRanges: TimeRange[];
}

export interface EpisodesConfig {
  name: string;
  episodes: EpisodeDatum[];
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
  };
  // Miscellaneous list of time ranges that should be skipped.
  skipRanges?: InputTimeRange[];
}

interface JoinedEpisodeDatum {
  season: number;
  episode: number;
  name: string;
  overview: string;
  filename: string;
  timings?: Timings;
}

interface ConfigEpisodeDatum {
  season: number;
  episode: number;
  name: string;
  overview: string;
  timings?: Timings;
}

interface FileEpisodeDatum {
  season: number;
  episode: number;
  filename: string;
}

interface InputEpisodesConfig {
  name: string;
  episodes: ConfigEpisodeDatum[];
  // Timings that are the same for every episode (e.g. credits always start at
  // MM:SS, intro is always MM:SS long, etc.).
  commonTimings?: Timings;
}

const seasonEpisodeRegex =
  /^.*?([sS](eason)?)?(?<season>\d+)(.|([eE](pisode)?)?)(?<episode>\d+).*?\.(mkv|mp4)$/;

/**
 * Get the length of a video file in seconds using ffprobe.
 * @param videoPath Path to video file.
 * @returns Length of the video in seconds.
 */
async function ffprobeLength(videoPath: string) {
  return parseFloat(
    (
      await exec(
        `ffprobe -i ${videoPath} -show_entries format=duration -v quiet -of csv="p=0"`,
      )
    ).stdout,
  );
}

/**
 * List video files in the configured search path.
 * @param config Nuxt runtime config.
 * @returns All video files that appear to have season and episode number.
 */
export async function lsAllFiles(
  config: RuntimeConfig,
): Promise<FileEpisodeDatum[]> {
  const globPattern = path.join(
    config.videoSourceDir,
    config.searchVideoDirRecursively ? "**/*.{mkv,mp4}" : "*.{mkv,mp4}",
  );
  const globbed = await glob(globPattern);
  const fileData: FileEpisodeDatum[] = [];
  globbed.forEach((filename, _index, _arr) => {
    const match = seasonEpisodeRegex.exec(path.basename(filename));
    if (match && match.length > 0 && match.groups) {
      fileData.push({
        season: parseInt(match.groups.season),
        episode: parseInt(match.groups.episode),
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
  config: RuntimeConfig,
  episodeData: ConfigEpisodeDatum[],
  fileData: FileEpisodeDatum[],
): JoinedEpisodeDatum[] {
  const filledData: JoinedEpisodeDatum[] = [];
  const missingEpisodes: string[] = [];
  episodeData.forEach((initialData) => {
    const found = fileData.find(
      (fileData) =>
        initialData.season === fileData.season &&
        initialData.episode === fileData.episode,
    );
    if (!found) {
      missingEpisodes.push(
        episodeName(initialData.season, initialData.episode, initialData.name),
      );
    } else {
      filledData.push({ ...found, ...initialData });
    }
  });
  if (missingEpisodes.length > 0) {
    const missingEpisodesStr = missingEpisodes.join(", ");
    if (config.allowMissingEpisodes) {
      console.warn(
        "Couldn't find files for",
        missingEpisodes.length,
        "episodes:",
        missingEpisodesStr,
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
      throw new Error("One of introLength or introEnd is required");
    }
  }

  if (mergedTimings.endCredits) {
    const start = timecodeToSec(mergedTimings.endCredits.start, true);
    skipRanges.push({ start, length: episodeLength - start });
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
 * Load video file info based on configs.
 * @param config Nuxt runtime config.
 * @param episodeConfig Parsed show/episode config.
 * @param fileData Results of globbing for files and parsing season/episode from filename.
 * @returns Fully loaded data structure used to generate frames.
 */
export async function findFiles(
  config: RuntimeConfig,
  episodeConfig: InputEpisodesConfig,
  fileData: FileEpisodeDatum[],
): Promise<EpisodesConfig> {
  const { name, episodes, commonTimings } = episodeConfig;
  return {
    name,
    episodes: (
      await Promise.all(
        joinFileData(config, episodes, fileData).map(
          async ({
            season,
            episode,
            name,
            overview,
            filename,
            timings,
          }: JoinedEpisodeDatum) => {
            try {
              const lengthSec = await ffprobeLength(filename);
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
                  season,
                  episode,
                  name,
                  overview,
                  filename,
                  skipRanges,
                  genLength,
                  lengthSec,
                },
              ];
            } catch (error) {
              console.error(
                "Failed to load",
                episodeName(season, episode, name),
                "at",
                filename,
              );
              return [];
            }
          },
        ),
      )
    ).flat(),
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
export function imagePathForId(config: RuntimeConfig, id: string) {
  return path.join(
    config.frameOutputDir,
    `${id}.${config.public.imageOutputExtension}`,
  );
}
