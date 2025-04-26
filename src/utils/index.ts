import { createHash } from 'crypto'
export function generateFileId(path: string, name: string): string {
  const hash = createHash('md5')
  hash.update(`${path}${name}`)
  return hash.digest('hex')
}