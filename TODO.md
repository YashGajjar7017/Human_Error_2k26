# Merge Maintenance Server into Main Server

## Pending Tasks
- [x] Integrate maintenance routes into server.js under /api/maintenance
- [x] Add maintenance middleware to server.js to check maintenance mode before other routes
- [x] Update adminApi.controller.js to call maintenanceController functions directly instead of axios proxy
- [x] Remove spawn of maintenance process in server.js
- [x] Delete maintenance-server.js
- [x] Update log message in server.js
- [ ] Test that maintenance endpoints work on main port
- [ ] Verify admin routes still function
