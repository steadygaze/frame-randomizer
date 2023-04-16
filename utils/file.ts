import { exec as execAsync } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { glob } from 'glob'
import shellescape from 'shell-escape'
import { episodeName } from './utils'
import config from '~~/config'

const exec = promisify(execAsync)

interface EpisodeDatum {
  season: number
  episode: number
  name: string
  overview: string
  filename: string // Pre shell escaped and quoted.
  lengthSec: number
}

interface JoinedEpisodeDatum {
  season: number
  episode: number
  name: string
  overview: string
  filename: string
}

interface InitialEpisodeDatum {
  season: number
  episode: number
  name: string
  overview: string
}

interface FileEpisodeDatum {
  season: number
  episode: number
  filename: string
}

const seasonEpisodeRegex =
  /^.*?([sS](eason)?)?(?<season>\d+)(.|([eE](pisode)?)?)(?<episode>\d+).*?\.(mkv|mp4)$/

async function ffprobeLength(videoPath: string) {
  return parseFloat(
    (
      await exec(
        `ffprobe -i ${videoPath} -show_entries format=duration -v quiet -of csv="p=0"`
      )
    ).stdout
  )
}

async function lsAllFiles(dir: string): Promise<FileEpisodeDatum[]> {
  const globPattern = path.join(
    dir,
    config.searchVideoDirRecursively ? '**/*.{mkv,mp4}' : '*.{mkv,mp4}'
  )
  const globbed = await glob(globPattern)
  const fileData: FileEpisodeDatum[] = []
  globbed.forEach((filename, _index, _arr) => {
    const match = seasonEpisodeRegex.exec(path.basename(filename))
    if (match && match.length > 0 && match.groups) {
      fileData.push({
        season: parseInt(match?.groups.season),
        episode: parseInt(match?.groups.episode),
        filename: shellescape([filename]),
      })
    }
  })
  return fileData
}

function joinFileData(
  episodeData: InitialEpisodeDatum[],
  fileData: FileEpisodeDatum[]
): JoinedEpisodeDatum[] {
  const filledData: JoinedEpisodeDatum[] = []
  const missingEpisodes: string[] = []
  episodeData.forEach((initialData) => {
    const found = fileData.find(
      (fileData) =>
        initialData.season === fileData.season &&
        initialData.episode === fileData.episode
    )
    if (!found) {
      missingEpisodes.push(
        episodeName(initialData.season, initialData.episode, initialData.name)
      )
    } else {
      filledData.push({ ...found, ...initialData })
    }
  })
  if (missingEpisodes.length > 0) {
    const missingEpisodesStr = missingEpisodes.join(', ')
    if (config.allowMissingEpisodes) {
      console.warn(
        "Couldn't find files for",
        missingEpisodes.length,
        'episodes:',
        missingEpisodesStr
      )
    } else {
      throw new Error(
        `Couldn't find files for ${missingEpisodes.length} episodes: ${missingEpisodesStr}`
      )
    }
  }
  return filledData
}

async function findFiles(
  episodeData: InitialEpisodeDatum[],
  fileData: FileEpisodeDatum[]
): Promise<EpisodeDatum[]> {
  return await Promise.all(
    joinFileData(episodeData, fileData).map(async (ep) => {
      const lengthSec = await ffprobeLength(ep.filename)
      return { ...ep, lengthSec }
    })
  )
}

export { findFiles, lsAllFiles }
