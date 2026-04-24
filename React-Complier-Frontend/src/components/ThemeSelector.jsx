import React, { useState, useEffect } from 'react'

const THEMES = {
  light: {
    name: 'Light Mode',
    icon: '☀️',
    colors: {
      bg: '#ffffff',
      fg: '#333333',
      primary: '#4CAF50',
      secondary: '#2196F3',
      danger: '#f44336'
    }
  },
  dark: {
    name: 'Dark Mode',
    icon: '🌙',
    colors: {
      bg: '#1e1e1e',
      fg: '#ffffff',
      primary: '#66BB6A',
      secondary: '#42A5F5',
      danger: '#EF5350'
    }
  },
  monokai: {
    name: 'Monokai',
    icon: '🎨',
    colors: {
      bg: '#272822',
      fg: '#F8F8F2',
      primary: '#A6E22E',
      secondary: '#66D9EF',
      danger: '#F92672'
    }
  },
  dracula: {
    name: 'Dracula',
    icon: '🧛',
    colors: {
      bg: '#282A36',
      fg: '#F8F8F2',
      primary: '#50FA7B',
      secondary: '#8BE9FD',
      danger: '#FF79C6'
    }
  },
  solarized: {
    name: 'Solarized',
    icon: '🌅',
    colors: {
      bg: '#FDF6E3',
      fg: '#657B83',
      primary: '#859900',
      secondary: '#268BD2',
      danger: '#DC322F'
    }
  }
}

export default function ThemeSelector({ onThemeChange, currentTheme }){
  const [showPicker, setShowPicker] = useState(false)
  const [customColor, setCustomColor] = useState('#4CAF50')

  const applyTheme = (themeName) => {
    const theme = THEMES[themeName]
    onThemeChange({
      name: themeName,
      ...theme
    })
    localStorage.setItem('appTheme', themeName)
    setShowPicker(false)
  }

  useEffect(() => {
    const saved = localStorage.getItem('appTheme')
    if (saved && THEMES[saved]) {
      applyTheme(saved)
    }
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span>🎨 Theme</span>
        <button 
          onClick={() => setShowPicker(!showPicker)}
          style={styles.toggleBtn}
        >
          {showPicker ? '✕' : '▼'}
        </button>
      </div>

      {showPicker && (
        <div style={styles.picker}>
          {/* Preset Themes */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Presets</h4>
            <div style={styles.themeGrid}>
              {Object.entries(THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => applyTheme(key)}
                  style={{
                    ...styles.themeButton,
                    backgroundColor: theme.colors.bg,
                    border: currentTheme === key ? '2px solid #4CAF50' : '2px solid #ddd',
                    color: theme.colors.fg
                  }}
                  title={theme.name}
                >
                  <div>{theme.icon}</div>
                  <div style={{fontSize: 10}}>{theme.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Customizer */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Custom Color</h4>
            <div style={styles.colorPickerRow}>
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                style={styles.colorInput}
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                style={styles.colorText}
              />
              <button
                onClick={() => {
                  onThemeChange({
                    name: 'custom',
                    colors: { primary: customColor }
                  })
                }}
                style={styles.applyBtn}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Export Theme */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Export</h4>
            <button
              onClick={() => {
                const themeData = JSON.stringify(THEMES, null, 2)
                const blob = new Blob([themeData], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'themes.json'
                a.click()
              }}
              style={styles.exportBtn}
            >
              📥 Download Themes
            </button>
          </div>
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
    marginBottom: 12
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: 12,
    cursor: 'pointer',
    paddingBottom: 8,
    borderBottom: '1px solid #ddd'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 12
  },
  picker: {
    marginTop: 12,
    maxHeight: 400,
    overflowY: 'auto'
  },
  section: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: '1px solid #eee'
  },
  sectionTitle: {
    margin: '0 0 8px 0',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase'
  },
  themeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 8
  },
  themeButton: {
    padding: 12,
    borderRadius: 4,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    transition: 'all 0.2s'
  },
  colorPickerRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center'
  },
  colorInput: {
    width: 50,
    height: 32,
    border: '1px solid #ddd',
    borderRadius: 4,
    cursor: 'pointer'
  },
  colorText: {
    flex: 1,
    padding: '4px 8px',
    fontSize: 11,
    border: '1px solid #ddd',
    borderRadius: 4,
    fontFamily: 'monospace'
  },
  applyBtn: {
    padding: '4px 12px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 'bold'
  },
  exportBtn: {
    width: '100%',
    padding: '8px',
    background: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 'bold'
  }
}
