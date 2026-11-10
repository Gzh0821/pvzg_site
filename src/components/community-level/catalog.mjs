export const API_BASE = 'https://levels.pvzge.com/api/github-levels/'
export const validLevelPath = path => typeof path === 'string' && path.length <= 2048 && /\.json$/i.test(path)
  && !/[\\\x00-\x1f\x7f]/.test(path) && path.split('/').every(part => part && part !== '.' && part !== '..')

export function parseCatalog(value) {
  if (value?.version !== 1 || !/^[a-f0-9]{40}$/.test(value.tree || '') || !Array.isArray(value.levels) || value.levels.length > 4000) throw Error('catalog')
  const paths = new Set()
  for (const entry of value.levels) {
    if (!validLevelPath(entry.path) || !/^[a-f0-9]{40}$/.test(entry.sha || '') || paths.has(entry.path)
      || !Number.isSafeInteger(entry.size) || entry.size <= 0 || entry.size > 10_000_000) throw Error('catalog')
    paths.add(entry.path)
  }
  return value.levels
}

export function localizedText(value, language) {
  if (typeof value === 'string') return value
  return value?.[language] || value?.[({ zh: 'zh-CN', es: 'es-ES', ru: 'ru-RU' })[language]] || value?.en || value?.default || ''
}

export function githubLevelLink(entry) {
  if (!validLevelPath(entry.path) || !/^[a-f0-9]{40}$/.test(entry.sha)) return ''
  return `pvzge://github-level/open?${new URLSearchParams({ path: entry.path, sha: entry.sha })}`
}

export function rawLevelUrl(path) {
  if (!validLevelPath(path)) throw Error('path')
  return new URL(`raw/main/${path.split('/').map(encodeURIComponent).join('/')}`, API_BASE).href
}

export async function verifyLevelBytes(bytes, entry) {
  if (bytes.length !== entry.size) throw Error('changed')
  const prefix = new TextEncoder().encode(`blob ${bytes.length}\0`)
  const framed = new Uint8Array(prefix.length + bytes.length)
  framed.set(prefix); framed.set(bytes, prefix.length)
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-1', framed))
  if (Array.from(hash, x => x.toString(16).padStart(2, '0')).join('') !== entry.sha) throw Error('changed')
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
}

// These are references found in the document, not guaranteed spawn counts.
export function levelReferences(raw) {
  const plants = new Set(), zombies = new Set(), localTypes = new Map()
  const objects = Array.isArray(raw.objects) ? raw.objects : []
  for (const object of objects) {
    if (['PlantType', 'ZombieType'].includes(object?.objclass)) {
      for (const alias of object.aliases || []) localTypes.set(alias, object.objclass === 'PlantType' ? plants : zombies)
    }
  }
  const queue = [raw]
  for (let i = 0; i < queue.length && i < 200000; i++) {
    const value = queue[i]
    if (typeof value === 'string') {
      const match = /^RTID\((.+)@(PlantTypes|ZombieTypes|CurrentLevel|\.)\)$/.exec(value)
      if (match) {
        const target = match[2] === 'PlantTypes' ? plants : match[2] === 'ZombieTypes' ? zombies : localTypes.get(match[1])
        target?.add(match[1])
      }
    } else if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) {
        if (typeof child === 'string' && child && !child.startsWith('RTID(')) {
          if (['PlantType', 'PlantTypeName', 'ToolType'].includes(key)) plants.add(child)
          if (['ZombieType', 'ZombieTypeName'].includes(key)) zombies.add(child)
        }
        if (['PlantIncludeList', 'PlantExcludeList'].includes(key) && Array.isArray(child)) {
          for (const item of child) if (typeof item === 'string' && !item.startsWith('RTID(')) plants.add(item)
        }
        if (queue.length < 200000) queue.push(child)
      }
    }
  }
  for (const object of objects) {
    const placements = object?.objclass === 'InitialPlantProperties' ? [plants, object.objdata?.Plants]
      : object?.objclass === 'InitialZombieProperties' ? [zombies, object.objdata?.Zombies] : null
    if (placements && Array.isArray(placements[1])) {
      for (const item of placements[1]) if (typeof item.TypeName === 'string' && !item.TypeName.startsWith('RTID(')) placements[0].add(item.TypeName)
    }
  }
  return { plants: [...plants].sort(), zombies: [...zombies].sort() }
}
