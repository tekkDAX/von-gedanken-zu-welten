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
  const [quickUrl, setQuickUrl] = useState<string>('')
  const [quickPdf, setQuickPdf] = useState<string>('')

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

  const runQuickUrl = async () => {
    if (!quickUrl) return setError('Bitte URL angeben')
    setLoading(true); setError(''); setOutput('')
    try {
      const res = await runCommand('extraction', 'extract_url', { url: quickUrl })
      setOutput(typeof res === 'string' ? res : JSON.stringify(res, null, 2))
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally { setLoading(false) }
  }

  const runQuickPdf = async () => {
    if (!quickPdf) return setError('Bitte eine PDF-Datei auswählen oder hochladen')
    // Backend erwartet Pfad relativ Projekt: data/uploads/<name>
    const path = `data/uploads/${quickPdf}`
    setLoading(true); setError(''); setOutput('')
    try {
      const res = await runCommand('extraction', 'extract_pdf', { path })
      setOutput(typeof res === 'string' ? res : JSON.stringify(res, null, 2))
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally { setLoading(false) }
  }

  return (
    <div className="font-sans p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Werkstatt Web</h1>
      {/* Quickstart Section for non-technical users */}
      <section className="mb-6 grid gap-3 p-3 border border-gray-300 rounded bg-white">
        <h2 className="text-lg font-semibold">Schnellstart</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="grid gap-2">
            <label className="text-sm">URL extrahieren</label>
            <div className="flex gap-2">
              <input
                className="border rounded px-2 py-1 flex-1"
                type="url"
                placeholder="https://example.com/artikel"
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
                onClick={runQuickUrl}
                disabled={loading}
              >Extrahieren</button>
            </div>
            <p className="text-xs text-gray-600">Verwendet Plugin <code>extraction.extract_url</code></p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm">PDF extrahieren</label>
            <div className="flex items-center gap-2">
              <select
                className="border rounded px-2 py-1 flex-1"
                value={quickPdf}
                onChange={(e) => setQuickPdf(e.target.value)}
              >
                <option value="">Datei auswählen…</option>
                {files.map(f => (
                  <option key={f.name} value={f.name}>{f.name}</option>
                ))}
              </select>
              <button
                className="bg-blue-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
                onClick={runQuickPdf}
                disabled={loading}
              >Extrahieren</button>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="border rounded px-2 py-1"
                type="file" accept="application/pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    const res = await uploadFile(file)
                    setFiles(prev => [{ name: res.filename, url: res.url }, ...prev])
                    setQuickPdf(res.filename)
                  } catch (err: any) {
                    setError(err?.message ?? String(err))
                  } finally {
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
            <p className="text-xs text-gray-600">Verwendet Plugin <code>extraction.extract_pdf</code> (Pfad: data/uploads/&lt;Datei&gt;)</p>
          </div>
        </div>
      </section>
      <section className="flex gap-3">
        <div className="min-w-[260px]">
          <h2 className="text-xl font-semibold mb-2">Plugins</h2>
          <ul className="list-none p-0 m-0">
            {plugins.map(pl => (
              <li key={pl.name}>
                <button
                  disabled={!pl.enabled}
                  onClick={() => { setSelected(pl.name); setSelectedCmd(''); setArgs({}); setOutput(''); setError(''); }}
                  className={`${selected === pl.name ? 'bg-blue-50' : 'bg-gray-100'} w-full text-left px-3 py-2 mb-1.5 rounded border border-gray-300`}
                >
                  <div className="font-semibold">{pl.name} {pl.version ? `v${pl.version}` : ''}</div>
                  <div className="text-xs opacity-80">{pl.description}</div>
                  {!pl.enabled && <div className="text-red-700 text-xs">deaktiviert</div>}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Command</h2>
          {currentPlugin ? (
            <>
              <div className="mb-2">
                <select
                  className="border rounded px-2 py-1"
                  value={selectedCmd}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedCmd(e.target.value); setArgs({}); setOutput(''); setError(''); }}
                >
                  {currentPlugin.commands.map((c: CommandDesc) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              {currentCommand && (
                <div className="grid gap-2">
                  <div className="text-sm opacity-80">{currentCommand.description}</div>
                  {currentCommand.params.map((p: CommandParam) => (
                    <label key={p.name} className="grid gap-1">
                      <span>{p.name}{p.required ? ' *' : ''}</span>
                      <input
                        type="text"
                        className="border rounded px-2 py-1"
                        placeholder={p.description}
                        value={args[p.name] ?? (p.default ?? '')}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArgs((prev: Record<string, any>) => ({ ...prev, [p.name]: e.target.value }))}
                      />
                    </label>
                  ))}
                  <div>
                    <button
                      className="bg-blue-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
                      onClick={handleRun}
                      disabled={loading}
                    >
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
        <section className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Output</h2>
          {error && <pre className="text-red-800 bg-red-100 p-2.5 rounded whitespace-pre-wrap">{error}</pre>}
          {output && <pre className="bg-black text-green-400 p-2.5 rounded whitespace-pre-wrap">{output}</pre>}
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Files</h2>
        <div className="flex items-center gap-2">
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
        <ul className="mt-3">
          {files.map((f: { name: string; url: string }) => (
            <li key={f.name}>
              <a
                className="text-blue-700 underline"
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
          {files.length === 0 && <li className="opacity-70">Noch keine Dateien hochgeladen.</li>}
        </ul>
      </section>
    </div>
  )
}
