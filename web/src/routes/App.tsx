import React, { useEffect, useMemo, useState } from 'react'
import { getPlugins, runCommand, uploadFile, getDownloadUrl, type PluginDesc, type CommandDesc, type CommandParam } from '../services/api'

export const App: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginDesc[]>([])
  const [selected, setSelected] = useState<string>('')
  const [selectedCmd, setSelectedCmd] = useState<string>('')
  const [args, setArgs] = useState<Record<string, any>>({})
  const [output, setOutput] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [files, setFiles] = useState<{ name: string; url: string }[]>([])

  useEffect(() => {
    getPlugins().then(setPlugins).catch(e => setError(String(e)))
  }, [])

  const currentPlugin = useMemo(() => plugins.find((p: PluginDesc) => p.name === selected), [plugins, selected])
  const currentCommand = useMemo(() => currentPlugin?.commands.find((c: CommandDesc) => c.name === selectedCmd), [currentPlugin, selectedCmd])

  useEffect(() => {
    if (currentPlugin && currentPlugin.commands.length && !selectedCmd) {
      setSelectedCmd(currentPlugin.commands[0].name)
    }
  }, [currentPlugin])

  const handleRun = async () => {
    if (!currentPlugin || !currentCommand) return
    setLoading(true)
    setError('')
    setOutput('')
    try {
      const res = await runCommand(currentPlugin.name, currentCommand.name, args)
      setOutput(typeof res === 'string' ? res : JSON.stringify(res, null, 2))
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <h1>Werkstatt Web</h1>
      <section style={{ display: 'flex', gap: 12 }}>
        <div style={{ minWidth: 260 }}>
          <h2>Plugins</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {plugins.map(pl => (
              <li key={pl.name}>
                <button
                  disabled={!pl.enabled}
                  onClick={() => { setSelected(pl.name); setSelectedCmd(''); setArgs({}); setOutput(''); setError(''); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: 6,
                    background: selected === pl.name ? '#eef' : '#f7f7f7', borderRadius: 6, border: '1px solid #ddd'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{pl.name} {pl.version ? `v${pl.version}` : ''}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{pl.description}</div>
                  {!pl.enabled && <div style={{ color: '#a00', fontSize: 12 }}>deaktiviert</div>}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <h2>Command</h2>
          {currentPlugin ? (
            <>
              <div style={{ marginBottom: 8 }}>
                <select value={selectedCmd} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedCmd(e.target.value); setArgs({}); setOutput(''); setError(''); }}>
                  {currentPlugin.commands.map((c: CommandDesc) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              {currentCommand && (
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ fontSize: 14, opacity: 0.8 }}>{currentCommand.description}</div>
                  {currentCommand.params.map((p: CommandParam) => (
                    <label key={p.name} style={{ display: 'grid', gap: 4 }}>
                      <span>{p.name}{p.required ? ' *' : ''}</span>
                      <input
                        type="text"
                        placeholder={p.description}
                        value={args[p.name] ?? (p.default ?? '')}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArgs((prev: Record<string, any>) => ({ ...prev, [p.name]: e.target.value }))}
                      />
                    </label>
                  ))}
                  <div>
                    <button onClick={handleRun} disabled={loading}>
                      {loading ? 'Läuft…' : 'Ausführen'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>Bitte Plugin auswählen.</div>
          )}
        </div>
      </section>

      {(error || output) && (
        <section style={{ marginTop: 16 }}>
          <h2>Output</h2>
          {error && <pre style={{ color: '#b00', background: '#fee', padding: 10, borderRadius: 6 }}>{error}</pre>}
          {output && <pre style={{ background: '#111', color: '#0f0', padding: 10, borderRadius: 6, whiteSpace: 'pre-wrap' }}>{output}</pre>}
        </section>
      )}

      <section style={{ marginTop: 24 }}>
        <h2>Files</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="file"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              try {
                const res = await uploadFile(file)
                setFiles(prev => [{ name: res.filename, url: res.url }, ...prev])
              } catch (err: any) {
                setError(err?.message ?? String(err))
              } finally {
                e.currentTarget.value = ''
              }
            }}
          />
        </div>
        <ul style={{ marginTop: 12 }}>
          {files.map((f: { name: string; url: string }) => (
            <li key={f.name}>
              <a
                href={f.url}
                onClick={async (ev: React.MouseEvent<HTMLAnchorElement>) => {
                  // if url is mock blob it's fine; otherwise ensure we have fresh API URL
                  if (!f.url.startsWith('blob:')) {
                    ev.preventDefault()
                    const url = await getDownloadUrl(f.name)
                    window.open(url, '_blank')
                  }
                }}
              >{f.name}</a>
            </li>
          ))}
          {files.length === 0 && <li style={{ opacity: 0.7 }}>Noch keine Dateien hochgeladen.</li>}
        </ul>
      </section>
    </div>
  )
}
