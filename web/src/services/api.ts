export type CommandParam = {
  name: string
  type?: string
  required?: boolean
  description?: string
  default?: any
}

export type CommandDesc = {
  name: string
  description?: string
  params: CommandParam[]
}

export type PluginDesc = {
  name: string
  version?: string
  description?: string
  enabled: boolean
  commands: CommandDesc[]
}

const ENV = (import.meta as any).env || {}
const API_BASE = ENV.VITE_API_BASE || 'http://localhost:8000'
const USE_MOCK = `${ENV.VITE_USE_MOCK || ''}`.toLowerCase() === '1' || `${ENV.VITE_USE_MOCK || ''}`.toLowerCase() === 'true'

// --- Mock Layer (frontend-only demo) ---
const mock = (() => {
  const files = new Map<string, Blob>()
  const plugins: PluginDesc[] = [
    {
      name: 'example',
      version: '0.1.0',
      description: 'Beispiel-Tool: Begrüßung und Echo (MOCK)',
      enabled: true,
      commands: [
        {
          name: 'greet',
          description: 'Gibt eine Begrüßung aus.',
          params: [
            { name: 'name', type: 'string', required: false, description: 'Name zum Grüßen', default: 'Welt' }
          ]
        },
        {
          name: 'echo',
          description: 'Gibt die Nachricht 1:1 zurück.',
          params: [
            { name: 'msg', type: 'string', required: true, description: 'Nachricht' }
          ]
        }
      ]
    }
  ]
  return {
    async getPlugins(): Promise<PluginDesc[]> { return structuredClone(plugins) },
    async runCommand(plugin: string, command: string, args: Record<string, any>) {
      if (plugin !== 'example') throw new Error('Plugin not found')
      if (command === 'greet') return `Hallo, ${args?.name ?? 'Welt'}!`
      if (command === 'echo') {
        if (!('msg' in (args || {}))) throw new Error("'msg' ist erforderlich")
        return String(args.msg)
      }
      throw new Error('Command not found')
    },
    async uploadFile(file: File): Promise<{ filename: string; url: string }> {
      const name = file.name
      const blob = new Blob([await file.arrayBuffer()], { type: file.type || 'application/octet-stream' })
      files.set(name, blob)
      const url = URL.createObjectURL(blob)
      return { filename: name, url }
    },
    async getDownloadUrl(name: string): Promise<string> {
      if (!files.has(name)) throw new Error('File not found')
      const blob = files.get(name)!
      return URL.createObjectURL(blob)
    }
  }
})()

export async function getPlugins(): Promise<PluginDesc[]> {
  if (USE_MOCK) return mock.getPlugins()
  const res = await fetch(`${API_BASE}/plugins`)
  if (!res.ok) throw new Error(`GET /plugins failed: ${res.status}`)
  return res.json()
}

export async function runCommand(plugin: string, command: string, args: Record<string, any>) {
  if (USE_MOCK) return mock.runCommand(plugin, command, args)
  const res = await fetch(`${API_BASE}/run/${encodeURIComponent(plugin)}/${encodeURIComponent(command)}` ,{
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ args })
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.detail || `POST /run failed: ${res.status}`)
  }
  const data = await res.json()
  return data.output
}

export async function uploadFile(file: File): Promise<{ filename: string; url: string }> {
  if (USE_MOCK) return mock.uploadFile(file)
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}/files/upload`, {
    method: 'POST',
    body: form
  })
  if (!res.ok) throw new Error(`POST /files/upload failed: ${res.status}`)
  const data = await res.json()
  const filename = data.filename || file.name
  const url = `${API_BASE}/files/download/${encodeURIComponent(filename)}`
  return { filename, url }
}

export async function getDownloadUrl(name: string): Promise<string> {
  if (USE_MOCK) return mock.getDownloadUrl(name)
  return `${API_BASE}/files/download/${encodeURIComponent(name)}`
}
