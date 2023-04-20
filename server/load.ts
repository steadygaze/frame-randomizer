import fs from "fs/promises";
import { RuntimeConfig } from "nuxt/schema";
import once from "lodash.once";
import { findFiles, lsAllFiles } from "~~/utils/file";

async function getEpisodeDataUncached(config: RuntimeConfig) {
  const [initialEpisodeDataString, fileData] = await Promise.all([
    fs.readFile(config.episodeDataPath, { encoding: "utf-8" }),
    lsAllFiles(config),
    fs.mkdir(config.imageOutputDir, { recursive: true }).catch((error) => {
      if (error instanceof Object && "code" in error) {
        // Ignore if dir already exists.
        if (error.code !== "EEXIST") {
          throw error;
        }
      } else {
        throw error;
      }
    }),
  ]);
  const initialEpisodeData = JSON.parse(initialEpisodeDataString).entries;
  const episodeData = await findFiles(config, initialEpisodeData, fileData);
  console.log("Loaded", episodeData.length, "episodes");
  return episodeData;
}

const getEpisodeData = once(getEpisodeDataUncached);

export { getEpisodeData };
