import { useState, useEffect } from 'react'
import '../styles/SharedComponents.css'

// Coding Quiz Game Component
function CodingQuiz({ onComplete }) {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [score, setScore] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [selectedAnswer, setSelectedAnswer] = useState(null)

    const questions = [
        {
            question: 'What is the time complexity of binary search?',
            options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
            correct: 1,
            explanation: 'Binary search halves the search space each time, giving O(log n) complexity.'
        },
        {
            question: 'Which data structure uses LIFO order?',
            options: ['Queue', 'Array', 'Stack', 'Linked List'],
            correct: 2,
            explanation: 'Stack follows Last In First Out (LIFO) order.'
        },
        {
            question: 'What does CSS stand for?',
            options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
            correct: 1,
            explanation: 'CSS stands for Cascading Style Sheets.'
        },
        {
            question: 'Which method adds an element to the end of an array in JavaScript?',
            options: ['push()', 'pop()', 'shift()', 'unshift()'],
            correct: 0,
            explanation: 'push() adds elements to the end of an array.'
        },
        {
            question: 'What is the output of typeof null in JavaScript?',
            options: ['null', 'undefined', 'object', 'boolean'],
            correct: 2,
            explanation: 'Due to a historical bug, typeof null returns "object".'
        },
    ]

    const handleAnswer = (index) => {
        setSelectedAnswer(index)
        if (index === questions[currentQuestion].correct) {
            setScore(s => s + 1)
        }
        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(c => c + 1)
                setSelectedAnswer(null)
            } else {
                setShowResult(true)
            }
        }, 1500)
    }

    if (showResult) {
        return (
            <div className="game-result">
                <h3>🎯 Quiz Complete!</h3>
                <div className="score-display">
                    <span className="score">{score}</span>
                    <span className="total">/ {questions.length}</span>
                </div>
                <p>{score >= 4 ? '🌟 Excellent!' : score >= 2 ? '👍 Good job!' : '📚 Keep learning!'}</p>
                <button className="btn-primary" onClick={() => {
                    setCurrentQuestion(0)
                    setScore(0)
                    setShowResult(false)
                    setSelectedAnswer(null)
                }}>Play Again</button>
            </div>
        )
    }

    const q = questions[currentQuestion]

    return (
        <div className="coding-quiz">
            <div className="quiz-progress">
                Question {currentQuestion + 1} / {questions.length}
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
                </div>
            </div>

            <h3 className="quiz-question">{q.question}</h3>

            <div className="quiz-options">
                {q.options.map((option, index) => (
                    <button
                        key={index}
                        className={`quiz-option ${selectedAnswer === index ? (index === q.correct ? 'correct' : 'wrong') : ''}`}
                        onClick={() => handleAnswer(index)}
                        disabled={selectedAnswer !== null}
                    >
                        {option}
                        {selectedAnswer === index && index === q.correct && <span className="answer-mark">✓</span>}
                        {selectedAnswer === index && index !== q.correct && <span className="answer-mark">✗</span>}
                    </button>
                ))}
            </div>

            {selectedAnswer !== null && (
                <div className="explanation">
                    💡 {q.explanation}
                </div>
            )}
        </div>
    )
}

// Typing Speed Game
function TypingSpeedGame({ onComplete }) {
    const [text, setText] = useState('The quick brown fox jumps over the lazy dog.')
    const [input, setInput] = useState('')
    const [startTime, setStartTime] = useState(null)
    const [wpm, setWpm] = useState(0)
    const [accuracy, setAccuracy] = useState(100)
    const [isComplete, setIsComplete] = useState(false)

    const phrases = [
        'The quick brown fox jumps over the lazy dog.',
        'Coding is the art of telling a computer what to do.',
        'Debugging is twice as hard as writing the code.',
        'Programming is not about what you know, its about what you can figure out.',
        'First, solve the problem. Then, write the code.',
    ]

    useEffect(() => {
        if (input.length === 1 && !startTime) {
            setStartTime(Date.now())
        }
        if (input === text) {
            const timeTaken = (Date.now() - startTime) / 1000 / 60 // minutes
            const words = text.split(' ').length
            const calculatedWpm = Math.round(words / timeTaken)
            setWpm(calculatedWpm)

            let correct = 0
            for (let i = 0; i < text.length; i++) {
                if (input[i] === text[i]) correct++
            }
            setAccuracy(Math.round((correct / text.length) * 100))
            setIsComplete(true)
        }
    }, [input, text, startTime])

    const newGame = () => {
        setText(phrases[Math.floor(Math.random() * phrases.length)])
        setInput('')
        setStartTime(null)
        setWpm(0)
        setAccuracy(100)
        setIsComplete(false)
    }

    return (
        <div className="typing-game">
            <h3>⌨️ Typing Speed Test</h3>
            <p className="typing-text">{text}</p>
            <textarea
                className="typing-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Start typing..."
                disabled={isComplete}
            />
            {isComplete && (
                <div className="typing-results">
                    <div className="result-item">
                        <span className="result-value">{wpm}</span>
                        <span className="result-label">WPM</span>
                    </div>
                    <div className="result-item">
                        <span className="result-value">{accuracy}%</span>
                        <span className="result-label">Accuracy</span>
                    </div>
                    <button className="btn-primary" onClick={newGame}>New Phrase</button>
                </div>
            )}
        </div>
    )
}

// Memory Game (Pattern Sequence)
function MemoryGame({ onComplete }) {
    const [sequence, setSequence] = useState([])
    const [playerSequence, setPlayerSequence] = useState([])
    const [level, setLevel] = useState(1)
    const [isShowing, setIsShowing] = useState(false)
    const [gameOver, setGameOver] = useState(false)

    const colors = ['🔴', '🟢', '🔵', '🟡']

    const addToSequence = () => {
        const newSeq = [...sequence, colors[Math.floor(Math.random() * colors.length)]]
        setSequence(newSeq)
        setPlayerSequence([])
        setIsShowing(true)

        setTimeout(() => {
            setIsShowing(false)
        }, newSeq.length * 800)
    }

    const startGame = () => {
        setSequence([])
        setPlayerSequence([])
        setLevel(1)
        setGameOver(false)
        setTimeout(addToSequence, 1000)
    }

    const handleColorClick = (color) => {
        if (isShowing || gameOver) return

        const newPlayerSeq = [...playerSequence, color]
        setPlayerSequence(newPlayerSeq)

        const currentIndex = newPlayerSeq.length - 1
        if (newPlayerSeq[currentIndex] !== sequence[currentIndex]) {
            setGameOver(true)
            return
        }

        if (newPlayerSeq.length === sequence.length) {
            setTimeout(() => {
                setLevel(l => l + 1)
                setTimeout(addToSequence, 1000)
            }, 500)
        }
    }

    useEffect(() => {
        startGame()
    }, [])

    return (
        <div className="memory-game">
            <h3>🎮 Pattern Memory</h3>
            <p className="level-indicator">Level {level}</p>

            {gameOver && (
                <div className="game-over">
                    <p>Game Over!</p>
                    <p>You reached Level {level}</p>
                    <button className="btn-primary" onClick={startGame}>Play Again</button>
                </div>
            )}

            <div className="pattern-grid">
                {colors.map((color, index) => (
                    <button
                        key={index}
                        className={`pattern-btn ${isShowing && sequence[index] === color ? 'active' : ''} ${playerSequence[index] === color && !isShowing ? 'clicked' : ''}`}
                        onClick={() => handleColorClick(color)}
                        disabled={isShowing || gameOver}
                    >
                        {color}
                    </button>
                ))}
            </div>

            <p className="game-hint">
                {isShowing ? 'Watch the pattern...' : 'Repeat the pattern!'}
            </p>
        </div>
    )
}

export default function MiniGames({ isOpen, onClose }) {
    const [activeGame, setActiveGame] = useState('quiz')

    const games = [
        { id: 'quiz', name: '📝 Coding Quiz', icon: '📝' },
        { id: 'typing', name: '⌨️ Typing Speed', icon: '⌨️' },
        { id: 'memory', name: '🎮 Memory Game', icon: '🎮' },
    ]

    if (!isOpen) return null

    return (
        <>
            <div className="modal-overlay" onClick={onClose} />
            <div className="modal-content games-modal">
                <button className="close-btn" onClick={onClose}>✕</button>

                <h2>🎮 Mini Games</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>Take a break and exercise your coding skills!</p>

                <div className="games-tabs">
                    {games.map(game => (
                        <button
                            key={game.id}
                            className={`game-tab ${activeGame === game.id ? 'active' : ''}`}
                            onClick={() => setActiveGame(game.id)}
                        >
                            <span className="game-icon">{game.icon}</span>
                            <span>{game.name}</span>
                        </button>
                    ))}
                </div>

                <div className="game-content">
                    {activeGame === 'quiz' && <CodingQuiz onComplete={() => { }} />}
                    {activeGame === 'typing' && <TypingSpeedGame onComplete={() => { }} />}
                    {activeGame === 'memory' && <MemoryGame onComplete={() => { }} />}
                </div>
            </div>
        </>
    )
}

