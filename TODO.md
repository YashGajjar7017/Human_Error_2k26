# TypeScript Conversion TODO

## Phase 1: Setup and Configuration
- [ ] Install TypeScript and @types packages for Backend
- [ ] Install TypeScript and @types packages for Frontend
- [ ] Create tsconfig.json for Backend
- [ ] Create tsconfig.json for Frontend
- [ ] Update Backend/package.json scripts for TypeScript compilation
- [ ] Update Frontend/package.json scripts for TypeScript compilation

## Phase 2: Rename Main Entry Files
- [ ] Rename Backend/server.js to server.ts
- [ ] Rename Frontend/index.js to index.ts

## Phase 3: Convert Controllers (Backend)
- [ ] Rename and convert Backend/controller/*.js to .ts (add types)
- [ ] Update imports/requires in controllers

## Phase 4: Convert Routes (Backend)
- [ ] Rename and convert Backend/Routes/*.js to .ts (add types)
- [ ] Update imports/requires in routes

## Phase 5: Convert Models (Backend)
- [ ] Rename and convert Backend/models/*.js to .ts (add types)
- [ ] Update imports/requires in models

## Phase 6: Convert DB, Middleware, Util (Backend)
- [ ] Rename and convert Backend/DB/*.js to .ts
- [ ] Rename and convert Backend/middleware/*.js to .ts
- [ ] Rename and convert Backend/util/*.js to .ts

## Phase 7: Convert Frontend Files
- [ ] Rename and convert Frontend/controller/*.js to .ts
- [ ] Rename and convert Frontend/Routes/*.js to .ts
- [ ] Rename and convert Frontend/models/*.js to .ts
- [ ] Rename and convert Frontend/middlewares/*.js to .ts
- [ ] Rename and convert Frontend/util/*.js to .ts

## Phase 8: Testing and Fixes
- [ ] Compile Backend with tsc and fix errors
- [ ] Compile Frontend with tsc and fix errors
- [ ] Test runtime functionality
- [ ] Ensure project runs correctly after conversion
