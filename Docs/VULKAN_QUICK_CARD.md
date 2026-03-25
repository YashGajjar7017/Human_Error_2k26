# VulkanKT - Quick Start Card

**VulkanKT v1.0.0** | Machine Code Compiler for Xenithra

---

## 🎯 One-Minute Overview

VulkanKT compiles **source code** → **machine code** across 7 languages and 5 architectures.

```
             INPUT                    OUTPUT
┌────────────────────────┐     ┌──────────────────┐
│ Code (C, C++, Rust,    │────▶│ Machine Code     │
│ Go, Java, Python)      │     │ (Binary/Hex)     │
└────────────────────────┘     └──────────────────┘
      Language                   Target Arch
      + Optimization              (x86/x64/ARM/etc)
```

---

## ⚡ Quick Start (2 Steps)

### Step 1: Start Server
```bash
cd Backend
npm start
```

### Step 2: Make API Call
```javascript
const result = await fetch('http://localhost:8000/api/vulkan/compile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'int main() { return 0; }',
    language: 'c',
    target: 'x64'
  })
}).then(r => r.json());
```

---

## 🔌 5 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/vulkan/compile` | Compile → machine code |
| POST | `/api/vulkan/analyze` | Analyze code (no compile) |
| GET | `/api/vulkan/capabilities` | List supported |
| POST | `/api/vulkan/stats` | Binary stats |
| GET | `/api/vulkan/info` | Compiler info |

---

## 📦 Supported

### Languages
```
C          C++      Rust     Go      Java      Python    JavaScript
(Full)     (Full)   (Full)   (Full)  (Partial) (Partial) (Partial)
```

### Architectures
```
x64 (default)    x86      ARM      ARM64    MIPS
Intel/AMD 64     32-bit   ARMv7    ARMv8    MIPS
```

### Optimization Levels
```
O0          O1           O2 (default)    O3
No opt      Dead code    Balanced        Aggressive
            removal      (+inlining)     (+vectorization)
```

---

## 📋 Request/Response

### Request
```json
{
  "code": "int main() { return 42; }",
  "language": "c",
  "target": "x64",
  "flags": { "optimization": 2 }
}
```

### Success Response
```json
{
  "success": true,
  "message": "Compilation successful",
  "data": {
    "machineCode": "554889e54883ec20...",
    "assembly": "; Assembly code...",
    "ir": { /* Intermediate rep */ },
    "metadata": {
      "language": "c",
      "target": "x64",
      "size": 8192,
      "optimizationLevel": 2
    },
    "hexDump": "00000000: 55 48 89 e5..."
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Unsupported language: xyz",
  "stage": "translation"
}
```

---

## 🧪 Testing

### Test All Endpoints
```bash
cd Backend/vulkanKT
node test.js
```

### Test Single Endpoint
```bash
# Get capabilities
curl http://localhost:8000/api/vulkan/capabilities

# Compile code
curl -X POST http://localhost:8000/api/vulkan/compile \
  -H "Content-Type: application/json" \
  -d '{"code":"int main(){}","language":"c"}'
```

---

## 📁 File Locations

```
Backend/
├── vulkanKT/                  ← MAIN PACKAGE
│   ├── index.js              ← Entry point
│   ├── test.js               ← Run tests here
│   ├── compiler/
│   ├── translator/
│   ├── generator/
│   └── optimizer/
├── Routes/
│   └── vulkan.routes.js       ← API endpoints
└── server.js                  ← Routes mounted here

Docs/
├── VULKAN_API_DOCS.md         ← Full reference
├── VULKAN_QUICK_REFERENCE.md  ← Tips & examples
├── VULKAN_INTEGRATION_GUIDE.md ← Frontend setup
└── VULKAN_IMPLEMENTATION_SUMMARY.md ← This summary
```

---

## 🎨 Frontend Integration

### React Component
```jsx
import CodeCompilerWidget from './components/CodeCompilerWidget';

export default function Dashboard() {
  return <CodeCompilerWidget />;
}
```

See [VULKAN_INTEGRATION_GUIDE.md](../Docs/VULKAN_INTEGRATION_GUIDE.md) for complete code.

---

## 🔍 Common Use Cases

### 📚 Educational (Learn Assembly)
```javascript
{
  "code": "int add(int a, int b) { return a + b; }",
  "language": "c",
  "target": "x64",
  "flags": { "optimization": 0 }  // O0 for clarity
}
```

### ⚡ Performance-Critical
```javascript
{
  "code": "...",
  "language": "c++",
  "target": "x64",
  "flags": { "optimization": 3 }  // O3 max
}
```

### 📱 Mobile/Embedded (ARM)
```javascript
{
  "code": "...",
  "language": "c",
  "target": "arm64"  // iPhone/modern Android
}
```

---

## ⚙️ Compilation Pipeline

```
Source Code
    ↓
[1] CODE TRANSLATOR
    └─ Parse → AST → IR
    ↓
[2] ASSEMBLY GENERATOR
    └─ Target-specific assembly
    ↓
[3] OPTIMIZER
    └─ Dead code, inlining, vectorization
    ↓
[4] MACHINE CODE COMPILER
    └─ Binary generation
    ↓
Machine Code (Binary)
```

---

## ⏱️ Limits

| Limit | Value |
|-------|-------|
| Max code size | 10 MB |
| Compilation timeout | 30 seconds |
| Hex dump output | 20 lines |
| Optimization levels | 0-3 |

---

## 🚨 Error Handling

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| 400 Bad Request | Missing code/language | Add `code` and `language` to request |
| Unsupported language | Language not supported | Use c, cpp, rust, go, java, python |
| Timeout | Code too large | Reduce code size |
| 500 Server Error | Compiler not installed | Install gcc, g++, rustc, etc. |

---

## 🔒 Security

✅ Input validation  
✅ Size limits (10MB)  
✅ Timeout protection (30s)  
✅ Isolated compilation  
✅ User activity logging  
✅ JWT auth support  

---

## 📚 Fast Reference Links

| Document | Purpose |
|----------|---------|
| [API Docs](../Docs/VULKAN_API_DOCS.md) | Full endpoint reference |
| [Quick Ref](../Docs/VULKAN_QUICK_REFERENCE.md) | Tips & tricks |
| [Integration](../Docs/VULKAN_INTEGRATION_GUIDE.md) | Frontend setup |
| [Summary](../Docs/VULKAN_IMPLEMENTATION_SUMMARY.md) | Complete overview |
| [Module README](../../Backend/vulkanKT/README.md) | Package docs |

---

## 🆚 VulkanKT vs Other Compilers

| Feature | VulkanKT | GCC Compiler | LLVM |
|---------|----------|--------------|------|
| Web API | ✅ Yes | ❌ No | ❌ No |
| IR Output | ✅ Yes | ❌ No | ✅ Yes |
| Multi-lang | ✅ 7 langs | ❌ C/C++ | ✅ Many |
| User tracking | ✅ Yes | ❌ No | ❌ No |
| Optimization | ✅ O0-O3 | ✅ O0-O3 | ✅ O0-O3 |

---

## ⚡ Performance Tips

1. **Use O2** (default) for balance
2. **Cache results** for repeated codes
3. **Batch compile** when possible
4. **Analyze first** before heavy compilations
5. **Monitor timeout** for large files

---

## 🔗 Integration Points

```
VulkanKT    ← API Routes → Express Server
  ↓
  ├─ User Authentication (JWT)
  ├─ Activity Logging (MongoDB)
  ├─ Error Handling
  └─ Response Formatting
```

---

## 🎓 Learning Path

1. **Day 1:** Read this card + VULKAN_API_DOCS.md
2. **Day 2:** Run tests, try API calls
3. **Day 3:** Integrate React component
4. **Day 4:** Advanced features (caching, analysis)
5. **Day 5:** Deploy to production

---

## 💬 Need Help?

| Topic | Location |
|-------|----------|
| API reference | [VULKAN_API_DOCS.md](../Docs/VULKAN_API_DOCS.md) |
| Frontend setup | [VULKAN_INTEGRATION_GUIDE.md](../Docs/VULKAN_INTEGRATION_GUIDE.md) |
| Troubleshooting | [README.md](../../Backend/vulkanKT/README.md) |
| Examples | [VULKAN_QUICK_REFERENCE.md](../Docs/VULKAN_QUICK_REFERENCE.md) |

---

## ✅ Checklist

- [ ] Server running (`npm start` in Backend)
- [ ] Tests pass (`node vulkanKT/test.js`)
- [ ] API endpoints working
- [ ] Documentation reviewed
- [ ] Frontend component added (optional)
- [ ] Error handling implemented
- [ ] User activity logging verified

---

**Status:** ✅ Production Ready v1.0.0  
**Last Updated:** March 2026  
**License:** MIT  

**Compile with Confidence | VulkanKT**

