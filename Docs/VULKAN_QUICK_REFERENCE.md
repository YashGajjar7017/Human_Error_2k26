# VulkanKT Quick Reference Guide

## Quick Start (5 Minutes)

### 1. Basic Compilation
```javascript
const response = await fetch('http://localhost:8000/api/vulkan/compile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'int main() { return 0; }',
    language: 'c',
    target: 'x64'
  })
});
const result = await response.json();
```

### 2. Check Capabilities
```bash
curl http://localhost:8000/api/vulkan/capabilities
```

### 3. Analyze Code First
```bash
curl -X POST http://localhost:8000/api/vulkan/analyze \
  -H "Content-Type: application/json" \
  -d '{"code":"int main(){}","language":"c"}'
```

---

## Supported Languages
- **C** - `language: "c"`
- **C++** - `language: "cpp"`
- **Java** - `language: "java"`
- **Python** - `language: "python"`
- **JavaScript** - `language: "javascript"`
- **Rust** - `language: "rust"`
- **Go** - `language: "go"`

---

## Supported Architectures
- **x64** (64-bit Intel/AMD) - `target: "x64"` ✅ **Default**
- **x86** (32-bit Intel/AMD) - `target: "x86"`
- **ARM** (32-bit ARM) - `target: "arm"`
- **ARM64** (64-bit ARM) - `target: "arm64"`
- **MIPS** (MIPS architecture) - `target: "mips"`

---

## Optimization Levels
```json
{
  "flags": {
    "optimization": 0  // 0=none, 1=basic, 2=standard (default), 3=aggressive
  }
}
```

**Level 0:** Debug build (slowest, most symbols)  
**Level 1:** Basic optimization (small + readable)  
**Level 2:** ⭐ Default (balanced speed/size)  
**Level 3:** Aggressive (fastest, largest binary size)

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/vulkan/compile` | Compile code → machine code |
| POST | `/api/vulkan/analyze` | Check code without compiling |
| GET | `/api/vulkan/capabilities` | List supported languages/architectures |
| POST | `/api/vulkan/stats` | Get binary statistics |
| GET | `/api/vulkan/info` | Get compiler info |

---

## Response Structure

**Success:**
```json
{
  "success": true,
  "message": "Compilation successful",
  "data": {
    "machineCode": "...",      // Hex string
    "assembly": "...",          // Assembly code
    "ir": { ... },              // Intermediate representation
    "metadata": { ... },        // Size, language, target, etc.
    "hexDump": "...",          // Human-readable binary
    "executablePath": "..."    // Path to compiled binary
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "stage": "translation|assembly_generation|machine_code_generation"
}
```

---

## Common Use Cases

### 🔧 Educational (Learning Assembly)
```javascript
{
  "code": "int add(int a, int b) { return a + b; }",
  "language": "c",
  "target": "x64",
  "flags": { "optimization": 0 }  // No optimization for clarity
}
```

### ⚡ Performance-Critical Code
```javascript
{
  "code": "...",
  "language": "c++",
  "target": "x64",
  "flags": { "optimization": 3 }  // Maximum optimization
}
```

### 📱 Mobile/Embedded (ARM)
```javascript
{
  "code": "...",
  "language": "c",
  "target": "arm64",  // iPhone/modern Android
  "flags": { "optimization": 2 }
}
```

### 🔐 Secure Code Analysis
```javascript
// 1. Analyze first
const analysis = await compile.analyze(code, language);
console.log(analysis.stats);

// 2. Then compile if approved
const compiled = await compile.compile({ code, language, target });
```

---

## Error Handling Example

```javascript
try {
  const response = await fetch('http://localhost:8000/api/vulkan/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: '...', language: 'c', target: 'x64' })
  });
  
  const result = await response.json();
  
  if (!result.success) {
    console.error(`Compilation failed at stage: ${result.stage}`);
    console.error(`Error: ${result.error}`);
    return;
  }
  
  console.log('Machine code size:', result.data.metadata.size);
  console.log('Hex dump:\n', result.data.hexDump);
  
} catch (error) {
  console.error('Network error:', error.message);
}
```

---

## Integration with Dashboard

### React Component Example
```jsx
import { useState } from 'react';

export default function VulkanCompiler() {
  const [code, setCode] = useState('int main() { return 0; }');
  const [language, setLanguage] = useState('c');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const compile = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/vulkan/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, target: 'x64' })
      });
      const data = await response.json();
      setResult(data.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea value={code} onChange={(e) => setCode(e.target.value)} />
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option>c</option>
        <option>cpp</option>
        <option>java</option>
      </select>
      <button onClick={compile} disabled={loading}>
        {loading ? 'Compiling...' : 'Compile'}
      </button>
      {result && <pre>{result.hexDump.slice(0, 500)}</pre>}
    </div>
  );
}
```

---

## Performance Tips

1. **Use O3 only if needed** - O2 is usually sufficient
2. **Analyze before critical compilations** - Catch errors early
3. **Batch operations** - Compile multiple files in parallel
4. **Cache results** - Save compiled binaries for reuse

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 400 Bad Request | Check JSON syntax, ensure `code` and `language` are in request |
| 500 Server Error | Verify compilers installed (gcc, g++, rustc, etc.) |
| Timeout | Reduce code size or increase timeout in config |
| Invalid machine code | Check optimization level, target architecture |

---

## Files & Modules

```
Backend/vulkanKT/
├── index.js                       # Main VulkanKT class
├── package.json                   # Dependencies
├── compiler/
│   └── MachineCodeCompiler.js    # Binary compilation
├── translator/
│   └── CodeTranslator.js         # Code→IR translation
├── generator/
│   └── AssemblyGenerator.js      # IR→Assembly generation
└── optimizer/
    └── Optimizer.js              # Code optimization
```

---

## Next Steps

1. ✅ Test `/api/vulkan/capabilities` endpoint
2. ✅ Try `/api/vulkan/analyze` with sample code
3. ✅ Use `/api/vulkan/compile` to generate machine code
4. ✅ Integrate into your dashboard/frontend
5. ✅ Monitor user activity through activity logs

---

**For full API documentation, see:** [VULKAN_API_DOCS.md](VULKAN_API_DOCS.md)
