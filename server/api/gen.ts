import fs from 'fs/promises'
import { exec as execAsync } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(execAsync)

async function ffprobeLength(videoPath: string) {
  return parseFloat(
    (
      await exec(
        `ffprobe -i ${videoPath} -show_entries format=duration -v quiet -of csv="p=0"`
      )
    ).stdout
  )
}

async function ffmpegFrame(
  videoPath: string,
  timestamp: number | string,
  outputPath: string
) {
  const command = `ffmpeg -ss ${timestamp} -i ${videoPath} -frames:v 1 -y ${outputPath}`
  await exec(command)
  return command
}

const paths = await Promise.all(
  (
    await fs.readdir(`/home/${process.env.USER}/Downloads`)
  )
    .filter((p) => !!p.match(/^YP-1S-.*\.mkv$/))
    .map(async (p) => {
      const match = p.match(/\d\dx\d\d/)
      const path = `/home/${process.env.USER}/Downloads/${p}`
      const lengthSec = await ffprobeLength(path)
      return {
        path,
        epNum: match ? match[0] : '',
        lengthSec,
      }
    })
)

console.dir(paths)

export default defineEventHandler(async () => {
  const fname = `gen${Date.now()}.png`
  const imagePath = `/home/${process.env.USER}/projects/showguesser/public/${fname}`
  // const videoPath =
  //   serverSideShows[Math.floor(Math.random() * serverSideShows.length)].path
  const { path, epNum, lengthSec } =
    paths[Math.floor(Math.random() * paths.length)]
  const randomSeekTimeSec = Math.random() * lengthSec
  const minute = Math.floor(randomSeekTimeSec / 60)
  const second = Math.floor((randomSeekTimeSec % 60) * 1000) / 1000
  const command = await ffmpegFrame(path, randomSeekTimeSec, imagePath)
  return { imagePath: fname, command, minute, second, epNum }
})
