# VulkanKT Professional IDE - Quick Start

## 🎯 Access the GUI

```
http://localhost:8000/vulkan
```

---

## 🖥️ Layout Overview

### **Left Panel** - File Explorer & Settings
- 📁 File Browser (collapsible folders)
- 🔧 Language Selection (C, C++, Rust, Go, Java, Python)
- 📍 Architecture Selection (x64, x86, ARM, ARM64, MIPS)
- ⚡ Optimization Level (O0-O3 slider)
- ▶️ Compile & Analyze Buttons

### **Middle Panel** - Code Editor
- 📝 Syntax-ready code editor
- 🔢 Line numbers (auto-updated)
- 🔴 Debug breakpoints (click to toggle)
- 📋 Multi-tab support
- 📍 Cursor position tracking
- 🎯 Proper indentation/tabs

### **Right Panel** - Output & Console
- 📊 **Output Tab**: Compilation results, binary info, assembly
- 💬 **Console Tab**: Real-time logs and messages
- 🐛 **Debug Tab**: Variables and breakpoints list

---

## 🎨 Design Highlights

✨ **Glass Morphism** - Modern, semi-transparent UI  
🌈 **Animated Gradients** - Cinema-like background effect  
💡 **Glowing Accents** - Cyan/neon cyberpunk aesthetic  
⚡ **Smooth Interactions** - All elements have smooth transitions  
🎭 **Professional Layout** - VS Code inspired 3-part interface  

---

## ⚙️ How to Use

### 1️⃣ **Write Code**
Click in the middle panel and start typing your C/C++/Python code

### 2️⃣ **Select Language & Architecture**
- Choose language from left panel dropdown
- Choose target architecture (default: x64)
- Adjust optimization level (O0-O3)

### 3️⃣ **Add Breakpoints** (Optional)
Click the red dot area on the left side of line numbers to toggle breakpoints

### 4️⃣ **Analyze or Compile**
- Click **"Analyze"** to check code structure
- Click **"Compile"** to compile to machine code

### 5️⃣ **View Results**
- **Output Tab**: See machine code and binary info
- **Console Tab**: Check logs and messages
- **Debug Tab**: View breakpoints and variables

---

## 🚀 Example Workflow

```
1. Load example.c (already in editor)
2. Click "Analyze" → See code stats (functions, variables, lines)
3. Toggle a breakpoint by clicking red dot area
4. Click "Compile" → Get machine code and assembly
5. View results in Output/Console tabs
```

---

## 📝 File Management

### **Open Files**
Click on files in the File Explorer (left panel) to switch between them

### **Close Files**
Click the ✕ on the file tab to close it

### **Available Samples**
- `example.c` - Basic C program
- `hello.cpp` - Simple C++ program
- `test.rs` - Rust example (can be added)

---

## 🔧 Settings

### **Language Selection**
```
C → gcc
C++ → g++
Rust → rustc
Go → go compiler
Java → javac
Python → Python interpreter
```

### **Architecture Selection**
```
x64 (Default) → Intel/AMD 64-bit
x86 → Intel/AMD 32-bit
ARM → ARM 32-bit (ARMv7)
ARM64 → ARM 64-bit (ARMv8)
MIPS → MIPS architecture
```

### **Optimization Level**
```
O0 → No optimization (slowest, best for debugging)
O1 → Basic optimization
O2 → Standard (balanced, recommended)
O3 → Aggressive optimization (fastest)
```

---

## 💻 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Indent selection |
| `Shift+Tab` | Outdent selection |
| `Ctrl+A` | Select all |
| `Ctrl+C` | Copy |
| `Ctrl+V` | Paste |
| `Ctrl+Z` | Undo |

---

## 📊 Output Sections

### **Machine Code Output**
Shows hexadecimal representation of compiled binary code

### **Binary Information**
- File size in bytes
- Target language and architecture
- Optimization level used
- Compilation duration

### **Assembly Code**
Target-specific assembly code preview (first 10 lines)

---

## 🐛 Debug Features

### **Breakpoints**
- Click red dot area next to line numbers to set
- Red dot appears when breakpoint is active
- Listed in Debug tab under "Breakpoints"
- Remove by clicking again

### **Console Logging**
- Automatic timestamps
- Color-coded messages (info, success, error)
- Scrolls to latest message
- Keeps last 100 messages

---

## ⚡ Features

✅ 7 Programming Languages  
✅ 5 CPU Architectures  
✅ 4 Optimization Levels  
✅ Real-time Line Numbers  
✅ Interactive Breakpoints  
✅ Code Analysis  
✅ Assembly Code Preview  
✅ Binary Statistics  
✅ Multi-file Support  
✅ Multi-tab Editor  
✅ Cursor Position Tracking  
✅ Real-time Console  
✅ Modern UI Design  
✅ Glass Morphism Effects  
✅ Animated Backgrounds  

---

## 🔗 API Integration

All interactions automatically connect to backend:

```javascript
POST /api/vulkan/compile      // Compile code
POST /api/vulkan/analyze      // Analyze code  
GET  /api/vulkan/capabilities // Get compiler info
POST /api/vulkan/stats        // Get binary stats
GET  /api/vulkan/info         // Get compiler details
```

---

## 🎓 Example Code

### **Simple C Program**
```c
#include <stdio.h>

int main() {
    printf("Hello, World!");
    return 0;
}
```

### **C++ Function**
```cpp
#include <iostream>

int add(int a, int b) {
    return a + b;
}

int main() {
    std::cout << add(5, 3) << std::endl;
    return 0;
}
```

### **Python Script**
```python
def greet(name):
    return f"Hello, {name}!"

x = 10
y = 20
print(f"Sum: {x + y}")
```

---

## 🆘 Troubleshooting

### **"Compilation failed" Error**
- Check code syntax
- Verify language is correct
- Look at console tab for error details

### **Empty Output**
- Make sure to click "Compile" button
- Check if code is present in editor
- See status bar at bottom for info

### **Slow Compilation**
- Reduce code size
- Use optimize level O2 (default)
- Check system resources

### **UI Not Loading**
- Ensure server is running: `npm start`
- Check URL: `http://localhost:8000/vulkan`
- Clear browser cache
- Check browser console (F12)

---

## 📚 Documentation

- **Full API Docs**: See [VULKAN_API_DOCS.md](VULKAN_API_DOCS.md)
- **Routes & Integration**: See [VULKAN_GUI_ROUTES.md](VULKAN_GUI_ROUTES.md)
- **Route Connections**: See [VULKAN_GUI_ROUTES.md](VULKAN_GUI_ROUTES.md)

---

## 🎮 Interactive Demo

1. Go to http://localhost:8000/vulkan
2. Code already there: `example.c`
3. Click "Compile"
4. View results in right panel
5. Toggle breakpoints by clicking red area
6. Check Console tab for logs

---

## 🎯 Status

| Feature | Status |
|---------|--------|
| GUI Layout (3-part) | ✅ Complete |
| Design (glass + gradients) | ✅ Complete |
| Code Editor | ✅ Complete |
| Line Numbers | ✅ Complete |
| Breakpoints | ✅ Complete |
| File Explorer | ✅ Complete |
| Settings Panel | ✅ Complete |
| Output Console | ✅ Complete |
| API Integration | ✅ Complete |
| Routes Connected | ✅ Complete |

---

**VulkanKT IDE - Ready to Use! 🚀**
