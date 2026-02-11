# Code Engine Testing Guide

## Overview
Complete testing scenarios for the Code Engine, Background Worker, and Enhanced Debugger services.

## Prerequisites
- Node.js running on port 8000
- Required compilers: GCC, G++, Python, Node.js
- Optional: GDB (for C/C++ debugging)

## Test Suite 1: Code Execution Engine

### Test 1.1: JavaScript Execution
```bash
curl -X POST http://localhost:8000/api/code-engine/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log(\"Hello from JavaScript\");\nconsole.log(2 + 3);",
    "language": "javascript"
  }'
```
Expected: Success with output containing "Hello from JavaScript" and "5"

### Test 1.2: Python Execution
```bash
curl -X POST http://localhost:8000/api/code-engine/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Python execution\")\nfor i in range(3):\n    print(i)",
    "language": "python"
  }'
```
Expected: Success with output "Python execution" followed by 0, 1, 2

### Test 1.3: C++ Compilation and Execution
```bash
curl -X POST http://localhost:8000/api/code-engine/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <iostream>\nint main() {\n  std::cout << \"C++ Output\";\n  return 0;\n}",
    "language": "cpp"
  }'
```
Expected: Success with "C++ Output"

### Test 1.4: C Execution
```bash
curl -X POST http://localhost:8000/api/code-engine/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <stdio.h>\nint main() {\n  printf(\"C Program\");\n  return 0;\n}",
    "language": "c"
  }'
```
Expected: Success with "C Program"

### Test 1.5: Timeout Handling
```bash
curl -X POST http://localhost:8000/api/code-engine/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "while(true) { }",
    "language": "javascript",
    "timeout": 2000
  }'
```
Expected: Error with "timedOut": true in response

### Test 1.6: Compilation Error Handling
```bash
curl -X POST http://localhost:8000/api/code-engine/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <stdio.h>\nint main() {\n  int x = \"invalid\";\n  return 0;\n}",
    "language": "c"
  }'
```
Expected: Error response with compilation error details

### Test 1.7: Code Translation to IR
```bash
curl -X POST http://localhost:8000/api/code-engine/translate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function add(a, b) { return a + b; }\nfunction multiply(x, y) { return x * y; }",
    "language": "javascript"
  }'
```
Expected: IR with functions ["add", "multiply"], 2 lines, tokens count > 0

### Test 1.8: Status Check
```bash
# First, execute and get sessionId from response
sessionId="session_1234567890_abc123"

curl -X GET http://localhost:8000/api/code-engine/status/$sessionId
```
Expected: JSON with session state and output

### Test 1.9: Active Sessions
```bash
curl -X GET http://localhost:8000/api/code-engine/sessions
```
Expected: Array of active sessions with their IDs and languages

### Test 1.10: Engine Statistics
```bash
curl -X GET http://localhost:8000/api/code-engine/stats
```
Expected: Statistics showing total sessions, by language breakdown

---

## Test Suite 2: Background Worker Service

### Test 2.1: Queue Code Execution Task
```bash
curl -X POST http://localhost:8000/api/code-engine/worker/queue \
  -H "Content-Type: application/json" \
  -d '{
    "type": "code-execution",
    "payload": {
      "code": "console.log(\"Background task 1\");",
      "language": "javascript"
    },
    "maxRetries": 3
  }'
```
Expected: Success with taskId in response

### Test 2.2: Get Task Status (Queued)
```bash
# Use taskId from Test 2.1
curl -X GET http://localhost:8000/api/code-engine/worker/task/task_1234567890_abc123
```
Expected: Task with status "queued" or "executing"

### Test 2.3: Multiple Task Queueing (Load Test)
```bash
#!/bin/bash
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/code-engine/worker/queue \
    -H "Content-Type: application/json" \
    -d "{
      \"type\": \"code-execution\",
      \"payload\": {
        \"code\": \"console.log('Task $i')\",
        \"language\": \"javascript\"
      }
    }" &
done
wait
```
Expected: All tasks queued and processed

### Test 2.4: Wait for Task Completion
```bash
# Poll until status is "completed"
taskId="task_..."
while true; do
  status=$(curl -s http://localhost:8000/api/code-engine/worker/task/$taskId | jq -r '.task.status')
  if [ "$status" = "completed" ]; then
    echo "Task completed"
    break
  fi
  sleep 1
done
```

### Test 2.5: Get Task Result
```bash
curl -X GET http://localhost:8000/api/code-engine/worker/task/task_1234567890_abc123
```
Expected: Result with success status and execution output

### Test 2.6: Cancel Queued Task
```bash
# Queue a task and cancel before execution
taskId="task_..."
curl -X POST http://localhost:8000/api/code-engine/worker/task/$taskId/cancel
```
Expected: Success if task was queued, error if already executing

### Test 2.7: Worker Statistics
```bash
curl -X GET http://localhost:8000/api/code-engine/worker/stats
```
Expected: Stats with workers info, queue size, active tasks

### Test 2.8: Task Retry Logic
```bash
curl -X POST http://localhost:8000/api/code-engine/worker/queue \
  -H "Content-Type: application/json" \
  -d '{
    "type": "code-execution",
    "payload": {
      "code": "process.exit(1)",
      "language": "javascript"
    },
    "maxRetries": 3
  }'
```
Expected: Task retried 3 times before failing

---

## Test Suite 3: Enhanced Debugger Service

### Test 3.1: Start Debug Session (C)
```bash
curl -X POST http://localhost:8000/api/code-engine/debug/start \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <stdio.h>\nint main() {\n  int x = 5;\n  int y = 10;\n  printf(\"%d\", x + y);\n  return 0;\n}",
    "language": "c",
    "breakpoints": []
  }'
```
Expected: Success with sessionId

### Test 3.2: Start Debug Session (JavaScript)
```bash
curl -X POST http://localhost:8000/api/code-engine/debug/start \
  -H "Content-Type: application/json" \
  -d '{
    "code": "let x = 5;\nlet y = 10;\nconsole.log(x + y);",
    "language": "javascript"
  }'
```
Expected: Success with sessionId

### Test 3.3: Set Breakpoint
```bash
sessionId="debug_..."
curl -X POST http://localhost:8000/api/code-engine/debug/$sessionId/breakpoint \
  -H "Content-Type: application/json" \
  -d '{
    "file": "main.c",
    "line": 3
  }'
```
Expected: Success with breakpoint ID

### Test 3.4: Get Debug Session Status
```bash
curl -X GET http://localhost:8000/api/code-engine/debug/$sessionId/status
```
Expected: Session details with language, state, breakpoints

### Test 3.5: Inspect Variables
```bash
curl -X GET http://localhost:8000/api/code-engine/debug/$sessionId/variables
```
Expected: Object with variable names and values

### Test 3.6: Get Call Stack
```bash
curl -X GET http://localhost:8000/api/code-engine/debug/$sessionId/call-stack
```
Expected: Array of call stack frames with function names and line numbers

### Test 3.7: Step Over
```bash
curl -X POST http://localhost:8000/api/code-engine/debug/$sessionId/step-over
```
Expected: Success response

### Test 3.8: Step Into
```bash
curl -X POST http://localhost:8000/api/code-engine/debug/$sessionId/step-into
```
Expected: Success response

### Test 3.9: Continue Execution
```bash
curl -X POST http://localhost:8000/api/code-engine/debug/$sessionId/continue
```
Expected: Success response

### Test 3.10: Remove Breakpoint
```bash
breakpointId=1
curl -X DELETE http://localhost:8000/api/code-engine/debug/$sessionId/breakpoint/$breakpointId
```
Expected: Success if breakpoint existed

### Test 3.11: Stop Debug Session
```bash
curl -X POST http://localhost:8000/api/code-engine/debug/$sessionId/stop
```
Expected: Success with cleanup message

### Test 3.12: Debugger Statistics
```bash
curl -X GET http://localhost:8000/api/code-engine/debug/stats
```
Expected: Stats with session counts by language

---

## Integration Tests

### Test 4.1: Full Execution Pipeline
```bash
# 1. Translate code to IR
IR=$(curl -s -X POST http://localhost:8000/api/code-engine/translate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "let x = 5; console.log(x * 2);",
    "language": "javascript"
  }')

# 2. Execute the code
EXEC=$(curl -s -X POST http://localhost:8000/api/code-engine/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "let x = 5; console.log(x * 2);",
    "language": "javascript"
  }')

# 3. Check status
SESSION_ID=$(echo $EXEC | jq -r '.sessionId')
curl -s http://localhost:8000/api/code-engine/status/$SESSION_ID | jq '.'
```

### Test 4.2: Background Task with Monitoring
```bash
# 1. Queue task
TASK=$(curl -s -X POST http://localhost:8000/api/code-engine/worker/queue \
  -H "Content-Type: application/json" \
  -d '{
    "type": "code-execution",
    "payload": {"code": "console.log(\"test\")", "language": "javascript"}
  }')

TASK_ID=$(echo $TASK | jq -r '.taskId')

# 2. Poll status until complete
while true; do
  STATUS=$(curl -s http://localhost:8000/api/code-engine/worker/task/$TASK_ID | jq -r '.task.status')
  echo "Task status: $STATUS"
  if [ "$STATUS" = "completed" ]; then
    curl -s http://localhost:8000/api/code-engine/worker/task/$TASK_ID | jq '.result'
    break
  fi
  sleep 1
done
```

### Test 4.3: Debug Session Workflow
```bash
# 1. Start debug
DEBUG=$(curl -s -X POST http://localhost:8000/api/code-engine/debug/start \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <stdio.h>\nint main() { int x=5; int y=10; printf(\"%d\", x+y); return 0; }",
    "language": "c"
  }')

SESSION=$(echo $DEBUG | jq -r '.sessionId')

# 2. Set breakpoint
curl -s -X POST http://localhost:8000/api/code-engine/debug/$SESSION/breakpoint \
  -H "Content-Type: application/json" \
  -d '{"file": "main.c", "line": 2}'

# 3. Get status
curl -s http://localhost:8000/api/code-engine/debug/$SESSION/status | jq '.'

# 4. Inspect variables
curl -s http://localhost:8000/api/code-engine/debug/$SESSION/variables | jq '.'

# 5. Stop
curl -s -X POST http://localhost:8000/api/code-engine/debug/$SESSION/stop | jq '.'
```

---

## Performance Tests

### Test 5.1: Concurrent Executions
```bash
#!/bin/bash
echo "Testing 20 concurrent executions..."
for i in {1..20}; do
  curl -s -X POST http://localhost:8000/api/code-engine/execute \
    -H "Content-Type: application/json" \
    -d "{
      \"code\": \"console.log('Execution $i')\",
      \"language\": \"javascript\"
    }" &
done
wait
echo "All executions completed"
```

### Test 5.2: Large Code Execution
```bash
# Generate large Python code (1000 lines)
code=$(python3 -c "print('\\n'.join([f'x{i} = {i}' for i in range(1000)]) + '\\nprint(sum([x0'+(', x' + str(i) for i in range(1, 1000) if i % 100 == 0).replace(\"', x\", \" + x\") + ']))')")

curl -X POST http://localhost:8000/api/code-engine/execute \
  -H "Content-Type: application/json" \
  -d "{
    \"code\": \"$code\",
    \"language\": \"python\"
  }"
```

### Test 5.3: Worker Load Test
```bash
#!/bin/bash
echo "Queueing 100 background tasks..."
for i in {1..100}; do
  curl -s -X POST http://localhost:8000/api/code-engine/worker/queue \
    -H "Content-Type: application/json" \
    -d "{
      \"type\": \"code-execution\",
      \"payload\": {
        \"code\": \"console.log('Task $i')\",
        \"language\": \"javascript\"
      }
    }" > /dev/null &
done
wait
echo "All tasks queued"

# Check stats
sleep 5
curl -s http://localhost:8000/api/code-engine/worker/stats | jq '.stats'
```

---

## Error Handling Tests

### Test 6.1: Compilation Error
```bash
curl -X POST http://localhost:8000/api/code-engine/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <stdio.h>\nint main() { int x = ;;;; }",
    "language": "c"
  }'
```
Expected: Error response with compilation error details

### Test 6.2: Runtime Error
```bash
curl -X POST http://localhost:8000/api/code-engine/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(1/0)",
    "language": "python"
  }'
```
Expected: Error response with runtime error

### Test 6.3: Missing Required Fields
```bash
curl -X POST http://localhost:8000/api/code-engine/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log(\"test\")"
  }'
```
Expected: 400 error - "language is required"

### Test 6.4: Invalid Language
```bash
curl -X POST http://localhost:8000/api/code-engine/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "test",
    "language": "invalid-lang"
  }'
```
Expected: Error response (executor selection fails)

---

## Cleanup Tests

### Test 7.1: Session Cleanup
```bash
sessionId="session_..."
curl -X DELETE http://localhost:8000/api/code-engine/session/$sessionId
```
Expected: Success response

### Test 7.2: Verify Session Removed
```bash
curl -X GET http://localhost:8000/api/code-engine/status/$sessionId
```
Expected: 404 error - session not found

---

## Monitoring Tests

### Test 8.1: Real-Time Statistics
```bash
# Run every 2 seconds
watch -n 2 'curl -s http://localhost:8000/api/code-engine/stats | jq "."'
```

### Test 8.2: Check Server Logs
```bash
# Should see logs like:
# ✅ Code Engine: Execution success - session_...
# ✅ Worker: Task completed - task_... (245ms)
# 🐛 Debugger: Session started - debug_...
# 🧹 Code Engine: Cleaned up expired sessions
```

---

## Test Automation Script

Save as `test_code_engine.sh`:

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
  local test_name=$1
  local test_cmd=$2
  
  echo -n "Testing: $test_name ... "
  
  if eval "$test_cmd"; then
    echo -e "${GREEN}PASSED${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}FAILED${NC}"
    ((TESTS_FAILED++))
  fi
}

# Run tests
run_test "JavaScript Execution" \
  'curl -s -X POST http://localhost:8000/api/code-engine/execute \
    -H "Content-Type: application/json" \
    -d "{\"code\": \"console.log(1+1)\", \"language\": \"javascript\"}" | grep -q "success"'

run_test "Python Execution" \
  'curl -s -X POST http://localhost:8000/api/code-engine/execute \
    -H "Content-Type: application/json" \
    -d "{\"code\": \"print(1+1)\", \"language\": \"python\"}" | grep -q "success"'

run_test "Code Translation" \
  'curl -s -X POST http://localhost:8000/api/code-engine/translate \
    -H "Content-Type: application/json" \
    -d "{\"code\": \"function test() {}\", \"language\": \"javascript\"}" | grep -q "success"'

# Print results
echo ""
echo "=============================="
echo "Total Passed: $TESTS_PASSED"
echo "Total Failed: $TESTS_FAILED"
echo "=============================="
```

Run with: `bash test_code_engine.sh`

---

## Success Criteria

✅ All code execution tests pass with correct output
✅ Background tasks queue and execute successfully
✅ Debug sessions start and variables are inspectable
✅ Timeout handling works correctly
✅ Error messages are descriptive
✅ Resource cleanup happens automatically
✅ Statistics endpoint shows accurate data
✅ Load tests handle concurrent requests

---

## Troubleshooting Test Issues

### Tests Timeout
- Check if required compilers are installed
- Verify system resources available
- Check server logs for errors

### Wrong Output
- Check if code is being sent correctly (escaping quotes)
- Verify language parameter matches code
- Check file system permissions

### 404 Errors
- Verify server is running on port 8000
- Check that code engine routes are registered
- Look for import errors in server.js

### Compilation Errors
- Ensure GCC, G++, Python installed
- Check PATH environment variable
- Run `gcc --version` to verify
