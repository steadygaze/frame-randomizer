import fs from 'fs/promises'
import { exec as execAsync } from 'node:child_process'
import { promisify } from 'node:util'
import { findFiles, lsAllFiles } from '~~/utils/file'
import config from '~~/config'

const exec = promisify(execAsync)

async function ffmpegFrame(
  videoPath: string,
  timestamp: number | string,
  outputPath: string
) {
  const command = `ffmpeg -ss ${timestamp} -i ${videoPath} -frames:v 1 -y ${outputPath}`
  await exec(command)
  return command
}

const [initialEpisodeDataString, fileData] = await Promise.all([
  fs.readFile(config.episodeDataPath, { encoding: 'utf-8' }),
  lsAllFiles(config.videoSourceDir),
])
const initialEpisodeData = JSON.parse(initialEpisodeDataString).entries
const episodeData = await findFiles(initialEpisodeData, fileData)
console.dir(episodeData)

try {
  await fs.mkdir(config.imageOutPath, { recursive: true })
} catch (error) {
  if (error instanceof Object && 'code' in error) {
    // Ignore if dir already exists.
    if (error.code !== 'EEXIST') {
      throw error
    }
  } else {
    throw error
  }
}

// eslint-disable-next-line no-undef -- defineEventHandler
export default defineEventHandler(async () => {
  const fname = `gen${Date.now()}.png`
  const imagePath = `/home/${process.env.USER}/projects/showguesser/public/${fname}`
  const { filename, lengthSec, season, episode } =
    episodeData[Math.floor(Math.random() * episodeData.length)]
  const randomSeekTimeSec = Math.random() * lengthSec
  const minute = Math.floor(randomSeekTimeSec / 60)
  const second = Math.floor((randomSeekTimeSec % 60) * 1000) / 1000
  const command = await ffmpegFrame(filename, randomSeekTimeSec, imagePath)
  return { imagePath: fname, command, minute, second, season, episode }
})
