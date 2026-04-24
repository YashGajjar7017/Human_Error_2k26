import React, {useState, useEffect} from 'react'
import CodeEditor from '../components/CodeEditor'
import OutputConsole from '../components/OutputConsole'
import FileExplorer from '../components/FileExplorer'
import LoadingAnimation from '../components/LoadingAnimation'
import DragDropZone from '../components/DragDropZone'
import ThemeSelector from '../components/ThemeSelector'
import DebugConsole from '../components/DebugConsole'

export default function Compiler(){
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState('')
  const [logs, setLogs] = useState([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [recentFiles, setRecentFiles] = useState([])
  const [currentTheme, setCurrentTheme] = useState('light')
  const [updateAvailable, setUpdateAvailable] = useState(false)

  function addLog(line){ setLogs(prev => [...prev, line]) }

  // Simulate progress updates every 3 seconds
  useEffect(() => {
    if (!running) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        const increment = Math.random() * 20 + 5
        return Math.min(prev + increment, 90)
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [running])

  // Check for updates on mount
  useEffect(() => {
    checkForUpdates()
  }, [])

  async function checkForUpdates() {
    try {
      const resp = await (await import('../api')).apiFetch('/api/filemanager/check-update', {
        method: 'GET'
      })
      const data = await resp.json()
      if (data.success && data.updateAvailable) {
        setUpdateAvailable(true)
        addLog(`🔔 Update available: ${data.latestVersion}`)
      }
    } catch (err) {
      console.log('Update check failed:', err)
    }
  }

  function handleFileSelect(file) {
    setSelectedFile(file)
    setCode(file.content)
    
    // Add to recent files
    setRecentFiles(prev => {
      const filtered = prev.filter(f => f.name !== file.name)
      return [{ name: file.name, path: file.path }, ...filtered].slice(0, 5)
    })

    // Detect language from file extension
    const ext = file.name.split('.').pop().toLowerCase()
    const languageMap = {
      'js': 'javascript',
      'py': 'python',
      'c': 'c',
      'cpp': 'cpp',
      'cc': 'cpp',
      'cxx': 'cpp',
      'java': 'java',
      'ts': 'javascript'
    }
    if (languageMap[ext]) setLanguage(languageMap[ext])
    
    addLog(`📂 Loaded file: ${file.name}`)
  }

  async function saveFile() {
    if (!selectedFile) {
      addLog('⚠️ No file selected to save')
      return
    }

    try {
      setRunning(true)
      addLog('💾 Saving file...')
      
      const resp = await (await import('../api')).apiFetch('/api/filemanager/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filepath: selectedFile.path,
          content: code
        })
      })
      
      const data = await resp.json()
      if (data.success) {
        addLog('✅ File saved successfully')
        selectedFile.lastSaved = new Date().toLocaleTimeString()
      } else {
        addLog('❌ Save failed: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      addLog('💥 Save error: ' + err.message)
    } finally {
      setRunning(false)
    }
  }

  async function runCode(){
    setRunning(true)
    setProgress(5)
    setLogs([])
    addLog('🚀 Starting compilation...')
    addLog('📤 Sending code to server...')
    
    try{
      await new Promise(r => setTimeout(r, 1000))
      setProgress(20)

      const resp = await (await import('../api')).apiFetch('/api/compiler/compile-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: code, language })
      })
      
      setProgress(70)
      const j = await resp.json()
      setProgress(85)
      
      if (!j.success){ 
        addLog('❌ Error: ' + (j.error || JSON.stringify(j))) 
      }
      else {
        setProgress(95)
        addLog('✅ Compilation finished')
        const result = j.result || {}
        if (result.stdout) addLog('📋 Output:\n' + result.stdout)
        if (result.stderr) addLog('⚠️ Errors:\n' + result.stderr)
        if (result.output) addLog('🔢 Result:\n' + JSON.stringify(result.output))
      }
    }catch(err){ 
      addLog('💥 Exception: ' + err.message) 
    }
    finally{ 
      setProgress(100)
      setRunning(false)
      setTimeout(() => setProgress(0), 500)
    }
  }

  return (
    <div style={{...styles.page, backgroundColor: isDarkTheme ? '#0d0d0d' : '#f5f5f5'}}>
      <LoadingAnimation isLoading={running} progress={progress} />
      
      {/* Top Navigation Bar */}
      <div style={{...styles.navbar, backgroundColor: isDarkTheme ? '#1e1e1e' : '#fff', borderBottom: isDarkTheme ? '1px solid #333' : '1px solid #ddd'}}>
        <div style={styles.navLeft}>
          <h1 style={{margin: 0, fontSize: 18, color: isDarkTheme ? '#fff' : '#333'}}>⚙️ Advanced Compiler</h1>
          {updateAvailable && <span style={{...styles.badge}}>🔔 Update</span>}
        </div>
        <div style={styles.navRight}>
          <a href="/classroom" style={styles.navLink}>🎓 Classroom</a>
          <a href="/gamification" style={styles.navLink}>🎮 Games</a>
          <a href="/collaboration" style={styles.navLink}>👥 Collab</a>
          <a href="/dashboard" style={styles.navLink}>📊 Dashboard</a>
        </div>
      </div>

      <div style={styles.container}>
        {/* Sidebar - File Explorer & Theme */}
        <div style={{...styles.sidebar, backgroundColor: isDarkTheme ? '#1e1e1e' : '#f9f9f9'}}>
          <ThemeSelector 
            onThemeChange={(theme) => {
              setCurrentTheme(theme.name)
              setIsDarkTheme(theme.name === 'dark' || theme.name === 'dracula')
            }}
            currentTheme={currentTheme}
          />
          
          <FileExplorer 
            onFileSelect={handleFileSelect} 
            selectedFile={selectedFile}
            isDarkTheme={isDarkTheme}
          />
        </div>

        {/* Middle - Code Editor or Drag & Drop */}
        <div style={styles.middle}>
          {code && selectedFile ? (
            <div style={{...styles.editorContainer, backgroundColor: isDarkTheme ? '#1e1e1e' : '#fff'}}>
              <div style={{...styles.editorHeader, borderBottom: isDarkTheme ? '1px solid #333' : '1px solid #ddd', color: isDarkTheme ? '#aaa' : '#666'}}>
                <div>📝 {selectedFile.name}</div>
                <div style={{fontSize: 10}}>
                  {selectedFile.lastSaved && `Last saved: ${selectedFile.lastSaved}`}
                </div>
              </div>

              <div style={styles.languageSelector}>
                <label style={{color: isDarkTheme ? '#aaa' : '#666'}}>Language:</label>
                <select 
                  value={language} 
                  onChange={e=>setLanguage(e.target.value)} 
                  style={{...styles.select, backgroundColor: isDarkTheme ? '#252525' : '#f0f0f0', color: isDarkTheme ? '#fff' : '#333'}}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </div>

              <CodeEditor value={code} onChange={setCode} language={language} />

              <div style={styles.editorActions}>
                <button onClick={runCode} disabled={running} style={{...styles.btn, ...styles.btnPrimary}}>
                  {running ? '⏳ Running...' : '▶️ Run Code'}
                </button>
                <button onClick={saveFile} disabled={running} style={{...styles.btn, ...styles.btnSuccess}}>
                  💾 Save
                </button>
                <button onClick={()=>{ setCode('') }} style={{...styles.btn, ...styles.btnSecondary}}>
                  🗑️ Clear
                </button>
              </div>
            </div>
          ) : (
            <DragDropZone 
              onFileDrop={handleFileSelect}
              recentFiles={recentFiles}
              isDarkTheme={isDarkTheme}
            />
          )}
        </div>

        {/* Right - Output Console */}
        <div style={{...styles.rightPanel, backgroundColor: isDarkTheme ? '#1e1e1e' : '#f9f9f9'}}>
          <h3 style={{margin: '0 0 12px 0', color: isDarkTheme ? '#fff' : '#333'}}>📊 Output</h3>
          <OutputConsole lines={logs} />
        </div>
      </div>

      {/* Debug Console - Bottom */}
      <div style={styles.debugContainer}>
        <DebugConsole isDarkTheme={isDarkTheme} />
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  navRight: {
    display: 'flex',
    gap: 16
  },
  navLink: {
    textDecoration: 'none',
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
    padding: '6px 12px',
    borderRadius: 4,
    transition: 'all 0.2s'
  },
  badge: {
    background: '#ff9800',
    color: 'white',
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 'bold'
  },
  container: {
    display: 'flex',
    gap: 12,
    padding: 12,
    flex: 1,
    overflow: 'hidden'
  },
  sidebar: {
    flex: 0,
    width: 240,
    overflowY: 'auto',
    borderRadius: 6,
    border: '1px solid #ddd'
  },
  middle: {
    flex: 1,
    minWidth: 300,
    overflow: 'auto'
  },
  rightPanel: {
    flex: 0,
    width: 300,
    borderRadius: 6,
    border: '1px solid #ddd',
    padding: 12,
    overflowY: 'auto'
  },
  editorContainer: {
    borderRadius: 6,
    border: '1px solid #ddd',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  editorHeader: {
    padding: 12,
    fontWeight: 'bold',
    fontSize: 12
  },
  languageSelector: {
    padding: '8px 12px',
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    fontSize: 12
  },
  select: {
    padding: '4px 8px',
    borderRadius: 4,
    border: '1px solid #ddd',
    fontSize: 11,
    flex: 1
  },
  editorActions: {
    display: 'flex',
    gap: 8,
    padding: 12,
    borderTop: '1px solid #ddd'
  },
  btn: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 'bold',
    transition: 'all 0.2s'
  },
  btnPrimary: {
    background: '#4CAF50',
    color: 'white'
  },
  btnSuccess: {
    background: '#2196F3',
    color: 'white'
  },
  btnSecondary: {
    background: '#f44336',
    color: 'white'
  },
  debugContainer: {
    padding: 12,
    borderTop: '1px solid #ddd'
  }
}
