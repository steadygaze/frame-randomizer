function episodeName(
  season: string | number,
  episode: string | number,
  name: string
): string {
  const sPadded = String(season).padStart(2, '0')
  const ePadded = String(episode).padStart(2, '0')
  return `S${sPadded}E${ePadded} ${name}`
}

export { episodeName }
