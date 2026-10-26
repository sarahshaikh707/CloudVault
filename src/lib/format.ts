export function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

export function fileGlyph(type: string) {
  if (type.startsWith('image/')) return 'Image'
  if (type.includes('pdf')) return 'PDF'
  if (type.includes('word') || type.includes('document')) return 'DOC'
  if (type.includes('zip')) return 'ZIP'
  if (type.startsWith('text/')) return 'TXT'
  return 'FILE'
}
