import { exec as execAsync } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { glob } from "glob";
import shellescape from "shell-escape";
import { RuntimeConfig } from "nuxt/schema";
import { episodeName } from "./utils";

const exec = promisify(execAsync);

export interface EpisodeDatum {
  season: number;
  episode: number;
  name: string;
  overview: string;
  filename: string; // Pre shell escaped and quoted.
  lengthSec: number;
}

interface JoinedEpisodeDatum {
  season: number;
  episode: number;
  name: string;
  overview: string;
  filename: string;
}

interface InitialEpisodeDatum {
  season: number;
  episode: number;
  name: string;
  overview: string;
}

interface Timings {
  // Episode starts (from 0:00) with an intro sequence that should be skipped.
  openingIntro?: {
    end?: number | string | boolean;
  };
  // Episode starts with a cold open that should not be skipped followed by an
  // intro sequence that should be skipped.
  coldOpen?: {
    introStart?: number | string;
  };
  // Episode ends with a credits sequence (to the end of the video file) that
  // should be skipped.
  endCredits?: {
    start?: number | string;
  };
}

interface FileEpisodeDatum {
  season: number;
  episode: number;
  filename: string;
  timings?: Timings;
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

async function lsAllFiles(config: RuntimeConfig): Promise<FileEpisodeDatum[]> {
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
  episodeData: InitialEpisodeDatum[],
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

async function findFiles(
  config: RuntimeConfig,
  episodeData: InitialEpisodeDatum[],
  fileData: FileEpisodeDatum[]
): Promise<EpisodeDatum[]> {
  return (
    await Promise.all(
      joinFileData(config, episodeData, fileData).map(async (ep) => {
        try {
          const lengthSec = await ffprobeLength(ep.filename);
          return [{ ...ep, lengthSec }];
        } catch (error) {
          console.error(
            "Failed to load",
            episodeName(ep.season, ep.episode, ep.name),
            "at",
            ep.filename
          );
          return [];
        }
      })
    )
  ).flat();
}

export { findFiles, lsAllFiles };
