import React, { useState } from 'react'

export default function DragDropZone({ onFileDrop, recentFiles, isDarkTheme }){
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        onFileDrop({
          name: file.name,
          content: event.target.result,
          path: '/' + file.name,
          isNew: true
        })
      }
      reader.readAsText(file)
    }
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      style={{
        ...styles.container,
        backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5',
        borderColor: dragActive ? '#4CAF50' : (isDarkTheme ? '#333' : '#ddd'),
        color: isDarkTheme ? '#ccc' : '#666'
      }}
    >
      {dragActive && (
        <div style={{...styles.dragOverlay, backgroundColor: isDarkTheme ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)'}}>
          <div style={{...styles.dragText, color: '#4CAF50'}}>
            <div style={{fontSize: 48}}>📤</div>
            <div>Drop your code files here</div>
          </div>
        </div>
      )}

      <div style={styles.content}>
        <h3 style={{marginTop: 0, color: isDarkTheme ? '#fff' : '#333'}}>📝 Drag & Drop Zone</h3>
        
        <div style={styles.instructions}>
          <p>Drag and drop code files here to open them</p>
          <p style={{fontSize: 11, opacity: 0.7}}>Supported: .js, .py, .c, .cpp, .java, .html, .css</p>
        </div>

        {recentFiles && recentFiles.length > 0 && (
          <div style={styles.recentSection}>
            <h4 style={{margin: '0 0 8px 0', fontSize: 12}}>📂 Recent Files</h4>
            <div style={styles.recentList}>
              {recentFiles.map((file, idx) => (
                <div key={idx} style={{...styles.recentItem, backgroundColor: isDarkTheme ? '#252525' : '#fff'}}>
                  <span>📄 {file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.features}>
          <div style={styles.feature}>
            <span style={{fontSize: 24}}>💾</span>
            <div style={{fontSize: 11}}>Save & Sync</div>
          </div>
          <div style={styles.feature}>
            <span style={{fontSize: 24}}>🔄</span>
            <div style={{fontSize: 11}}>Auto-Detect</div>
          </div>
          <div style={styles.feature}>
            <span style={{fontSize: 24}}>⚡</span>
            <div style={{fontSize: 11}}>Quick Run</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    border: '2px dashed #ddd',
    borderRadius: 8,
    padding: 20,
    minHeight: 400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    cursor: 'default',
    transition: 'all 0.3s ease'
  },
  dragOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  dragText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },
  content: {
    textAlign: 'center',
    width: '100%'
  },
  instructions: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 16
  },
  recentSection: {
    margin: '16px 0',
    padding: '12px',
    borderRadius: 6,
    background: 'rgba(100, 100, 100, 0.1)'
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  recentItem: {
    padding: '6px 8px',
    borderRadius: 4,
    fontSize: 11,
    border: '1px solid #ddd'
  },
  features: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: 16,
    gap: 12
  },
  feature: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6
  }
}
