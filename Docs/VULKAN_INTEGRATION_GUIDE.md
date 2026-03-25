# VulkanKT Integration Guide

## Overview
This guide explains how to integrate the VulkanKT compiler into your Xenithra Dashboard and application.

---

## Backend Integration (Already Done ✅)

The VulkanKT routes are already mounted in the server:

```javascript
// Backend/server.js (line ~280)
const vulkanRoutes = require('./Routes/vulkan.routes');
app.use('/api/vulkan', vulkanRoutes);
```

All endpoints are available immediately without additional setup.

---

## Frontend Integration

### 1. Create a Compiler Component

#### React Example: `CodeCompilerWidget.jsx`

```jsx
import React, { useState } from 'react';
import './CodeCompilerWidget.css';

export default function CodeCompilerWidget() {
  const [code, setCode] = useState('int main() { return 0; }');
  const [language, setLanguage] = useState('c');
  const [target, setTarget] = useState('x64');
  const [optimization, setOptimization] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('output'); // 'output', 'assembly', 'ir', 'hexdump'

  const handleCompile = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/vulkan/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          target,
          flags: { optimization }
        })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Compilation failed');
        return;
      }

      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      const response = await fetch('/api/vulkan/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });

      const data = await response.json();
      alert(`Functions: ${data.data.stats.functions}\nVariables: ${data.data.stats.variables}\nLines: ${data.data.stats.lines}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="compiler-widget">
      <div className="compiler-header">
        <h2>🔧 VulkanKT Compiler</h2>
        <p>Translate code to machine code</p>
      </div>

      <div className="compiler-controls">
        <div className="control-group">
          <label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="rust">Rust</option>
            <option value="go">Go</option>
          </select>
        </div>

        <div className="control-group">
          <label>Target Architecture</label>
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="x64">x64 (64-bit)</option>
            <option value="x86">x86 (32-bit)</option>
            <option value="arm">ARM (32-bit)</option>
            <option value="arm64">ARM64 (64-bit)</option>
            <option value="mips">MIPS</option>
          </select>
        </div>

        <div className="control-group">
          <label>Optimization Level</label>
          <input 
            type="range" 
            min="0" 
            max="3" 
            value={optimization}
            onChange={(e) => setOptimization(Number(e.target.value))}
          />
          <span>O{optimization}</span>
        </div>
      </div>

      <div className="editor-section">
        <label>Source Code</label>
        <textarea 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your code here..."
          rows={10}
        />
      </div>

      <div className="button-group">
        <button onClick={handleAnalyze} disabled={loading}>
          📊 Analyze
        </button>
        <button onClick={handleCompile} disabled={loading} className="primary">
          {loading ? '⏳ Compiling...' : '▶️ Compile'}
        </button>
      </div>

      {error && (
        <div className="error-box">
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="result-section">
          <div className="tabs">
            <button 
              className={tab === 'output' ? 'active' : ''}
              onClick={() => setTab('output')}
            >
              Machine Code
            </button>
            <button 
              className={tab === 'assembly' ? 'active' : ''}
              onClick={() => setTab('assembly')}
            >
              Assembly
            </button>
            <button 
              className={tab === 'ir' ? 'active' : ''}
              onClick={() => setTab('ir')}
            >
              IR
            </button>
            <button 
              className={tab === 'hexdump' ? 'active' : ''}
              onClick={() => setTab('hexdump')}
            >
              Hex Dump
            </button>
          </div>

          <div className="output-box">
            {tab === 'output' && (
              <div>
                <h4>Machine Code (Hex)</h4>
                <p><code>{result.machineCode.substring(0, 500)}...</code></p>
              </div>
            )}

            {tab === 'assembly' && (
              <div>
                <h4>Assembly Code</h4>
                <pre>{result.assembly}</pre>
              </div>
            )}

            {tab === 'ir' && (
              <div>
                <h4>Intermediate Representation</h4>
                <pre>{JSON.stringify(result.ir, null, 2)}</pre>
              </div>
            )}

            {tab === 'hexdump' && (
              <div>
                <h4>Hex Dump</h4>
                <pre className="hexdump">{result.hexDump}</pre>
              </div>
            )}
          </div>

          <div className="metadata">
            <h4>Compilation Info</h4>
            <ul>
              <li><strong>Binary Size:</strong> {result.metadata.size} bytes</li>
              <li><strong>Language:</strong> {result.metadata.language}</li>
              <li><strong>Target:</strong> {result.metadata.target}</li>
              <li><strong>Optimization:</strong> O{result.metadata.optimizationLevel}</li>
              <li><strong>Executable:</strong> {result.executablePath}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### CSS: `CodeCompilerWidget.css`

```css
.compiler-widget {
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
  color: #e0e0e0;
  font-family: 'Jetbrains Mono', monospace;
}

.compiler-header {
  margin-bottom: 20px;
  border-bottom: 2px solid #007acc;
  padding-bottom: 10px;
}

.compiler-header h2 {
  margin: 0 0 5px 0;
  color: #00d4ff;
}

.compiler-header p {
  margin: 0;
  color: #888;
  font-size: 0.9em;
}

.compiler-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
}

.control-group label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #00d4ff;
  font-size: 0.9em;
}

.control-group select,
.control-group input[type="range"] {
  padding: 8px;
  background: #2d2d2d;
  color: #e0e0e0;
  border: 1px solid #444;
  border-radius: 4px;
}

.editor-section {
  margin-bottom: 20px;
}

.editor-section label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #00d4ff;
}

.editor-section textarea {
  width: 100%;
  background: #2d2d2d;
  color: #e0e0e0;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 10px;
  font-family: 'Jetbrains Mono', monospace;
  font-size: 0.9em;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.button-group button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.button-group button.primary {
  background: #007acc;
  color: white;
}

.button-group button.primary:hover:not(:disabled) {
  background: #005a9e;
}

.button-group button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-box {
  background: #4e1616;
  border: 1px solid #8b0000;
  color: #ff6b6b;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.result-section {
  margin-top: 20px;
  border-top: 1px solid #333;
  padding-top: 20px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  border-bottom: 1px solid #333;
}

.tabs button {
  padding: 10px 15px;
  background: #2d2d2d;
  color: #888;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.tabs button.active {
  color: #00d4ff;
  border-bottom: 2px solid #00d4ff;
}

.output-box {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.output-box h4 {
  margin: 0 0 10px 0;
  color: #00d4ff;
}

.output-box code,
.output-box pre {
  font-family: 'Jetbrains Mono', monospace;
  font-size: 0.85em;
  color: #90ee90;
  word-break: break-all;
}

.hexdump {
  color: #87ceeb;
}

.metadata {
  background: #2d2d2d;
  border: 1px solid #444;
  padding: 15px;
  border-radius: 4px;
}

.metadata h4 {
  margin: 0 0 10px 0;
  color: #00d4ff;
}

.metadata ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.metadata li {
  padding: 5px 0;
  border-bottom: 1px solid #333;
}

.metadata li:last-child {
  border-bottom: none;
}

.metadata strong {
  color: #00d4ff;
}
```

---

### 2. Integrate into Dashboard

#### In your main dashboard file (e.g., `Dashboard.jsx`):

```jsx
import CodeCompilerWidget from './components/CodeCompilerWidget';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        {/* Other dashboard components */}
        
        <CodeCompilerWidget />
        
        {/* More components */}
      </div>
    </div>
  );
}
```

---

## Advanced Usage

### 1. Batch Compilation

```javascript
async function compileMultiple(codes) {
  const results = await Promise.all(
    codes.map(({ code, language }) =>
      fetch('/api/vulkan/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, target: 'x64' })
      }).then(r => r.json())
    )
  );
  return results;
}
```

### 2. Real-time Code Analysis

```javascript
let debounceTimer;

function onCodeChange(code, language) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const analysis = await fetch('/api/vulkan/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language })
    }).then(r => r.json());
    
    // Update UI with stats
    updateStats(analysis.data.stats);
  }, 500); // Debounce 500ms
}
```

### 3. Caching Compiled Results

```javascript
const compilationCache = new Map();

async function compileWithCache(code, language, target) {
  const key = `${language}:${target}:${btoa(code)}`;
  
  if (compilationCache.has(key)) {
    return compilationCache.get(key);
  }
  
  const result = await fetch('/api/vulkan/compile', {
    // ...
  }).then(r => r.json());
  
  compilationCache.set(key, result);
  return result;
}
```

---

## Deployment Checklist

- ✅ VulkanKT routes mounted in server
- ✅ API endpoints tested (run `npm test` in vulkanKT dir)
- ✅ Frontend component created
- ✅ Styling integrated with dashboard theme
- ✅ Error handling implemented
- ✅ User authorization verified (if needed)
- ✅ Activity logging working
- ✅ Documentation updated

---

## Troubleshooting Integration

### Problem: CORS Error
```javascript
// Make sure your fetch requests have correct headers
headers: { 'Content-Type': 'application/json' }
```

### Problem: Empty Response
```javascript
// Check that the server is running
// Check network tab in browser DevTools
// Verify endpoint is /api/vulkan/compile (not /vulkan/compile)
```

### Problem: Compilation Timeout
```javascript
// Reduce code size or increase timeout in backend config
const vulkan = new VulkanKT({
  timeout: 60000 // Increase to 60 seconds
});
```

---

## API Reference

See [VULKAN_API_DOCS.md](../../Docs/VULKAN_API_DOCS.md) for complete API documentation.

---

## Performance Tips

1. **Cache results** for frequently compiled code
2. **Debounce analysis** to avoid excessive requests
3. **Batch compile** when possible
4. **Use O2 by default** (O3 may be slower for small codes)
5. **Show loading state** during compilation

---

## Next Steps

1. **Test the API** - Run the test suite
2. **Create component** - Add to your dashboard
3. **Style and integrate** - Match your dashboard theme
4. **Add features** - Implement real-time analysis, caching, etc.
5. **Monitor usage** - Check activity logs

---

For more information, see [README.md](./README.md) and [VULKAN_API_DOCS.md](../../Docs/VULKAN_API_DOCS.md).
