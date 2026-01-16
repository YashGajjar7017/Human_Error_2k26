import { useState, useEffect, useRef } from 'react'
import '../styles/SharedComponents.css'

export default function VoiceCommands({ isOpen, onClose, onNavigate }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [lastResult, setLastResult] = useState(null)
  const recognitionRef = useRef(null)

  const commands = [
    { phrase: 'go to dashboard', action: () => navigateTo('/dashboard'), description: 'Go to Dashboard' },
    { phrase: 'go to compiler', action: () => navigateTo('/compiler'), description: 'Open Code Compiler' },
    { phrase: 'go to achievements', action: () => navigateTo('/achievements'), description: 'View Achievements' },
    { phrase: 'go to classroom', action: () => navigateTo('/classroom'), description: 'Open Learning Classroom' },
    { phrase: 'go to analytics', action: () => navigateTo('/analytics'), description: 'View Analytics' },
    { phrase: 'go to snippets', action: () => navigateTo('/snippets'), description: 'Open Code Snippets' },
    { phrase: 'go to leaderboard', action: () => navigateTo('/leaderboard'), description: 'View Leaderboard' },
    { phrase: 'go to collaboration', action: () => navigateTo('/collaboration'), description: 'Open Collaboration' },
    { phrase: 'go to settings', action: () => navigateTo('/settings'), description: 'Open Settings' },
    { phrase: 'go to profile', action: () => navigateTo('/profile'), description: 'View Profile' },
    { phrase: 'go to notifications', action: () => navigateTo('/notifications'), description: 'View Notifications' },
    { phrase: 'go to admin', action: () => navigateTo('/admin'), description: 'Open Admin Panel' },
    { phrase: 'open help', action: () => navigateTo('/help'), description: 'Open Help' },
    { phrase: 'close', action: () => { onClose(); setLastResult(null); }, description: 'Close Voice Panel' },
  ]

  const navigateTo = (path) => {
    if (onNavigate) {
      onNavigate(path)
    }
    setLastResult({ type: 'success', message: `Navigating to ${path}...` })
    setTimeout(() => { onClose() }, 1000)
  }

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setTranscript('')
      }

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex
        const result = event.results[current]
        const text = result[0].transcript
        setTranscript(text)

        if (result.isFinal) {
          processCommand(text)
        }
      }

      recognitionRef.current.onerror = (event) => {
        setIsListening(false)
        if (event.error === 'not-allowed') {
          setLastResult({ type: 'error', message: 'Microphone access denied' })
        }
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onNavigate])

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Error starting recognition:', error)
      }
    } else {
      setLastResult({ type: 'error', message: 'Voice recognition not supported' })
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const processCommand = (text) => {
    const normalizedText = text.toLowerCase().trim()
    setCommandHistory(prev => [{ text, timestamp: new Date() }, ...prev.slice(0, 4)])

    const matchedCommand = commands.find(cmd => 
      normalizedText.includes(cmd.phrase.toLowerCase())
    )

    if (matchedCommand) {
      setLastResult({ type: 'processing', message: `Executing: ${matchedCommand.description}...` })
      setTimeout(() => { matchedCommand.action() }, 500)
    } else {
      setLastResult({ type: 'warning', message: `Command not recognized: "${text}"` })
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="voice-overlay" onClick={onClose} />
      <div className="voice-panel">
        <button className="voice-close" onClick={onClose}>×</button>
        
        <div className="voice-icon" style={{ 
          animation: isListening ? 'voice-pulse 1.5s infinite' : 'none',
          background: isListening ? 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          {isListening ? '🎤' : '🎙️'}
        </div>

        <h3>{isListening ? 'Listening...' : 'Voice Commands'}</h3>
        <p>{isListening ? 'Say a command...' : 'Click microphone to start'}</p>

        <div className="voice-transcript">
          {transcript || (isListening ? 'Listening...' : 'Tap microphone to speak')}
        </div>

        {lastResult && (
          <div className={`voice-result ${lastResult.type}`}>
            {lastResult.message}
          </div>
        )}

        <div className="voice-commands">
          {commands.slice(0, 6).map((cmd, i) => (
            <button key={i} className="voice-command-hint" onClick={() => processCommand(cmd.phrase)}>
              "{cmd.phrase}"
            </button>
          ))}
        </div>

        <div className="voice-actions">
          {!isListening ? (
            <button className="voice-start-btn" onClick={startListening}>🎤 Start Listening</button>
          ) : (
            <button className="voice-stop-btn" onClick={stopListening}>⏹️ Stop</button>
          )}
        </div>
      </div>
    </>
  )
}

