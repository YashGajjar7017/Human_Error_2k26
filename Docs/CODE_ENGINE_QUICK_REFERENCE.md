# Code Engine Quick Reference Card

## 🚀 Quick API Reference

### Code Execution
```
POST /api/code-engine/execute
{
  "code": "console.log('hello')",
  "language": "javascript",
  "timeout": 5000
}
→ { success, sessionId, output: {stdout, stderr, exitCode} }
```

### Code Translation
```
POST /api/code-engine/translate
{
  "code": "...",
  "language": "javascript"
}
→ { success, ir: {metadata, functions, variables} }
```

### Background Tasks
```
POST /api/code-engine/worker/queue
{
  "type": "code-execution",
  "payload": { "code": "...", "language": "javascript" }
}
→ { success, taskId }

GET /api/code-engine/worker/task/:taskId
→ { task: {status, type}, result: {success, output} }
```

### Debugging
```
POST /api/code-engine/debug/start
{
  "code": "...",
  "language": "c",
  "breakpoints": [{file: "main.c", line: 2}]
}
→ { sessionId, breakpoints }

POST /api/code-engine/debug/:sessionId/breakpoint
{ "file": "main.c", "line": 3 }
→ { breakpoint: {id, file, line} }

GET /api/code-engine/debug/:sessionId/variables
→ { variables: {x: "5", y: "10"} }

GET /api/code-engine/debug/:sessionId/call-stack
→ { callStack: [{function, file, line}] }

POST /api/code-engine/debug/:sessionId/step-over
POST /api/code-engine/debug/:sessionId/step-into
POST /api/code-engine/debug/:sessionId/continue
→ { success }
```

---

## 📊 Supported Languages

| Language | Type | Compiler/Runtime | Debug Support |
|----------|------|------------------|---------------|
| C | Compiled | GCC | GDB |
| C++ | Compiled | G++ | GDB |
| Java | Compiled | javac | Limited |
| Python | Interpreted | python3 | PDB |
| JavaScript | Interpreted | node | Inspector |
| TypeScript | Compiled | tsc | Node |
| Go | Compiled | go | GDB |
| Rust | Compiled | rustc | LLDB |
| Ruby | Interpreted | ruby | Limited |
| PHP | Interpreted | php | Limited |
| Bash | Interpreted | bash | Limited |

---

## 🎯 Common Use Cases

### Simple Code Execution
```javascript
const result = await fetch('/api/code-engine/execute', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    code: 'console.log("Hello");',
    language: 'javascript',
    timeout: 5000
  })
});
const {output} = await result.json();
console.log(output.stdout); // "Hello"
```

### Async Task Queue
```javascript
// Queue
const taskResp = await fetch('/api/code-engine/worker/queue', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    type: 'code-execution',
    payload: {code: 'print("task")', language: 'python'}
  })
});
const {taskId} = await taskResp.json();

// Poll status
while(true) {
  const status = await fetch(`/api/code-engine/worker/task/${taskId}`);
  const {task} = await status.json();
  if(task.status === 'completed') break;
  await new Promise(r => setTimeout(r, 1000));
}
```

### Debug Workflow
```javascript
// Start
const debugResp = await fetch('/api/code-engine/debug/start', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    code: 'int x = 5; printf("%d", x);',
    language: 'c'
  })
});
const {sessionId} = await debugResp.json();

// Set breakpoint
await fetch(`/api/code-engine/debug/${sessionId}/breakpoint`, {
  method: 'POST',
  body: JSON.stringify({file: 'main.c', line: 1})
});

// Inspect
const vars = await fetch(`/api/code-engine/debug/${sessionId}/variables`);

// Stop
await fetch(`/api/code-engine/debug/${sessionId}/stop`, {method: 'POST'});
```

---

## 🔧 Configuration

### Change Worker Count
```javascript
// In backgroundWorker.service.js
const worker = new BackgroundWorker({
  maxWorkers: 8,           // Default: 4
  maxQueueSize: 2000,      // Default: 1000
  taskTimeout: 600000      // Default: 300000 (5 min)
});
```

### Change Execution Timeout
```javascript
// Per execution
POST /api/code-engine/execute
{
  "code": "...",
  "language": "javascript",
  "timeout": 10000  // 10 seconds
}
```

### Change Output Limit
```javascript
// In codeEngine.service.js
this.maxOutputSize = 20 * 1024 * 1024; // 20MB (default: 10MB)
```

---

## 📈 Monitoring

### Real-Time Statistics
```bash
# Engine stats
curl http://localhost:8000/api/code-engine/stats

# Worker stats  
curl http://localhost:8000/api/code-engine/worker/stats

# Debugger stats
curl http://localhost:8000/api/code-engine/debug/stats
```

### Check Active Sessions
```bash
curl http://localhost:8000/api/code-engine/sessions
```

### Server Log Indicators
```
✅ Code Engine: Execution success - session_...
❌ Code Engine: Execution failed - session_...: error
✅ Worker: Task completed - task_... (245ms)
❌ Worker: Task failed - task_...: error
🐛 Debugger: Session started - debug_...
⏸️  Debugger: Paused - debug_... (breakpoint)
```

---

## ⚠️ Common Errors & Fixes

| Error | Cause | Solution |
|-------|-------|----------|
| "Language not supported" | Invalid language | Check supported languages list |
| "Compilation failed" | Syntax error | Check code syntax |
| "Timeout" | Code too slow/infinite loop | Increase timeout or fix code |
| "Session not found" | Session expired | Sessions expire after 1 hour |
| "Task cancelled" | User cancelled | Requeue task |
| "Debugger error" | Compiler not installed | Install GCC, G++, etc. |
| "File not found" | Debug file missing | Ensure compilation succeeded |

---

## 🔐 Security Features

- ✅ Process isolation (separate process per execution)
- ✅ Timeout enforcement (SIGTERM → SIGKILL)
- ✅ Output size limits (10MB per execution)
- ✅ Temporary file cleanup (automatic)
- ✅ Resource limiting (CPU, memory via process limits)
- ✅ Activity logging (user execution history)

---

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "sessionId": "session_...",
  "output": {
    "stdout": "output text",
    "stderr": "",
    "exitCode": 0,
    "timedOut": false,
    "executionTime": 245
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Compilation failed",
  "errorType": "compilation|runtime|timeout|engine",
  "details": "error message"
}
```

---

## 🧹 Cleanup

### Manual Session Cleanup
```bash
DELETE /api/code-engine/session/:sessionId
```

### Automatic Cleanup Schedules
- Code Engine: Every 30 minutes (expires >1 hour)
- Worker: Every 1 hour (clears old tasks)
- Debug: On stop/end of session

---

## 📊 Performance Metrics

### Typical Execution Times
- JavaScript: 50-200ms
- Python: 100-300ms
- C/C++: Compile 500-2000ms, Execute 50-200ms
- Java: Compile 1000-3000ms, Execute 100-500ms

### Typical Queue Times
- Fast execution: <100ms queue wait
- During peak: 1-5 seconds queue wait
- With 4 workers: 100+ concurrent tasks possible

### Memory Usage (per session)
- Typical: 5-20MB
- Large code: 50-200MB
- Max limit: Available system memory

---

## 🔗 Integration Example

```javascript
// Complete workflow
async function executeAndDebugCode(code, language) {
  // 1. Execute to verify
  const execResp = await fetch('/api/code-engine/execute', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({code, language, timeout: 5000})
  });
  
  if (!execResp.ok) {
    const {error} = await execResp.json();
    console.error('Execution failed:', error);
    return;
  }
  
  const execData = await execResp.json();
  console.log('Output:', execData.output.stdout);
  
  // 2. If debugging needed
  const debugResp = await fetch('/api/code-engine/debug/start', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({code, language})
  });
  
  const {sessionId} = await debugResp.json();
  
  // 3. Inspect variables
  const varsResp = await fetch(
    `/api/code-engine/debug/${sessionId}/variables`
  );
  const {variables} = await varsResp.json();
  console.log('Variables:', variables);
  
  // 4. Cleanup
  await fetch(`/api/code-engine/debug/${sessionId}/stop`, {
    method: 'POST'
  });
}
```

---

## 🚨 Debugging Tips

1. **Check Server Logs**: Most errors logged with timestamps
2. **Use Status Endpoint**: GET `/api/code-engine/status/:sessionId`
3. **Monitor Worker**: GET `/api/code-engine/worker/stats`
4. **Test Compilers**: Run `gcc --version`, `python --version`, etc.
5. **Check Permissions**: Ensure temp directories are writable
6. **Memory Pressure**: Check available system memory
7. **File Cleanup**: Manually delete `Backend/temp/` if full

---

## 📚 File Structure

```
Backend/
├── service/
│   ├── codeEngine.service.js      (Core execution)
│   ├── backgroundWorker.service.js (Task queue)
│   └── debugger.service.js         (Debug sessions)
├── Routes/
│   └── codeEngine.routes.js        (API endpoints)
└── server.js                       (Integration)

Docs/
├── CODE_ENGINE_COMPLETE_GUIDE.md   (Full docs)
├── CODE_ENGINE_IMPLEMENTATION_SUMMARY.md (Overview)
├── CODE_ENGINE_TESTING_GUIDE.md    (Test cases)
└── CODE_ENGINE_QUICK_REFERENCE.md  (This file)
```

---

## 🔄 Workflow Diagrams

### Code Execution Flow
```
Code Input
    ↓
Create Context
    ↓
Translate to IR
    ↓
Compile (if needed)
    ↓
Execute with Timeout
    ↓
Capture Output
    ↓
Cleanup Temp Files
    ↓
Return Result
```

### Task Queue Flow
```
Queue Task
    ↓
Wait for Worker
    ↓
Execute Task
    ↓
On Error: Retry (max 3x)
    ↓
Log Result
    ↓
Cleanup Session
    ↓
Return Result
```

### Debug Workflow
```
Start Debug
    ↓
Compile with -g
    ↓
Attach Debugger
    ↓
Set Breakpoints
    ↓
Run to Breakpoint
    ↓
Inspect Variables
    ↓
Step/Continue
    ↓
Stop & Cleanup
```

---

## 💡 Pro Tips

1. **Reuse Sessions**: Use session IDs to check results later
2. **Batch Operations**: Queue multiple tasks instead of sequential
3. **Stream Large Output**: Use polling for long-running tasks
4. **Set Realistic Timeouts**: Account for compilation + execution
5. **Monitor Worker Queue**: Scale workers based on queue depth
6. **Clean Old Sessions**: Periodic cleanup prevents memory leaks
7. **Cache Compiled Code**: Reuse executables when possible
8. **Log Activities**: Track execution history for analysis

---

## 🆘 Support Resources

- Full Guide: `CODE_ENGINE_COMPLETE_GUIDE.md`
- Testing: `CODE_ENGINE_TESTING_GUIDE.md`
- Implementation: `CODE_ENGINE_IMPLEMENTATION_SUMMARY.md`
- API Docs: Auto-generated at GET `/api/code-engine`
- Server Health: GET `/health`

---

**Last Updated**: February 11, 2026
**Version**: 1.0 Complete
