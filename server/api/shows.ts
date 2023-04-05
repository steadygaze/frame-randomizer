/* global defineEventHandler */
import fs from 'fs/promises'

interface ServerSideShow {
  season: number
  episode: number
  title: string
  path: string
}

export interface Show {
  season: number
  episode: number
  title: string
  fullName: string
}

const serverSideShows: ServerSideShow[] = JSON.parse(
  await fs.readFile(
    `/home/${process.env.USER}/projects/showguesser_data/data.json`,
    { encoding: 'utf-8' }
  )
).shows

const shows = serverSideShows.map((show) => {
  return {
    season: show.season,
    episode: show.episode,
    title: show.title,
    fullName: `S${show.season}E${show.episode} ${show.title}`,
  }
})

export default defineEventHandler(() => {
  return { shows }
})
