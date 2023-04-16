import fs from 'node:fs/promises'
import fsAsync from 'node:fs'
import path from 'path'
import { sendStream } from 'h3'
import { RuntimeConfig } from 'nuxt/schema'

// eslint-disable-next-line no-undef -- useRuntimeConfig is autoimported
const config = useRuntimeConfig() as RuntimeConfig

// eslint-disable-next-line no-undef -- defineEventHandler is autoimported
export default defineEventHandler(async (event) => {
  const imageId = event.context?.params?.id
  if (!imageId) {
    throw new Error('No imageId param')
  }
  const filePath = path.join(
    config.imageOutputDir,
    `${imageId}.${config.public.imageOutputExtension}`
  )
  await fs.access(filePath)
  return sendStream(event, fsAsync.createReadStream(filePath))
})
