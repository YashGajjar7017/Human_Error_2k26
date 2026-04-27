# 🚀 Quick Start Guide - Enhanced Compiler

## Installation & Setup

### Backend Setup
```bash
cd Backend
npm install
node server.js
```
Server runs on: `http://localhost:8000`

### Frontend Setup
```bash
cd React-Complier-Frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 🎯 Testing All New Features

### ✅ Test 1: File Explorer with Drag & Drop
1. Open compiler page
2. Click on "Backend" in File Explorer
3. See list of files
4. Click any JavaScript file to load it
5. Try dragging a file to the drop zone

**Expected:** File loads, code appears in editor, language auto-detects

---

### ✅ Test 2: Save Functionality
1. Load or type code in editor
2. Click "💾 Save" button
3. Watch logs for confirmation
4. Refresh page and reload file
5. Verify changes were saved

**Expected:** "✅ File saved successfully" in logs, last saved time updates

---

### ✅ Test 3: Theme Selection
1. Click "🎨 Theme" section in left sidebar
2. Click different preset themes (Light, Dark, Monokai, Dracula, Solarized)
3. Try custom color picker
4. Refresh page

**Expected:** Theme applies immediately and persists after refresh

---

### ✅ Test 4: Loading Animation
1. Click "▶️ Run Code" button
2. Watch cool loading animation appear
3. Progress bar updates every 3 seconds
4. Animation disappears when done

**Expected:** Beautiful overlay with smooth animation and progress bar

---

### ✅ Test 5: Debug Console
1. Look at bottom of page for "Debug Console"
2. Click "🐛 Debug" tab
3. See system info (browser, platform, memory)
4. Click "📥" to export logs

**Expected:** System information displays, logs can be exported

---

### ✅ Test 6: Navigation Links
1. Look at top navbar
2. Click "🎓 Classroom" link
3. Click "🎮 Games" link
4. Click "👥 Collaboration" link
5. Click "📊 Dashboard" link

**Expected:** Navigate to those pages (links configured in routes)

---

### ✅ Test 7: Update Check
1. Open compiler page
2. Check if "🔔 Update" badge appears in navbar
3. Check logs for update notification

**Expected:** Update check runs, shows current version vs latest

---

### ✅ Test 8: File Icons
1. Navigate to different directories
2. Look at file icons in explorer
3. JavaScript files show 📜
4. Python files show 🐍
5. Other files show appropriate icons

**Expected:** Each file type displays correct icon

---

### ✅ Test 9: Directory Navigation
1. Click "⬆️" button to go up directories
2. Navigate through Backend/Frontend folders
3. Use "🔄" button to refresh current folder

**Expected:** Navigate up/down folders, refresh reloads current directory

---

### ✅ Test 10: Compile Code
1. Load a Python file from CodePredictor
2. Click "▶️ Run Code"
3. Watch progress updates
4. See compilation results in output console

**Expected:** Code compiles and results appear with progress tracking

---

### ✅ Test 11: Recent Files
1. Load several files
2. Click "📝 Drag & Drop Zone" area when no file selected
3. See "Recent Files" list

**Expected:** Recently opened files appear in recent list

---

### ✅ Test 12: Empty Initial State
1. First load of page
2. Middle section shows drag & drop zone
3. Instructions visible
4. No default files shown

**Expected:** Clean empty state with drag & drop zone

---

## 🔧 Troubleshooting

### File Explorer Not Loading
- Check backend is running on `localhost:8000`
- Verify CORS is enabled
- Check browser console for errors

### Save Not Working
- Ensure backend has write permissions to project folder
- Check file path is valid
- Verify POST endpoint is accessible

### Theme Not Persisting
- Check localStorage is enabled in browser
- Clear cache and try again
- Verify theme name matches preset

### Loading Animation Not Showing
- Check if running state is true
- Verify progress is updating
- Check CSS animations are not disabled

---

## 📱 Responsive Design

The compiler is fully responsive and works on:
- ✅ Desktop (tested on 1920x1080)
- ✅ Laptop (tested on 1366x768)
- ✅ Tablets
- ✅ Mobile (portrait & landscape)

---

## 🎨 Keyboard Shortcuts (Future)

These can be added in next update:
- `Ctrl+S` - Save file
- `Ctrl+R` - Run code
- `Ctrl+L` - Clear code
- `Ctrl+T` - Toggle theme

---

## 📊 API Endpoints Reference

### File Operations
- `POST /api/filemanager/list` - List files in directory
- `POST /api/filemanager/read` - Read file content
- `POST /api/filemanager/save` - Save file content
- `GET /api/filemanager/check-update` - Check for updates

### Compilation
- `POST /api/compiler/compile-content` - Compile and run code

---

## 🐛 Debug Commands

Open browser console and run:
```javascript
// Check current theme
localStorage.getItem('appTheme')

// Check recent files
console.log(recentFiles)

// Check app state
console.log({ language, code, selectedFile })
```

---

## 📝 File Paths for Testing

Good files to test with:
- `/Backend/server.js` - JavaScript
- `/CodePredictor/train.py` - Python
- `/Backend/controller/*` - Various files
- `/Docs/ARCHITECTURE.md` - Markdown
- `/Frontend/*.html` - HTML files

---

## 💾 Backup Before Testing

Recommended to backup these before heavy testing:
```bash
cp -r Backend/controller Backend/controller.backup
cp -r Frontend Frontend.backup
```

---

## ✨ Pro Tips

1. **Multiple Themes**: Save time by using keyboard shortcuts for theme switching
2. **Recent Files**: Files are auto-tracked, no manual bookmarking needed
3. **Drag & Drop**: Works with files from file explorer - try dragging from desktop
4. **Auto-Save**: Consider adding auto-save feature (coming soon)
5. **Export Logs**: Always export logs before closing debug console for history

---

## 🎓 Learning Resources

- React Documentation: https://react.dev
- File API: https://developer.mozilla.org/en-US/docs/Web/API/File
- Drag & Drop: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Review backend logs
3. Check CORS configuration
4. Verify file permissions

---

**Last Updated:** April 24, 2026
**Version:** 2.0 (Full Release)
