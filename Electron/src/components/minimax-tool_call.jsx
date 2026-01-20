import { useState, useEffect, useRef } from 'react'
import '../styles/SharedComponents.css'

export default function AIAssistant({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi! I\'m your AI coding assistant. Ask me anything about programming, debugging, or code optimization!', timestamp: new Date() }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const messagesEndRef = useRef(null)

  const quickPrompts = [
    'How do I reverse a string in JavaScript?',
    'Explain async/await',
    'Help me optimize this code',
    'What are React hooks?',
    'How to implement binary search?'
  ]

  const codeExamples = {
    javascript: `// Array reverse
const reverse = arr => arr.slice().reverse();

// Or in-place
function reverseInPlace(arr) {
  for (let i = 0; i < arr.length / 2; i++) {
    [arr[i], arr[arr.length - 1 - i]] = 
    [arr[arr.length - 1 - i], arr[i]];
  }
  return arr;
}`,
    python: `# List reverse
my_list = [1, 2, 3, 4, 5]
reversed_list = my_list[::-1]

# Or using reversed()
reversed_list = list(reversed(my_list))`,
    react: `// Custom hook example
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  return [storedValue, setStoredValue];
}`
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(input)
      setMessages(prev => [...prev, { role: 'bot', content: response, timestamp: new Date() }])
      setIsTyping(false)
    }, 1500)
  }

  const generateResponse = (query) => {
    const q = query.toLowerCase()
    
    if (q.includes('reverse string') || q.includes('reverse array')) {
      return `Here's how to reverse an array:\n\n${codeExamples.javascript}`
    }
    
    if (q.includes('async') || q.includes('await')) {
      return `Async/await is a JavaScript pattern for handling asynchronous operations:\n\n**Basic syntax:**\n\`\`\`javascript\nasync function fetchData() {\n  const response = await fetch(url);\n  const data = await response.json();\n  return data;\n}\n\`\`\`\n\n**Key points:**\n- \`async\` functions always return a Promise\n- \`await\` pauses execution until Promise resolves\n- Errors can be caught with try/catch`
    }
    
    if (q.includes('react hooks') || q.includes('hook')) {
      return `React Hooks are functions that let you use state and lifecycle features:\n\n${codeExamples.react}`
    }
    
    if (q.includes('binary search')) {
      return `Binary Search Algorithm:\n\n**Time Complexity:** O(log n)\n\n\`\`\`javascript\nfunction binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1; // Not found\n}\n\`\`\``
    }
    
    if (q.includes('optimize') || q.includes('performance')) {
      return `Here are some performance optimization tips:\n\n**1. Use efficient algorithms**\n- Choose O(n log n) over O(n²) when possible\n\n**2. Memoize expensive computations**\n\`\`\`javascript\nconst memoized = (fn) => {\n  const cache = new Map();\n  return (...args) => {\n    const key = args.join(',');\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  };\n};\n\`\`\`\n\n**3. Avoid unnecessary re-renders**\n- Use React.memo()\n- Implement shouldComponentUpdate`
    }
    
    return `I understand you're asking about "${query}". Here's a general approach:\n\n1. **Break down the problem** - Understand what you're trying to solve\n2. **Research best practices** - Look for established patterns\n3. **Start simple** - Implement a basic solution first\n4. **Iterate and optimize** - Improve based on testing\n\nWould you like me to elaborate on any specific aspect?`
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const useQuickPrompt = (prompt) => {
    setInput(prompt)
  }

  if (!isOpen) return null

  return (
    <div className="ai-assistant-panel">
      <div className="ai-header">
        <h3>
          <span>🤖</span> AI Coding Assistant
        </h3>
        <div className="ai-status">
          <span className="ai-status-dot"></span>
          Online
        </div>
        <button className="ai-close" onClick={onClose}>×</button>
      </div>

      <div className="ai-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`ai-message ${msg.role}`}>
            <div className="ai-message-content">
              {msg.content.split('\n').map((line, i) => (
                <p key={i} style={{ margin: line.startsWith('```') || line.startsWith('**') ? 0 : '8px 0' }}>
                  {line.startsWith('```') ? (
                    <code style={{ 
                      display: 'block', 
                      background: '#1e1e1e', 
                      color: '#d4d4d4',
                      padding: '12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      overflow: 'auto'
                    }}>
                      {line.replace('```javascript', '').replace('```python', '').replace('```', '')}
                    </code>
                  ) : line.startsWith('**') ? (
                    <strong>{line.replace(/\*\*/g, '')}</strong>
                  ) : (
                    line
                  )}
                </p>
              ))}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="ai-typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <div className="quick-prompts">
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Quick prompts:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {quickPrompts.map((prompt, i) => (
              <button 
                key={i}
                className="quick-prompt-btn"
                onClick={() => useQuickPrompt(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ai-input-container">
        <input
          type="text"
          className="ai-input"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="ai-send-btn" onClick={handleSend}>
          ➤
        </button>
      </div>
    </div>
  )
}

