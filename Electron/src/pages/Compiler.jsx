import { useState, useRef, useEffect } from 'react'
import '../styles/SharedComponents.css'

export default function Compiler() {
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello, World!");')
  const [language, setLanguage] = useState('javascript')
  const [output, setOutput] = useState('')
  const [isCompiling, setIsCompiling] = useState(false)
  const [theme, setTheme] = useState('vs-dark')
  const editorRef = useRef(null)

  const languages = [
    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'cpp', name: 'C++', icon: '⚡' },
    { id: 'csharp', name: 'C#', icon: '🔷' },
    { id: 'go', name: 'Go', icon: '🐹' },
    { id: 'rust', name: 'Rust', icon: '🦀' },
    { id: 'typescript', name: 'TypeScript', icon: '🔷' }
  ]

  const handleCompile = async () => {
    setIsCompiling(true)
    setOutput('Compiling...')

    try {
      // Simulate compilation - in real app, call backend API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const result = {
        javascript: `> Running JavaScript code...\n> Output:\nHello, World!\n\n> Execution time: 42ms\n> Memory: 24MB`,
        python: `> Running Python code...\n> Output:\nHello, World!\n\n> Execution time: 15ms\n> Memory: 32MB`,
        java: `> Running Java code...\n> Output:\nHello, World!\n\n> Execution time: 120ms\n> Memory: 45MB`,
        cpp: `> Running C++ code...\n> Output:\nHello, World!\n\n> Execution time: 5ms\n> Memory: 12MB`,
        default: `> Code compiled successfully!\n> Output:\nHello, World!`
      }

      setOutput(result[language] || result.default)
    } catch (error) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setIsCompiling(false)
    }
  }

  const handleClear = () => {
    setCode('')
    setOutput('')
  }

  const handleSampleCode = () => {
    const samples = {
      javascript: `// JavaScript Example\nconst greeting = "Hello, World!";\nconst numbers = [1, 2, 3, 4, 5];\n\n// Map and reduce\nconst sum = numbers.reduce((acc, n) => acc + n, 0);\nconsole.log(greeting);\nconsole.log("Sum:", sum);`,
      python: `# Python Example\ngreeting = "Hello, World!"\nnumbers = [1, 2, 3, 4, 5]\n\n# Sum using built-in\ntotal = sum(numbers)\nprint(greeting)\nprint(f"Sum: {total}")`,
      java: `// Java Example\npublic class Main {\n    public static void main(String[] args) {\n        String greeting = "Hello, World!";\n        int[] numbers = {1, 2, 3, 4, 5};\n        int sum = 0;\n        for (int n : numbers) sum += n;\n        \n        System.out.println(greeting);\n        System.out.println("Sum: " + sum);\n    }\n}`,
      cpp: `// C++ Example\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::string greeting = "Hello, World!";\n    std::vector<int> numbers = {1, 2, 3, 4, 5};\n    int sum = 0;\n    for (int n : numbers) sum += n;\n    \n    std::cout << greeting << std::endl;\n    std::cout << "Sum: " << sum << std::endl;\n    return 0;\n}`
    }
    setCode(samples[language] || samples.javascript)
  }

  return (
    <div className="compiler-container">
      <header className="compiler-header">
        <div className="header-left">
          <h1>Code Compiler</h1>
          <p>Write, compile, and run code in multiple languages</p>
        </div>
        <div className="header-right">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="language-select"
          >
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.icon} {lang.name}
              </option>
            ))}
          </select>
          <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="theme-select"
          >
            <option value="vs-dark">🌙 Dark</option>
            <option value="vs-light">☀️ Light</option>
          </select>
        </div>
      </header>

      <div className="compiler-main">
        <div className="editor-section">
          <div className="editor-toolbar">
            <span className="file-name">
              {languages.find(l => l.id === language)?.icon} main.{language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'cpp' ? 'cpp' : language === 'csharp' ? 'cs' : language === 'go' ? 'go' : language === 'rust' ? 'rs' : 'js'}
            </span>
            <div className="toolbar-actions">
              <button onClick={handleSampleCode} className="toolbar-btn">
                📝 Sample Code
              </button>
              <button onClick={handleClear} className="toolbar-btn">
                🗑️ Clear
              </button>
              <button onClick={handleCompile} className="toolbar-btn primary" disabled={isCompiling}>
                {isCompiling ? '⏳ Running...' : '▶️ Run'}
              </button>
            </div>
          </div>
          <textarea
            ref={editorRef}
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
            spellCheck="false"
            style={{
              backgroundColor: theme === 'vs-dark' ? '#1e1e1e' : '#ffffff',
              color: theme === 'vs-dark' ? '#d4d4d4' : '#333333',
              fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace"
            }}
          />
        </div>

        <div className="output-section">
          <div className="output-header">
            <span>🖥️ Output</span>
            <button 
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(output)}
              disabled={!output}
            >
              📋 Copy
            </button>
          </div>
          <div className="output-content" style={{
            backgroundColor: theme === 'vs-dark' ? '#1e1e1e' : '#f5f5f5',
            color: theme === 'vs-dark' ? '#d4d4d4' : '#333333'
          }}>
            {output ? (
              <pre>{output}</pre>
            ) : (
              <div className="empty-output">
                <span className="empty-icon">📊</span>
                <p>Run your code to see output here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="compiler-footer">
        <div className="footer-info">
          <span>📁 {language.toUpperCase()}</span>
          <span>📝 {code.split('\n').length} lines</span>
          <span>⌨️ {code.length} characters</span>
        </div>
        <div className="footer-actions">
          <button className="footer-btn" title="Download Code">
            💾 Download
          </button>
          <button className="footer-btn" title="Share Code">
            🔗 Share
          </button>
          <button className="footer-btn" title="Format Code">
            ✨ Format
          </button>
        </div>
      </div>
    </div>
  )
}

