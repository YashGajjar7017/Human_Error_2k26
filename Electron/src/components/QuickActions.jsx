import { useState, useEffect } from 'react'
import '../styles/SharedComponents.css'

export default function QuickActions({ onNavigate, onOpenSearch }) {
    const [isOpen, setIsOpen] = useState(false)

    const actions = [
        { icon: '💻', label: 'Compiler', path: '/compiler', color: '#667eea' },
        { icon: '🏆', label: 'Achievements', path: '/achievements', color: '#ffc107' },
        { icon: '🎯', label: 'Challenges', path: '/achievements', color: '#28a745' },
        { icon: '📝', label: 'Snippets', path: '/snippets', color: '#e83e8c' },
        { icon: '🔔', label: 'Notifications', path: '/notifications', color: '#fd7e14' },
        { icon: '🎮', label: 'Mini Games', path: '/achievements', color: '#6f42c1' },
        { icon: '🎤', label: 'Voice', action: 'voice', color: '#20c997' },
        { icon: '🔍', label: 'Search', action: 'search', color: '#17a2b8' },
    ]

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'q' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                // Don't trigger if user is typing in an input
                if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                    setIsOpen(prev => !prev)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleAction = (action) => {
        if (action.path) {
            if (onNavigate) onNavigate(action.path)
        } else if (action.action === 'voice') {
            // Emit custom event for voice commands
            window.dispatchEvent(new CustomEvent('openVoiceCommands'))
        } else if (action.action === 'search') {
            if (onOpenSearch) onOpenSearch()
            else window.dispatchEvent(new CustomEvent('openGlobalSearch'))
        }
        setIsOpen(false)
    }

    return (
        <div className="quick-actions-container">
            <div className={`quick-menu ${isOpen ? 'open' : ''}`}>
                {actions.map((action, index) => (
                    <div
                        key={index}
                        className="quick-menu-item"
                        onClick={() => handleAction(action)}
                        style={{ '--item-color': action.color }}
                    >
                        {action.icon}
                        <span className="quick-menu-tooltip">{action.label}</span>
                    </div>
                ))}
            </div>
            <button
                className={`quick-fab ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                +
            </button>
            <div className="keyboard-hint">Press Q</div>
        </div>
    )
}

