import React, { useState, useEffect } from 'react'

const FILE_ICONS = {
  '.js': '📜', '.jsx': '📜', '.ts': '📜', '.tsx': '📜',
  '.py': '🐍', '.java': '☕', '.c': '©️', '.cpp': '⚙️',
  '.html': '🌐', '.css': '🎨', '.json': '📋', '.xml': '📝',
  '.md': '📖', '.txt': '📄', '.pdf': '📕', '.yml': '⚙️',
  '.yaml': '⚙️', '.sh': '🔧', '.sql': '📊', '.zip': '📦',
  '.png': '🖼️', '.jpg': '🖼️', '.gif': '🖼️', '.svg': '🎭'
}

export default function FileExplorer({ onFileSelect, selectedFile, isDarkTheme }){
  const [files, setFiles] = useState([])
  const [directories, setDirectories] = useState([])
  const [currentPath, setCurrentPath] = useState('/')
  const [expanded, setExpanded] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scrollTop, setScrollTop] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [pathHistory, setPathHistory] = useState(['/'])

  const commonDirs = [
    { name: 'Backend', path: '/Backend', icon: '⚙️' },
    { name: 'Frontend', path: '/Frontend', icon: '🌐' },
    { name: 'React-Complier', path: '/React-Complier-Frontend', icon: '⚛️' },
    { name: 'CodePredictor', path: '/CodePredictor', icon: '🤖' },
    { name: 'Docs', path: '/Docs', icon: '📚' },
  ]

  useEffect(() => {
    loadDirectory('/')
  }, [])

  async function loadDirectory(path) {
    setLoading(true)
    setError('')
    try {
      const resp = await (await import('../api')).apiFetch('/api/filemanager/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: path || '/' })
      })
      const data = await resp.json()
      if (data.success) {
        setFiles(data.files || [])
        setDirectories(data.directories || [])
        setCurrentPath(path || '/')
        setPathHistory(prev => [...prev, path || '/'])
      } else {
        setError(data.error || 'Failed to load directory')
      }
    } catch (err) {
      setError('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleFileClick(filename) {
    setLoading(true)
    try {
      const filepath = currentPath === '/' ? `/${filename}` : `${currentPath}/${filename}`
      const resp = await (await import('../api')).apiFetch('/api/filemanager/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filepath })
      })
      const data = await resp.json()
      if (data.success) {
        onFileSelect({
          name: filename,
          path: filepath,
          content: data.content || ''
        })
      } else {
        setError('Failed to load file: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      setError('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  function navigateUp() {
    if (pathHistory.length > 1) {
      const newHistory = pathHistory.slice(0, -1)
      setPathHistory(newHistory)
      loadDirectory(newHistory[newHistory.length - 1])
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFileSelect({
        name: files[0].name,
        path: currentPath + '/' + files[0].name,
        content: 'file_dragged',
        isDropped: true,
        file: files[0]
      })
    }
  }

  function getFileIcon(filename) {
    const ext = '.' + filename.split('.').pop().toLowerCase()
    return FILE_ICONS[ext] || '📄'
  }

  return (
    <div 
      style={{...styles.container, backgroundColor: isDarkTheme ? '#1e1e1e' : '#f9f9f9'}}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
    >
      <div style={{...styles.header, borderBottom: isDarkTheme ? '1px solid #333' : '2px solid #ddd'}}>
        <h3 style={{color: isDarkTheme ? '#fff' : '#333', margin: 0}}>📁 Explorer</h3>
        <div style={{display: 'flex', gap: 4}}>
          <button onClick={navigateUp} disabled={pathHistory.length <= 1} title="Up" style={styles.iconBtn}>⬆️</button>
          <button onClick={() => loadDirectory(currentPath)} disabled={loading} title="Refresh" style={styles.iconBtn}>
            {loading ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {error && <div style={{...styles.error, backgroundColor: isDarkTheme ? '#3e2e2e' : '#ffebee'}}>{error}</div>}

      {dragOver && (
        <div style={styles.dragOver}>
          <div style={{fontSize: 24}}>📤 Drop files here</div>
        </div>
      )}

      <div style={{...styles.pathBar, backgroundColor: isDarkTheme ? '#252525' : '#f0f0f0', color: isDarkTheme ? '#aaa' : '#666'}}>
        <span style={{fontSize: 11}}>{currentPath}</span>
      </div>

      <div style={{...styles.directoryList, maxHeight: 300, overflowY: 'auto'}}>
        {/* Quick Access */}
        <div style={styles.section}>
          <h4 style={{...styles.sectionTitle, color: isDarkTheme ? '#aaa' : '#555'}}>Quick Access</h4>
          {commonDirs.map(dir => (
            <button
              key={dir.path}
              onClick={() => loadDirectory(dir.path)}
              style={{...styles.quickAccessBtn, 
                backgroundColor: currentPath === dir.path ? (isDarkTheme ? '#333' : '#e3f2fd') : 'transparent',
                color: isDarkTheme ? '#fff' : '#333'}}
            >
              {dir.icon} {dir.name}
            </button>
          ))}
        </div>

        {/* Current Directory Contents */}
        {files.length > 0 || directories.length > 0 ? (
          <div style={styles.section}>
            <h4 style={{...styles.sectionTitle, color: isDarkTheme ? '#aaa' : '#555'}}>📂 Contents</h4>
            
            {/* Directories */}
            {directories.map(dir => (
              <button
                key={dir}
                onClick={() => loadDirectory(currentPath === '/' ? `/${dir}` : `${currentPath}/${dir}`)}
                style={{...styles.itemButton, 
                  color: isDarkTheme ? '#fff' : '#333',
                  backgroundColor: isDarkTheme ? '#252525' : 'transparent',
                  borderColor: isDarkTheme ? '#333' : '#ddd'}}
              >
                📂 {dir}
              </button>
            ))}

            {/* Files */}
            {files.map(file => (
              <button
                key={file}
                onClick={() => handleFileClick(file)}
                style={{...styles.itemButton,
                  backgroundColor: selectedFile?.name === file ? (isDarkTheme ? '#333' : '#e3f2fd') : (isDarkTheme ? '#1e1e1e' : 'transparent'),
                  color: isDarkTheme ? '#fff' : '#333',
                  borderColor: isDarkTheme ? '#333' : '#ddd'}}
              >
                {getFileIcon(file)} {file}
              </button>
            ))}
          </div>
        ) : (
          <div style={{...styles.emptyState, color: isDarkTheme ? '#666' : '#999'}}>
            No files in this directory
          </div>
        )}
      </div>

      {selectedFile && (
        <div style={{...styles.selectedInfo, backgroundColor: isDarkTheme ? '#1e3a1f' : '#e8f5e9', color: isDarkTheme ? '#aed581' : '#2e7d32'}}>
          <strong>✓ Selected:</strong> {selectedFile.name}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    background: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: 6,
    padding: 12,
    maxHeight: '500px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: 12,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: '2px solid #ddd'
  },
  iconBtn: {
    padding: '4px 8px',
    background: 'transparent',
    border: '1px solid #ddd',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
    marginLeft: 4
  },
  pathBar: {
    padding: '6px 8px',
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    fontSize: 10,
    marginBottom: 8,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    fontSize: 11
  },
  dragOver: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(76, 175, 80, 0.2)',
    border: '2px dashed #4CAF50',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  directoryList: {
    marginBottom: 12,
    flex: 1,
    overflowY: 'auto'
  },
  section: {
    marginBottom: 12
  },
  sectionTitle: {
    margin: '8px 0 4px 0',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    opacity: 0.7
  },
  quickAccessBtn: {
    width: '100%',
    padding: '6px 8px',
    textAlign: 'left',
    background: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 11,
    marginBottom: 4,
    transition: 'all 0.2s'
  },
  itemButton: {
    width: '100%',
    padding: '4px 8px',
    textAlign: 'left',
    border: '1px solid #e0e0e0',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 11,
    marginBottom: 2,
    transition: 'all 0.2s'
  },
  emptyState: {
    padding: '20px 8px',
    textAlign: 'center',
    fontSize: 11,
    opacity: 0.6
  },
  selectedInfo: {
    padding: 8,
    borderRadius: 4,
    fontSize: 11,
    marginTop: 8,
    borderTop: '1px solid #ddd'
  }
}

