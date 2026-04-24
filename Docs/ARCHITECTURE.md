# System Architecture - Code Compiler 2026

## Overall System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                            │
│                    http://localhost:3000                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Frontend HTML/CSS/JavaScript                     │   │
│  │                                                           │   │
│  │  index.html                                              │   │
│  │  ├─ VSCode Dark Theme (vscode-theme.css)                │   │
│  │  ├─ Animated Background (animated-background.css)       │   │
│  │  ├─ Button Animations (button-animations.css)           │   │
│  │  └─ JavaScript:                                          │   │
│  │     ├─ Code Editor (with line numbers)                  │   │
│  │     ├─ Language Selector                                │   │
│  │     ├─ API Calls to Backend                             │   │
│  │     └─ Output Display                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Frontend Server (Express.js on port 3000)              │    │
│  │                                                         │    │
│  │  Routes:                                               │    │
│  │  ├─ GET / → index.html                                │    │
│  │  ├─ GET /Account/logout                               │    │
│  │  ├─ POST /api/* → Proxy to Backend (port 8000)        │    │
│  │  └─ All other routes...                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────┬──────────────────────────────────────┘
                          │
                          │ HTTP/JSON
                          │ API Requests
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND SERVER                                  │
│              http://localhost:8000                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │       Express.js API Server (port 8000)                 │   │
│  │                                                           │   │
│  │  API Routes:                                             │   │
│  │  ├─ /api/code-engine/execute → Compile & Run Code      │   │
│  │  ├─ /api/code-engine/compile → Compile Only            │   │
│  │  ├─ /api/code-engine/languages → Get Language List     │   │
│  │  ├─ /api/code-engine/history/:id → Execution History   │   │
│  │  └─ /api/* → Other routes...                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                        │
│              ┌───────────┴───────────┐                           │
│              │                       │                           │
│              ▼                       ▼                           │
│   ┌──────────────────┐    ┌──────────────────┐                 │
│   │  Code Engine     │    │   Session/Auth   │                 │
│   │   Service        │    │   Management     │                 │
│   │                  │    │                  │                 │
│   │ Execution:       │    │ Routes:          │                 │
│   │ - Write temp     │    │ - Login          │                 │
│   │ - Compile        │    │ - Logout         │                 │
│   │ - Run (spawn)    │    │ - Dashboard      │                 │
│   │ - Capture output │    │ - Profile        │                 │
│   │ - Cleanup        │    │ - Settings       │                 │
│   └──────────────────┘    └──────────────────┘                 │
│              │                       │                           │
│              └───────────┬───────────┘                           │
│                          │                                        │
│                          ▼                                        │
│            ┌──────────────────────────┐                         │
│            │   System Resources       │                         │
│            │                          │                         │
│            │  ├─ File System          │                         │
│            │  │  └─ /tmp/code-exec/   │                         │
│            │  ├─ Child Processes      │                         │
│            │  │  ├─ gcc/g++           │                         │
│            │  │  ├─ python3           │                         │
│            │  │  ├─ java/javac        │                         │
│            │  │  └─ node              │                         │
│            │  ├─ Memory               │                         │
│            │  │  └─ Session History   │                         │
│            │  └─ Time                 │                         │
│            │     └─ 5sec timeout      │                         │
│            └──────────────────────────┘                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Request/Response Flow

### 1. User Runs Code

```
Browser                     Frontend Server            Backend Server         System
  │                               │                          │                 │
  │──Write Code──────────────────►│                          │                 │
  │                               │                          │                 │
  │◄──Display in Editor───────────│                          │                 │
  │                               │                          │                 │
  │──Click Run───────────────────►│                          │                 │
  │                               │                          │                 │
  │                               │──POST /api/code-engine───►│                 │
  │                               │   /execute               │                 │
  │                               │   { code, lang, input }  │                 │
  │                               │                          │                 │
  │                               │                          │──Write temp file──►│
  │                               │                          │                 │
  │                               │                          │──Compile────────►│
  │                               │                          │                 │
  │                               │                          │──Execute────────►│
  │                               │                          │  (with timeout)  │
  │                               │                          │                 │
  │                               │                          │◄──Capture output─│
  │                               │                          │                 │
  │                               │◄──{ success, output }────│                 │
  │                               │                          │──Cleanup────────►│
  │◄──Display Output──────────────│                          │                 │
  │   (green=success,             │                          │                 │
  │    red=error)                 │                          │                 │
```

### 2. Execution Process (Detailed)

```
POST /api/code-engine/execute
│
├─ Validate Input
│  ├─ Check code exists
│  ├─ Check language supported
│  └─ Check input size < 1MB
│
├─ Generate Session ID (unique identifier)
│
├─ Create Temp File
│  ├─ Path: /tmp/code-execution/temp_{sessionId}.{ext}
│  └─ Write code to file
│
├─ Compile (if needed)
│  ├─ C/C++: gcc/g++ -o {binary} {file}
│  ├─ Java: javac {file}
│  └─ Python/JS: Skip (interpreted)
│
├─ Execute
│  ├─ Spawn child process
│  ├─ Pass input via stdin
│  ├─ Set timeout: 5 seconds
│  ├─ Capture stdout
│  ├─ Capture stderr
│  └─ Get exit code
│
├─ Store in History
│  └─ Map[sessionId] = { code, output, error, exitCode }
│
├─ Cleanup
│  ├─ Delete temp source file
│  ├─ Delete compiled binary
│  └─ Release process resources
│
└─ Return Response
   ├─ success: boolean
   ├─ output: string
   ├─ error: string
   ├─ exitCode: number
   ├─ type: 'success|compile_error|runtime_error|system_error'
   ├─ sessionId: string
   └─ timestamp: ISO8601
```

## Data Flow

### Frontend to Backend Flow

1. **User Input:**
   - Code written in textarea
   - Language selected from dropdown
   - Input provided in stdin panel

2. **Serialization:**
   - JavaScript collects data
   - Converts to JSON
   - Sends via HTTP POST

3. **API Call:**
   - URL: `POST /api/code-engine/execute`
   - Headers: `Content-Type: application/json`
   - Body: `{ code, language, input }`

4. **Backend Processing:**
   - Receives request
   - Validates parameters
   - Executes code
   - Sends back response

5. **Frontend Display:**
   - Receives JSON response
   - Parses output
   - Displays with proper formatting
   - Shows errors if any

### Language-Specific Workflows

#### C/C++ Workflow
```
source.c/cpp → gcc/g++ → binary → Execute → Output
                ↓ (error)
            Compilation Error
```

#### Python Workflow
```
source.py → Python Interpreter → Output
           ↓ (error)
       Runtime Error
```

#### Java Workflow
```
source.java → javac → .class → java → Output
            ↓ (error)
        Compilation Error
```

#### JavaScript Workflow
```
source.js → Node.js → Output
         ↓ (error)
     Runtime Error
```

## Component Responsibilities

### Frontend (port 3000)

| Component | Responsibility |
|-----------|---|
| index.html | UI structure, form inputs |
| vscode-theme.css | Dark theme styling |
| animated-background.css | Animations, glassy effects |
| button-animations.css | Interactive button effects |
| JavaScript | API calls, DOM updates, events |

### Backend (port 8000)

| Component | Responsibility |
|-----------|---|
| codeEngine.routes.js | Route definitions |
| Code Execution | Compile and run user code |
| Session Management | Track execution history |
| Error Handling | Validate and respond with errors |
| Cleanup | Remove temporary files |

### System Resources

| Resource | Usage |
|----------|---|
| Temp Directory | Store code files during execution |
| Child Processes | Run compilers and interpreters |
| Memory | Store execution history |
| Time | Enforce 5-second timeout |

## Security Measures

### 1. Input Validation
```javascript
// Check code exists and language is valid
if (!code || !LANGUAGE_CONFIG[language]) {
    return error();
}
```

### 2. Sandboxed Execution
```javascript
// Run in temp directory, not application directory
cwd: TEMP_DIR
```

### 3. Timeout Protection
```javascript
// Kill process after 5 seconds
timeout: 5000
```

### 4. Resource Limits
```javascript
// Limit output buffer size
maxBuffer: 1024 * 1024  // 1MB
```

### 5. Cleanup
```javascript
// Always remove temp files
fs.unlinkSync(filePath);
fs.unlinkSync(exePath);
```

## Error Handling

### Error Types

1. **Validation Error** (400)
   - Missing code or language
   - Unsupported language

2. **Compile Error** (200 with success:false)
   - Syntax errors
   - Missing includes/imports
   - Type errors

3. **Runtime Error** (200 with success:false)
   - Division by zero
   - Null pointer exception
   - Timeout exceeded
   - Segmentation fault

4. **System Error** (500)
   - File system error
   - Process spawn failure
   - Resource exhaustion

## Performance Considerations

### Optimization

1. **Async Processing:**
   - Non-blocking API calls
   - Promises/async-await
   - Spawn processes instead of exec

2. **Resource Management:**
   - Immediate cleanup
   - History limit (prevent memory leak)
   - Process timeout

3. **Frontend:**
   - CSS animations use GPU
   - Lazy loading
   - Debounced input

### Limits

| Aspect | Limit |
|--------|---|
| Execution Time | 5 seconds |
| Output Size | 1 MB |
| Input Size | 1 MB |
| Code Size | No limit (OS dependent) |
| History Items | In-memory (unbounded, manual clear) |

## Scalability

### Current Implementation
- Single-threaded Node.js
- In-memory history
- Suitable for: Single user or small teams

### Future Improvements
- Cluster mode for multiple cores
- Redis for session persistence
- Queue for concurrent executions
- Load balancer for scaling

## Dependencies

### Backend
- `express` - Web framework
- `child_process` - Code execution
- `fs` - File management
- `crypto` - Session IDs
- `os` - Temp directory

### Frontend
- `express` - Serve frontend
- `http-proxy-middleware` - API proxy
- `express-session` - Session management

## Integration Points

### What Communicates

1. **Browser ↔ Frontend Server:**
   - Static files (HTML, CSS, JS)
   - API routes (Account, Dashboard, etc.)

2. **Frontend Server ↔ Backend Server:**
   - `/api/*` routes proxied to port 8000
   - Code execution requests
   - Authentication requests

3. **Backend Server ↔ System:**
   - Spawns compiler/interpreter processes
   - Reads/writes temp files
   - Manages system resources

### What Doesn't Communicate

- Browser doesn't directly access Backend
- Frontend doesn't execute code locally
- Backend doesn't directly access Frontend DB

---

## Deployment Notes

### Development
```bash
# Terminal 1: Backend
cd Backend && npm start

# Terminal 2: Frontend
cd Frontend && npm start

# Open http://localhost:3000
```

### Production
- Use production-ready Node.js process manager (PM2)
- Use reverse proxy (Nginx) with load balancing
- Use environment variables for configuration
- Use clustering for multi-core usage
- Add monitoring and logging

---

**Architecture Version:** 2.0
**Last Updated:** April 2026
**Status:** Production Ready
