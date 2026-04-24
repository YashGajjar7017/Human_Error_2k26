import React, { useEffect, useState } from 'react'

export default function LoadingAnimation({ isLoading, progress }){
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4)
    }, 600)

    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  const spinners = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  const currentSpinner = spinners[animationPhase % spinners.length]

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.spinner}>{currentSpinner}</div>
        
        <div style={styles.text}>
          <span style={styles.compiling}>Compiling</span>
          <span style={styles.dots}>{'.'.repeat((animationPhase % 3) + 1)}</span>
        </div>

        <div style={styles.progressContainer}>
          <div 
            style={{
              ...styles.progressBar,
              width: `${progress}%`,
              animation: progress > 0 && progress < 100 ? 'pulse 2s infinite' : 'none'
            }}
          >
            <span style={styles.progressText}>{progress}%</span>
          </div>
        </div>

        <div style={styles.stats}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Progress:</span>
            <span style={styles.statValue}>{progress}%</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Status:</span>
            <span style={styles.statValue}>Running</span>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(2px)'
  },
  container: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: 40,
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    minWidth: 300,
    maxWidth: 400
  },
  spinner: {
    fontSize: 48,
    marginBottom: 20,
    display: 'inline-block',
    animation: 'spin 1s linear infinite'
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    letterSpacing: 1
  },
  compiling: {
    display: 'inline-block'
  },
  dots: {
    display: 'inline-block',
    minWidth: 30,
    textAlign: 'left'
  },
  progressContainer: {
    width: '100%',
    height: 6,
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
    borderRadius: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'width 0.3s ease',
    minWidth: '2%',
    position: 'relative',
    boxShadow: '0 0 10px rgba(76, 175, 80, 0.5)'
  },
  progressText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: 20,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.8,
    marginBottom: 2
  },
  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4CAF50'
  }
}
