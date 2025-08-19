/*
 Legacy Frontend Sample (archived from datenfragmente/1.txt)
 Purpose: Keep the early prototype code for reference after cleanup.
 Note: The production UI now lives in web/src/routes/App.tsx (React + Vite + TS + Tailwind).
*/

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [file, setFile] = useState(null);
  const [plugins, setPlugins] = useState([]);
  const [selectedPlugin, setSelectedPlugin] = useState('');
  const [command, setCommand] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [commands, setCommands] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/plugins')
      .then(response => {
        setPlugins(response.data);
        // Fetch commands for selected plugin
        if (response.data.length > 0) {
          axios.get(`http://localhost:8000/plugins/${response.data[0].name}/commands`)
            .then(cmdResp => setCommands(cmdResp.data))
            .catch(err => setError('Failed to load commands'));
        }
      })
      .catch(err => setError('Failed to load plugins'));
  }, []);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      await axios.post('http://localhost:8000/files/upload', formData);
      setResult('File uploaded!');
    } catch (err) {
      setError(`Upload failed: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const handleExecute = async () => {
    if (!file || !selectedPlugin || !command) {
      setError('Select file, plugin, and command');
      return;
    }
    try {
      const response = await axios.post(`http://localhost:8000/run/${selectedPlugin}/${command}`, {
        path: `data/uploads/${file.name}`,
        kind: 'text', // Adjustable via UI later
        options: '{}'
      });
      setResult(JSON.stringify(response.data, null, 2));
      setError(null);
    } catch (err) {
      setError(`Execution failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const prepareForKDP = async () => {
    if (!result) {
      setError('Run extraction first');
      return;
    }
    try {
      const kdpData = await axios.post('http://localhost:8000/run/kdpformat/extract', {
        data: JSON.parse(result)
      });
      setResult(JSON.stringify(kdpData.data, null, 2));
      setError('KDP-ready!');
    } catch (err) {
      setError(`KDP prep failed: ${err.message}`);
    }
  };

  const generateBusinessForm = async () => {
    try {
      const formData = await axios.post('http://localhost:8000/run/businessform/generate');
      setResult(JSON.stringify(formData.data, null, 2));
      setError(null);
    } catch (err) {
      setError(`Form generation failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Content Extraction Tool (Legacy Prototype)</h1>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Upload File</label>
          <input type="file" className="mt-1 block w-full p-2 border rounded" onChange={handleFileUpload} />
        </div>

        {/* Plugin Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Select Plugin</label>
          <select className="mt-1 block w-full p-2 border rounded" value={selectedPlugin} onChange={(e) => {
            setSelectedPlugin(e.target.value);
            axios.get(`http://localhost:8000/plugins/${e.target.value}/commands`)
              .then(cmdResp => setCommands(cmdResp.data))
              .catch(err => setError('Failed to load commands'));
          }}>
            <option value="">Choose a plugin</option>
            {plugins.map(plugin => <option key={plugin.name} value={plugin.name}>{plugin.description}</option>)}
          </select>
        </div>

        {/* Command Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Select Command</label>
          <select className="mt-1 block w-full p-2 border rounded" value={command} onChange={(e) => setCommand(e.target.value)}>
            <option value="">Choose a command</option>
            {commands.map(cmd => <option key={cmd.name} value={cmd.name}>{cmd.description}</option>)}
          </select>
        </div>

        {/* Execute Button */}
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2" onClick={handleExecute}>
          Run Extraction
        </button>

        {/* KDP Prep Button */}
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2" onClick={prepareForKDP}>
          Prepare for KDP
        </button>

        {/* Business Form Button */}
        <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600" onClick={generateBusinessForm}>
          Generate Business Form
        </button>

        {/* Result/Error */}
        {result && <div className="mt-4 p-4 bg-green-100 rounded"><h2 className="text-lg font-semibold">Result</h2><pre className="text-sm">{result}</pre></div>}
        {error && <div className="mt-4 p-4 bg-red-100 rounded"><h2 className="text-lg font-semibold">Error</h2><p>{error}</p></div>}
      </div>
    </div>
  );
};

export default App;
