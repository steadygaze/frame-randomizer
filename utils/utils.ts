import { v5 as uuidv5 } from 'uuid'
import config from '~~/config'

function episodeName(
  season: string | number,
  episode: string | number,
  name: string
): string {
  const sPadded = String(season).padStart(2, '0')
  const ePadded = String(episode).padStart(2, '0')
  return `S${sPadded}E${ePadded} ${name}`
}

const nameParts = [config.instanceName, config.imageOutputDir].join('___')
function myUuid(purpose = 'image_generation') {
  return uuidv5(nameParts + purpose + Date.now(), config.uuidNamespace)
}

export { episodeName, myUuid }
