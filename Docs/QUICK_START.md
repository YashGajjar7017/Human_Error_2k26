# Quick Start Guide - New Code Compiler UI

## Quick Setup (5 minutes)

### 1. Start Backend Server
```bash
cd Backend
npm install  # Only first time
npm start    # Or use: node server.js
```
Server runs on: `http://localhost:8000`

### 2. Start Frontend Server
```bash
cd Frontend
npm install  # Only first time
npm start    # Or use: nodemon index.js
```
Frontend runs on: `http://localhost:3000`

### 3. Access the Application
Open browser and go to: `http://localhost:3000`

---

## Features at a Glance

### 🎨 New Visual Design
- **VSCode-inspired dark theme** - Professional, eye-friendly
- **Glassy morphism UI** - Modern, elegant glass-effect cards
- **Animated backgrounds** - 5 floating gradient objects with smooth animations
- **Split editor layout** - Code on left, output on right (like OnlineGDB)

### ⚡ Quick Actions
| Button | Action | Shortcut |
|--------|--------|----------|
| Run | Execute code | Ctrl+Enter |
| Compile | Compile only | - |
| Download | Save code to file | - |
| Share | Share code (coming) | - |
| Clear | Clear editor | - |

### 📝 Supported Languages
- **C** (.c files)
- **C++** (.cpp files)
- **Python 3** (.py files)
- **Java** (.java files)
- **JavaScript** (.js files)
- **HTML/CSS** (.html files)

### 🎯 Key Features

**Editor:**
- Line numbering
- Tab key support for indentation
- Language-specific templates
- Auto-save (coming soon)

**Output:**
- Real-time execution results
- Error messages with line numbers
- Input/stdin support
- Execution history (for debugging)

**Navigation:**
- Quick access sidebar
- File explorer
- Tool shortcuts
- User profile menu

---

## Common Tasks

### Run C Code
1. Select "C" from language dropdown
2. Write or paste C code
3. Click "Run" button
4. See output in right panel

```c
#include<stdio.h>
int main() {
    printf("Hello, World!");
    return 0;
}
```

### Run Python Code
1. Select "Python" from dropdown
2. Paste Python code
3. Click "Run"

```python
print("Hello, World!")
name = input("Enter your name: ")
print(f"Welcome, {name}!")
```

### Provide Input
1. Type input in the "Input" text area (bottom right)
2. Click "Run"
3. Program receives input via stdin

### Download Your Code
1. Write your code
2. Click "Download" button
3. File saves with correct extension

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Tab | Indent current line |
| Ctrl+Enter | Run code |
| Ctrl+A | Select all |
| Ctrl+C | Copy |
| Ctrl+V | Paste |

---

## Troubleshooting

### **Error: "Cannot reach server"**
- Check if Backend is running: `http://localhost:8000/health`
- Check if Frontend is running: `http://localhost:3000`
- Check firewall settings

### **Code executes but no output**
- Make sure code outputs something (print, console.log, etc.)
- Check input panel is empty if program doesn't expect input
- Look at error panel for compilation errors

### **Animations are stuttering**
- Close other browser tabs
- Disable background animations in sidebar (coming soon)
- Clear browser cache
- Check GPU acceleration is enabled

### **Code won't compile**
- Check language selection matches code syntax
- Look at error message for syntax errors
- Verify all includes/imports are present

### **Logout not working**
- Clear browser cookies
- Try in incognito/private mode
- Check browser console for errors

---

## API Reference (Quick)

### Execute Code
```bash
curl -X POST http://localhost:8000/api/code-engine/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello\")",
    "language": "python",
    "input": ""
  }'
```

### Get Supported Languages
```bash
curl http://localhost:8000/api/code-engine/languages
```

### Server Health Check
```bash
curl http://localhost:8000/api/code-engine/health
```

---

## Performance Tips

1. **Faster Execution:**
   - Keep code under 1000 lines
   - Avoid infinite loops
   - Close other applications

2. **Better UX:**
   - Use Chrome/Edge for best compatibility
   - Enable hardware acceleration
   - Keep browser updated

3. **Cleaner Code:**
   - Use proper indentation
   - Add comments
   - Save frequently

---

## What's New

✨ **Major Changes from Previous Version:**
- Complete UI redesign with modern dark theme
- OnlineGDB-style split editor layout
- Animated glassy morphism background
- Enhanced code execution with multiple languages
- Better error handling and messages
- Responsive mobile design
- Session tracking for debugging
- Improved performance optimizations

🆕 **New Endpoints:**
- `/api/code-engine/execute` - Run code
- `/api/code-engine/compile` - Compile only
- `/api/code-engine/languages` - Get supported languages
- `/api/code-engine/history/{sessionId}` - Execution history
- `/Account/logout` - Logout endpoint

---

## File Locations

| File | Purpose |
|------|---------|
| `/Frontend/views/index.html` | Main page (new design) |
| `/Frontend/Public/CSS/vscode-theme.css` | Dark theme |
| `/Frontend/Public/CSS/animated-background.css` | Animations |
| `/Frontend/Public/CSS/button-animations.css` | Button effects |
| `/Backend/Routes/codeEngine.routes.js` | Code execution API |
| `IMPLEMENTATION_GUIDE_NEW.md` | Detailed documentation |

---

## Next Steps

1. **Explore the Interface:**
   - Try writing and running code
   - Switch between languages
   - Test different inputs

2. **Customize (Optional):**
   - Edit CSS files to change colors
   - Modify animation speeds
   - Add new languages

3. **Report Issues:**
   - Check browser console for errors
   - Test in different browser
   - Check server logs

---

## System Requirements

**Minimum:**
- 2GB RAM
- Node.js 14+
- Modern browser

**Recommended:**
- 4GB RAM
- Node.js 16+
- Chrome/Edge/Firefox (latest)
- GPU with hardware acceleration

---

## Support

For issues or questions:
1. Check browser console (F12)
2. Check server logs
3. Read `IMPLEMENTATION_GUIDE_NEW.md` for detailed info
4. Check `/api/code-engine/health` endpoint

---

**Version:** 2.0
**Date:** April 2026
**Status:** ✅ Ready to Use
