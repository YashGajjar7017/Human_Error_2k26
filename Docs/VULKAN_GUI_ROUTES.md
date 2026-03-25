# VulkanKT Routes & API Integration Guide

## 🎯 Route Configuration

### **VulkanKT UI Access**
```
GET http://localhost:8000/vulkan
└─ Serves: Frontend/index-vulkan.html
```

### **VulkanKT API Routes** (All endpoints available at `/api/vulkan`)

#### 1. **Compile Code to Machine**
```
POST /api/vulkan/compile
├─ Body: {
│   "code": "...",
│   "language": "c|cpp|rust|go|java|python",
│   "target": "x64|x86|arm|arm64|mips",
│   "flags": { "optimization": 0|1|2|3 }
│ }
└─ Response: { machineCode, assembly, ir, metadata }
```

#### 2. **Analyze Code (Without Compilation)**
```
POST /api/vulkan/analyze
├─ Body: {
│   "code": "...",
│   "language": "c|cpp|rust|go|java|python"
│ }
└─ Response: { stats, ast, language }
```

#### 3. **Get Compiler Capabilities**
```
GET /api/vulkan/capabilities
└─ Response: { languages, architectures, optimizationLevels, version }
```

#### 4. **Get Binary Statistics**
```
POST /api/vulkan/stats
├─ Body: { "machineCode": "..." }
└─ Response: { size, instructions, entropy }
```

#### 5. **Get Compiler Info**
```
GET /api/vulkan/info
└─ Response: { compiler, version, capabilities }
```

---

## 📂 Frontend File Structure

```
Frontend/
├── index-vulkan.html          (Main UI - NEW)
└── js/
    └── vulkan-main.js         (Main logic - NEW)

Public/
└── CSS/
    └── vulkan-style.css       (Styling - NEW)
```

---

## 🔗 Static File Serving

### CSS Files
```
GET /CSS/vulkan-style.css
└─ Served from: Public/CSS/vulkan-style.css
```

### JavaScript Files
```
GET /js/vulkan-main.js
└─ Served from: Frontend/js/vulkan-main.js
```

### Icons & Assets
```
GET /assets/*
└─ Served from: Public/
└─ Using: FontAwesome CDN (https://cdnjs.cloudflare.com/ajax/libs/font-awesome/)
```

---

## 🔧 Backend Route Integration

All routes are mounted in `Backend/server.js`:

```javascript
// Line ~52
const vulkanRoutes = require('./Routes/vulkan.routes');

// Line ~282
app.use('/api/vulkan', vulkanRoutes);

// Line ~330
app.get('/vulkan', (req, res) => { /* serves HTML */ });
```

---

## ✅ Route Connection Status

| Route | Method | Status | Purpose |
|-------|--------|--------|---------|
| `/vulkan` | GET | ✅ Connected | Serve UI |
| `/api/vulkan/compile` | POST | ✅ Connected | Compile code |
| `/api/vulkan/analyze` | POST | ✅ Connected | Analyze code |
| `/api/vulkan/capabilities` | GET | ✅ Connected | Get capabilities |
| `/api/vulkan/stats` | POST | ✅ Connected | Get binary stats |
| `/api/vulkan/info` | GET | ✅ Connected | Get compiler info |
| `/CSS/vulkan-style.css` | GET | ✅ Connected | Load styles |
| `/js/vulkan-main.js` | GET | ✅ Connected | Load JavaScript |

---

## 🚀 How to Use

### 1. **Start the Server**
```bash
cd Backend
npm start
# Server runs on http://localhost:8000
```

### 2. **Access the VulkanKT UI**
```
http://localhost:8000/vulkan
```

### 3. **Test an API Endpoint**
```bash
curl -X POST http://localhost:8000/api/vulkan/compile \
  -H "Content-Type: application/json" \
  -d '{
    "code":"int main(){return 0;}",
    "language":"c",
    "target":"x64"
  }'
```

---

## 🔍 Frontend Architecture

### **3-Part Layout**

```
┌─────────────────────────────────┐
│        NAVBAR (VulkanKT)         │
├──────────────┬──────────────┬────┤
│              │              │    │
│   FILE       │    CODE      │OUT-│
│   EXPLORER   │    EDITOR    │PUT │
│              │   (w/ Line#) │    │
│   - Language │  (w/ Debug)  │&   │
│   - Arch     │   Tabs       │CON │
│   - Optimize │   Breakpts   │SOLE│
│   - Buttons  │   Status     │    │
│              │              │    │
├──────────────┴──────────────┴────┤
│        STATUS BAR                │
└─────────────────────────────────┘
```

### **Functionality**

#### **Left Panel (File Explorer)**
- File browser with collapsible folders
- Language selector (C, C++, Rust, Go, Java, Python)
- Architecture selector (x86, x64, ARM, ARM64, MIPS)
- Optimization level slider (O0-O3)
- Action buttons (Analyze, Compile)

#### **Middle Panel (Code Editor)**
- Syntax-highlighted code editor
- Line numbers (auto-updated)
- Debug breakpoints (red dots - clickable)
- Multi-tab support
- Cursor position tracking
- Tab/indentation support
- Scroll-synchronized line numbers

#### **Right Panel (Output)**
- Output tab: Compilation results, binary info, assembly preview
- Console tab: Real-time logging and messages
- Debug tab: Variables and breakpoints

---

## 🎨 Design Features

### **Glass Morphism Design**
- Semi-transparent backgrounds with backdrop blur
- Modern glassmorphic UI elements
- Glowing neon accents (cyan/blue)

### **Animated Gradient Background**
- 15-second gradient animation (cinema-like effect)
- Multiple gradient layers
- Film flicker overlay effect

### **Interactive Elements**
- Smooth transitions and hover effects
- Glowing buttons on interaction
- Dynamic status updates
- Real-time feedback

---

## 🧪 Testing the Routes

### **1. Test UI Access**
```bash
curl http://localhost:8000/vulkan
# Should return HTML content
```

### **2. Test Compilation API**
```bash
curl -X POST http://localhost:8000/api/vulkan/compile \
  -H "Content-Type: application/json" \
  -d '{"code":"int main(){return 42;}","language":"c","target":"x64"}'
```

### **3. Test Analysis API**
```bash
curl -X POST http://localhost:8000/api/vulkan/analyze \
  -H "Content-Type: application/json" \
  -d '{"code":"int x = 5;","language":"c"}'
```

### **4. Test Capabilities**
```bash
curl http://localhost:8000/api/vulkan/capabilities
```

---

## 📋 Request/Response Examples

### **Compilation Request**
```json
{
  "code": "#include <stdio.h>\nint main() { printf(\"Hi\"); return 0; }",
  "language": "c",
  "target": "x64",
  "flags": { "optimization": 2 }
}
```

### **Compilation Response**
```json
{
  "success": true,
  "message": "Compilation successful",
  "data": {
    "machineCode": "554889e54883ec20...",
    "assembly": "; Assembly code...",
    "ir": { /* IR structure */ },
    "metadata": {
      "language": "c",
      "target": "x64",
      "size": 8192,
      "optimizationLevel": 2
    },
    "executablePath": "/path/to/binary",
    "hexDump": "00000000: 55 48 89 e5..."
  }
}
```

---

## 🔄 JavaScript Event Flow

```
User Action
    ↓
setupEditorEvents() / setupButtonEvents()
    ↓
fetch('/api/vulkan/compile' or analyze)
    ↓
API Response
    ↓
displayCompilationResult() / displayAnalysisResult()
    ↓
logToConsole()
    ↓
Update Output Panel
```

---

## 🐛 Debugging Tips

### **Check Console Logs**
Open browser DevTools (F12) → Console tab for JavaScript errors

### **Check Network Tab**
DevTools → Network tab to see API requests/responses

### **Check Server Logs**
```bash
# Terminal where server is running
# Look for compilation/API errors
```

### **Test Routes Directly**
```bash
# Check if route exists
curl -v http://localhost:8000/vulkan

# Test API endpoint
curl -v -X POST http://localhost:8000/api/vulkan/compile \
  -H "Content-Type: application/json" \
  -d '{"code":"test","language":"c"}'
```

---

## ✨ Features Implemented

✅ VS Code-like 3-part layout  
✅ Glass morphism design  
✅ Animated gradient background  
✅ Line numbers in editor  
✅ Debug breakpoints (red dots)  
✅ Multi-language support (7 languages)  
✅ Multi-architecture support (5 architectures)  
✅ Optimization level selector  
✅ Code analysis  
✅ Compilation with status tracking  
✅ Output/Console/Debug tabs  
✅ File explorer with multiple files  
✅ Tab-based editor  
✅ Real-time cursor tracking  
✅ Modern button designs  

---

## 🔮 Future Enhancements

- [ ] Real-time syntax highlighting
- [ ] Code folding support
- [ ] Variable inspection during debugging
- [ ] Project management
- [ ] Git integration
- [ ] Code snippets
- [ ] Custom themes
- [ ] Keyboard shortcuts

---

## 📞 Support

For issues:
1. Check server logs
2. Check browser console (DevTools)
3. Verify all routes are connected
4. Test API endpoints with curl
5. Check file paths are correct

---

**VulkanKT GUI - Production Ready ✅**
