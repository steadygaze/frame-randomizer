import { RuntimeConfig } from 'nuxt/schema'
import { v5 as uuidv5 } from 'uuid'

function episodeName(
  season: string | number,
  episode: string | number,
  name: string
): string {
  const sPadded = String(season).padStart(2, '0')
  const ePadded = String(episode).padStart(2, '0')
  return `S${sPadded}E${ePadded} ${name}`
}

function myUuid(config: RuntimeConfig, purpose = 'image_generation') {
  return uuidv5(
    [config.instanceName, config.imageOutputDir, purpose, Date.now()].join(
      '___'
    ),
    config.uuidNamespace
  )
}

export { episodeName, myUuid }
