import { exec as execAsync } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { glob } from "glob";
import shellescape from "shell-escape";
import { RuntimeConfig } from "nuxt/schema";
import merge from "lodash.merge";
import { episodeName, timecodeToSec } from "./utils";

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

interface EpisodeConfig {
  entries: ConfigEpisodeDatum[];
  // Timings that are the same for every episode (e.g. credits always start at
  // MM:SS, intro is always MM:SS long, etc.).
  commonTimings?: Timings;
}

const seasonEpisodeRegex =
  /^.*?([sS](eason)?)?(?<season>\d+)(.|([eE](pisode)?)?)(?<episode>\d+).*?\.(mkv|mp4)$/;

async function ffprobeLength(videoPath: string) {
  return parseFloat(
    (
      await exec(
        `ffprobe -i ${videoPath} -show_entries format=duration -v quiet -of csv="p=0"`
      )
    ).stdout
  );
}

export async function lsAllFiles(
  config: RuntimeConfig
): Promise<FileEpisodeDatum[]> {
  const globPattern = path.join(
    config.videoSourceDir,
    config.searchVideoDirRecursively ? "**/*.{mkv,mp4}" : "*.{mkv,mp4}"
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

function joinFileData(
  config: RuntimeConfig,
  episodeData: ConfigEpisodeDatum[],
  fileData: FileEpisodeDatum[]
): JoinedEpisodeDatum[] {
  const filledData: JoinedEpisodeDatum[] = [];
  const missingEpisodes: string[] = [];
  episodeData.forEach((initialData) => {
    const found = fileData.find(
      (fileData) =>
        initialData.season === fileData.season &&
        initialData.episode === fileData.episode
    );
    if (!found) {
      missingEpisodes.push(
        episodeName(initialData.season, initialData.episode, initialData.name)
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
        missingEpisodesStr
      );
    } else {
      throw new Error(
        `Couldn't find files for ${missingEpisodes.length} episodes: ${missingEpisodesStr}`
      );
    }
  }
  return filledData;
}

function parseRange(range: InputTimeRange) {
  const start = timecodeToSec(range?.start);
  if (range.end) {
    return { start, length: timecodeToSec(range?.end) - start };
  } else if (range.length) {
    return { start, length: timecodeToSec(range?.length) };
  } else {
    throw new Error("One of length or end is required");
  }
}

export function generateSkipRanges(
  episodeLength: number,
  episodeTimings: Timings | undefined,
  commonTimings: Timings | undefined
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

export async function findFiles(
  config: RuntimeConfig,
  episodeConfig: EpisodeConfig,
  fileData: FileEpisodeDatum[]
): Promise<EpisodeDatum[]> {
  const { entries, commonTimings } = episodeConfig;
  return (
    await Promise.all(
      joinFileData(config, entries, fileData).map(
        async ({
          season,
          episode,
          name,
          overview,
          filename,
          timings,
        }: JoinedEpisodeDatum) => {
          const skipRanges: TimeRange[] = [];
          if (timings) {
            if (timings.openingIntro || commonTimings?.openingIntro) {
              skipRanges.push({
                start: 0,
                length: timecodeToSec(
                  timings.openingIntro?.end ||
                    commonTimings?.openingIntro?.end ||
                    0
                ),
              });
            }
          }
          const genLength = skipRanges.reduce(
            (sum, range) => sum + range.length,
            0
          );
          try {
            const lengthSec = await ffprobeLength(filename);
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
              filename
            );
            return [];
          }
        }
      )
    )
  ).flat();
}
