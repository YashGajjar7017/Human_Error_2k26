# Code Engine, Background Services & Enhanced Debugger Documentation

## Overview

This documentation describes the complete code execution infrastructure, including:
1. **CodeEngine** - High-level to low-level code translation and execution
2. **BackgroundWorker** - Asynchronous task execution service
3. **EnhancedDebugger** - Advanced debugging with breakpoints and inspection

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     API Routes (codeEngine.routes.js)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
├──────────────────┬──────────────────┬──────────────────────────┤
│  Code Execution  │  Background Work │  Debug Sessions          │
│  Service         │  Service         │  Service                 │
├──────────────────┼──────────────────┼──────────────────────────┤
│                  │                  │                          │
│ • Translation    │ • Task Queue     │ • Breakpoints            │
│ • Compilation    │ • Workers        │ • Stepping               │
│ • Execution      │ • Retries        │ • Variables              │
│ • Error Handle   │ • Logging        │ • Call Stack             │
└──────────────────┴──────────────────┴──────────────────────────┘
                            │
                    System: GCC, G++, Node, Python, etc.
```

## 1. CodeEngine Service

### Location
`Backend/service/codeEngine.service.js`

### Features

#### High-Level to Low-Level Translation
- **Intermediate Representation (IR)**: Converts high-level code to IR
- **Token Analysis**: Extracts tokens, functions, and variables
- **Metadata Extraction**: Analyzes code structure

```javascript
const ir = await codeEngine.translateToIR(code, language);
// Returns:
// {
//   original: code,
//   language: 'javascript',
//   transformed: code,
//   metadata: {
//     lines: 45,
//     tokens: [...],
//     functions: ['main', 'helper'],
//     variables: ['x', 'y', 'result']
//   }
// }
```

#### Multi-Language Support
- **Compiled**: C, C++, Java, Go, Rust, TypeScript
- **Interpreted**: Python, JavaScript, Node.js, Ruby, PHP, Bash

#### Execution Pipeline
1. **Create Execution Context**: Unique session with environment
2. **Translate to IR**: Parse and analyze code
3. **Compile** (if needed): Generate executable
4. **Execute**: Run with timeout and output capture
5. **Cleanup**: Remove temporary files

### API Endpoints

#### Execute Code
```
POST /api/code-engine/execute
Content-Type: application/json

{
  "code": "console.log('Hello, World!');",
  "language": "javascript",
  "timeout": 5000,
  "stdin": "",
  "args": [],
  "env": {}
}

Response:
{
  "success": true,
  "sessionId": "session_1234567890_abc123def",
  "output": {
    "stdout": "Hello, World!",
    "stderr": "",
    "exitCode": 0,
    "timedOut": false,
    "executionTime": 245
  }
}
```

#### Translate Code to IR
```
POST /api/code-engine/translate
Content-Type: application/json

{
  "code": "function add(a, b) { return a + b; }",
  "language": "javascript"
}

Response:
{
  "success": true,
  "ir": {
    "original": "...",
    "language": "javascript",
    "metadata": {
      "lines": 1,
      "functions": ["add"],
      "variables": ["a", "b"],
      "tokens": [...]
    }
  }
}
```

#### Get Execution Status
```
GET /api/code-engine/status/:sessionId

Response:
{
  "success": true,
  "sessionId": "session_1234567890_abc123def",
  "state": "completed",
  "language": "javascript",
  "output": {
    "stdout": "Hello, World!",
    "stderr": "",
    "exitCode": 0,
    "timedOut": false,
    "executionTime": 245
  }
}
```

#### Get Active Sessions
```
GET /api/code-engine/sessions

Response:
{
  "success": true,
  "count": 3,
  "sessions": [
    {
      "id": "session_...",
      "language": "javascript",
      "state": "executing",
      "createdAt": "2026-02-11T..."
    }
  ]
}
```

#### Engine Statistics
```
GET /api/code-engine/stats

Response:
{
  "success": true,
  "engine": {
    "totalSessions": 15,
    "activeSessions": 2,
    "completedSessions": 12,
    "failedSessions": 1,
    "byLanguage": {
      "javascript": 5,
      "python": 4,
      "cpp": 3,
      "java": 2
    }
  },
  "worker": { ... }
}
```

### Usage Example

```javascript
const codeEngine = require('./service/codeEngine.service');

// Simple execution
const result = await codeEngine.executeCode(
  'console.log("Hello");',
  'javascript',
  { timeout: 5000 }
);

// With options
const result = await codeEngine.executeCode(
  `
  #include <stdio.h>
  int main() {
    printf("Hello, World!");
    return 0;
  }
  `,
  'cpp',
  {
    timeout: 10000,
    args: ['--verbose'],
    env: { DEBUG: '1' }
  }
);

// Translation only
const ir = await codeEngine.translateToIR(code, 'python');
```

## 2. BackgroundWorker Service

### Location
`Backend/service/backgroundWorker.service.js`

### Features

#### Task Queue Management
- Maximum 1000 tasks in queue
- 4 concurrent workers (configurable)
- Automatic task retry (up to 3 times default)
- Task timeout: 5 minutes

#### Task Types
1. **code-execution**: Execute user code
2. **compilation**: Compile code
3. **analysis**: Analyze code
4. **custom**: Custom handler function

#### Worker Lifecycle
- **Queued**: Task waiting in queue
- **Executing**: Currently running
- **Completed**: Successfully finished
- **Failed**: Exceeded max retries
- **Cancelled**: User cancelled

### API Endpoints

#### Queue a Task
```
POST /api/code-engine/worker/queue
Content-Type: application/json

{
  "type": "code-execution",
  "payload": {
    "code": "console.log('test');",
    "language": "javascript",
    "timeout": 5000
  },
  "maxRetries": 3
}

Response:
{
  "success": true,
  "taskId": "task_1234567890_abc123def",
  "message": "Task queued for background execution"
}
```

#### Get Task Status
```
GET /api/code-engine/worker/task/:taskId

Response:
{
  "success": true,
  "task": {
    "id": "task_...",
    "status": "completed",
    "type": "code-execution",
    "queuedAt": "...",
    "executedAt": "...",
    "completedAt": "...",
    "retries": 0
  },
  "result": {
    "success": true,
    "result": { ... },
    "executionTime": 245
  }
}
```

#### Cancel a Task
```
POST /api/code-engine/worker/task/:taskId/cancel

Response:
{
  "success": true,
  "message": "Task cancelled"
}
```

#### Worker Statistics
```
GET /api/code-engine/worker/stats

Response:
{
  "success": true,
  "stats": {
    "workers": {
      "total": 4,
      "busy": 2,
      "idle": 2
    },
    "queue": {
      "size": 15,
      "maxSize": 1000
    },
    "tasks": {
      "active": 2,
      "completed": 148,
      "total": 165
    },
    "workers": [
      {
        "id": "worker-0",
        "busy": true,
        "tasksCompleted": 42,
        "currentTask": "task_..."
      }
    ]
  },
  "recentTasks": [ ... ]
}
```

### Usage Example

```javascript
const backgroundWorker = require('./service/backgroundWorker.service');

// Queue code execution task
const taskId = await backgroundWorker.queueTask({
  type: 'code-execution',
  payload: {
    code: 'print("Processing...")',
    language: 'python',
    timeout: 10000
  },
  maxRetries: 3
});

// Monitor task
const status = backgroundWorker.getTaskStatus(taskId);
if (status.status === 'completed') {
  const result = backgroundWorker.getTaskResult(taskId);
  console.log(result);
}

// Listen for events
backgroundWorker.on('task:complete', ({ taskId, duration }) => {
  console.log(`Task ${taskId} completed in ${duration}ms`);
});
```

## 3. Enhanced Debugger Service

### Location
`Backend/service/debugger.service.js`

### Features

#### Debug Session Management
- GDB for C/C++/Go
- LLDB for Rust
- Node Inspector for JavaScript
- Python PDB for Python

#### Debugging Capabilities
- **Breakpoints**: Set/remove at file:line
- **Stepping**: Step over, step into
- **Variables**: Inspect all variables
- **Call Stack**: View function call stack
- **Watch Expressions**: Monitor expressions

### API Endpoints

#### Start Debug Session
```
POST /api/code-engine/debug/start
Content-Type: application/json

{
  "code": "#include <stdio.h>\nint main() { int x = 5; return 0; }",
  "language": "c",
  "breakpoints": [
    { "file": "main.c", "line": 2 }
  ],
  "watchExpressions": ["x"]
}

Response:
{
  "success": true,
  "sessionId": "debug_1234567890_abc123def",
  "message": "Debug session started",
  "breakpoints": [
    { "id": 1, "file": "main.c", "line": 2 }
  ]
}
```

#### Set Breakpoint
```
POST /api/code-engine/debug/:sessionId/breakpoint
Content-Type: application/json

{
  "file": "main.c",
  "line": 3
}

Response:
{
  "success": true,
  "breakpoint": {
    "id": 2,
    "file": "main.c",
    "line": 3
  }
}
```

#### Step Over
```
POST /api/code-engine/debug/:sessionId/step-over

Response:
{
  "success": true
}
```

#### Step Into
```
POST /api/code-engine/debug/:sessionId/step-into

Response:
{
  "success": true
}
```

#### Continue Execution
```
POST /api/code-engine/debug/:sessionId/continue

Response:
{
  "success": true
}
```

#### Get Variables
```
GET /api/code-engine/debug/:sessionId/variables

Response:
{
  "success": true,
  "variables": {
    "x": "5",
    "y": "10",
    "result": "15"
  },
  "count": 3
}
```

#### Get Call Stack
```
GET /api/code-engine/debug/:sessionId/call-stack

Response:
{
  "success": true,
  "callStack": [
    {
      "function": "main",
      "file": "main.c",
      "line": 2
    },
    {
      "function": "add",
      "file": "helpers.c",
      "line": 10
    }
  ],
  "currentFrame": { ... }
}
```

#### Debug Session Status
```
GET /api/code-engine/debug/:sessionId/status

Response:
{
  "success": true,
  "session": {
    "id": "debug_...",
    "language": "c",
    "state": "debugging",
    "paused": true,
    "reason": "breakpoint",
    "currentLine": 2,
    "breakpoints": [...],
    "createdAt": "..."
  }
}
```

#### Remove Breakpoint
```
DELETE /api/code-engine/debug/:sessionId/breakpoint/:breakpointId

Response:
{
  "success": true,
  "message": "Breakpoint removed"
}
```

#### Stop Debugging
```
POST /api/code-engine/debug/:sessionId/stop

Response:
{
  "success": true,
  "message": "Debug session stopped"
}
```

#### Debugger Statistics
```
GET /api/code-engine/debug/stats

Response:
{
  "success": true,
  "stats": {
    "totalSessions": 8,
    "activeSessions": 2,
    "pausedSessions": 1,
    "byLanguage": {
      "c": 3,
      "javascript": 2,
      "python": 2,
      "cpp": 1
    }
  }
}
```

### Usage Example

```javascript
const debugger = require('./service/debugger.service');

// Create debug session
const session = debugger.createDebugSession(
  '#include <stdio.h>\nint main() { int x = 5; printf("%d", x); }',
  'c',
  { breakpoints: [{ file: 'main.c', line: 3 }] }
);

// Compile with debug symbols
const compiled = await debugger.compileWithDebugSymbols(session);

// Start debugging
if (compiled.success) {
  await debugger.startDebug(session.id, compiled.executable);
  
  // Set another breakpoint
  await debugger.setBreakpoint(session.id, 'main.c', 4);
  
  // Step through
  await debugger.stepOver(session.id);
  
  // Inspect variables
  const vars = await debugger.getVariables(session.id);
  console.log('Variables:', vars);
  
  // Get call stack
  const stack = await debugger.getCallStack(session.id);
  console.log('Call stack:', stack);
  
  // Stop when done
  await debugger.stopDebug(session.id);
  await debugger.cleanupSession(session.id);
}
```

## Integration with Server

### Initialization
The services are automatically initialized when the server starts:

```javascript
// Imported in server.js
const codeEngine = require('./service/codeEngine.service');
const backgroundWorker = require('./service/backgroundWorker.service');
const debugger = require('./service/debugger.service');

// Registered in routes
app.use('/api/code-engine', codeEngineRoutes);
```

### Cleanup Schedules
- **Code Engine**: Every 30 minutes - cleans up expired sessions (>1 hour old)
- **Background Worker**: Every 1 hour - clears old completed tasks
- **Debugger**: On-demand cleanup after debug session ends

### Event Handling
Services emit events for monitoring:

```javascript
// Code Engine events
codeEngine.on('session:created', ({ sessionId, language }) => {});
codeEngine.on('compilation:success', ({ sessionId }) => {});
codeEngine.on('compilation:error', ({ sessionId, error }) => {});
codeEngine.on('execution:start', ({ sessionId }) => {});
codeEngine.on('execution:complete', ({ sessionId, exitCode, timedOut }) => {});
codeEngine.on('code:success', ({ sessionId }) => {});
codeEngine.on('code:error', ({ sessionId, error }) => {});

// Background Worker events
backgroundWorker.on('task:queued', ({ taskId, type }) => {});
backgroundWorker.on('task:start', ({ taskId, worker }) => {});
backgroundWorker.on('task:complete', ({ taskId, worker, duration }) => {});
backgroundWorker.on('task:error', ({ taskId, error }) => {});
backgroundWorker.on('task:retry', ({ taskId, attempt }) => {});

// Debugger events
debugger.on('debug:session-created', ({ sessionId, language }) => {});
debugger.on('debug:started', ({ sessionId }) => {});
debugger.on('debug:paused', ({ sessionId, reason }) => {});
debugger.on('debug:stopped', ({ sessionId }) => {});
debugger.on('debug:breakpoint-set', ({ sessionId, breakpoint }) => {});
```

## Performance Considerations

### Timeouts
- **Code Execution**: Default 30 seconds (configurable per request)
- **Background Task**: Default 5 minutes
- **Debug Session**: 10 minutes inactive timeout

### Output Limits
- **Code Execution**: 10MB per execution
- **Debug Output**: Streamed in real-time

### Resource Management
- **Temporary Files**: Cleaned up after execution
- **Session Cleanup**: Automatic after timeout
- **Memory**: Sessions stored in Maps, cleaned periodically

## Error Handling

### Compilation Errors
Detailed error messages with line numbers:
```json
{
  "success": false,
  "error": "Compilation failed",
  "errorLines": [
    {
      "file": "main.c",
      "line": 5,
      "column": 10,
      "message": "undefined reference to 'printf'"
    }
  ]
}
```

### Runtime Errors
Captured and returned with execution output:
```json
{
  "success": false,
  "errorType": "runtime",
  "error": "Division by zero",
  "output": {
    "stdout": "Starting execution...",
    "stderr": "Error: Cannot divide by zero",
    "exitCode": 1
  }
}
```

### Timeout Errors
```json
{
  "success": false,
  "errorType": "timeout",
  "error": "Execution exceeded 30000ms timeout",
  "output": {
    "stdout": "Partial output...",
    "stderr": "",
    "timedOut": true
  }
}
```

## Security Considerations

1. **Execution Isolation**: Code runs in separate processes with timeout
2. **Resource Limits**: Output size capped at 10MB per execution
3. **File System**: Isolated to temporary working directories
4. **Signal Handling**: SIGTERM then SIGKILL for timeout enforcement
5. **User Logging**: Activity logged to user's activity log

## Troubleshooting

### Code Won't Compile
- Check language specification
- Verify compiler is installed
- Check syntax errors in compilation error details

### Execution Times Out
- Increase timeout parameter
- Check for infinite loops in code
- Verify input/output operations aren't blocking

### Debugger Won't Attach
- Ensure code compiles with debug symbols (-g flag)
- Verify debugger tool is installed (gdb, lldb, etc.)
- Check process isn't exiting too quickly

### Memory Issues
- Cleanup old sessions: `DELETE /api/code-engine/session/:id`
- Monitor worker stats for stuck tasks
- Check system disk space for temporary files

## Testing

### Sample Requests

**C++ Execution:**
```bash
curl -X POST http://localhost:8000/api/code-engine/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <iostream>\nint main() { std::cout << \"Hello\"; return 0; }",
    "language": "cpp",
    "timeout": 5000
  }'
```

**Python Debugging:**
```bash
curl -X POST http://localhost:8000/api/code-engine/debug/start \
  -H "Content-Type: application/json" \
  -d '{
    "code": "x = 5\ny = 10\nprint(x + y)",
    "language": "python",
    "breakpoints": []
  }'
```

**Background Task:**
```bash
curl -X POST http://localhost:8000/api/code-engine/worker/queue \
  -H "Content-Type: application/json" \
  -d '{
    "type": "code-execution",
    "payload": {
      "code": "console.log(\"Background task\");",
      "language": "javascript"
    }
  }'
```
