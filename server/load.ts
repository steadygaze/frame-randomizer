import fs from "fs/promises";
import { RuntimeConfig } from "nuxt/schema";
import once from "lodash.once";
import { findFiles, lsAllFiles } from "~/utils/file";

async function getEpisodeDataUncached(runtimeConfig: RuntimeConfig) {
  const [episodeConfigString, fileData] = await Promise.all([
    fs.readFile(runtimeConfig.episodeDataPath, { encoding: "utf-8" }),
    lsAllFiles(runtimeConfig),
    fs
      .mkdir(runtimeConfig.imageOutputDir, { recursive: true })
      .catch((error) => {
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
  const episodeConfig = JSON.parse(episodeConfigString);
  const episodeData = await findFiles(runtimeConfig, episodeConfig, fileData);
  console.log("Loaded", episodeData.length, "episodes");
  return episodeData;
}

const getEpisodeData = once(getEpisodeDataUncached);

export { getEpisodeData };
