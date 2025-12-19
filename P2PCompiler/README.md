# P2P Compiler Prototype ✅

Quick prototype to demonstrate a peer-to-peer distributed compilation job assignment system using Node.js and libp2p.

## Components
- `src/peer.js` — libp2p node helper
- `src/worker.js` — worker that accepts jobs and runs compile commands
- `src/client.js` — submits a job to a peer and waits for the result
- `src/orchestrator.js` — simple scheduler that dials peers and assigns jobs
- `configs/server-config.xml` — editable XML server config (change bootstrap peers, defaults)

> ⚠️ This prototype runs arbitrary commands from job requests — **do not** expose to untrusted networks without sandboxing (Docker, chroot, seccomp, etc.).

## Quick start (local)
1. Install deps:
   ```bash
   npm install
   ```
2. Start a worker:
   ```bash
   npm run start:worker
   ```
3. From another shell, run client to submit a job:
   ```bash
   npm run start:client -- "echo hello from client"
   ```

## Config
Edit `configs/server-config.xml` to change listen addresses, bootstrap peers, `defaultCommand` and `maxJobs`.

## Next steps
- Add Docker-based sandboxing for worker execution
- Implement artifact streaming and tar uploads
- Add signed artifacts and secure peer authentication

